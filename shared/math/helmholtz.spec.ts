import { describe, expect, it } from "vitest";
import { getHelmholtzCalculations } from "./helmholtz";

describe("helmholtz math", () => {
	it("should calculate correct geometry and acoustics", () => {
		// Use meters for inputs to get a realistic frequency
		const width = 1.0;
		const height = 1.0;
		const depth = 0.5;
		const faceThickness = 0.025;
		const neckDepth = 0.1;
		const slotWidth = 0.1;
		const slotCount = 2;
		const slotLength = 0.2;

		const result = getHelmholtzCalculations(
			width,
			height,
			depth,
			faceThickness,
			neckDepth,
			slotWidth,
			slotCount,
			slotLength
		);

		// Total Volume = 1 * 1 * 0.5 = 0.5 m^3
		// Face Volume = 1 * 1 * 0.025 = 0.025 m^3
		// Neck Area = 0.1 * 0.2 * 2 = 0.04 m^2
		// Neck Volume = 0.04 * 0.1 = 0.004 m^3
		// Cavity Volume = 0.5 - 0.025 - 0.004 = 0.471 m^3
		expect(result.cavityVolume).toBeCloseTo(0.471, 3);
		
		// Open Area Percentage = (0.04 / 1.0) * 100 = 4%
		expect(result.openAreaPercentage).toBeCloseTo(4, 1);

		// Effective Length L = 0.1 + (0.1 * 0.85) = 0.185 m
		// Resonant Frequency: fr = (c / 2 * pi) * sqrt(A / (V * L))
		// fr = (343 / (2 * pi)) * sqrt(0.04 / (0.471 * 0.185))
		// fr = 54.59 * sqrt(0.04 / 0.087135)
		// fr = 54.59 * sqrt(0.45883)
		// fr = 54.59 * 0.67736 = 37.05 Hz
		
		expect(result.resonantFrequency).toBeCloseTo(37.05, 0);
		expect(result.effectiveOperatingRange[0]).toBeLessThan(result.resonantFrequency);
		expect(result.effectiveOperatingRange[1]).toBeGreaterThan(result.resonantFrequency);
	});
});
