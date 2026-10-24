import { describe, expect, it } from "vitest";
import { validateABFUSORDesign } from "@validators/abfusor";

describe("validateABFUSORDesign", () => {
	it("accepts a pure-QRD design (absorptiveRatio 0)", () => {
		expect(
			validateABFUSORDesign({
				prime: 7,
				designFrequency: 1000,
				absorptiveRatio: 0,
			}),
		).toEqual({ valid: true });
	});

	it("accepts a ratio strictly below 1", () => {
		expect(
			validateABFUSORDesign({
				prime: 7,
				designFrequency: 1000,
				absorptiveRatio: 0.999,
			}),
		).toEqual({ valid: true });
	});

	it("rejects a ratio of 1 (no diffusive wells left)", () => {
		const result = validateABFUSORDesign({
			prime: 7,
			designFrequency: 1000,
			absorptiveRatio: 1,
		});

		expect(result).toEqual({
			valid: false,
			errors: [
				{
					field: "absorptiveRatio",
					message: "absorptiveRatio must satisfy 0 <= value < 1 (got 1).",
				},
			],
		});
	});

	it("rejects a negative ratio", () => {
		const result = validateABFUSORDesign({
			prime: 7,
			designFrequency: 1000,
			absorptiveRatio: -0.1,
		});

		if (!result.valid) {
			expect(result.errors).toEqual([
				{
					field: "absorptiveRatio",
					message: "absorptiveRatio must satisfy 0 <= value < 1 (got -0.1).",
				},
			]);
		}
	});

	it("accepts an omitted material (design supplies its default)", () => {
		expect(
			validateABFUSORDesign({
				prime: 7,
				designFrequency: 1000,
				absorptiveRatio: 0.5,
			}),
		).toEqual({ valid: true });
	});

	it("requires flow resistivity once a material spec is supplied", () => {
		// designABFUSOR only defaults when the whole field is omitted, so an empty
		// spec would otherwise push NaN into the absorption curves.
		const result = validateABFUSORDesign({
			prime: 7,
			designFrequency: 1000,
			absorptiveRatio: 0.5,
			material: {},
		});

		if (!result.valid) {
			expect(result.errors).toEqual([
				{
					field: "material.flowResistivity",
					message: "Value is required when a material spec is supplied.",
				},
			]);
		}
	});

	it("rejects a non-positive flow resistivity", () => {
		const result = validateABFUSORDesign({
			prime: 7,
			designFrequency: 1000,
			absorptiveRatio: 0.5,
			material: { flowResistivity: 0 },
		});

		if (!result.valid) {
			expect(result.errors).toEqual([
				{
					field: "material.flowResistivity",
					message: "Value must be greater than zero (got 0).",
				},
			]);
		}
	});

	it("rejects a non-object material instead of ignoring it", () => {
		const result = validateABFUSORDesign({
			prime: 7,
			designFrequency: 1000,
			absorptiveRatio: 0.5,
			material: "foam",
		});

		if (!result.valid) {
			expect(result.errors).toEqual([
				{
					field: "material",
					message: 'Value must be a material spec object (got "foam").',
				},
			]);
		}
	});

	it("rejects a negative surface resistance, allows zero", () => {
		const negative = validateABFUSORDesign({
			prime: 7,
			designFrequency: 1000,
			absorptiveRatio: 0.5,
			material: {
				flowResistivity: 1000,
				surfaceResistance: -1,
			},
		});

		expect(negative.valid).toBe(false);

		const zero = validateABFUSORDesign({
			prime: 7,
			designFrequency: 1000,
			absorptiveRatio: 0.5,
			material: {
				flowResistivity: 1000,
				surfaceResistance: 0,
			},
		});

		expect(zero).toEqual({ valid: true });
	});

	it("rejects a non-prime order", () => {
		const result = validateABFUSORDesign({
			prime: 6,
			designFrequency: 1000,
			absorptiveRatio: 0.5,
		});

		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual(["prime"]);
		}
	});

	it("reports every problem at once, in checked order", () => {
		const result = validateABFUSORDesign({
			prime: 4,
			designFrequency: 0,
			absorptiveRatio: 1,
			material: { flowResistivity: -5 },
			frequencyAxis: [],
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual([
				"prime",
				"designFrequency",
				"absorptiveRatio",
				"material.flowResistivity",
				"frequencyAxis",
			]);
		}
	});
});
