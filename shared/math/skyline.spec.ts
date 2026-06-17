import { describe, expect, it } from "vitest";
import { calculateSkylineDepths, getSkylineDepths } from "./skyline";

describe("skyline math", () => {
	describe("calculateSkylineDepths", () => {
		it("should calculate depths correctly for n=5", () => {
			const depths = calculateSkylineDepths(5);
			expect(depths).toEqual([0, 1, 4, 4, 1]);
		});

		it("should calculate depths correctly for n=7", () => {
			const depths = calculateSkylineDepths(7);
			expect(depths).toEqual([0, 1, 4, 2, 2, 4, 1]);
		});

		it("should throw error if p is not prime", () => {
			expect(() => calculateSkylineDepths(4)).toThrow(
				"p must be a prime number.",
			);
			expect(() => calculateSkylineDepths(10)).toThrow(
				"p must be a prime number.",
			);
		});
	});

	describe("getSkylineDepths", () => {
		it("should return depths for a prime order", () => {
			const result = getSkylineDepths(5);
			expect(result.order).toBe(5);
			expect(result.depths).toEqual([0, 1, 4, 4, 1]);
		});

		it("should find the next prime order if n is not prime", () => {
			const result4 = getSkylineDepths(4);
			expect(result4.order).toBe(5);
			expect(result4.depths).toEqual([0, 1, 4, 4, 1]);

			const result6 = getSkylineDepths(6);
			expect(result6.order).toBe(7);
			expect(result6.depths).toEqual([0, 1, 4, 2, 2, 4, 1]);
		});
	});
});
