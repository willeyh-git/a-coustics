import { describe, expect, it } from "vitest";
import { validateQRDDesign } from "@validators/qrd";

describe("validateQRDDesign", () => {
	it("accepts a valid prime and frequency", () => {
		expect(validateQRDDesign({ prime: 7, designFrequency: 1000 })).toEqual({
			valid: true,
		});
	});

	it("rejects a non-prime order", () => {
		const res = validateQRDDesign({ prime: 6, designFrequency: 1000 });
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("prime");
	});

	it("rejects a non-positive frequency", () => {
		const res = validateQRDDesign({ prime: 7, designFrequency: 0 });
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("designFrequency");
	});

	it("collects all errors at once", () => {
		const res = validateQRDDesign({ prime: 4, designFrequency: -5 });
		expect(res.valid).toBe(false);
		if (!res.valid) {
			const fields = res.errors.map((e) => e.field).sort();
			expect(fields).toEqual(["designFrequency", "prime"]);
		}
	});
});
