import { describe, expect, it } from "vitest";
import { Hz, m } from "@units/units";
import { toFrequency, toLength } from "@geometry/scaling";
import { calculateWavelength, halfWavelength } from "@acoustics/frequency";
import {
	calculateWellWidth,
	calculateWellWidthWithWall,
	calculatePanelWidth,
	calculatePanelHeight,
	calculatePanelArea,
	calculatePanelVolume,
} from "@geometry/panel";

describe("calculateWellWidth", () => {
	it("computes c / (2·fHigh) for a known frequency", () => {
		const w = calculateWellWidth(toFrequency(1000, Hz));

		// 343 / (2 * 1000) = 0.1715 m
		expect(Number(w)).toBeCloseTo(0.1715, 6);
	});

	it("equals exactly half of the wavelength at that frequency", () => {
		const fHigh = toFrequency(800, Hz);
		const w = calculateWellWidth(fHigh);
		const lambda = calculateWavelength(fHigh);

		expect(Number(w)).toBe(Number(lambda) / 2);
	});

	it("reuses the shared half-wavelength helper", () => {
		const fHigh = toFrequency(800, Hz);

		expect(Number(calculateWellWidth(fHigh))).toBe(
			Number(halfWavelength(fHigh)),
		);
	});

	it("narrows inversely with frequency (half wavelength is anti-linear)", () => {
		const narrow = calculateWellWidth(toFrequency(1000, Hz));
		const wider = calculateWellWidth(toFrequency(500, Hz));

		expect(Number(wider)).toBeCloseTo(Number(narrow) * 2, 9);
	});

	it("rejects a non-positive frequency as a programmer error", () => {
		expect(() => calculateWellWidth(toFrequency(0, Hz))).toThrow(
			/fHigh must be greater than zero/,
		);
		expect(() => calculateWellWidth(toFrequency(-100, Hz))).toThrow(
			/fHigh must be greater than zero/,
		);
	});
});

describe("calculateWellWidthWithWall", () => {
	it("subtracts divider thickness from the ideal opening", () => {
		// 343 / (2 * 1000) = 0.1715 m; 0.0115 m of divider -> 0.16 m opening.
		const w = calculateWellWidthWithWall(
			toFrequency(1000, Hz),
			toLength(0.0115, m),
		);

		expect(Number(w)).toBeCloseTo(0.16, 6);
	});

	it("with a zero-thickness divider matches calculateWellWidth", () => {
		const ideal = calculateWellWidth(toFrequency(1234, Hz));
		const withWall = calculateWellWidthWithWall(
			toFrequency(1234, Hz),
			toLength(0, m),
		);

		expect(Number(withWall)).toBe(Number(ideal));
	});

	it("always returns a strictly positive opening", () => {
		const w = calculateWellWidthWithWall(
			toFrequency(1000, Hz),
			toLength(0.0002, m),
		);

		expect(Number(w)).toBeGreaterThan(0);
	});

	it("rejects a divider that consumes the whole opening", () => {
		// opening = 0.1715 m at 1000 Hz; a 0.1715 m divider leaves no well.
		expect(() =>
			calculateWellWidthWithWall(toFrequency(1000, Hz), toLength(0.1715, m)),
		).toThrow(/wallThickness must be smaller/);

		expect(() =>
			calculateWellWidthWithWall(toFrequency(1000, Hz), toLength(0.2, m)),
		).toThrow(/wallThickness must be smaller/);
	});

	it("rejects a negative divider thickness", () => {
		expect(() =>
			calculateWellWidthWithWall(toFrequency(1000, Hz), toLength(-0.001, m)),
		).toThrow(/wallThickness must be non-negative/);
	});

	it("rejects a non-positive frequency like calculateWellWidth does", () => {
		expect(() =>
			calculateWellWidthWithWall(toFrequency(0, Hz), toLength(0.001, m)),
		).toThrow(/fHigh must be greater than zero/);
	});
});

describe("calculatePanelWidth", () => {
	it("multiplies cell width by the well count", () => {
		const W = calculatePanelWidth(toLength(0.02, m), 7);

		expect(Number(W)).toBeCloseTo(0.14, 6);
	});

	it("is linear in the count", () => {
		const w = toLength(0.02, m);

		expect(Number(calculatePanelWidth(w, 8))).toBeCloseTo(
			Number(calculatePanelWidth(w, 4)) * 2,
			9,
		);
	});

	it("is linear in the cell width", () => {
		const narrow = calculatePanelWidth(toLength(0.02, m), 7);
		const wider = calculatePanelWidth(toLength(0.04, m), 7);

		expect(Number(wider)).toBeCloseTo(Number(narrow) * 2, 9);
	});

	it("matches the well-width rule for a QRD order", () => {
		const w = calculateWellWidth(toFrequency(1000, Hz));
		const p = 7;

		expect(Number(calculatePanelWidth(w, p))).toBeCloseTo(Number(w) * p, 9);
	});

	it("accepts a count of 1 as a single-cell panel", () => {
		const cell = toLength(0.0375, m);

		expect(calculatePanelWidth(cell, 1)).toBe(cell);
	});

	it("rejects a non-positive count as a programmer error", () => {
		expect(() => calculatePanelWidth(toLength(0.02, m), 0)).toThrow(
			/count must be a positive safe integer/,
		);
		expect(() => calculatePanelWidth(toLength(0.02, m), -3)).toThrow(
			/count must be a positive safe integer/,
		);
	});

	it("rejects a non-integer count as a programmer error", () => {
		expect(() => calculatePanelWidth(toLength(0.02, m), 6.5)).toThrow(
			/count must be a positive safe integer/,
		);
		expect(() =>
			calculatePanelWidth(toLength(0.02, m), Number.MAX_SAFE_INTEGER + 1),
		).toThrow(/count must be a positive safe integer/);
	});
});

describe("calculatePanelHeight", () => {
	it("multiplies cell height by the row count", () => {
		const H = calculatePanelHeight(toLength(0.03, m), 5);

		expect(Number(H)).toBeCloseTo(0.15, 6);
	});

	it("mirrors calculatePanelWidth for square cells", () => {
		const cell = toLength(0.02, m);

		expect(Number(calculatePanelHeight(cell, 7))).toBe(
			Number(calculatePanelWidth(cell, 7)),
		);
	});

	it("passes a free design height through with count = 1", () => {
		const fixedHeight = toLength(0.5, m);

		expect(calculatePanelHeight(fixedHeight, 1)).toBe(fixedHeight);
	});

	it("rejects a non-positive count as a programmer error", () => {
		expect(() => calculatePanelHeight(toLength(0.03, m), 0)).toThrow(
			/count must be a positive safe integer/,
		);
	});
});

describe("calculatePanelArea", () => {
	it("multiplies width by height", () => {
		const A = calculatePanelArea(
			calculatePanelWidth(toLength(0.02, m), 7),
			calculatePanelHeight(toLength(0.06, m), 5),
		);

		// 0.14 m x 0.3 m
		expect(Number(A)).toBeCloseTo(0.042, 6);
	});

	it("is commutative in width and height", () => {
		const a = calculatePanelArea(toLength(0.14, m), toLength(0.3, m));
		const b = calculatePanelArea(toLength(0.3, m), toLength(0.14, m));

		expect(Number(b)).toBe(Number(a));
	});

	it("scales linearly with each dimension", () => {
		const base = calculatePanelArea(toLength(0.14, m), toLength(0.3, m));
		const doubled = calculatePanelArea(toLength(0.28, m), toLength(0.3, m));

		expect(Number(doubled)).toBeCloseTo(Number(base) * 2, 9);
	});

	it("rejects a non-positive dimension", () => {
		expect(() => calculatePanelArea(toLength(0, m), toLength(0.3, m))).toThrow(
			/width and height must both be positive/,
		);
		expect(() =>
			calculatePanelArea(toLength(0.14, m), toLength(-0.3, m)),
		).toThrow(/width and height must both be positive/);
	});
});

describe("calculatePanelVolume", () => {
	it("multiplies width by height by depth", () => {
		const V = calculatePanelVolume(
			toLength(0.14, m),
			toLength(0.3, m),
			toLength(0.1, m),
		);

		expect(Number(V)).toBeCloseTo(0.0042, 9);
	});

	it("is invariant to the order of the three dimensions", () => {
		const a = calculatePanelVolume(
			toLength(0.14, m),
			toLength(0.3, m),
			toLength(0.1, m),
		);
		const b = calculatePanelVolume(
			toLength(0.1, m),
			toLength(0.14, m),
			toLength(0.3, m),
		);

		expect(Number(b)).toBe(Number(a));
	});

	it("scales linearly with each dimension", () => {
		const base = calculatePanelVolume(
			toLength(0.14, m),
			toLength(0.3, m),
			toLength(0.1, m),
		);
		const doubled = calculatePanelVolume(
			toLength(0.28, m),
			toLength(0.3, m),
			toLength(0.1, m),
		);

		expect(Number(doubled)).toBeCloseTo(Number(base) * 2, 9);
	});

	it("projects to the plan area when depth is zero", () => {
		const width = toLength(0.14, m);
		const height = toLength(0.3, m);
		const area = calculatePanelArea(width, height);
		const volume = calculatePanelVolume(width, height, toLength(0, m));

		expect(Number(volume)).toBe(0);
		// V = A · D, so a one-metre depth exposes the plan area again.
		expect(
			Number(calculatePanelVolume(width, height, toLength(1, m))),
		).toBeCloseTo(Number(area), 9);
	});

	it("rejects a negative depth", () => {
		expect(() =>
			calculatePanelVolume(
				toLength(0.14, m),
				toLength(0.3, m),
				toLength(-0.1, m),
			),
		).toThrow(/width and height must be positive and depth non-negative/);
	});

	it("rejects a non-positive plan dimension", () => {
		expect(() =>
			calculatePanelVolume(toLength(0, m), toLength(0.3, m), toLength(0.1, m)),
		).toThrow(/width and height must be positive and depth non-negative/);
	});
});
