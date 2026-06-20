import { describe, expect, it } from "vitest";
import { asNonNegativeInteger } from "../helpers";
import { gcd } from "../number-theory";

describe("gcd", () => {
	it("should calculate the greatest common divisor", () => {
		expect(gcd(asNonNegativeInteger(12), asNonNegativeInteger(18))).toBe(6);
		expect(gcd(asNonNegativeInteger(8), asNonNegativeInteger(12))).toBe(4);
		expect(gcd(asNonNegativeInteger(7), asNonNegativeInteger(13))).toBe(1);
		expect(gcd(asNonNegativeInteger(10), asNonNegativeInteger(5))).toBe(5);
		expect(gcd(asNonNegativeInteger(45), asNonNegativeInteger(75))).toBe(15);
		expect(gcd(asNonNegativeInteger(101), asNonNegativeInteger(103))).toBe(1);
	});

	it("should handle zero correctly in gcd", () => {
		expect(gcd(asNonNegativeInteger(0), asNonNegativeInteger(5))).toBe(5);
		expect(gcd(asNonNegativeInteger(0), asNonNegativeInteger(0))).toBe(0);
	});
	it("throws for negative inputs", () => {
		expect(() => gcd(-12, 8)).toThrow(RangeError);
	});
});
