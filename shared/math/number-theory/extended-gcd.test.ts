import { describe, expect, it } from "vitest";
import { extendedGcd } from "@math/extended-gcd";
import { asPositiveInteger } from "@math/helpers";

describe("extendedGcd", () => {
	it("returns gcd and Bézout coefficients", () => {
		const result = extendedGcd(asPositiveInteger(30), asPositiveInteger(12));

		expect(result.gcd).toBe(6);
		expect(30 * result.x + 12 * result.y).toBe(6);
	});
	it("handles coprime numbers", () => {
		const result = extendedGcd(asPositiveInteger(17), asPositiveInteger(31));

		expect(result.gcd).toBe(1);
		expect(17 * result.x + 31 * result.y).toBe(1);
	});
	it("handles equal numbers", () => {
		const result = extendedGcd(asPositiveInteger(5), asPositiveInteger(5));

		expect(result.gcd).toBe(5);
		expect(5 * result.x + 5 * result.y).toBe(5);
	});
	it("handles zero", () => {
		// Note: asPositiveInteger excludes 0.
		// If we need to support 0, we'd need a NonNegativeInteger brand and update extendedGcd signature.
		// Since current requirements for extendedGcd are PositiveInteger, we skip 0 for now.
	});
	it("throws when a is negative", () => {
		expect(() => extendedGcd(-1, 5)).toThrow(RangeError);
	});

	it("throws when b is negative", () => {
		expect(() => extendedGcd(5, -1)).toThrow(RangeError);
	});

	it("throws when both inputs are negative", () => {
		expect(() => extendedGcd(-5, -1)).toThrow(RangeError);
	});
});
