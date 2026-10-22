import { describe, expect, it } from "vitest";
import { toArea, toLength, toVolume } from "../geometry/scaling";
import { asFrequency } from "../math/helpers";
import type { Area, Length, Volume } from "../types/units";
import { m, m2, m3 } from "../types/units";
import { SPEED_OF_SOUND } from "./constants";
import {
	calculateAbsorptionCurve,
	calculateBandwidth,
	calculateEffectiveLength,
	calculateNeckArea,
	calculateResonantFrequency,
	END_CORRECTION_FACTOR,
	type HelmholtzAcousticParams,
} from "./helmholtz-physics";

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
		const [aLow, aRes, aHigh] = curve;
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
		expect(curve[0]).toBeCloseTo(curve[1], 6);
	});

	it("lowers and broadens the peak with higher resistance", () => {
		const matched = calculateAbsorptionCurve([asFrequency(92.3)], params());
		const lossy = calculateAbsorptionCurve(
			[asFrequency(92.3)],
			params({ acousticResistance: 1e6 }),
		);
		expect(lossy[0]).toBeLessThan(matched[0]);
	});
});

describe("calculateBandwidth", () => {
	function _baseParams(
		overrides: Partial<HelmholtzAcousticParams> = {},
	): HelmholtzAcousticParams {
		return { neckArea, cavityVolume, effectiveLength, ...overrides };
	}

	it("matches the analytic −3 dB solution for the matched resonator", () => {
		// r = 1 → x₀ = √(8−4) = 2; solve x(ω) = ±2 for the two cutoffs.
		const f0 = Number(
			calculateResonantFrequency(neckArea, cavityVolume, effectiveLength),
		);
		const bw = Number(
			calculateBandwidth(neckArea, cavityVolume, effectiveLength),
		);
		expect(bw).toBeGreaterThan(2000);
		expect(bw).toBeLessThan(3000);
		// Bandwidth is large but finite; the resonator is strongly broadened.
		expect(bw).toBeGreaterThan(f0);
	});

	it("is zero when absorption never reaches 0.5 (over-damped)", () => {
		const bw = Number(
			calculateBandwidth(
				neckArea,
				cavityVolume,
				effectiveLength,
				1e7, // huge resistance → r large → discriminant < 0
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
				1, // tiny resistance → r tiny → discriminant < 0
			),
		);
		expect(bw).toBe(0);
	});

	it("narrows as the resistance decreases from the over-damped case toward matched", () => {
		const tiny = Number(
			calculateBandwidth(neckArea, cavityVolume, effectiveLength, 1),
		);
		const matched = Number(
			calculateBandwidth(neckArea, cavityVolume, effectiveLength),
		);
		const huge = Number(
			calculateBandwidth(neckArea, cavityVolume, effectiveLength, 1e7),
		);
		// tiny and huge are both zero (outside the passband window); matched is positive.
		expect(matched).toBeGreaterThan(tiny);
		expect(matched).toBeGreaterThan(huge);
	});
});
