import { describe, expect, it } from "vitest";
import { extendedGcd } from "../extended-gcd";
import { asNonNegativeInteger } from "../helpers";

describe("extendedGcd", () => {
	it("returns gcd and Bézout coefficients", () => {
		const result = extendedGcd(
			asNonNegativeInteger(30),
			asNonNegativeInteger(12),
		);

		expect(result.gcd).toBe(6);
		expect(30 * result.x + 12 * result.y).toBe(6);
	});
	it("handles coprime numbers", () => {
		const result = extendedGcd(
			asNonNegativeInteger(17),
			asNonNegativeInteger(31),
		);

		expect(result.gcd).toBe(1);
		expect(17 * result.x + 31 * result.y).toBe(1);
	});
	it("handles equal numbers", () => {
		const result = extendedGcd(
			asNonNegativeInteger(5),
			asNonNegativeInteger(5),
		);

		expect(result.gcd).toBe(5);
		expect(5 * result.x + 5 * result.y).toBe(5);
	});
	it("handles zero", () => {
		const result = extendedGcd(
			asNonNegativeInteger(42),
			asNonNegativeInteger(0),
		);

		expect(result.gcd).toBe(42);
		expect(result.x).toBe(1);
		expect(result.y).toBe(0);
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
