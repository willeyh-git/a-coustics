import { describe, it, expect } from "vitest";
import { calculateQRDDepths, isPrime, getQRDDepths } from "./qrd";

describe("qrd math", () => {
	describe("isPrime", () => {
		it("should return true for prime numbers", () => {
			expect(isPrime(2)).toBe(true);
			expect(isPrime(3)).toBe(true);
			expect(isPrime(5)).toBe(true);
			expect(isPrime(7)).toBe(true);
			expect(isPrime(11)).toBe(true);
			expect(isPrime(97)).toBe(true);
		});

		it("should return false for non-prime numbers", () => {
			expect(isPrime(1)).toBe(false);
			expect(isPrime(0)).toBe(false);
			expect(isPrime(-5)).toBe(false);
			expect(isPrime(4)).toBe(false);
			expect(isPrime(6)).toBe(false);
			expect(isPrime(8)).toBe(false);
			expect(isPrime(9)).toBe(false);
			expect(isPrime(10)).toBe(false);
		});
	});

	describe("calculateQRDDepths", () => {
		it("should calculate depths correctly for n=5", () => {
			const depths = calculateQRDDepths(5);
			expect(depths).toEqual([0, 1, 4, 4, 1]);
		});

		it("should calculate depths correctly for n=7", () => {
			const depths = calculateQRDDepths(7);
			expect(depths).toEqual([0, 1, 4, 2, 2, 4, 1]);
		});

		it("should throw error for non-positive n", () => {
			expect(() => calculateQRDDepths(0)).toThrow();
			expect(() => calculateQRDDepths(-1)).toThrow();
		});
	});

	describe("getQRDDepths", () => {
		it("should return depths for a prime order", () => {
			const result = getQRDDepths(5);
			expect(result.order).toBe(5);
			expect(result.depths).toEqual([0, 1, 4, 4, 1]);
		});

		it("should find the next prime order if n is not prime", () => {
			const result4 = getQRDDepths(4);
			expect(result4.order).toBe(5);
			expect(result4.depths).toEqual([0, 1, 4, 4, 1]);

			const result6 = getQRDDepths(6);
			expect(result6.order).toBe(7);
			expect(result6.depths).toEqual([0, 1, 4, 2, 2, 4, 1]);
		});
	});
});
