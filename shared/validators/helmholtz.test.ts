import { describe, expect, it } from "vitest";
import { validateHelmholtzDesign } from "@validators/helmholtz";

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
		const res = validateHelmholtzDesign({
			neckRadius: 0,
			neckLength: 0.01,
			cavityVolume: 0.001,
		});
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("neckRadius");
	});

	it("rejects a non-positive cavity volume", () => {
		const res = validateHelmholtzDesign({
			neckRadius: 0.02,
			neckLength: 0.01,
			cavityVolume: 0,
		});
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("cavityVolume");
	});

	it("rejects a non-positive explicit acoustic resistance", () => {
		const res = validateHelmholtzDesign({
			neckRadius: 0.02,
			neckLength: 0.01,
			cavityVolume: 0.001,
			acousticResistance: -1,
		});
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("acousticResistance");
	});

	it("rejects an empty frequency axis", () => {
		const res = validateHelmholtzDesign({
			neckRadius: 0.02,
			neckLength: 0.01,
			cavityVolume: 0.001,
			frequencyAxis: [],
		});
		expect(res.valid).toBe(false);
		if (!res.valid) expect(res.errors[0].field).toBe("frequencyAxis");
	});

	it("collects all errors at once", () => {
		const res = validateHelmholtzDesign({
			neckRadius: 0,
			neckLength: -1,
			cavityVolume: 0,
		});
		expect(res.valid).toBe(false);
		if (!res.valid) {
			const fields = res.errors.map((e) => e.field).sort();
			expect(fields).toEqual([
				"cavityVolume",
				"neckLength",
				"neckRadius",
			]);
		}
	});
});
