import {
	calculatePorousAbsorption,
	type PorousMaterial,
} from "../acoustics/materials";
import { designUnitDepth } from "../acoustics/design";
import { sequenceToDepths } from "../geometry/depths";
import { asFlowResistivity } from "../math/helpers";
import { generateQRDSequence } from "../math/sequences";
import { toFrequency } from "../geometry/scaling";
import type { FrequencyResponse } from "../types/core";
import type { Frequency, Length, Prime } from "../types/units";
import { Hz } from "../types/units";

/**
 * State of an individual ABFUSOR well:
 * - `DIFFUSIVE`: an empty QRD well that reflects and scatters sound.
 * - `ABSORPTIVE`: the well is completely filled with absorptive material,
 *   turning it into a rigid-backed porous absorber.
 */
export type ABFUSORWellState = "DIFFUSIVE" | "ABSORPTIVE";

/**
 * Porous absorber specification: the properties that affect absorption. The
 * layer thickness is set per well (to each well's depth), so it is deliberately
 * absent here — callers cannot supply a meaningless thickness.
 */
export type PorousAbsorberSpec = Omit<PorousMaterial, "thickness">;

/**
 * Default flow resistivity (rayls/m³) for a typical open-cell absorptive foam,
 * used when a design omits an explicit `material`.
 */
export const DEFAULT_FLOW_RESISTIVITY_FOAM = asFlowResistivity(5000);

/**
 * Input for designing an ABFUSOR (Absorbing Binary Diffuser).
 */
export interface DesignABFUSORInput {
	/** Prime order of the underlying QRD sequence. */
	prime: Prime;
	/** Design (centre) frequency of the panel (Hz). */
	designFrequency: Frequency;
	/**
	 * Fraction of wells, taken from the shallowest up, that are converted to
	 * absorptive wells. Must satisfy `0 <= absorptiveRatio < 1`. A value of `0`
	 * yields a pure QRD diffuser; larger values absorb progressively more of
	 * the shallow (poorly-diffusing) wells.
	 */
	absorptiveRatio: number;
	/**
	 * Absorptive material spec. Only its flow resistivity (and optional surface
	 * resistance) are used; each absorptive well is filled to its own depth, so
	 * the layer thickness per well is set internally. Defaults to
	 * {@link DEFAULT_FLOW_RESISTIVITY_FOAM} when omitted.
	 */
	material?: PorousAbsorberSpec;
	/** Optional frequency axis for the absorption curves. */
	frequencyAxis?: Frequency[];
}

/**
 * Per-well ABFUSOR description.
 */
export interface ABFUSORWell {
	index: number;
	residue: number;
	depth: Length;
	state: ABFUSORWellState;
	/**
	 * Normal-incidence absorption coefficient of this well over the analysis
	 * axis. `0` for diffusive wells (perfect reflection); the porous-model
	 * curve for absorptive wells.
	 */
	absorption: FrequencyResponse;
}

/**
 * Result of designing an ABFUSOR hybrid panel.
 */
export interface DesignABFUSORResult {
	prime: Prime;
	sequence: number[];
	unitDepth: Length;
	depths: Length[];
	states: ABFUSORWellState[];
	wells: ABFUSORWell[];
	/** Average normal-incidence absorption across every well. */
	overallAbsorption: FrequencyResponse;
	/** Peak value of the overall absorption curve. */
	maxAbsorption: number;
	/** Fraction of wells that are absorptive. */
	absorptiveFraction: number;
	/** Fraction of wells that are diffusive. */
	diffusiveFraction: number;
	/** Deepest well depth (the maximum QRD well depth). */
	maxDepth: Length;
	/** Shallowest well depth. */
	minDepth: Length;
}

/**
 * Builds a logarithmically spaced frequency axis from `center / 3` to
 * `center * 3`, used when no explicit axis is supplied.
 */
function generateFrequencyAxis(
	center: Frequency,
	points: number = 400,
): Frequency[] {
	if (points < 2) {
		throw new RangeError(`points must be at least 2 (got ${points})`);
	}
	const c = Number(center);
	const lo = c / 3;
	const hi = c * 3;
	const axis: Frequency[] = [];
	for (let i = 0; i < points; i = i + 1) {
		const t = i / (points - 1);
		const f = lo * (hi / lo) ** t;
		axis.push(toFrequency(f, Hz));
	}
	return axis;
}

/**
 * Designs an ABFUSOR (Absorbing Binary Diffuser): a QRD diffuser in which the
 * shallowest wells are filled with absorptive material to become absorptive
 * wells, while the deep wells remain diffusive.
 *
 * The shallow wells are poor phase-modulators (they barely vary the reflected
 * wavefront), so converting them to absorptive wells costs little diffusion
 * while adding genuine sound absorption. Deep wells retain full QRD diffusion.
 *
 * @param input The prime, design frequency, absorptive fraction, and material.
 * @returns The hybrid panel's geometry and combined diffusion/absorption metrics.
 * @throws RangeError if `absorptiveRatio` is outside `[0, 1)`, the flow
 * resistivity is non-positive, or an explicit frequency axis contains a
 * non-positive value.
 */
export function designABFUSOR(input: DesignABFUSORInput): DesignABFUSORResult {
	const { prime, designFrequency, absorptiveRatio } = input;
	const material: PorousAbsorberSpec = input.material ?? {
		flowResistivity: DEFAULT_FLOW_RESISTIVITY_FOAM,
	};

	if (absorptiveRatio < 0 || absorptiveRatio >= 1) {
		throw new RangeError(
			`absorptiveRatio must satisfy 0 <= ratio < 1 (got ${absorptiveRatio})`,
		);
	}
	if (Number(material.flowResistivity) <= 0) {
		throw new RangeError(
			`material.flowResistivity must be positive (got ${Number(
				material.flowResistivity,
			)})`,
		);
	}

	const unitDepth = designUnitDepth(designFrequency, prime);
	const sequence = generateQRDSequence(prime);
	const depths = sequenceToDepths(sequence, unitDepth);

	const n = depths.length;
	const absorptiveCount = Math.floor(absorptiveRatio * n);

	// Index wells sorted by ascending depth; the shallowest `absorptiveCount`
	// become absorptive.
	const order = Array.from({ length: n }, (_, i) => i).sort(
		(a, b) => depths[a] - depths[b],
	);
	const absorptiveSet = new Set<number>(order.slice(0, absorptiveCount));

	const axis = input.frequencyAxis ?? generateFrequencyAxis(designFrequency);

	const wells: ABFUSORWell[] = [];
	const absorptionSum: number[] = new Array<number>(axis.length).fill(0);

	for (let i = 0; i < n; i = i + 1) {
		const state: ABFUSORWellState = absorptiveSet.has(i)
			? "ABSORPTIVE"
			: "DIFFUSIVE";
		const depth = depths[i];
		const residue = sequence[i];

		let absorption: FrequencyResponse;
		if (state === "ABSORPTIVE") {
			const wellMaterial: PorousMaterial = {
				flowResistivity: material.flowResistivity,
				thickness: depth,
				surfaceResistance: material.surfaceResistance,
			};
			absorption = {
				frequencies: axis,
				values: calculatePorousAbsorption(axis, { material: wellMaterial }),
			};
			for (let k = 0; k < axis.length; k = k + 1) {
				absorptionSum[k] = absorptionSum[k] + absorption.values[k];
			}
		} else {
			absorption = {
				frequencies: axis,
				values: new Array<number>(axis.length).fill(0),
			};
		}

		wells.push({ index: i, residue, depth, state, absorption });
	}

	const overallValues = absorptionSum.map((s) => s / n);
	const maxAbsorption = overallValues.reduce((m, v) => (v > m ? v : m), 0);

	return {
		prime,
		sequence,
		unitDepth,
		depths,
		states: wells.map((w) => w.state),
		wells,
		overallAbsorption: { frequencies: axis, values: overallValues },
		maxAbsorption,
		// absorptiveSet.size is the single source of truth for the fractions.
		absorptiveFraction: absorptiveSet.size / n,
		diffusiveFraction: (n - absorptiveSet.size) / n,
		// prime ≥ 2 ⇒ at least one well ⇒ depths is non-empty, so depths[0] is a
		// valid seed for the reduce.
		maxDepth: depths.reduce((m, d) => (d > m ? d : m), depths[0]),
		minDepth: depths.reduce((m, d) => (d < m ? d : m), depths[0]),
	};
}
