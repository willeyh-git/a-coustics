import { describe, expect, it } from "vitest";
import { validatePolyDesign } from "@validators/poly";

// Non-zero quadratic residues mod 7 are {1, 2, 4}; 3 is not a residue.
describe("validatePolyDesign", () => {
	it("accepts valid quadratic-residue coefficients", () => {
		expect(
			validatePolyDesign({ prime: 7, designFrequency: 1000, q1: 1, q2: 4 }),
		).toEqual({ valid: true });
	});

	it("rejects a coefficient that is not a quadratic residue", () => {
		const res = validatePolyDesign({ prime: 7, designFrequency: 1000, q1: 3, q2: 1 });
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("q1");
	});

	it("rejects a coefficient congruent to 0 mod p", () => {
		const res = validatePolyDesign({ prime: 7, designFrequency: 1000, q1: 7, q2: 1 });
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("q1");
	});

	it("rejects a non-integer coefficient", () => {
		const res = validatePolyDesign({ prime: 7, designFrequency: 1000, q1: 1.5, q2: 1 });
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("q1");
	});

	it("rejects a non-prime order", () => {
		const res = validatePolyDesign({ prime: 6, designFrequency: 1000, q1: 1, q2: 1 });
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("prime");
	});

	it("collects all errors at once", () => {
		const res = validatePolyDesign({
			prime: 7,
			designFrequency: 0,
			q1: 3,
			q2: 0,
		});
		expect(res.valid).toBe(false);
		if (!res.valid) {
			const fields = res.errors.map((e) => e.field).sort();
			expect(fields).toEqual(["designFrequency", "q1", "q2"]);
		}
	});
});
