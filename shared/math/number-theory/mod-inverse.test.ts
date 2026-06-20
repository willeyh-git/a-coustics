import { describe, expect, it } from "vitest";
import { modInverse } from "./mod-inverse";

describe("modInverse", () => {
	describe("valid inverses", () => {
		it("finds the inverse of 3 mod 11", () => {
			expect(modInverse(3, 11)).toBe(4);
		});

		it("finds the inverse of 10 mod 17", () => {
			expect(modInverse(10, 17)).toBe(12);
		});

		it("finds the inverse of 1 mod n", () => {
			expect(modInverse(1, 7)).toBe(1);
			expect(modInverse(1, 101)).toBe(1);
		});

		it("returns a positive representative", () => {
			expect(modInverse(11, 26)).toBe(19);
		});
	});

	describe("non-existent inverses", () => {
		it("throws when gcd(a, m) ≠ 1", () => {
			expect(() => modInverse(2, 4)).toThrow(RangeError);
			expect(() => modInverse(6, 9)).toThrow(RangeError);
			expect(() => modInverse(12, 18)).toThrow(RangeError);
		});
	});

	describe("domain validation", () => {
		it("throws for zero modulus", () => {
			expect(() => modInverse(3, 0)).toThrow(RangeError);
		});

		it("throws for negative a", () => {
			expect(() => modInverse(-3, 11)).toThrow(RangeError);
		});

		it("throws for negative modulus", () => {
			expect(() => modInverse(3, -11)).toThrow(RangeError);
		});

		it("throws for non-integer a", () => {
			expect(() => modInverse(3.5, 11)).toThrow(RangeError);
		});

		it("throws for non-integer modulus", () => {
			expect(() => modInverse(3, 11.5)).toThrow(RangeError);
		});

		it("throws for NaN", () => {
			expect(() => modInverse(NaN, 11)).toThrow(RangeError);
			expect(() => modInverse(3, NaN)).toThrow(RangeError);
		});

		it("throws for Infinity", () => {
			expect(() => modInverse(Infinity, 11)).toThrow(RangeError);
			expect(() => modInverse(3, Infinity)).toThrow(RangeError);
		});
		it("throws for zero", () => {
			expect(() => modInverse(0, 7)).toThrow(RangeError);
		});
	});
});
