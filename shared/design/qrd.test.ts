import { describe, expect, it } from "vitest";
import { toFrequency } from "../geometry/scaling";
import { asPrime } from "../math/helpers";
import { Hz } from "../types/units";
import { designQRD } from "./qrd";

describe("designQRD", () => {
	it("should generate a complete QRD design", () => {
		const result = designQRD({
			prime: asPrime(7),
			designFrequency: toFrequency(343, Hz),
		});

		expect(result.sequence).toEqual([0, 1, 4, 2, 2, 4, 1]);

		expect(result.unitDepth).toBeCloseTo(1 / 14, 3);

		expect(result.depths).toHaveLength(7);
	});

	it("should have depths derived from sequence × unitDepth", () => {
		const result = designQRD({
			prime: asPrime(7),
			designFrequency: toFrequency(343, Hz),
		});

		expect(result.depths[0]).toBeCloseTo(0, 3);
		expect(result.depths[1]).toBeCloseTo(1 / 14, 3);
		expect(result.depths[2]).toBeCloseTo(4 / 14, 3);
	});

	it("should reject non-prime values", () => {
		expect(() =>
			designQRD({
				prime: 8,
				designFrequency: toFrequency(343, Hz),
			}),
		).toThrow();
	});
});
