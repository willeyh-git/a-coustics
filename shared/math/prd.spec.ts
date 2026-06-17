import { describe, expect, it } from "vitest";
import { calculatePRDDepths, getPRDDepths } from "./prd";

describe("prd math", () => {
	describe("calculatePRDDepths", () => {
		it("should calculate depths correctly for prime p=3", () => {
			// Smallest prime > 1 is 2. p=3 is a good test.
			// Primitive root of 3 is 2.
			// g^0 mod 3 = 1
			// g^1 mod 3 = 2
			const depths = calculatePRDDepths(3);
			expect(depths).toEqual([1, 2]);
		});

		it("should calculate depths correctly for prime p=7", () => {
			// Primitive roots of 7 are 3 and 5.
			// If g=3: 3^0=1, 3^1=3, 3^2=2, 3^3=6, 3^4=4, 3^5=5
			const depths = calculatePRDDepths(7);
			expect(depths).toEqual([1, 3, 2, 6, 4, 5]);
		});

		it("should throw error if p is not prime", () => {
			expect(() => calculatePRDDepths(4)).toThrow("p must be a prime number.");
			expect(() => calculatePRDDepths(10)).toThrow("p must be a prime number.");
		});
	});

	describe("getPRDDepths", () => {
		it("should return depths for a prime order", () => {
			const result = getPRDDepths(7);
			expect(result.order).toBe(7);
			expect(result.depths).toEqual([1, 3, 2, 6, 4, 5]);
		});

		it("should find the next prime order if n is not prime", () => {
			const result4 = getPRDDepths(4);
			expect(result4.order).toBe(5);
			// p=5, primitive root g=2.
			// 2^0=1, 2^1=2, 2^2=4, 2^3=3
			expect(result4.depths).toEqual([1, 2, 4, 3]);

			const result6 = getPRDDepths(6);
			expect(result6.order).toBe(7);
			expect(result6.depths).toEqual([1, 3, 2, 6, 4, 5]);
		});
	});
});
