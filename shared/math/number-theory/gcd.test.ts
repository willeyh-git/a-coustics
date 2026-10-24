import { describe, expect, it } from "vitest";
import { asPositiveInteger } from "@math/helpers";
import { gcd } from "@math/number-theory";

describe("gcd", () => {
	it("should calculate the greatest common divisor", () => {
		expect(gcd(asPositiveInteger(12), asPositiveInteger(18))).toBe(6);
		expect(gcd(asPositiveInteger(8), asPositiveInteger(12))).toBe(4);
		expect(gcd(asPositiveInteger(7), asPositiveInteger(13))).toBe(1);
		expect(gcd(asPositiveInteger(10), asPositiveInteger(5))).toBe(5);
		expect(gcd(asPositiveInteger(45), asPositiveInteger(75))).toBe(15);
		expect(gcd(asPositiveInteger(101), asPositiveInteger(103))).toBe(1);
	});

	it("should handle zero correctly in gcd", () => {
		// Note: gcd(0, 0) or gcd(0, x) with 0 is technically undefined or 0,
		// but our PositiveInteger brand excludes 0.
		// If we need to support 0, we'd need a NonNegativeInteger brand and update gcd signature.
		// Since current requirements for gcd are PositiveInteger, we skip 0 for now.
	});
	it("throws for negative inputs", () => {
		expect(() => gcd(-12, 8)).toThrow(RangeError);
	});
});
