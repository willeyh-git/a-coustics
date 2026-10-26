import { validateQRDDesign } from "@validators/qrd";
import { describe, expect, it } from "vitest";

describe("validateQRDDesign", () => {
	it("accepts a valid prime order and design frequency", () => {
		expect(validateQRDDesign({ prime: 7, designFrequency: 1000 })).toEqual({
			valid: true,
		});
	});

	it("rejects a non-prime order", () => {
		const result = validateQRDDesign({ prime: 6, designFrequency: 1000 });

		expect(result).toEqual({
			valid: false,
			errors: [{ field: "prime", message: "Value 6 must be a prime number." }],
		});
	});

	it("rejects an order outside the accepted range", () => {
		const result = validateQRDDesign({
			prime: 10_000_003,
			designFrequency: 1000,
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual(["prime"]);
			expect(result.errors.map((error) => error.message).join(" ")).toContain(
				"between 3 and 100",
			);
		}
	});

	it("rejects a non-positive design frequency", () => {
		const result = validateQRDDesign({ prime: 7, designFrequency: 0 });

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual([
				"designFrequency",
			]);
		}
	});

	it("reports every problem at once", () => {
		const result = validateQRDDesign({ prime: 4, designFrequency: -5 });

		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual([
				"prime",
				"designFrequency",
			]);
			expect(result.errors.map((error) => error.message)).toEqual([
				"Value 4 must be a prime number.",
				"Value must be greater than zero (got -5).",
			]);
		}
	});

	it("treats an omitted required field as a user error", () => {
		const result = validateQRDDesign({});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual([
				"prime",
				"designFrequency",
			]);
		}
	});
});
