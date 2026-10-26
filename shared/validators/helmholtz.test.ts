import { validateHelmholtzDesign } from "@validators/helmholtz";
import { describe, expect, it } from "vitest";

describe("validateHelmholtzDesign", () => {
	it("accepts a valid resonator geometry", () => {
		expect(
			validateHelmholtzDesign({
				neckRadius: 0.02,
				neckLength: 0.01,
				cavityVolume: 0.001,
			}),
		).toEqual({ valid: true });
	});

	it("rejects a non-positive neck radius", () => {
		const result = validateHelmholtzDesign({
			neckRadius: 0,
			neckLength: 0.01,
			cavityVolume: 0.001,
		});

		expect(result).toEqual({
			valid: false,
			errors: [
				{
					field: "neckRadius",
					message: "Value must be greater than zero (got 0).",
				},
			],
		});
	});

	it("rejects a non-positive cavity volume", () => {
		const result = validateHelmholtzDesign({
			neckRadius: 0.02,
			neckLength: 0.01,
			cavityVolume: 0,
		});

		if (!result.valid) {
			expect(result.errors).toEqual([
				{
					field: "cavityVolume",
					message: "Value must be greater than zero (got 0).",
				},
			]);
		}
	});

	it("rejects a non-positive explicit acoustic resistance", () => {
		const result = validateHelmholtzDesign({
			neckRadius: 0.02,
			neckLength: 0.01,
			cavityVolume: 0.001,
			acousticResistance: -1,
		});

		if (!result.valid) {
			expect(result.errors).toEqual([
				{
					field: "acousticResistance",
					message: "Value must be greater than zero (got -1).",
				},
			]);
		}
	});

	it("accepts the critical-matched default (no acoustic resistance)", () => {
		expect(
			validateHelmholtzDesign({
				neckRadius: 0.02,
				neckLength: 0.01,
				cavityVolume: 0.001,
			}),
		).toEqual({ valid: true });
	});

	it("rejects an empty frequency axis", () => {
		const result = validateHelmholtzDesign({
			neckRadius: 0.02,
			neckLength: 0.01,
			cavityVolume: 0.001,
			frequencyAxis: [],
		});

		if (!result.valid) {
			expect(result.errors).toEqual([
				{
					field: "frequencyAxis",
					message:
						"Value must be a non-empty array (got [array of 0 entry(s)]).",
				},
			]);
		}
	});

	it("names the bad axis entry by index", () => {
		const result = validateHelmholtzDesign({
			neckRadius: 0.02,
			neckLength: 0.01,
			cavityVolume: 0.001,
			frequencyAxis: [100, -5],
		});

		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual([
				"frequencyAxis",
			]);
			expect(result.errors.map((error) => error.message).join(" ")).toContain(
				"entry 1",
			);
		}
	});

	it("reports every geometry problem at once, in checked order", () => {
		const result = validateHelmholtzDesign({
			neckRadius: 0,
			neckLength: -1,
			cavityVolume: 0,
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual([
				"neckRadius",
				"neckLength",
				"cavityVolume",
			]);
		}
	});
});
