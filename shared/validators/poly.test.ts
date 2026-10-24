import { describe, expect, it } from "vitest";
import { validatePolyDesign } from "@validators/poly";

// Non-zero quadratic residues mod 7 are {1, 2, 4}; 3 and 5 are not.
describe("validatePolyDesign", () => {
	it("accepts valid quadratic-residue coefficients", () => {
		expect(
			validatePolyDesign({
				prime: 7,
				designFrequency: 1000,
				q1: 1,
				q2: 4,
			}),
		).toEqual({ valid: true });
	});

	it("accepts coefficients outside [0, p) that normalise to a residue", () => {
		// 8 ≡ 1 (mod 7) and -3 ≡ 4 (mod 7): same congruence classes, same design.
		expect(
			validatePolyDesign({
				prime: 7,
				designFrequency: 1000,
				q1: 8,
				q2: -3,
			}),
		).toEqual({ valid: true });
	});

	it("rejects a coefficient that is not a quadratic residue", () => {
		const result = validatePolyDesign({
			prime: 7,
			designFrequency: 1000,
			q1: 3,
			q2: 1,
		});

		expect(result).toEqual({
			valid: false,
			errors: [
				{
					field: "q1",
					message:
						"Value q1=3 must be congruent to a quadratic residue modulo 7.",
				},
			],
		});
	});

	it("rejects a coefficient congruent to 0 modulo p", () => {
		const result = validatePolyDesign({
			prime: 7,
			designFrequency: 1000,
			q1: 7,
			q2: 1,
		});

		expect(result).toEqual({
			valid: false,
			errors: [
				{
					field: "q1",
					message: "Value q1=7 must not be congruent to 0 modulo 7.",
				},
			],
		});
	});

	it("rejects a non-integer coefficient", () => {
		const result = validatePolyDesign({
			prime: 7,
			designFrequency: 1000,
			q1: 1.5,
			q2: 1,
		});

		if (!result.valid) {
			expect(result.errors).toEqual([
				{
					field: "q1",
					message: "Value q1=1.5 must be an integer.",
				},
			]);
		}
	});

	it("reports an unusable order once, without blaming the coefficients", () => {
		const result = validatePolyDesign({
			prime: 6,
			designFrequency: 1000,
			q1: 1,
			q2: 1,
		});

		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual(["prime"]);
		}
	});

	it("collects independent problems in one pass", () => {
		const result = validatePolyDesign({
			prime: 7,
			designFrequency: 0,
			q1: 3,
			q2: 0,
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual([
				"designFrequency",
				"q1",
				"q2",
			]);
		}
	});
});
