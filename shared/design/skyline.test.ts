import { describe, expect, it } from "vitest";
import { toFrequency } from "../geometry/scaling";
import { asPrime } from "../math/helpers";
import { Hz } from "../types/units";
import { designSkyline } from "./skyline";

describe("designSkyline", () => {
	const prime = asPrime(7);
	const freq = toFrequency(343, Hz);

	it("generates a square p × p grid (QRD default)", () => {
		const result = designSkyline({ prime, designFrequency: freq });

		expect(result.sequenceType).toBe("QRD");
		expect(result.grid).toHaveLength(7);
		for (const row of result.grid) {
			expect(row).toHaveLength(7);
		}
	});

	it("derives the grid from the QRD source sequence", () => {
		const result = designSkyline({ prime, designFrequency: freq });

		expect(result.sequence).toEqual([0, 1, 4, 2, 2, 4, 1]);
	});

	it("computes Height(i, j) = (S(i) + S(j)) mod p", () => {
		const result = designSkyline({ prime, designFrequency: freq });

		expect(result.grid[0][0]).toBe(0);
		expect(result.grid[0][1]).toBe(1);
		expect(result.grid[1][0]).toBe(1);
		expect(result.grid[2][2]).toBe((4 + 4) % 7);
		expect(result.grid[3][5]).toBe((2 + 4) % 7);
	});

	it("is symmetric across the diagonal", () => {
		const result = designSkyline({ prime, designFrequency: freq });

		for (let i = 0; i < 7; i++) {
			for (let j = 0; j < 7; j++) {
				expect(result.grid[i][j]).toBe(result.grid[j][i]);
			}
		}
	});

	it("uses the QRD unit height as the unit height", () => {
		const result = designSkyline({ prime, designFrequency: freq });

		expect(result.unitHeight).toBeCloseTo(1 / 14, 3);
	});

	it("converts the grid into physical heights", () => {
		const result = designSkyline({ prime, designFrequency: freq });

		expect(result.heights).toHaveLength(7);
		expect(result.heights[0][0]).toBeCloseTo(0, 3);
		expect(result.heights[1][1]).toBeCloseTo((1 + 1) / 14, 3);
		expect(result.heights[2][2]).toBeCloseTo(((4 + 4) % 7) / 14, 3);
	});

	it("reports the max residue and max height", () => {
		const result = designSkyline({ prime, designFrequency: freq });

		// Max residue for (S(i)+S(j)) mod 7 is 6, reached by 4 + 2.
		expect(result.maxResidue).toBe(6);
		expect(result.maxHeight).toBeCloseTo(6 / 14, 3);
	});

	it("has no primitive root for QRD", () => {
		const result = designSkyline({ prime, designFrequency: freq });

		expect(result.primitiveRoot).toBeUndefined();
	});

	it("handles small primes (p = 3)", () => {
		const result = designSkyline({
			prime: asPrime(3),
			designFrequency: freq,
		});

		expect(result.sequence).toEqual([0, 1, 1]);
		expect(result.grid).toHaveLength(3);
		expect(result.grid[1][1]).toBe(2);
		expect(result.maxResidue).toBe(2);
		// Unit height is λ/(2p) = 1/6 at 343 Hz.
		expect(result.unitHeight).toBeCloseTo(1 / 6, 3);
		expect(result.maxHeight).toBeCloseTo(2 / 6, 3);
	});

	it("defaults to QRD when sequenceType is omitted", () => {
		const result = designSkyline({ prime, designFrequency: freq });
		expect(result.sequenceType).toBe("QRD");
	});

	it("supports PRD sequence source", () => {
		const result = designSkyline({
			prime,
			designFrequency: freq,
			sequenceType: "PRD",
		});

		expect(result.sequenceType).toBe("PRD");
		expect(result.primitiveRoot).toBe(3); // primitive root of 7
		expect(result.grid).toHaveLength(7);
		expect(result.sequence).toEqual([1, 3, 2, 6, 4, 5, 1]);
	});

	it("derives the PRD grid from the source sequence", () => {
		const result = designSkyline({
			prime,
			designFrequency: freq,
			sequenceType: "PRD",
		});

		// First sequence value is 1: (1 + 1) mod 7 = 2, (1 + 6) mod 7 = 0.
		expect(result.grid[0][0]).toBe(2);
		expect(result.grid[0][1]).toBe(4);
		expect(result.grid[0][3]).toBe(0);

		for (let i = 0; i < 7; i++) {
			for (let j = 0; j < 7; j++) {
				expect(result.grid[i][j]).toBe((result.sequence[i] + result.sequence[j]) % 7);
			}
		}
	});

	it("repeats the first row/column for PRD (g^(p-1) = g^0 = 1)", () => {
		const result = designSkyline({
			prime,
			designFrequency: freq,
			sequenceType: "PRD",
		});

		for (let j = 0; j < 7; j++) {
			expect(result.grid[0][j]).toBe(result.grid[6][j]);
			expect(result.grid[j][0]).toBe(result.grid[j][6]);
		}
	});

	it("accepts an explicitly valid primitive root for PRD", () => {
		const result = designSkyline({
			prime,
			designFrequency: freq,
			sequenceType: "PRD",
			primitiveRoot: 5,
		});

		expect(result.primitiveRoot).toBe(5);
		expect(result.sequence).toEqual([1, 5, 4, 6, 2, 3, 1]);
	});

	it("rejects an explicitly invalid primitive root", () => {
		expect(() =>
			designSkyline({
				prime,
				designFrequency: freq,
				sequenceType: "PRD",
				primitiveRoot: 1,
			}),
		).toThrow(RangeError);
	});
});
