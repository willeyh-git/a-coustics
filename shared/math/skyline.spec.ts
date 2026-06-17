import { describe, expect, it } from "vitest";
import { calculateSkylineDepths, getSkylineDepths, getSkylineCalculations } from "./skyline";

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

	describe("getSkylineCalculations", () => {
		it("should return correct geometry and acoustics", () => {
			// Use rows=3, cols=5 so order=15
			const result = getSkylineCalculations(1000, 1000, 200, 3, 5);
			expect(result.order).toBe(15);
			// Depths for next prime after 15 (which is 17)
			expect(result.depths).toHaveLength(17);
			// 343 / (2 * avgCellDim) where avgCellDim = (1000/5 + 1000/3) / 2 = 266.66
			// wavelengthD = 266.66 * (1 + 200 / 266.66) = 266.66 * 1.75 = 466.66
			// designFrequency = 343 / 466.66 = 0.735
			expect(result.designFrequency).toBeCloseTo(0.735, 2);
			expect(result.minFrequency).toBeLessThan(result.maxFrequency);
		});
	});
});
