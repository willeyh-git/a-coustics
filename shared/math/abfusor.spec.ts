import { describe, expect, it } from "vitest";
import { getAbfusorCalculations } from "./abfusor";

describe("abfusor math", () => {
	it("should calculate correct geometry and acoustics", () => {
		const width = 1000;
		const height = 1000;
		const depth = 200;
		const numSlats = 10;
		const slatWidth = 100;
		const slatSpacing = 80;
		const slatDepthVariation = 50;
		const absorberDepth = 150;

		const result = getAbfusorCalculations(
			width,
			height,
			depth,
			numSlats,
			slatWidth,
			slatSpacing,
			slatDepthVariation,
			absorberDepth
		);

		// Total Slat/Gap Width = (10 * 100) + (9 * 80) = 1000 + 720 = 1720
		// Open Area % = (720 / 1720) * 100 = 41.86%
		expect(result.openAreaPercentage).toBeCloseTo(41.86, 2);
		
		// Slat positions = [50, 180, 310, 440, 570, 700, 830, 960, 1090, 1220]
		// Wait, currentX = 100/2 = 50. 
		// next = 50 + 100 + 80 = 230.
		// My manual calc was wrong.
		// i=0: 50
		// i=1: 50 + 100 + 80 = 230
		// i=2: 230 + 100 + 80 = 410
		// i=3: 410 + 100 + 80 = 590
		// i=4: 590 + 100 + 80 = 870
		// i=5: 870 + 100 + 80 = 1050
		// i=6: 1050 + 100 + 80 = 1230
		// i=7: 1230 + 100 + 80 = 1310
		// i=8: 1310 + 100 + 80 = 1390
		// i=9: 1390 + 100 + 80 = 1470
		// Wait, the loop goes numSlats (10) times.
		
		expect(result.slatPositions).toHaveLength(10);
		expect(result.slatPositions[0]).toBe(50);

		// Acoustics
		// Scattering = min(100, (50/200)*100 + (80/100)*20) = min(100, 25 + 16) = 41
		expect(result.estimatedScattering).toBe(41);
		
		// Absorption = min(100, (150/200)*100 + (100-41.86)*0.5)
		// Absorption = min(100, 75 + 58.14*0.5) = min(100, 75 + 29.07) = 100
		expect(result.estimatedAbsorption).toBe(100);
	});
});
