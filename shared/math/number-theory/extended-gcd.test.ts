import { describe, expect, it } from "vitest";
import { extendedGcd } from "../extended-gcd";

describe("extendedGcd", () => {
	it("returns gcd and Bézout coefficients", () => {
		const result = extendedGcd(30, 12);

		expect(result.gcd).toBe(6);
		expect(30 * result.x + 12 * result.y).toBe(6);
	});
	it("handles coprime numbers", () => {
		const result = extendedGcd(17, 31);

		expect(result.gcd).toBe(1);
		expect(17 * result.x + 31 * result.y).toBe(1);
	});
	it("handles equal numbers", () => {
		const result = extendedGcd(5, 5);

		expect(result.gcd).toBe(5);
		expect(5 * result.x + 5 * result.y).toBe(5);
	});
	it("handles zero", () => {
		const result = extendedGcd(42, 0);

		expect(result.gcd).toBe(42);
		expect(result.x).toBe(1);
		expect(result.y).toBe(0);
	});
});
