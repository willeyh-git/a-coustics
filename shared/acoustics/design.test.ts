import { SPEED_OF_SOUND } from "@acoustics/constants";
import { designUnitDepth } from "@acoustics/design";
import {
	calculateWavelength,
	frequencyFromWavelength,
	halfWavelength,
	quarterWavelength,
} from "@acoustics/frequency";
import { calculateUnitDepth } from "@acoustics/qrd-physics";
import { asFrequency, asPrime } from "@math/helpers";
import type { Prime } from "@units/units";
import { m } from "@units/units";
import { describe, expect, it } from "vitest";

describe("acoustics constants", () => {
	it("should define speed of sound at room temperature", () => {
		expect(SPEED_OF_SOUND).toBeGreaterThan(330);
		expect(SPEED_OF_SOUND).toBeLessThan(350);
	});
});

describe("wavelength", () => {
	it("should compute correct wavelength at 343 Hz", () => {
		const result = calculateWavelength(asFrequency(343));

		expect(result).toBeCloseTo(1, 3);
	});

	it("should decrease with increasing frequency", () => {
		const low = calculateWavelength(asFrequency(200));
		const high = calculateWavelength(asFrequency(800));

		expect(low).toBeGreaterThan(high);
	});
});

describe("QRD unit depth", () => {
	it("should compute unit depth from wavelength and prime", () => {
		const lambda = m; // normalized wavelength
		const p = asPrime(7);

		const result = calculateUnitDepth(lambda, p);

		expect(result).toBeCloseTo(1 / (2 * 7), 5);
	});

	it("should scale inversely with prime number", () => {
		const lambda = m;

		const smallP = calculateUnitDepth(lambda, asPrime(5));
		const largeP = calculateUnitDepth(lambda, asPrime(11));

		expect(smallP).toBeGreaterThan(largeP);
	});
});

describe("design unit depth", () => {
	it("should derive unit depth from frequency and prime", () => {
		const p = asPrime(7);
		const f = asFrequency(343); // Hz

		const result = designUnitDepth(f, p);

		expect(result).toBeCloseTo(1 / (2 * 7), 3);
	});

	it("should produce smaller depths at higher frequency", () => {
		const p = asPrime(7);

		const low = designUnitDepth(asFrequency(200), p);
		const high = designUnitDepth(asFrequency(800), p);

		expect(low).toBeGreaterThan(high);
	});
});

describe("acoustic sanity constraints", () => {
	it("should reject zero or negative frequency", () => {
		expect(() => designUnitDepth(asFrequency(0), asPrime(7))).toThrow();
		expect(() => designUnitDepth(asFrequency(-100), asPrime(7))).toThrow();
	});

	it("should reject non-prime p", () => {
		// Branded types are compile-time; pass a runtime value that fails validation.
		const fakePrime = 8 as unknown as Prime;
		expect(() => designUnitDepth(asFrequency(343), fakePrime)).toThrow(
			"p must be a prime number",
		);
	});
});

describe("determinism", () => {
	it("should always return same unit depth for same inputs", () => {
		const frequency = asFrequency(343);
		const a = designUnitDepth(frequency, asPrime(7));
		const b = designUnitDepth(frequency, asPrime(7));

		expect(a).toBeCloseTo(b, 10);
	});
});

describe("frequencyFromWavelength", () => {
	it("should be the inverse of calculateWavelength", () => {
		const frequency = asFrequency(343);

		const wavelength = calculateWavelength(frequency);

		expect(frequencyFromWavelength(wavelength)).toBeCloseTo(frequency, 10);
	});
	it("should calculate quarter wavelength", () => {
		expect(quarterWavelength(asFrequency(343))).toBeCloseTo(0.25, 3);
	});
	it("should calculate half wavelength", () => {
		expect(halfWavelength(asFrequency(343))).toBeCloseTo(0.5, 3);
	});
});
