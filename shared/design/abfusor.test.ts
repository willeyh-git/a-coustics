import { describe, expect, it } from "vitest";
import { toFrequency } from "../geometry/scaling";
import { asPrime, asFlowResistivity } from "../math/helpers";
import { Hz } from "../types/units";
import {
	type ABFUSORWellState,
	type DesignABFUSORResult,
	designABFUSOR,
	type PorousAbsorberSpec,
} from "./abfusor";

const material = (flowResistivity: number): PorousAbsorberSpec => ({
	flowResistivity: asFlowResistivity(flowResistivity),
});

const run = (absorptiveRatio: number, prime: number = 7): DesignABFUSORResult =>
	designABFUSOR({
		prime: asPrime(prime),
		designFrequency: toFrequency(343, Hz),
		absorptiveRatio,
		material: material(50000),
	});

describe("designABFUSOR", () => {
	it("reuses the underlying QRD sequence and depths", () => {
		const result = run(0);

		expect(result.sequence).toEqual([0, 1, 4, 2, 2, 4, 1]);
		expect(result.unitDepth).toBeCloseTo(1 / 14, 3);
		expect(result.depths[2]).toBeCloseTo(4 / 14, 3);
		expect(result.maxDepth).toBeCloseTo(4 / 14, 3);
		expect(result.minDepth).toBeCloseTo(0, 3);
	});

	it("is a pure QRD diffuser when absorptiveRatio is 0", () => {
		const result = run(0);

		const expected: ABFUSORWellState[] = [
			"DIFFUSIVE",
			"DIFFUSIVE",
			"DIFFUSIVE",
			"DIFFUSIVE",
			"DIFFUSIVE",
			"DIFFUSIVE",
			"DIFFUSIVE",
		];
		expect(result.states).toEqual(expected);
		expect(result.absorptiveFraction).toBe(0);
		expect(result.diffusiveFraction).toBe(1);
		expect(result.maxAbsorption).toBe(0);
	});

	it("converts the shallowest wells to absorptive", () => {
		const result = run(0.5);

		// floor(0.5 * 7) = 3 wells. Sorted by ascending depth, the shallowest
		// are indices 0 (depth 0), 1 (1/14) and 6 (1/14).
		const absorptiveIndices = result.wells
			.filter((w) => w.state === "ABSORPTIVE")
			.map((w) => w.index)
			.sort((a, b) => a - b);
		expect(absorptiveIndices).toEqual([0, 1, 6]);
		expect(result.absorptiveFraction).toBeCloseTo(3 / 7, 6);
		expect(result.diffusiveFraction).toBeCloseTo(4 / 7, 6);
		expect(result.absorptiveFraction + result.diffusiveFraction).toBe(1);
	});

	it("assigns zero absorption to diffusive wells and positive to absorptive ones", () => {
		const result = run(0.5);

		for (const w of result.wells) {
			if (w.state === "DIFFUSIVE") {
				expect(w.absorption.values.every((v) => v === 0)).toBe(true);
			} else if (w.index === 1) {
				// Well 1 has a real (1/14 m) absorptive fill.
				expect(w.absorption.values.some((v) => v > 0)).toBe(true);
			}
		}
	});

	it("keeps the overall absorption within [0, 1] and positive when wells absorb", () => {
		const result = run(0.5);

		for (const v of result.overallAbsorption.values) {
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThanOrEqual(1);
		}
		expect(result.maxAbsorption).toBeGreaterThan(0);
	});

	it("absorbs more as the absorptive fraction grows", () => {
		const low = run(0).maxAbsorption;
		const high = run(0.7).maxAbsorption;
		expect(high).toBeGreaterThan(low);
	});

	it("rejects an absorptiveRatio outside [0, 1)", () => {
		expect(() => run(1)).toThrow(RangeError);
		expect(() => run(-0.1)).toThrow(RangeError);
	});

	it("rejects a non-prime order", () => {
		expect(() => run(0.5, 8)).toThrow();
	});

	it("rejects a non-positive flow resistivity", () => {
		expect(() =>
			designABFUSOR({
				prime: asPrime(7),
				designFrequency: toFrequency(343, Hz),
				absorptiveRatio: 0.5,
				material: material(0),
			}),
		).toThrow(RangeError);
	});

	it("honours an explicit frequency axis", () => {
		const axis = [toFrequency(200, Hz), toFrequency(800, Hz)];
		const result = designABFUSOR({
			prime: asPrime(7),
			designFrequency: toFrequency(343, Hz),
			absorptiveRatio: 0.5,
			material: material(50000),
			frequencyAxis: axis,
		});

		expect(result.overallAbsorption.frequencies).toEqual(axis);
		expect(result.overallAbsorption.values).toHaveLength(2);
	});
});
