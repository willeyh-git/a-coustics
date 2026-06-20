import { describe, expect, it } from "vitest";
import {
	assertInteger,
	assertNonNegativeInteger,
	assertPositiveInteger,
	assertPrime,
} from "./helpers";

describe("Math Helpers", () => {
	describe("assertInteger", () => {
		it("should pass for integers", () => {
			expect(() => assertInteger(1)).not.toThrow();
			expect(() => assertInteger(0)).not.toThrow();
			expect(() => assertInteger(-5)).not.toThrow();
			expect(() => assertInteger(100)).not.toThrow();
		});

		it("should throw for non-integers", () => {
			expect(() => assertInteger(1.5)).toThrow(RangeError);
			expect(() => assertInteger(NaN)).toThrow(RangeError);
			expect(() => assertInteger(Infinity)).toThrow(RangeError);
		});
	});

	describe("assertNonNegativeInteger", () => {
		it("should pass for non-negative integers", () => {
			expect(() => assertNonNegativeInteger(0)).not.toThrow();
			expect(() => assertNonNegativeInteger(1)).not.toThrow();
			expect(() => assertNonNegativeInteger(100)).not.toThrow();
		});

		it("should throw for negative integers", () => {
			expect(() => assertNonNegativeInteger(-1)).toThrow(RangeError);
			expect(() => assertNonNegativeInteger(-100)).toThrow(RangeError);
		});

		it("should throw for non-integers", () => {
			expect(() => assertNonNegativeInteger(1.5)).toThrow(RangeError);
		});
	});

	describe("assertPositiveInteger", () => {
		it("should pass for positive integers", () => {
			expect(() => assertPositiveInteger(1)).not.toThrow();
			expect(() => assertPositiveInteger(100)).not.toThrow();
		});

		it("should throw for 0", () => {
			expect(() => assertPositiveInteger(0)).toThrow(RangeError);
		});

		it("should throw for negative integers", () => {
			expect(() => assertPositiveInteger(-1)).toThrow(RangeError);
			expect(() => assertPositiveInteger(-100)).toThrow(RangeError);
		});

		it("should throw for non-integers", () => {
			expect(() => assertPositiveInteger(1.5)).toThrow(RangeError);
		});
	});

	describe("assertPrime", () => {
		it("should pass for prime numbers", () => {
			expect(() => assertPrime(2)).not.toThrow();
			expect(() => assertPrime(3)).not.toThrow();
			expect(() => assertPrime(5)).not.toThrow();
			expect(() => assertPrime(7)).not.toThrow();
			expect(() => assertPrime(11)).not.toThrow();
			expect(() => assertPrime(13)).not.toThrow();
			expect(() => assertPrime(17)).not.toThrow();
			expect(() => assertPrime(19)).not.toThrow();
		});

		it("should throw for non-prime numbers", () => {
			expect(() => assertPrime(1)).toThrow(RangeError);
			expect(() => assertPrime(4)).toThrow(RangeError);
			expect(() => assertPrime(6)).toThrow(RangeError);
			expect(() => assertPrime(8)).toThrow(RangeError);
			expect(() => assertPrime(9)).toThrow(RangeError);
			expect(() => assertPrime(10)).toThrow(RangeError);
			expect(() => assertPrime(15)).toThrow(RangeError);
		});

		it("should throw for negative numbers", () => {
			expect(() => assertPrime(-2)).toThrow(RangeError);
			expect(() => assertPrime(-7)).toThrow(RangeError);
		});

		it("should throw for non-integers", () => {
			expect(() => assertPrime(1.5)).toThrow(RangeError);
			expect(() => assertPrime(2.1)).toThrow(RangeError);
		});
	});
});
