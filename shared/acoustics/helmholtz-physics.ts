import {
	toAcousticResistance,
	toArea,
	toDensity,
	toFrequency,
	toLength,
} from "@geometry/scaling";
import type {
	AcousticResistance,
	Area,
	Density,
	Frequency,
	Length,
	Volume,
} from "@units/units";
import { Hz, kgPerM3, m, m2, raylsPerM4 } from "@units/units";
import { SPEED_OF_SOUND } from "@acoustics/constants";

/**
 * Air density (kg/m³) at 20 °C. Used to derive the characteristic impedance
 * of air `Z₀ = ρ₀ · c` for the acoustic-impedance absorption model. Matches
 * the temperature assumed by `SPEED_OF_SOUND` (343 m/s at ~20 °C).
 */
export const AIR_DENSITY: Density = toDensity(1.204, kgPerM3);

/**
 * Characteristic impedance of air `Z₀ = ρ₀ · c` (rayls/m²), the reference
 * impedance against which the resonator's specific impedance is normalized.
 */
export const CHARACTERISTIC_IMPEDANCE_OF_AIR = AIR_DENSITY * SPEED_OF_SOUND;

/**
 * End-correction factor for the neck. The oscillating air column in the neck
 * behaves as if it were slightly longer than the physical neck. For a neck
 * open at both ends the conventional correction is `1.7 · r`.
 */
export const END_CORRECTION_FACTOR = 1.7;

/**
 * Default normalized resistance for the absorption model.
 *
 * The neck of a Helmholtz resonator presents a specific acoustic impedance to
 * the incident sound. When the (dimensionless, Z₀-referenced) resistance equals
 * 1 the resonator is "critically matched": at resonance all incident energy is
 * absorbed (α = 1). This is the natural design target and the default used when
 * no explicit `acousticResistance` is supplied.
 */
export const DEFAULT_NORMALIZED_RESISTANCE = 1;

/**
 * Calculates the cross-sectional area of a circular neck from its radius.
 * @param neckRadius The neck radius in meters.
 * @returns The neck area in square meters.
 */
export function calculateNeckArea(neckRadius: Length): Area {
	const r = Number(neckRadius);
	if (r <= 0) {
		throw new RangeError(`Neck radius ${r} must be positive`);
	}
	return toArea(Math.PI * r * r, m2);
}

/**
 * Calculates the effective (end-corrected) neck length.
 * @param neckLength The physical neck length in meters.
 * @param neckRadius The neck radius in meters.
 * @returns The effective neck length in meters.
 */
export function calculateEffectiveLength(
	neckLength: Length,
	neckRadius: Length,
): Length {
	const L = Number(neckLength);
	const r = Number(neckRadius);
	if (L <= 0 || r <= 0) {
		throw new RangeError(
			`neckLength and neckRadius must be positive (got ${L}, ${r})`,
		);
	}
	return toLength(L + END_CORRECTION_FACTOR * r, m);
}

/**
 * Shared validation for resonator geometry; rejects non-positive areas,
 * volumes, and lengths.
 */
function assertPositiveGeometry(
	neckArea: Area,
	cavityVolume: Volume,
	effectiveLength: Length,
): void {
	const A = Number(neckArea);
	const V = Number(cavityVolume);
	const L = Number(effectiveLength);
	if (A <= 0 || V <= 0 || L <= 0) {
		throw new RangeError(
			`neckArea, cavityVolume, and effectiveLength must be positive (got ${A}, ${V}, ${L})`,
		);
	}
}

/**
 * Calculates the resonant (design) frequency of a Helmholtz resonator.
 *
 * ```text
 * f = (c / 2π) × √(A / (V × L_eff))
 * ```
 *
 * @param neckArea The neck cross-sectional area (m²).
 * @param cavityVolume The cavity volume (m³).
 * @param effectiveLength The end-corrected neck length (m).
 * @returns The resonant frequency in Hz.
 * @throws RangeError if any input is non-positive.
 */
export function calculateResonantFrequency(
	neckArea: Area,
	cavityVolume: Volume,
	effectiveLength: Length,
): Frequency {
	assertPositiveGeometry(neckArea, cavityVolume, effectiveLength);

	const A = Number(neckArea);
	const V = Number(cavityVolume);
	const L = Number(effectiveLength);

	const raw = (SPEED_OF_SOUND / (2 * Math.PI)) * Math.sqrt(A / (V * L));
	return toFrequency(raw, Hz);
}

/**
 * Parameters shared by the absorption and bandwidth calculations.
 */
export interface HelmholtzAcousticParams {
	neckArea: Area;
	cavityVolume: Volume;
	effectiveLength: Length;
	/**
	 * Acoustic resistance of the neck in rayls/m⁴ (Pa·s/m⁴). Must be positive
	 * when supplied. When omitted the resonator is assumed critically matched,
	 * i.e. the resistance is chosen so that the normalized resistance equals
	 * `DEFAULT_NORMALIZED_RESISTANCE`.
	 */
	acousticResistance?: AcousticResistance;
}

/**
 * Resolves the acoustic resistance (rayls/m⁴) from an optional explicit value
 * or the critically-matched default. Single source of truth for the default so
 * consumers cannot drift.
 * @throws RangeError if a supplied resistance is not positive.
 */
export function resolveAcousticResistance(
	params: HelmholtzAcousticParams,
): AcousticResistance {
	if (params.acousticResistance !== undefined) {
		if (Number(params.acousticResistance) <= 0) {
			throw new RangeError(
				`acousticResistance must be positive (got ${Number(params.acousticResistance)})`,
			);
		}
		return params.acousticResistance;
	}
	// r = A · Ra / Z₀ = DEFAULT_NORMALIZED_RESISTANCE  →  Ra = Z₀ · DEFAULT / A
	return toAcousticResistance(
		(CHARACTERISTIC_IMPEDANCE_OF_AIR / Number(params.neckArea)) *
			DEFAULT_NORMALIZED_RESISTANCE,
		raylsPerM4,
	);
}

/**
 * Normalizes the specific acoustic impedance of the resonator by the
 * characteristic impedance of air (Z₀ = ρ₀ · c) and returns its real part `r`
 * and imaginary part `x(ω)`.
 */
function normalizedImpedance(
	params: HelmholtzAcousticParams,
	frequency: Frequency,
): { r: number; x: number } {
	const A = Number(params.neckArea);
	const V = Number(params.cavityVolume);
	const L = Number(params.effectiveLength);
	const Ra = resolveAcousticResistance(params);

	const r = (A * Number(Ra)) / CHARACTERISTIC_IMPEDANCE_OF_AIR;
	const w = 2 * Math.PI * Number(frequency);
	const x = (w * L) / SPEED_OF_SOUND - (A * SPEED_OF_SOUND) / (w * V);

	return { r, x };
}

/**
 * Calculates the sound-absorption coefficient (0–1, power absorption) of a
 * Helmholtz resonator over a set of frequencies.
 *
 * The resonator is modelled as a single degree-of-freedom mass–spring system
 * whose normalized specific impedance is `z = r + jx`. For a locally-reacting
 * surface at normal incidence:
 *
 * ```text
 * α = 4r / ((r + 1)² + x²)
 * ```
 *
 * The coefficient peaks at the resonant frequency where `x = 0`.
 * @param frequencies The sample frequencies (Hz).
 * @param params Resonator geometry and resistance.
 * @returns The absorption coefficient at each frequency.
 */
export function calculateAbsorptionCurve(
	frequencies: Frequency[],
	params: HelmholtzAcousticParams,
): number[] {
	return frequencies.map((f) => {
		const { r, x } = normalizedImpedance(params, f);
		return (4 * r) / ((r + 1) ** 2 + x * x);
	});
}

/**
 * Calculates the −3 dB (half-power) bandwidth of a Helmholtz resonator.
 *
 * Solving the absorption coefficient `α = 4r / ((r + 1)² + x²)` for `α = 0.5`
 * gives the two angular frequencies at which `x = ±x₀` with `x₀ = √(8r − (r+1)²)`.
 * Each is a quadratic in `ω`, so the bandwidth is obtained exactly and is
 * independent of any sampling axis. When the resonator is so over- or
 * under-damped that absorption never reaches 0.5 (`8r − (r+1)² ≤ 0`), the
 * bandwidth is reported as 0.
 *
 * @param neckArea The neck cross-sectional area (m²).
 * @param cavityVolume The cavity volume (m³).
 * @param effectiveLength The end-corrected neck length (m).
 * @param acousticResistance Optional acoustic resistance (rayls/m⁴).
 * @returns The bandwidth in Hz.
 * @throws RangeError if any input is not positive.
 */
export function calculateBandwidth(
	neckArea: Area,
	cavityVolume: Volume,
	effectiveLength: Length,
	acousticResistance?: AcousticResistance,
): Frequency {
	assertPositiveGeometry(neckArea, cavityVolume, effectiveLength);

	const A = Number(neckArea);
	const V = Number(cavityVolume);
	const L = Number(effectiveLength);
	const Ra = resolveAcousticResistance({
		neckArea,
		cavityVolume,
		effectiveLength,
		acousticResistance,
	});
	const r = (A * Number(Ra)) / CHARACTERISTIC_IMPEDANCE_OF_AIR;

	const discriminant = 8 * r - (r + 1) ** 2;
	if (discriminant <= 0) {
		return toFrequency(0, Hz);
	}

	// x(ω) = ω·L/c − A·c/(ω·V) = ∓x₀  →  (L/c)·ω² ∓ x₀·ω − A·c/V = 0
	const x0 = Math.sqrt(discriminant);
	const a = L / SPEED_OF_SOUND;
	const b = (A * SPEED_OF_SOUND) / V;
	const root = Math.sqrt(x0 * x0 + 4 * a * b);

	const wHigh = (x0 + root) / (2 * a); // upper cutoff (+x₀ branch)
	// The lower cutoff is the same quadratic root written as 2b / (x₀ + root),
	// algebraically identical to (−x₀ + root) / (2a) but free of the
	// catastrophic cancellation in (−x₀ + root) when 4ab ≪ x₀².
	const wLow = (2 * b) / (x0 + root);

	return toFrequency((wHigh - wLow) / (2 * Math.PI), Hz);
}
