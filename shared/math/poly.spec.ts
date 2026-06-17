import { describe, expect, it } from "vitest";
import { getPolyCalculations } from "./poly";

describe("poly math", () => {
	it("should calculate correct geometry and acoustics", () => {
		const width = 1000;
		const height = 1000;
		const depth = 200;
		const thickness = 25;

		const result = getPolyCalculations(width, height, depth, thickness);

		// R = (depth^2 + (width^2 / 4)) / (2 * depth)
		// R = (200^2 + (1000^2 / 4)) / (2 * 200)
		// R = (40000 + 250000) / 400
		// R = 290000 / 400 = 725
		expect(result.radius).toBe(725);
		
		// arcAngle = 2 * arcsin((width/2) / R)
		// arcAngle = 2 * arcsin(500 / 725)
		// arcAngle = 2 * arcsin(0.68965...)
		// arcAngle = 2 * 0.7610... = 1.522... radians
		expect(result.arcAngle).toBeCloseTo(1.522, 3);
		
		// surfaceArea = R * arcAngle * height
		// surfaceArea = 725 * 1.522 * 1000 = 1,103,450
		expect(result.surfaceArea).toBeCloseTo(1103468, 0);
		
		// Acoustics
		// designFrequency = c / (2 * R) = 343 / (2 * 725) = 343 / 1450 = 0.23655...
		expect(result.designFrequency).toBeCloseTo(0.23655, 4);
		expect(result.minFrequency).toBeLessThan(result.designFrequency);
		expect(result.maxFrequency).toBeGreaterThan(result.designFrequency);
	});
});
