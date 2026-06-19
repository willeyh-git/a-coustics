import { describe, expect, it } from "vitest";
import { SPEED_OF_SOUND } from "./constants";
import { designUnitDepth } from "./design";
import {
	calculateWavelength,
	frequencyFromWavelength,
	halfWavelength,
	quarterWavelength,
} from "./frequency";
import { calculateUnitDepth } from "./qrd-physics";

describe("acoustics constants", () => {
	it("should define speed of sound at room temperature", () => {
		expect(SPEED_OF_SOUND).toBeGreaterThan(330);
		expect(SPEED_OF_SOUND).toBeLessThan(350);
	});
});

describe("wavelength", () => {
	it("should compute correct wavelength at 343 Hz", () => {
		const result = calculateWavelength(343);

		expect(result).toBeCloseTo(1, 3);
	});

	it("should decrease with increasing frequency", () => {
		const low = calculateWavelength(200);
		const high = calculateWavelength(800);

		expect(low).toBeGreaterThan(high);
	});
});

describe("QRD unit depth", () => {
	it("should compute unit depth from wavelength and prime", () => {
		const lambda = 1; // normalized wavelength
		const p = 7;

		const result = calculateUnitDepth(lambda, p);

		expect(result).toBeCloseTo(1 / (2 * 7), 5);
	});

	it("should scale inversely with prime number", () => {
		const lambda = 1;

		const smallP = calculateUnitDepth(lambda, 5);
		const largeP = calculateUnitDepth(lambda, 11);

		expect(smallP).toBeGreaterThan(largeP);
	});
});

describe("design unit depth", () => {
	it("should derive unit depth from frequency and prime", () => {
		const p = 7;
		const f = 343; // Hz

		const result = designUnitDepth(f, p);

		expect(result).toBeCloseTo(1 / (2 * 7), 3);
	});

	it("should produce smaller depths at higher frequency", () => {
		const p = 7;

		const low = designUnitDepth(200, p);
		const high = designUnitDepth(800, p);

		expect(low).toBeGreaterThan(high);
	});
});

describe("acoustic sanity constraints", () => {
	it("should reject zero or negative frequency", () => {
		expect(() => designUnitDepth(0, 7)).toThrow();
		expect(() => designUnitDepth(-100, 7)).toThrow();
	});

	it("should reject non-prime p", () => {
		expect(() => designUnitDepth(343, 8)).toThrow();
	});
});

describe("determinism", () => {
	it("should always return same unit depth for same inputs", () => {
		const a = designUnitDepth(343, 7);
		const b = designUnitDepth(343, 7);

		expect(a).toBeCloseTo(b, 10);
	});
});

describe("frequencyFromWavelength", () => {
	it("should be the inverse of calculateWavelength", () => {
		const frequency = 343;

		const wavelength = calculateWavelength(frequency);

		expect(frequencyFromWavelength(wavelength)).toBeCloseTo(frequency, 10);
	});
	it("should calculate quarter wavelength", () => {
		expect(quarterWavelength(343)).toBeCloseTo(0.25, 3);
	});
	it("should calculate half wavelength", () => {
		expect(halfWavelength(343)).toBeCloseTo(0.5, 3);
	});
});
