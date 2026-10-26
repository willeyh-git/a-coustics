import { asModulus, asPositiveInteger, asPrime } from "@math/helpers";
import { modInverse } from "@math/number-theory/mod-inverse";
import { describe, expect, it } from "vitest";

describe("modInverse", () => {
	describe("valid inverses", () => {
		it("finds the inverse of 3 mod 11", () => {
			expect(modInverse(asPositiveInteger(3), asPositiveInteger(11))).toBe(4);
		});

		it("finds the inverse of 10 mod 17", () => {
			expect(modInverse(asPositiveInteger(10), asPositiveInteger(17))).toBe(12);
		});

		it("finds the inverse of 1 mod n", () => {
			expect(modInverse(asPositiveInteger(1), asPositiveInteger(7))).toBe(1);
			expect(modInverse(asPositiveInteger(1), asPositiveInteger(101))).toBe(1);
		});

		it("returns a positive representative", () => {
			expect(modInverse(asPositiveInteger(11), asPositiveInteger(26))).toBe(19);
		});
	});

	describe("non-existent inverses", () => {
		it("throws when gcd(a, m) ≠ 1", () => {
			expect(() =>
				modInverse(asPositiveInteger(2), asPositiveInteger(4)),
			).toThrow(RangeError);
			expect(() =>
				modInverse(asPositiveInteger(6), asPositiveInteger(9)),
			).toThrow(RangeError);
			expect(() =>
				modInverse(asPositiveInteger(12), asPositiveInteger(18)),
			).toThrow(RangeError);
		});
	});

	// Moduli are not tied to one brand: prime-field code holds `Modulus` or
	// `Prime` values, and a composite modulus (a ring `Z/mZ`) is a plain
	// `PositiveInteger`. `modInverse` accepts all three, so no call site needs
	// an unsafe cast to a single brand.
	describe("accepts any positive brand as modulus", () => {
		it("accepts a Modulus-branded prime modulus", () => {
			// 3 · 4 = 12 ≡ 1 (mod 11).
			expect(modInverse(asPositiveInteger(3), asModulus(11))).toBe(4);
			expect(modInverse(asPositiveInteger(10), asModulus(17))).toBe(12);
		});

		it("accepts a Prime-branded modulus", () => {
			expect(modInverse(asPositiveInteger(3), asPrime(11))).toBe(4);
			// 11 · 8 = 88 ≡ 1 (mod 29).
			expect(modInverse(asPositiveInteger(11), asPrime(29))).toBe(8);
		});
	});

	// Out-of-domain literals never reach `modInverse`: the parameters are
	// branded, so `asPositiveInteger` throws while building the argument. These
	// assertions pin that junk cannot even be *passed* (construction itself is
	// covered in `helpers.test.ts`); the guards inside `modInverse` exist for
	// unbranded JavaScript callers and are not reachable from typed code.
	describe("rejects out-of-domain arguments at construction", () => {
		it("rejects a zero modulus", () => {
			expect(() =>
				modInverse(asPositiveInteger(3), asPositiveInteger(0)),
			).toThrow(RangeError);
		});

		it("rejects a negative a", () => {
			expect(() =>
				modInverse(asPositiveInteger(-3), asPositiveInteger(11)),
			).toThrow(RangeError);
		});

		it("rejects a negative modulus", () => {
			expect(() =>
				modInverse(asPositiveInteger(3), asPositiveInteger(-11)),
			).toThrow(RangeError);
		});

		it("rejects a non-integer a", () => {
			expect(() =>
				modInverse(asPositiveInteger(3.5), asPositiveInteger(11)),
			).toThrow(RangeError);
		});

		it("rejects a non-integer modulus", () => {
			expect(() =>
				modInverse(asPositiveInteger(3), asPositiveInteger(11.5)),
			).toThrow(RangeError);
		});

		it("rejects NaN", () => {
			expect(() =>
				modInverse(asPositiveInteger(NaN), asPositiveInteger(11)),
			).toThrow(RangeError);
			expect(() =>
				modInverse(asPositiveInteger(3), asPositiveInteger(NaN)),
			).toThrow(RangeError);
		});

		it("rejects Infinity", () => {
			expect(() =>
				modInverse(asPositiveInteger(Infinity), asPositiveInteger(11)),
			).toThrow(RangeError);
			expect(() =>
				modInverse(asPositiveInteger(3), asPositiveInteger(Infinity)),
			).toThrow(RangeError);
		});
		it("rejects a zero a", () => {
			expect(() =>
				modInverse(asPositiveInteger(0), asPositiveInteger(7)),
			).toThrow(RangeError);
		});
	});
});
