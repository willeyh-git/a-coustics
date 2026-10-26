import { designPRD } from "@design/prd";
import { toFrequency } from "@geometry/scaling";
import { asPrime } from "@math/helpers";
import { Hz } from "@units/units";
import { describe, expect, it } from "vitest";

describe("designPRD", () => {
	it("should generate a complete PRD design with explicit primitive root", () => {
		const result = designPRD({
			prime: asPrime(7),
			primitiveRoot: 3,
			designFrequency: toFrequency(343, Hz),
		});

		expect(result.primitiveRoot).toBe(3);
		expect(result.sequence).toEqual([1, 3, 2, 6, 4, 5, 1]);

		expect(result.unitDepth).toBeCloseTo(1 / 14, 3);

		expect(result.depths).toHaveLength(7);
	});

	it("should auto-select a primitive root when none provided", () => {
		const result = designPRD({
			prime: asPrime(7),
			designFrequency: toFrequency(343, Hz),
		});

		// 3 is the smallest primitive root of 7; auto-select must converge with the explicit path.
		expect(result.primitiveRoot).toBe(3);
		expect(result.sequence).toEqual([1, 3, 2, 6, 4, 5, 1]);
	});

	it("should have depths derived from sequence × unitDepth", () => {
		const result = designPRD({
			prime: asPrime(7),
			primitiveRoot: 3,
			designFrequency: toFrequency(343, Hz),
		});

		expect(result.depths[0]).toBeCloseTo(1 / 14, 3);
		expect(result.depths[1]).toBeCloseTo(3 / 14, 3);
		expect(result.depths[2]).toBeCloseTo(2 / 14, 3);
		expect(result.depths[3]).toBeCloseTo(6 / 14, 3);
		expect(result.depths[4]).toBeCloseTo(4 / 14, 3);
		expect(result.depths[5]).toBeCloseTo(5 / 14, 3);
	});

	it("should reject non-prime values at construction", () => {
		// Branded types make an invalid Prime unrepresentable; rejection happens at asPrime.
		expect(() =>
			designPRD({
				prime: asPrime(8),
				designFrequency: toFrequency(343, Hz),
			}),
		).toThrow();
	});

	it("should reject an explicit non-primitive root", () => {
		// 2 has order 3 modulo 7, so it is not a primitive root.
		expect(() =>
			designPRD({
				prime: asPrime(7),
				primitiveRoot: 2,
				designFrequency: toFrequency(343, Hz),
			}),
		).toThrow();
	});

	it("should handle p=2 (edge case)", () => {
		const result = designPRD({
			prime: asPrime(2),
			designFrequency: toFrequency(343, Hz),
		});

		expect(result.primitiveRoot).toBe(1);
		expect(result.sequence).toEqual([1, 1]);
		expect(result.unitDepth).toBeCloseTo(1 / 4, 3);
		expect(result.depths).toHaveLength(2);
	});

	it("should generate different sequences for different primes", () => {
		const result7 = designPRD({
			prime: asPrime(7),
			designFrequency: toFrequency(343, Hz),
		});

		const result11 = designPRD({
			prime: asPrime(11),
			designFrequency: toFrequency(343, Hz),
		});

		expect(result7.sequence).toHaveLength(7);
		expect(result11.sequence).toHaveLength(11);
	});
});
