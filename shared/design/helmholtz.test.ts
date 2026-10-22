import { describe, expect, it } from "vitest";
import { SPEED_OF_SOUND } from "../acoustics/constants";
import { AIR_DENSITY } from "../acoustics/helmholtz-physics";
import { toLength, toVolume } from "../geometry/scaling";
import { asFrequency } from "../math/helpers";
import type { Length, Volume } from "../types/units";
import { m, m3 } from "../types/units";
import { designHelmholtz } from "./helmholtz";

const neckRadius: Length = toLength(0.02, m);
const neckLength: Length = toLength(0.01, m);
const cavityVolume: Volume = toVolume(0.01, m3);

describe("designHelmholtz", () => {
	it("derives the neck area and effective length", () => {
		const result = designHelmholtz({
			neckRadius,
			neckLength,
			cavityVolume,
		});

		expect(Number(result.neckArea)).toBeCloseTo(Math.PI * 0.02 ** 2, 10);
		expect(Number(result.effectiveLength)).toBeCloseTo(0.01 + 1.7 * 0.02, 10);
	});

	it("produces a resonant frequency near 92.3 Hz for the canonical geometry", () => {
		const result = designHelmholtz({
			neckRadius,
			neckLength,
			cavityVolume,
		});

		expect(Number(result.resonantFrequency)).toBeCloseTo(92.3, 1);
	});

	it("defaults to a critically-matched normalized resistance of 1", () => {
		const result = designHelmholtz({
			neckRadius,
			neckLength,
			cavityVolume,
		});

		expect(result.normalizedResistance).toBeCloseTo(1, 10);
		// Ra = Z₀ / A with Z₀ = ρ₀ · c.
		const z0 = AIR_DENSITY * SPEED_OF_SOUND;
		const expectedRa = z0 / (Math.PI * 0.02 ** 2);
		expect(result.acousticResistance).toBeCloseTo(expectedRa, 6);
	});

	it("peaks the absorption curve at the resonant frequency", () => {
		const result = designHelmholtz({
			neckRadius,
			neckLength,
			cavityVolume,
		});

		const { frequencies, values } = result.absorptionCurve;
		const f0 = Number(result.resonantFrequency);

		// Find the sample closest to resonance.
		let peakIndex = 0;
		let peakDist = Number.POSITIVE_INFINITY;
		for (let i = 0; i < frequencies.length; i++) {
			const dist = Math.abs(Number(frequencies[i]) - f0);
			if (dist < peakDist) {
				peakDist = dist;
				peakIndex = i;
			}
		}

		expect(values[peakIndex]).toBeCloseTo(1, 6);
		// The peak is the maximum of the curve.
		expect(values[peakIndex]).toBeGreaterThanOrEqual(Math.max(...values), 1e-9);
	});

	it("reports a positive, finite bandwidth", () => {
		const result = designHelmholtz({
			neckRadius,
			neckLength,
			cavityVolume,
		});

		expect(Number(result.bandwidth)).toBeGreaterThan(0);
	});

	it("generates a logarithmic axis from f₀/3 to 3·f₀ by default", () => {
		const result = designHelmholtz({
			neckRadius,
			neckLength,
			cavityVolume,
		});

		const { frequencies } = result.absorptionCurve;
		expect(frequencies.length).toBe(400);
		const f0 = Number(result.resonantFrequency);
		expect(Number(frequencies[0])).toBeCloseTo(f0 / 3, 3);
		expect(Number(frequencies[frequencies.length - 1])).toBeCloseTo(f0 * 3, 3);
	});

	it("honours an explicit frequency axis", () => {
		const axis = [asFrequency(50), asFrequency(100), asFrequency(200)];
		const result = designHelmholtz({
			neckRadius,
			neckLength,
			cavityVolume,
			frequencyAxis: axis,
		});

		expect(result.absorptionCurve.frequencies).toHaveLength(3);
		expect(result.absorptionCurve.values).toHaveLength(3);
	});

	it("accepts an explicit acoustic resistance", () => {
		const result = designHelmholtz({
			neckRadius,
			neckLength,
			cavityVolume,
			acousticResistance: 5000,
		});

		expect(result.acousticResistance).toBeCloseTo(5000, 10);
		expect(result.normalizedResistance).toBeLessThan(1);
		// Higher-than-matched resistance lowers the peak absorption.
		expect(Math.max(...result.absorptionCurve.values)).toBeLessThan(1);
	});

	it("increases the resonant frequency with a larger neck or smaller cavity", () => {
		const base = designHelmholtz({
			neckRadius,
			neckLength,
			cavityVolume,
		});

		const biggerNeck = designHelmholtz({
			neckRadius: toLength(0.03, m),
			neckLength,
			cavityVolume,
		});
		const smallerCavity = designHelmholtz({
			neckRadius,
			neckLength,
			cavityVolume: toVolume(0.002, m3),
		});

		expect(Number(biggerNeck.resonantFrequency)).toBeGreaterThan(
			Number(base.resonantFrequency),
		);
		expect(Number(smallerCavity.resonantFrequency)).toBeGreaterThan(
			Number(base.resonantFrequency),
		);
	});

	it("is the inverse of the resonant-frequency formula", () => {
		// Given a target resonant frequency and fixed geometry, the reported
		// frequency must match the lumped-parameter prediction.
		const A = Math.PI * 0.02 ** 2;
		const V = 0.01;
		const L = 0.01 + 1.7 * 0.02;
		const expected = (SPEED_OF_SOUND / (2 * Math.PI)) * Math.sqrt(A / (V * L));

		const result = designHelmholtz({
			neckRadius,
			neckLength,
			cavityVolume,
		});

		expect(Number(result.resonantFrequency)).toBeCloseTo(expected, 10);
	});
});
