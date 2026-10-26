import {
	SKYLINE_SEQUENCE_TYPES,
	validateSkylineDesign,
} from "@validators/skyline";
import { describe, expect, it } from "vitest";

describe("validateSkylineDesign", () => {
	it("accepts a QRD-sourced design", () => {
		expect(validateSkylineDesign({ prime: 7, designFrequency: 1000 })).toEqual({
			valid: true,
		});
	});

	it("accepts a PRD-sourced design with a valid primitive root", () => {
		expect(
			validateSkylineDesign({
				prime: 7,
				designFrequency: 1000,
				sequenceType: "PRD",
				primitiveRoot: 3,
			}),
		).toEqual({ valid: true });
	});

	it("accepts a PRD-sourced design that omits the root (auto-selected)", () => {
		expect(
			validateSkylineDesign({
				prime: 7,
				designFrequency: 1000,
				sequenceType: "PRD",
			}),
		).toEqual({ valid: true });
	});

	it("rejects a PRD-sourced design whose root is not a primitive root", () => {
		const result = validateSkylineDesign({
			prime: 7,
			designFrequency: 1000,
			sequenceType: "PRD",
			primitiveRoot: 2,
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

	it("does not flag a root when the source is QRD", () => {
		// designSkyline ignores primitiveRoot for a QRD source, so it is not an
		// error either.
		expect(
			validateSkylineDesign({
				prime: 7,
				designFrequency: 1000,
				sequenceType: "QRD",
				primitiveRoot: 2,
			}),
		).toEqual({ valid: true });
	});

	it("rejects a sequence source the design cannot build", () => {
		// designSkyline would otherwise fall back to QRD behind the user's back.
		const result = validateSkylineDesign({
			prime: 7,
			designFrequency: 1000,
			sequenceType: "prd",
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.errors).toEqual([
				{
					field: "sequenceType",
					message:
						`Value must be one of: ${SKYLINE_SEQUENCE_TYPES.join(", ")} ` +
						`(got "prd").`,
				},
			]);
		}
	});

	it("does not flag an omitted sequence source (defaults to QRD)", () => {
		expect(validateSkylineDesign({ prime: 7, designFrequency: 1000 })).toEqual({
			valid: true,
		});
	});

	it("reports an unusable order once, without a follow-on root error", () => {
		const result = validateSkylineDesign({
			prime: 8,
			designFrequency: 1000,
			sequenceType: "PRD",
			primitiveRoot: 3,
		});

		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual(["prime"]);
		}
	});

	it("collects independent problems in one pass", () => {
		const result = validateSkylineDesign({
			prime: 9,
			designFrequency: -1,
			sequenceType: "SQ",
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual([
				"prime",
				"designFrequency",
				"sequenceType",
			]);
		}
	});
});
