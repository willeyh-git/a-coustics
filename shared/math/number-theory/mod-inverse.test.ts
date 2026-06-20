import { describe, expect, it } from "vitest";
import { asInteger, asPositiveInteger } from "../helpers";
import { modInverse } from "./mod-inverse";

describe("modInverse", () => {
	describe("valid inverses", () => {
		it("finds the inverse of 3 mod 11", () => {
			expect(modInverse(asInteger(3), asPositiveInteger(11))).toBe(4);
		});

		it("finds the inverse of 10 mod 17", () => {
			expect(modInverse(asInteger(10), asPositiveInteger(17))).toBe(12);
		});

		it("finds the inverse of 1 mod n", () => {
			expect(modInverse(asInteger(1), asPositiveInteger(7))).toBe(1);
			expect(modInverse(asInteger(1), asPositiveInteger(101))).toBe(1);
		});

		it("returns a positive representative", () => {
			expect(modInverse(asInteger(11), asPositiveInteger(26))).toBe(19);
		});
	});

	describe("non-existent inverses", () => {
		it("throws when gcd(a, m) ≠ 1", () => {
			expect(() => modInverse(asInteger(2), asPositiveInteger(4))).toThrow(
				Error,
			);
			expect(() => modInverse(asInteger(6), asPositiveInteger(9))).toThrow(
				Error,
			);
			expect(() => modInverse(asInteger(12), asPositiveInteger(18))).toThrow(
				Error,
			);
		});
	});

	describe("domain validation", () => {
		it("throws for zero modulus", () => {
			expect(() => modInverse(asInteger(3), asPositiveInteger(0))).toThrow(
				RangeError,
			);
		});

		it("throws for negative a", () => {
			expect(() => modInverse(asInteger(-3), asPositiveInteger(11))).toThrow(
				RangeError,
			);
		});

		it("throws for negative modulus", () => {
			expect(() => modInverse(asInteger(3), asPositiveInteger(-11))).toThrow(
				RangeError,
			);
		});

		it("throws for non-integer a", () => {
			expect(() => modInverse(asInteger(3.5), asPositiveInteger(11))).toThrow(
				RangeError,
			);
		});

		it("throws for non-integer modulus", () => {
			expect(() => modInverse(asInteger(3), asPositiveInteger(11.5))).toThrow(
				RangeError,
			);
		});

		it("throws for NaN", () => {
			expect(() => modInverse(asInteger(NaN), asPositiveInteger(11))).toThrow(
				RangeError,
			);
			expect(() => modInverse(asInteger(3), asPositiveInteger(NaN))).toThrow(
				RangeError,
			);
		});

		it("throws for Infinity", () => {
			expect(() =>
				modInverse(asInteger(Infinity), asPositiveInteger(11)),
			).toThrow(RangeError);
			expect(() =>
				modInverse(asInteger(3), asPositiveInteger(Infinity)),
			).toThrow(RangeError);
		});
		it("throws for zero", () => {
			expect(() => modInverse(asInteger(0), asPositiveInteger(7))).toThrow(
				RangeError,
			);
		});
	});
});
