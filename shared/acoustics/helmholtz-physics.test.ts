import { describe, expect, it } from "vitest";
import {
	toAcousticResistance,
	toArea,
	toLength,
	toVolume,
} from "@geometry/scaling";
import { asAcousticResistance, asFrequency } from "@math/helpers";
import { at } from "@utils/at";
import type {
	AcousticResistance,
	Area,
	Frequency,
	Length,
	Volume,
} from "@units/units";
import { m, m2, m3, raylsPerM4 } from "@units/units";
import { SPEED_OF_SOUND } from "@acoustics/constants";
import {
	AIR_DENSITY,
	calculateAbsorptionCurve,
	calculateBandwidth,
	calculateEffectiveLength,
	calculateNeckArea,
	calculateResonantFrequency,
	END_CORRECTION_FACTOR,
	type HelmholtzAcousticParams,
} from "@acoustics/helmholtz-physics";

// Canonical resonator used across the tests.
const neckRadius: Length = toLength(0.02, m); // 2 cm
const neckLength: Length = toLength(0.01, m); // 1 cm
const cavityVolume: Volume = toVolume(0.01, m3); // 10 L
const neckArea: Area = calculateNeckArea(neckRadius);
const effectiveLength: Length = calculateEffectiveLength(
	neckLength,
	neckRadius,
);

function params(
	overrides: Partial<HelmholtzAcousticParams> = {},
): HelmholtzAcousticParams {
	return {
		neckArea,
		cavityVolume,
		effectiveLength,
		...overrides,
	};
}

/**
 * Builds an acoustic resistance (rayls/m⁴) that yields the requested
 * normalized resistance r for the canonical neck: r = A · Ra / Z₀.
 */
function raFor(normalizedResistance: number): AcousticResistance {
	return toAcousticResistance(
		(normalizedResistance * AIR_DENSITY * SPEED_OF_SOUND) / Number(neckArea),
		raylsPerM4,
	);
}

function alphaAt(
	frequency: Frequency,
	helmholtzParams: HelmholtzAcousticParams,
): number {
	return at(calculateAbsorptionCurve([frequency], helmholtzParams), 0);
}

/**
 * Locates the frequency inside the (log) bracket whose absorption equals
 * `target` by geometric bisection, assuming the absorption curve is
 * monotonic across the bracket and α(a) < target < α(b).
 */
function halfPowerFrequency(
	lowAlphaFrequency: number,
	highAlphaFrequency: number,
	target: number,
	helmholtzParams: HelmholtzAcousticParams,
): number {
	let lo = lowAlphaFrequency;
	let hi = highAlphaFrequency;
	for (let step = 0; step < 200; step = step + 1) {
		const mid = Math.sqrt(lo * hi);
		if (alphaAt(asFrequency(mid), helmholtzParams) < target) {
			lo = mid;
		} else {
			hi = mid;
		}
	}
	return Math.sqrt(lo * hi);
}

describe("calculateNeckArea", () => {
	it("computes π·r²", () => {
		expect(Number(calculateNeckArea(toLength(0.01, m)))).toBeCloseTo(
			Math.PI * 0.01 ** 2,
			10,
		);
	});

	it("rejects non-positive radius", () => {
		expect(() => calculateNeckArea(toLength(0, m))).toThrow();
		expect(() => calculateNeckArea(toLength(-1, m))).toThrow();
	});
});

describe("calculateEffectiveLength", () => {
	it("adds the 1.7·r end correction", () => {
		const expected = 0.01 + END_CORRECTION_FACTOR * 0.02;
		expect(Number(effectiveLength)).toBeCloseTo(expected, 10);
		expect(END_CORRECTION_FACTOR).toBeCloseTo(1.7, 10);
	});

	it("rejects non-positive neck geometry", () => {
		expect(() =>
			calculateEffectiveLength(toLength(0, m), neckRadius),
		).toThrow();
		expect(() =>
			calculateEffectiveLength(neckLength, toLength(-1, m)),
		).toThrow();
	});
});

describe("calculateResonantFrequency", () => {
	it("matches the lumped-parameter formula", () => {
		const expected =
			(SPEED_OF_SOUND / (2 * Math.PI)) *
			Math.sqrt(
				Number(neckArea) / (Number(cavityVolume) * Number(effectiveLength)),
			);
		expect(
			Number(
				calculateResonantFrequency(neckArea, cavityVolume, effectiveLength),
			),
		).toBeCloseTo(expected, 10);
	});

	it("is approximately 92.3 Hz for the canonical resonator", () => {
		const f = calculateResonantFrequency(
			neckArea,
			cavityVolume,
			effectiveLength,
		);
		expect(Number(f)).toBeCloseTo(92.3, 1);
	});

	it("increases with neck area and decreases with cavity volume", () => {
		const biggerNeck = calculateResonantFrequency(
			toArea(0.002, m2),
			cavityVolume,
			effectiveLength,
		);
		const smallerNeck = calculateResonantFrequency(
			toArea(0.0005, m2),
			cavityVolume,
			effectiveLength,
		);
		expect(Number(biggerNeck)).toBeGreaterThan(Number(smallerNeck));

		const biggerCavity = calculateResonantFrequency(
			neckArea,
			toVolume(0.05, m3),
			effectiveLength,
		);
		const smallerCavity = calculateResonantFrequency(
			neckArea,
			toVolume(0.002, m3),
			effectiveLength,
		);
		expect(Number(smallerCavity)).toBeGreaterThan(Number(biggerCavity));
	});

	it("rejects non-positive inputs", () => {
		expect(() =>
			calculateResonantFrequency(toArea(0, m2), cavityVolume, effectiveLength),
		).toThrow();
		expect(() =>
			calculateResonantFrequency(neckArea, toVolume(0, m3), effectiveLength),
		).toThrow();
	});
});

describe("calculateAbsorptionCurve", () => {
	it("peaks at the resonant frequency (α = 1 when critically matched)", () => {
		const f0 = calculateResonantFrequency(
			neckArea,
			cavityVolume,
			effectiveLength,
		);
		const curve = calculateAbsorptionCurve([f0], params());
		expect(curve[0]).toBeCloseTo(1, 6);
	});

	it("decreases away from resonance and stays within [0, 1]", () => {
		const f0 = Number(
			calculateResonantFrequency(neckArea, cavityVolume, effectiveLength),
		);
		const curve = calculateAbsorptionCurve(
			[asFrequency(f0 * 0.5), asFrequency(f0), asFrequency(f0 * 2)],
			params(),
		);
		const aLow = at(curve, 0);
		const aRes = at(curve, 1);
		const aHigh = at(curve, 2);
		expect(aRes).toBeGreaterThan(aLow);
		expect(aRes).toBeGreaterThan(aHigh);
		for (const a of curve) {
			expect(a).toBeGreaterThanOrEqual(0);
			expect(a).toBeLessThanOrEqual(1 + 1e-9);
		}
	});

	it("is symmetric in log-frequency about the resonance for matched resistance", () => {
		const f0 = Number(
			calculateResonantFrequency(neckArea, cavityVolume, effectiveLength),
		);
		const curve = calculateAbsorptionCurve(
			[asFrequency(f0 * 0.8), asFrequency(f0 * 1.25)],
			params(),
		);
		// 0.8 and 1.25 are multiplicative inverses about 1 (0.8 × 1.25 = 1).
		expect(at(curve, 0)).toBeCloseTo(at(curve, 1), 6);
	});

	it("lowers and broadens the peak with higher resistance", () => {
		const matched = calculateAbsorptionCurve([asFrequency(92.3)], params());
		const lossy = calculateAbsorptionCurve(
			[asFrequency(92.3)],
			params({ acousticResistance: asAcousticResistance(1e6) }),
		);
		expect(at(lossy, 0)).toBeLessThan(at(matched, 0));
	});
});

describe("calculateBandwidth", () => {
	it("matches the half-power crossings of the absorption curve", () => {
		// The closed-form bandwidth must equal the width between the two
		// α = 0.5 crossings located by bisection on the curve itself.
		const f0 = Number(
			calculateResonantFrequency(neckArea, cavityVolume, effectiveLength),
		);
		const helmholtzParams = params();
		const lower = halfPowerFrequency(f0 / 1e6, f0, 0.5, helmholtzParams);
		const upper = halfPowerFrequency(f0 * 1e6, f0, 0.5, helmholtzParams);
		const bw = Number(
			calculateBandwidth(neckArea, cavityVolume, effectiveLength),
		);
		expect(bw).toBeCloseTo(upper - lower, 6);
		// Sanity: the passband is wider than the resonant frequency itself.
		expect(bw).toBeGreaterThan(f0);
	});

	it("is zero when absorption never reaches 0.5 (over-damped)", () => {
		const bw = Number(
			calculateBandwidth(
				neckArea,
				cavityVolume,
				effectiveLength,
				raFor(30), // r = 30 → 8r − (r+1)² < 0
			),
		);
		expect(bw).toBe(0);
	});

	it("is zero when absorption never reaches 0.5 (under-damped)", () => {
		const bw = Number(
			calculateBandwidth(
				neckArea,
				cavityVolume,
				effectiveLength,
				raFor(0.1), // r = 0.1 → 8r − (r+1)² < 0
			),
		);
		expect(bw).toBe(0);
	});

	it("grows with normalized resistance across the passband window (up to its peak at r = 3)", () => {
		const widths = [0.3, 0.5, 1, 2, 3].map((r: number) =>
			Number(
				calculateBandwidth(neckArea, cavityVolume, effectiveLength, raFor(r)),
			),
		);
		expect(at(widths, 0)).toBeLessThan(at(widths, 1));
		expect(at(widths, 1)).toBeLessThan(at(widths, 2));
		expect(at(widths, 2)).toBeLessThan(at(widths, 3));
		expect(at(widths, 3)).toBeLessThan(at(widths, 4));
	});

	it("rejects non-positive acoustic resistance", () => {
		expect(() =>
			calculateBandwidth(
				neckArea,
				cavityVolume,
				effectiveLength,
				toAcousticResistance(-1000, raylsPerM4),
			),
		).toThrow();
		expect(() =>
			calculateBandwidth(
				neckArea,
				cavityVolume,
				effectiveLength,
				toAcousticResistance(0, raylsPerM4),
			),
		).toThrow();
	});

	it("rejects non-positive geometry", () => {
		expect(() =>
			calculateBandwidth(toArea(0, m2), cavityVolume, effectiveLength),
		).toThrow();
		expect(() =>
			calculateBandwidth(neckArea, toVolume(0, m3), effectiveLength),
		).toThrow();
	});
});
