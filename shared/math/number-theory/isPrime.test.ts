import { isPrime } from "@math/number-theory";
import { describe, expect, it } from "vitest";

describe("isPrime", () => {
	it("should return true for prime numbers", () => {
		expect(isPrime(2)).toBe(true);
		expect(isPrime(3)).toBe(true);
		expect(isPrime(5)).toBe(true);
		expect(isPrime(7)).toBe(true);
		expect(isPrime(11)).toBe(true);
		expect(isPrime(13)).toBe(true);
		expect(isPrime(17)).toBe(true);
		expect(isPrime(19)).toBe(true);
	});

	it("should return false for composite numbers", () => {
		expect(isPrime(4)).toBe(false);
		expect(isPrime(6)).toBe(false);
		expect(isPrime(8)).toBe(false);
		expect(isPrime(9)).toBe(false);
		expect(isPrime(10)).toBe(false);
		expect(isPrime(12)).toBe(false);
		expect(isPrime(15)).toBe(false);
	});

	it("should handle small edge cases", () => {
		expect(isPrime(1)).toBe(false);
		expect(isPrime(2)).toBe(true);
	});

	it("should return false for negative numbers", () => {
		expect(isPrime(-7)).toBe(false);
		expect(isPrime(-2)).toBe(false);
	});
});
