import { describe, expect, it } from "vitest";
import { validateABFUSORDesign } from "@validators/abfusor";

describe("validateABFUSORDesign", () => {
	it("accepts a valid design with absorptiveRatio 0 (pure QRD)", () => {
		expect(
			validateABFUSORDesign({
				prime: 7,
				designFrequency: 1000,
				absorptiveRatio: 0,
			}),
		).toEqual({ valid: true });
	});

	it("accepts an absorptiveRatio strictly below 1", () => {
		expect(
			validateABFUSORDesign({
				prime: 7,
				designFrequency: 1000,
				absorptiveRatio: 0.999,
			}),
		).toEqual({ valid: true });
	});

	it("rejects absorptiveRatio equal to 1", () => {
		const res = validateABFUSORDesign({
			prime: 7,
			designFrequency: 1000,
			absorptiveRatio: 1,
		});
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("absorptiveRatio");
	});

	it("rejects a negative absorptiveRatio", () => {
		const res = validateABFUSORDesign({
			prime: 7,
			designFrequency: 1000,
			absorptiveRatio: -0.1,
		});
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("absorptiveRatio");
	});

	it("rejects a non-positive material flow resistivity", () => {
		const res = validateABFUSORDesign({
			prime: 7,
			designFrequency: 1000,
			absorptiveRatio: 0.5,
			material: { flowResistivity: 0 },
		});
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("flowResistivity");
	});

	it("rejects a non-prime order", () => {
		const res = validateABFUSORDesign({
			prime: 6,
			designFrequency: 1000,
			absorptiveRatio: 0.5,
		});
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("prime");
	});

	it("collects all errors at once", () => {
		const res = validateABFUSORDesign({
			prime: 4,
			designFrequency: 0,
			absorptiveRatio: 1,
			material: { flowResistivity: -5 },
		});
		expect(res.valid).toBe(false);
		if (!res.valid) {
			const fields = res.errors.map((e) => e.field).sort();
			expect(fields).toEqual([
				"absorptiveRatio",
				"designFrequency",
				"flowResistivity",
				"prime",
			]);
		}
	});
});
