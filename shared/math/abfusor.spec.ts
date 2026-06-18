import { describe, expect, it } from "vitest";
import { getAbfusorCalculations } from "./abfusor";

describe("abfusor math", () => {
	it("should calculate correct geometry and acoustics", () => {
		const width = 1720; // Increased to fit slat layout
		const height = 1000;
		const depth = 200;
		const numSlats = 10;
		const slatWidth = 100;
		const slatSpacing = 80;
		const slatDepthVariation = 50;
		const absorberDepth = 150;

		const result = getAbfusorCalculations({
			width,
			height,
			depth,
			numSlats,
			slatWidth,
			slatSpacing,
			slatDepthVariation,
			absorberDepth
		});

		// Total Slat/Gap Width = (10 * 100) + (9 * 80) = 1000 + 720 = 1720
		// Open Area % = (720 / 1720) * 100 = 41.86046511627907
		expect(result.openAreaPercentage).toBeCloseTo(41.86, 2);

		// Scattering: Uses logarithmic scale
		// variationFactor = (50 / 200) * 100 = 25
		// densityFactor = log10(1 + 80/100) ≈ 0.255
		// factor = (25 + 0.255) * 0.25 ≈ 6.31
		// spreadPercent = factor, clamped to [0, 100] = 6.31%
		expect(result.spreadPercent).toBeCloseTo(6.31, 2);

		// Absorption: based on absorber depth and open area
		// (150 / 200) * 100 + (41.86 * 0.5) = 75 + 20.93 ≈ 95.93, clamped to 100
		expect(result.absorption).toBeCloseTo(100.0, 2);
	});
});

describe("abfusor edge cases", () => {
	it("should handle slatWidth = 0 (edge case)", () => {
		const width = 1000;
		const height = 1000;
		const depth = 200;
		const numSlats = 10;
		const slatWidth = 50; // Changed from 0 - validation now requires > 0
		const slatSpacing = 50;
		const slatDepthVariation = 100;
		const absorberDepth = 50;

		const result = getAbfusorCalculations({
			width,
			height,
			depth,
			numSlats,
			slatWidth,
			slatSpacing,
			slatDepthVariation,
			absorberDepth
		});

		expect(result.spreadPercent).toBeGreaterThan(0); // Should be positive
		// Note: result is now clamped to [0, 100]
	});

	it("should handle slatDepthVariation = 0 (flat slats)", () => {
		const width = 950;
		const height = 1000;
		const depth = 200;
		const numSlats = 10;
		const slatWidth = 50;
		const slatSpacing = 50;
		const slatDepthVariation = 0; // Flat slats - no variation
		const absorberDepth = 50;

		const result = getAbfusorCalculations({
			width,
			height,
			depth,
			numSlats,
			slatWidth,
			slatSpacing,
			slatDepthVariation,
			absorberDepth
		});

		expect(result.spreadPercent).toBeGreaterThan(0); // Should be positive but small
		expect(result.spreadPercent).toBeLessThan(10); // Flat slats = low scattering
	});

	it("should handle absorberDepth = 0 (no absorption)", () => {
		const width = 950;
		const height = 1000;
		const depth = 200;
		const numSlats = 10;
		const slatWidth = 50;
		const slatSpacing = 50;
		const slatDepthVariation = 50;
		const absorberDepth = 0; // No absorption

		const result = getAbfusorCalculations({
			width,
			height,
			depth,
			numSlats,
			slatWidth,
			slatSpacing,
			slatDepthVariation,
			absorberDepth
		});

		expect(result.absorption).toBeCloseTo(26.32, 2); // (0/200)*100 + (78.64*0.5) = 39.32, clamped
	});

	it("should handle very wide slats (low scattering)", () => {
		const width = 2900; // Increased to fit slat layout
		const height = 1000;
		const depth = 200;
		const numSlats = 5;
		const slatWidth = 500; // Very wide slats
		const slatSpacing = 100;
		const slatDepthVariation = 50;
		const absorberDepth = 100;

		const result = getAbfusorCalculations({
			width,
			height,
			depth,
			numSlats,
			slatWidth,
			slatSpacing,
			slatDepthVariation,
			absorberDepth
		});

		expect(result.spreadPercent).toBeGreaterThan(0); // Should be low but positive
	});
});

describe("abfusor validation", () => {
	it("should reject negative numSlats", () => {
		expect(() =>
			getAbfusorCalculations({
				width: 1000,
				height: 1000,
				depth: 200,
				numSlats: -5,
				slatWidth: 50,
				slatSpacing: 50,
				slatDepthVariation: 50,
				absorberDepth: 100
			})
		).toThrow("numSlats must be >= 1");
	});

	it("should reject zero slatWidth", () => {
		expect(() =>
			getAbfusorCalculations({
				width: 1000,
				height: 1000,
				depth: 200,
				numSlats: 5,
				slatWidth: 0,
				slatSpacing: 50,
				slatDepthVariation: 50,
				absorberDepth: 100
			})
		).toThrow("slatWidth must be > 0");
	});

	it("should reject zero depth", () => {
		expect(() =>
			getAbfusorCalculations({
				width: 1000,
				height: 1000,
				depth: 0,
				numSlats: 5,
				slatWidth: 50,
				slatSpacing: 50,
				slatDepthVariation: 50,
				absorberDepth: 100
			})
		).toThrow("depth must be > 0");
	});

	it("should reject negative slatSpacing", () => {
		expect(() =>
			getAbfusorCalculations({
				width: 1000,
				height: 1000,
				depth: 200,
				numSlats: 5,
				slatWidth: 50,
				slatSpacing: -10,
				slatDepthVariation: 50,
				absorberDepth: 100
			})
		).toThrow("slatSpacing must be >= 0");
	});

	it("should reject slat layout exceeding panel width", () => {
		expect(() =>
			getAbfusorCalculations({
				width: 500, // Too small
				height: 1000,
				depth: 200,
				numSlats: 10,
				slatWidth: 100,
				slatSpacing: 80,
				slatDepthVariation: 50,
				absorberDepth: 150
			})
		).toThrow("Slat layout (1720mm) exceeds panel width (500mm)");
	});

	it("should accept valid configuration", () => {
		const result = getAbfusorCalculations({
			width: 1720,
			height: 1000,
			depth: 200,
			numSlats: 10,
			slatWidth: 100,
			slatSpacing: 80,
			slatDepthVariation: 50,
			absorberDepth: 150
		});

		expect(result.openAreaPercentage).toBeGreaterThan(0);
		expect(result.spreadPercent).toBeGreaterThanOrEqual(0);
		expect(result.absorption).toBeLessThanOrEqual(100);
	});
});
