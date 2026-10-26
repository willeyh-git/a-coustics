import { validatePRDDesign } from "@validators/prd";
import { describe, expect, it } from "vitest";

describe("validatePRDDesign", () => {
	it("accepts a valid prime, frequency and primitive root", () => {
		expect(
			validatePRDDesign({ prime: 7, primitiveRoot: 3, designFrequency: 1000 }),
		).toEqual({ valid: true });
	});

	it("accepts a design that omits the root (auto-selected)", () => {
		expect(validatePRDDesign({ prime: 7, designFrequency: 1000 })).toEqual({
			valid: true,
		});
	});

	it("rejects a value that is not a primitive root modulo the order", () => {
		const result = validatePRDDesign({
			prime: 7,
			primitiveRoot: 2,
			designFrequency: 1000,
		});

		expect(result).toEqual({
			valid: false,
			errors: [
				{
					field: "primitiveRoot",
					message: "Value 2 must be a primitive root modulo 7.",
				},
			],
		});
	});

	it("rejects a non-integer root", () => {
		const result = validatePRDDesign({
			prime: 7,
			primitiveRoot: "3",
			designFrequency: 1000,
		});

		if (!result.valid) {
			expect(result.errors).toEqual([
				{
					field: "primitiveRoot",
					message: 'Value must be an integer (got "3").',
				},
			]);
		}
	});

	it("reports the order problem once, not also against the root", () => {
		const result = validatePRDDesign({
			prime: 4,
			primitiveRoot: 99,
			designFrequency: 1000,
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual(["prime"]);
		}
	});

	it("collects independent problems in one pass", () => {
		const result = validatePRDDesign({
			prime: 4,
			primitiveRoot: 2,
			designFrequency: 0,
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual([
				"prime",
				"designFrequency",
			]);
		}
	});
});
