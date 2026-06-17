import { describe, expect, it } from "vitest";
import { isPrime } from "./math-helpers";

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
