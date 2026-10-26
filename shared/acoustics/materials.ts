import { SPEED_OF_SOUND } from "@acoustics/constants";
import {
	AIR_DENSITY,
	CHARACTERISTIC_IMPEDANCE_OF_AIR,
} from "@acoustics/helmholtz-physics";
import type { FrequencyResponse } from "@units/core";
import type {
	FlowResistivity,
	Frequency,
	Length,
	SurfaceResistance,
} from "@units/units";

/**
 * A rigidly-backed porous absorber (fibrous or foamic) modelled as an
 * equivalent fluid. The complex flow resistivity, density, thermal bulk
 * modulus, characteristic impedance and wavenumber are given by the
 * Delany–Bazley (1970) empirical model; the backed-layer surface impedance and
 * the normal-incidence power-absorption coefficient follow from classical
 * acoustic-layer theory.
 *
 * Flow resistivity is expressed in rayls/m³ (the Delany–Bazley SI unit).
 */

/**
 * A rigidly-backed porous layer, characterised by its flow resistivity and the
 * thickness of the absorbing layer.
 */
export interface PorousMaterial {
	/** Flow resistivity of the porous medium in rayls/m³. */
	flowResistivity: FlowResistivity;
	/** Thickness of the absorbing layer (m). For a fully filled well this is the well depth. */
	thickness: Length;
	/**
	 * Optional surface (reluctance) resistance in rayls/m² added in series with
	 * the layer. Defaults to 0 (a free front surface, as for an open well).
	 */
	surfaceResistance?: SurfaceResistance;
}

/**
 * Parameters for the absorption calculations: a porous material.
 */
export interface PorousAcousticParams {
	material: PorousMaterial;
}

/**
 * A minimal, strongly-typed complex number used by the layered-impedance
 * calculation. No external complex-number dependency is required.
 */
interface Complex {
	re: number;
	im: number;
}

const cMul = (a: Complex, b: Complex): Complex => ({
	re: a.re * b.re - a.im * b.im,
	im: a.re * b.im + a.im * b.re,
});

const cAdd = (a: Complex, b: Complex): Complex => ({
	re: a.re + b.re,
	im: a.im + b.im,
});

const cSqrt = (z: Complex): Complex => {
	const r = Math.hypot(z.re, z.im);
	const re = Math.sqrt((r + z.re) / 2);
	const im = Math.sign(z.im) * Math.sqrt(Math.max(0, (r - z.re) / 2));
	return { re, im };
};

/**
 * `coth(a + jb)` via the closed form
 * `coth(a+jb) = [sinh(2a) - j·sin(2b)] / [cosh(2a) - cos(2b)]`.
 * The denominator is zero only when `a = 0` and `b = 0`, which is guarded by
 * the caller (non-zero layer thickness).
 */
const cCoth = (z: Complex): Complex => {
	const a = z.re;
	const b = z.im;
	const denom = Math.cosh(2 * a) - Math.cos(2 * b);
	if (denom === 0) {
		// z = 0: coth diverges; a zero-thickness layer absorbs nothing.
		return { re: 0, im: 0 };
	}
	return {
		re: Math.sinh(2 * a) / denom,
		im: -Math.sin(2 * b) / denom,
	};
};

const magnitude = (z: Complex): number => Math.hypot(z.re, z.im);

// Delany–Bazley (1970) empirical coefficients (SI units: σ in rayls/m³, f in Hz).
const DB_RESISTIVITY_REAL = 0.0571;
const DB_RESISTIVITY_REAL_EXP = 0.754;
const DB_RESISTIVITY_IMAG = 0.087;
const DB_RESISTIVITY_IMAG_EXP = 0.718;
const DB_THERMAL_REAL = 0.59;
const DB_THERMAL_IMAG = 0.124;
const DB_THERMAL_EXP = 0.5;
// Isentropic index of air.
const GAS_GAMMA = 1.4;
// Frame tortuosity (Ward). A rigid frame with open-cell absorber has α∞ ≈ 1;
// it supplies the real (inertial) part of the complex density.
const TORTUOSITY = 1;

/**
 * Delany–Bazley complex flow resistivity (normalised by σ):
 * `σ̂/σ = 1 + 0.0571·X^(-0.754) - j·0.087·X^(-0.718)`, `X = f/100`.
 */
const normalisedResistivity = (f: number): Complex => {
	const pReal = (100 / f) ** DB_RESISTIVITY_REAL_EXP;
	const pImag = (100 / f) ** DB_RESISTIVITY_IMAG_EXP;
	return {
		re: 1 + DB_RESISTIVITY_REAL * pReal,
		im: -DB_RESISTIVITY_IMAG * pImag,
	};
};

/**
 * Delany–Bazley thermal function for the bulk modulus:
 * `F = 1 / √(1 + (0.59 - j0.124)·X^(-0.5))`, `X = f/100`. It tends to 1 at high
 * frequency (adiabatic) and to 0 at low frequency (isothermal).
 */
const thermalFunction = (f: number): Complex => {
	const pm = (100 / f) ** DB_THERMAL_EXP;
	const inside: Complex = {
		re: 1 + DB_THERMAL_REAL * pm,
		im: -DB_THERMAL_IMAG * pm,
	};
	const root = cSqrt(inside);
	// 1 / root
	const inv = {
		re: root.re / (root.re * root.re + root.im * root.im),
		im: -root.im / (root.re * root.re + root.im * root.im),
	};
	return inv;
};

/**
 * Normal-incidence power-absorption coefficient of a rigidly-backed porous
 * layer over a frequency axis.
 *
 * The backed-layer surface impedance is `Zs = Rs + Zc·coth(j·k·L)` where `Rs`
 * is the optional surface resistance. The absorption is
 * `α = 1 - |Zs - Z₀| / |Zs + Z₀|`, with `Z₀` the characteristic impedance of
 * air. The coefficient is clamped to [0, 1].
 *
 * @param frequencies Sample frequencies (Hz).
 * @param params The porous material (and optional resistance).
 * @returns The absorption coefficient at each frequency.
 * @throws RangeError if the flow resistivity or thickness is negative, or if
 * the frequency axis contains a non-positive value.
 */
export function calculatePorousAbsorption(
	frequencies: Frequency[],
	params: PorousAcousticParams,
): number[] {
	const { flowResistivity, thickness } = params.material;
	const surfaceResistance = params.material.surfaceResistance
		? Number(params.material.surfaceResistance)
		: 0;

	const sigma = Number(flowResistivity);
	const L = Number(thickness);
	if (sigma <= 0) {
		throw new RangeError(`flowResistivity must be positive (got ${sigma})`);
	}
	if (L < 0) {
		throw new RangeError(`thickness must be non-negative (got ${L})`);
	}
	// Fail fast on an invalid axis before any early return.
	for (const f of frequencies) {
		const freq = Number(f);
		if (freq <= 0) {
			throw new RangeError(`frequency must be positive (got ${freq})`);
		}
	}
	if (L === 0) {
		// No material present: nothing to absorb.
		return frequencies.map(() => 0);
	}

	const speedOfSound = SPEED_OF_SOUND;
	const rho0 = Number(AIR_DENSITY);
	// ρ̂ = ρ0·α∞ + σ̂/(jω): the tortuosity term supplies the real (inertial)
	// part of the complex density, without which Zc is reactive and absorption
	// collapses.
	const alphaInf = TORTUOSITY;
	// γ·p0 = ρ0·c², so the adiabatic bulk modulus is rho0 * c².
	const gammaP0 = rho0 * speedOfSound * speedOfSound;
	const gamma = GAS_GAMMA;
	const Z0 = CHARACTERISTIC_IMPEDANCE_OF_AIR;
	const twoPiF = (f: number) => 2 * Math.PI * f;

	return frequencies.map((f) => {
		const freq = Number(f);
		const w = twoPiF(freq);

		// Complex density rho_hat = rho0 * alpha_inf + sigma_hat / (j omega).
		const sHat = cMul(normalisedResistivity(freq), { re: sigma, im: 0 });
		const rhoHat = cAdd(
			{ re: rho0 * alphaInf, im: 0 },
			cMul(sHat, { re: 0, im: -1 / w }), // 1/(jω) = -j/ω
		);

		// Thermal bulk modulus ĉ = γp0 / (γ - (γ-1)·F).
		const F = thermalFunction(freq);
		const denom = { re: gamma - (gamma - 1) * F.re, im: -(gamma - 1) * F.im };
		const denomMag2 = denom.re * denom.re + denom.im * denom.im;
		const invDenom = { re: denom.re / denomMag2, im: -denom.im / denomMag2 };
		const cBar = cMul({ re: gammaP0, im: 0 }, invDenom);

		// Reciprocal of the bulk modulus, 1/ĉ = conj(ĉ)/|ĉ|².
		const cBarMag2 = cBar.re * cBar.re + cBar.im * cBar.im;
		const invCBar = { re: cBar.re / cBarMag2, im: -cBar.im / cBarMag2 };

		const zc = cSqrt(cMul(rhoHat, cBar));
		const kRoot = cSqrt(cMul(rhoHat, invCBar));
		const k: Complex = { re: w * kRoot.re, im: w * kRoot.im };

		// ψ = j·k·L = (-im(k)·L) + j·(re(k)·L)
		const psi: Complex = { re: -k.im * L, im: k.re * L };
		const zLayer = cMul(zc, cCoth(psi));
		const zs = cAdd(zLayer, { re: surfaceResistance, im: 0 });

		const incident = magnitude(cAdd(zs, { re: -Z0, im: 0 }));
		const reflected = magnitude(cAdd(zs, { re: Z0, im: 0 }));
		const alpha = reflected === 0 ? 0 : 1 - incident / reflected;

		return Math.min(1, Math.max(0, alpha));
	});
}

/**
 * Convenience wrapper returning a {@link FrequencyResponse} for a material over
 * a frequency axis.
 *
 * @param frequencies Sample frequencies (Hz).
 * @param params The porous material (and optional resistance).
 * @returns The absorption response over the axis.
 * @throws RangeError if the flow resistivity or thickness is negative, or if
 * the frequency axis contains a non-positive value.
 */
export function porousAbsorptionResponse(
	frequencies: Frequency[],
	params: PorousAcousticParams,
): FrequencyResponse {
	return {
		frequencies,
		values: calculatePorousAbsorption(frequencies, params),
	};
}
