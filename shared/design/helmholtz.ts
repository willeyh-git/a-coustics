import { SPEED_OF_SOUND } from "../acoustics/constants";
import {
	AIR_DENSITY,
	calculateAbsorptionCurve,
	calculateBandwidth,
	calculateEffectiveLength,
	calculateNeckArea,
	calculateResonantFrequency,
	type HelmholtzAcousticParams,
} from "../acoustics/helmholtz-physics";
import { toArea, toFrequency } from "../geometry/scaling";
import type { Area, Frequency, Length, Volume } from "../types/units";
import { Hz, m2 } from "../types/units";

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
	 * Optional explicit acoustic resistance (rayls/m⁴). When omitted the
	 * resonator is assumed critically matched (normalized resistance = 1).
	 */
	acousticResistance?: number;
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
	acousticResistance: number;
	absorptionCurve: {
		frequencies: Frequency[];
		values: number[];
	};
	bandwidth: Frequency;
}

/**
 * Builds a logarithmically spaced frequency axis from `center / 3` to
 * `center * 3` with `points` samples, used when no explicit axis is supplied.
 */
function generateFrequencyAxis(center: Frequency, points = 400): Frequency[] {
	const c = Number(center);
	const lo = c / 3;
	const hi = c * 3;
	const axis: Frequency[] = [];
	for (let i = 0; i < points; i++) {
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

	const z0 = AIR_DENSITY * SPEED_OF_SOUND;
	const resolvedResistance = acousticResistance ?? z0 / Number(neckArea);
	const normalizedResistance = (resolvedResistance * Number(neckArea)) / z0;

	const params: HelmholtzAcousticParams = {
		neckArea,
		cavityVolume,
		effectiveLength,
		acousticResistance: resolvedResistance,
	};

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
		neckArea: toArea(Number(neckArea), m2),
		effectiveLength,
		resonantFrequency,
		normalizedResistance,
		acousticResistance: resolvedResistance,
		absorptionCurve,
		bandwidth,
	};
}
