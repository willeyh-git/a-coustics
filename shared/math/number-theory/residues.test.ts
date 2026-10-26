import { asPrime } from "@math/helpers";
import { getQuadraticResidues } from "@math/number-theory";
import { describe, expect, it } from "vitest";

describe("quadratic residues", () => {
	it("should return quadratic residues for p=7", () => {
		// S(i) = i² mod 7 for i=0..6
		// 0^2 mod 7 = 0
		// 1^2 mod 7 = 1
		// 2^2 mod 7 = 4
		// 3^2 mod 7 = 9 mod 7 = 2
		// 4^2 mod 7 = 16 mod 7 = 2
		// 5^2 mod 7 = 25 mod 7 = 4
		// 6^2 mod 7 = 36 mod 7 = 1
		// Sequence: [0, 1, 4, 2, 2, 4, 1]
		// Unique residues: [0, 1, 2, 4]
		const result = getQuadraticResidues(asPrime(7));
		expect(result).toEqual(expect.arrayContaining([0, 1, 2, 4]));
		expect(result.length).toBe(4);
	});

	it("should return quadratic residues for p=11", () => {
		// 0^2 = 0
		// 1^2 = 1
		// 2^2 = 4
		// 3^2 = 9
		// 4^2 = 16 = 5
		// 5^2 = 25 = 3
		// 6^2 = 36 = 3
		// 7^2 = 49 = 5
		// 8^2 = 64 = 9
		// 9^2 = 81 = 4
		// 10^2 = 100 = 1
		// Unique residues: [0, 1, 3, 4, 5, 9]
		const result = getQuadraticResidues(asPrime(11));
		expect(result).toEqual(expect.arrayContaining([0, 1, 3, 4, 5, 9]));
		expect(result.length).toBe(6);
	});

	it("should only contain valid mod p residues", () => {
		const p = 7;
		const result = getQuadraticResidues(asPrime(p));

		for (const r of result) {
			expect(r).toBeGreaterThanOrEqual(0);
			expect(r).toBeLessThan(p);
		}
	});
});
