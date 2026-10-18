import { describe, expect, it } from "vitest";
import { asPositiveInteger } from "../helpers";
import { modInverse } from "./mod-inverse";

describe("modInverse", () => {
	describe("valid inverses", () => {
		it("finds the inverse of 3 mod 11", () => {
			expect(modInverse(asPositiveInteger(3), asPositiveInteger(11) as Modulus)).toBe(4);
		});

		it("finds the inverse of 10 mod 17", () => {
			expect(modInverse(asPositiveInteger(10), asPositiveInteger(17) as Modulus)).toBe(12);
		});

		it("finds the inverse of 1 mod n", () => {
			expect(modInverse(asPositiveInteger(1), asPositiveInteger(7) as Modulus)).toBe(1);
			expect(modInverse(asPositiveInteger(1), asPositiveInteger(101) as Modulus)).toBe(1);
		});

		it("returns a positive representative", () => {
			expect(modInverse(asPositiveInteger(11), asPositiveInteger(26) as Modulus)).toBe(19);
		});
	});

	describe("non-existent inverses", () => {
		it("throws when gcd(a, m) ≠ 1", () => {
			expect(() => modInverse(asPositiveInteger(2), asPositiveInteger(4) as Modulus)).toThrow(
				Error,
			);
			expect(() => modInverse(asPositiveInteger(6), asPositiveInteger(9) as Modulus)).toThrow(
				Error,
			);
			expect(() => modInverse(asPositiveInteger(12), asPositiveInteger(18) as Modulus)).toThrow(
				Error,
			);
		});
	});

	describe("domain validation", () => {
		it("throws for zero modulus", () => {
			expect(() => modInverse(asPositiveInteger(3), asPositiveInteger(0) as Modulus)).toThrow(
				RangeError,
			);
		});

		it("throws for negative a", () => {
			expect(() => modInverse(asPositiveInteger(-3), asPositiveInteger(11) as Modulus)).toThrow(
				RangeError,
			);
		});

		it("throws for negative modulus", () => {
			expect(() => modInverse(asPositiveInteger(3), asPositiveInteger(-11) as Modulus)).toThrow(
				RangeError,
			);
		});

		it("throws for non-integer a", () => {
			expect(() => modInverse(asPositiveInteger(3.5), asPositiveInteger(11) as Modulus)).toThrow(
				RangeError,
			);
		});

		it("throws for non-integer modulus", () => {
			expect(() => modInverse(asPositiveInteger(3), asPositiveInteger(11.5) as Modulus)).toThrow(
				RangeError,
			);
		});

		it("throws for NaN", () => {
			expect(() => modInverse(asPositiveInteger(NaN), asPositiveInteger(11) as Modulus)).toThrow(
				RangeError,
			);
			expect(() => modInverse(asPositiveInteger(3), asPositiveInteger(NaN) as Modulus)).toThrow(
				RangeError,
			);
		});

		it("throws for Infinity", () => {
			expect(() =>
				modInverse(asPositiveInteger(Infinity), asPositiveInteger(11) as Modulus),
			).toThrow(RangeError);
			expect(() =>
				modInverse(asPositiveInteger(3), asPositiveInteger(Infinity) as Modulus),
			).toThrow(RangeError);
		});
		it("throws for zero", () => {
			expect(() => modInverse(asPositiveInteger(0), asPositiveInteger(7) as Modulus)).toThrow(
				RangeError,
			);
		});
	});
});
