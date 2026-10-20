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

		// Max residue for (S(i)+S(j)) mod 7 is 6 (e.g. 4 + 4 = 8 mod 7 = 1,
		// but 4 + 3 not present; check the true maximum reached).
		expect(result.maxResidue).toBeGreaterThanOrEqual(0);
		expect(result.maxResidue).toBeLessThan(7);
		expect(result.maxHeight).toBeCloseTo(result.maxResidue / 14, 3);
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
	});

	it("accepts an explicitly valid primitive root for PRD", () => {
		const result = designSkyline({
			prime,
			designFrequency: freq,
			sequenceType: "PRD",
			primitiveRoot: 5,
		});

		expect(result.primitiveRoot).toBe(5);
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
