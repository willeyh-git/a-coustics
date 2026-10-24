import { describe, expect, it } from "vitest";
import { validatePRDDesign } from "@validators/prd";

describe("validatePRDDesign", () => {
	it("accepts a valid prime, frequency and primitive root", () => {
		expect(
			validatePRDDesign({ prime: 7, primitiveRoot: 3, designFrequency: 1000 }),
		).toEqual({ valid: true });
	});

	it("accepts a design that omits the primitive root (auto-selected)", () => {
		expect(validatePRDDesign({ prime: 7, designFrequency: 1000 })).toEqual({
			valid: true,
		});
	});

	it("rejects a non-primitive root", () => {
		const res = validatePRDDesign({ prime: 7, primitiveRoot: 2, designFrequency: 1000 });
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("primitiveRoot");
	});

	it("rejects a non-prime order", () => {
		const res = validatePRDDesign({ prime: 8, primitiveRoot: 3, designFrequency: 1000 });
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("prime");
	});

	it("collects all errors at once", () => {
		const res = validatePRDDesign({ prime: 4, primitiveRoot: 2, designFrequency: 0 });
		expect(res.valid).toBe(false);
		if (!res.valid) {
			const fields = res.errors.map((e) => e.field).sort();
			expect(fields).toEqual(["designFrequency", "prime", "primitiveRoot"]);
		}
	});
});
