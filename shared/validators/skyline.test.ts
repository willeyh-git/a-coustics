import { describe, expect, it } from "vitest";
import { validateSkylineDesign } from "@validators/skyline";

describe("validateSkylineDesign", () => {
	it("accepts a valid QRD-sourced design", () => {
		expect(
			validateSkylineDesign({ prime: 7, designFrequency: 1000 }),
		).toEqual({ valid: true });
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

	it("rejects a PRD-sourced design with a non-primitive root", () => {
		const res = validateSkylineDesign({
			prime: 7,
			designFrequency: 1000,
			sequenceType: "PRD",
			primitiveRoot: 2,
		});
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("primitiveRoot");
	});

	it("does not flag the root when the source is QRD", () => {
		// With QRD source a primitiveRoot field is irrelevant; it must not error.
		expect(
			validateSkylineDesign({
				prime: 7,
				designFrequency: 1000,
				sequenceType: "QRD",
				primitiveRoot: 2,
			}),
		).toEqual({ valid: true });
	});

	it("rejects a non-prime order", () => {
		const res = validateSkylineDesign({ prime: 9, designFrequency: 1000 });
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("prime");
	});
});
