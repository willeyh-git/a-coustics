import { asModulus } from "@math/helpers";
import { modPow } from "@math/number-theory";
import { describe, expect, it } from "vitest";

describe("modPow", () => {
	describe("correctness", () => {
		it("returns base^exp % modulus", () => {
			expect(modPow(2, 10, asModulus(11))).toBe(1);
		});

		it("handles exponent 0", () => {
			expect(modPow(5, 0, asModulus(7))).toBe(1);
		});

		it("handles negative bases via modular reduction", () => {
			expect(modPow(-1, 3, asModulus(7))).toBe(6);
		});
	});

	describe("base validation", () => {
		it("throws for fractional bases", () => {
			expect(() => modPow(2.5, 2, asModulus(7))).toThrow(RangeError);
		});

		it("throws for NaN and infinite bases", () => {
			expect(() => modPow(NaN, 2, asModulus(7))).toThrow(RangeError);
			expect(() => modPow(Infinity, 2, asModulus(7))).toThrow(RangeError);
			expect(() => modPow(-Infinity, 2, asModulus(7))).toThrow(RangeError);
		});
	});

	describe("exponent validation", () => {
		it("throws for negative exponents", () => {
			expect(() => modPow(2, -1, asModulus(7))).toThrow(RangeError);
			expect(() => modPow(2, -3, asModulus(7))).toThrow(RangeError);
		});

		it("throws for fractional exponents", () => {
			expect(() => modPow(2, 0.5, asModulus(7))).toThrow(RangeError);
		});

		it("throws for NaN and infinite exponents", () => {
			expect(() => modPow(2, NaN, asModulus(7))).toThrow(RangeError);
			expect(() => modPow(2, Infinity, asModulus(7))).toThrow(RangeError);
			expect(() => modPow(2, -Infinity, asModulus(7))).toThrow(RangeError);
		});

		it("throws for exponents above MAX_SAFE_INTEGER", () => {
			expect(() =>
				modPow(2, Number.MAX_SAFE_INTEGER + 1, asModulus(7)),
			).toThrow(RangeError);
		});
	});
});
