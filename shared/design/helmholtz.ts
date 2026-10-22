import {
	CHARACTERISTIC_IMPEDANCE_OF_AIR,
	calculateAbsorptionCurve,
	calculateBandwidth,
	calculateEffectiveLength,
	calculateNeckArea,
	calculateResonantFrequency,
	resolveAcousticResistance,
	type HelmholtzAcousticParams,
} from "../acoustics/helmholtz-physics";
import { toFrequency } from "../geometry/scaling";
import type { FrequencyResponse } from "../types/core";
import type {
	Area,
	AcousticResistance,
	Frequency,
	Length,
	Volume,
} from "../types/units";
import { Hz } from "../types/units";

/**
 * Input for designing a Helmholtz resonator from its geometry.
 */
export interface DesignHelmholtzInput {
	/** Neck radius (m). */
	neckRadius: Length;
	/** Physical neck length / plate thickness (m). */
	neckLength: Length;
	/** Cavity volume behind the neck (m³). */
	cavityVolume: Volume;
	/**
	 * Optional explicit acoustic resistance (rayls/m⁴). Must be positive when
	 * supplied. When omitted the resonator is assumed critically matched
	 * (normalized resistance = 1).
	 */
	acousticResistance?: AcousticResistance;
	/**
	 * Optional frequency axis over which to evaluate the absorption curve and
	 * bandwidth. When omitted, a logarithmic axis from f₀/3 to 3·f₀ is used.
	 */
	frequencyAxis?: Frequency[];
}

/**
 * Result of designing a Helmholtz resonator.
 */
export interface DesignHelmholtzResult {
	neckArea: Area;
	effectiveLength: Length;
	resonantFrequency: Frequency;
	normalizedResistance: number;
	acousticResistance: AcousticResistance;
	absorptionCurve: FrequencyResponse;
	bandwidth: Frequency;
}

/**
 * Builds a logarithmically spaced frequency axis from `center / 3` to
 * `center * 3` with `points` samples, used when no explicit axis is supplied.
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
 * Designs a Helmholtz resonator from its neck and cavity geometry.
 *
 * Computes the resonant frequency, the sound-absorption coefficient across a
 * frequency axis, and the −3 dB bandwidth.
 *
 * @param input The resonator geometry and optional resistance/axis.
 * @returns The resonator's acoustic characterization.
 */
export function designHelmholtz(
	input: DesignHelmholtzInput,
): DesignHelmholtzResult {
	const {
		neckRadius,
		neckLength,
		cavityVolume,
		acousticResistance,
		frequencyAxis,
	} = input;

	const neckArea = calculateNeckArea(neckRadius);
	const effectiveLength = calculateEffectiveLength(neckLength, neckRadius);
	const resonantFrequency = calculateResonantFrequency(
		neckArea,
		cavityVolume,
		effectiveLength,
	);

	const baseParams: HelmholtzAcousticParams = {
		neckArea,
		cavityVolume,
		effectiveLength,
		acousticResistance,
	};
	const resolvedResistance = resolveAcousticResistance(baseParams);
	const params: HelmholtzAcousticParams = {
		...baseParams,
		acousticResistance: resolvedResistance,
	};
	const normalizedResistance =
		(Number(resolvedResistance) * Number(neckArea)) /
		CHARACTERISTIC_IMPEDANCE_OF_AIR;

	const frequencies = frequencyAxis ?? generateFrequencyAxis(resonantFrequency);
	const absorptionCurve = {
		frequencies,
		values: calculateAbsorptionCurve(frequencies, params),
	};
	const bandwidth = calculateBandwidth(
		neckArea,
		cavityVolume,
		effectiveLength,
		resolvedResistance,
	);

	return {
		neckArea,
		effectiveLength,
		resonantFrequency,
		normalizedResistance,
		acousticResistance: resolvedResistance,
		absorptionCurve,
		bandwidth,
	};
}
