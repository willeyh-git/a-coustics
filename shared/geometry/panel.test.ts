import { describe, expect, it } from "vitest";
import { m, Hz } from "@units/units";
import { toLength } from "@geometry/scaling";
import { calculateWavelength } from "@acoustics/frequency";
import {
	calculateWellWidth,
	calculatePanelWidth,
	calculatePanelHeight,
	calculatePanelArea,
	calculatePanelVolume,
} from "@geometry/panel";

describe("calculateWellWidth", () => {
	it("computes c / (2·fHigh) for a known frequency", () => {
		const fHigh = toLength(1000, Hz);
		const w = calculateWellWidth(fHigh);

		// 343 / (2 * 1000) = 0.1715 m
		expect(Number(w)).toBeCloseTo(0.1715, 6);
	});

	it("equals exactly half of the wavelength at that frequency", () => {
		const fHigh = toLength(800, Hz);
		const w = calculateWellWidth(fHigh);
		const lambda = calculateWavelength(fHigh);

		expect(Number(w)).toBeCloseTo(Number(lambda) / 2, 6);
	});

	it("halves linearly as frequency doubles", () => {
		const narrow = calculateWellWidth(toLength(1000, Hz));
		const wide = calculateWellWidth(toLength(2000, Hz));

		expect(Number(wide)).toBeCloseTo(Number(narrow) / 2, 6);
	});

	it("throws on a non-positive frequency (programmer error)", () => {
		expect(() => calculateWellWidth(toLength(0, Hz))).toThrow();
		expect(() => calculateWellWidth(toLength(-100, Hz))).toThrow();
	});

	it("returns a branded Length", () => {
		const w = calculateWellWidth(toLength(1000, Hz));
		expect(typeof w).toBe("number");
	});
});

describe("calculatePanelWidth", () => {
	it("multiplies cell width by the well count", () => {
		const w = toLength(0.02, m);
		const W = calculatePanelWidth(w, 7);

		expect(Number(W)).toBeCloseTo(0.14, 6);
	});

	it("is linear in the count", () => {
		const w = toLength(0.02, m);
		const two = calculatePanelWidth(w, 4);
		const eight = calculatePanelWidth(w, 8);

		expect(Number(eight)).toBeCloseTo(Number(two) * 2, 6);
	});

	it("is linear in the cell width", () => {
		const narrow = calculatePanelWidth(toLength(0.02, m), 7);
		const wide = calculatePanelWidth(toLength(0.04, m), 7);

		expect(Number(wide)).toBeCloseTo(Number(narrow) * 2, 6);
	});

	it("returns a branded Length", () => {
		const W = calculatePanelWidth(toLength(0.02, m), 7);
		expect(typeof W).toBe("number");
	});

	it("throws on a non-positive count (programmer error)", () => {
		expect(() => calculatePanelWidth(toLength(0.02, m), 0)).toThrow();
		expect(() => calculatePanelWidth(toLength(0.02, m), -3)).toThrow();
	});
});

describe("calculatePanelHeight", () => {
	it("multiplies cell height by the row count", () => {
		const h = toLength(0.03, m);
		const H = calculatePanelHeight(h, 5);

		expect(Number(H)).toBeCloseTo(0.15, 6);
	});

	it("matches calculatePanelWidth when cells are square and count is equal", () => {
		const cell = toLength(0.02, m);
		const W = calculatePanelWidth(cell, 7);
		const H = calculatePanelHeight(cell, 7);

		expect(Number(H)).toBeCloseTo(Number(W), 6);
	});

	it("returns a branded Length", () => {
		const H = calculatePanelHeight(toLength(0.03, m), 5);
		expect(typeof H).toBe("number");
	});

	it("throws on a non-positive count (programmer error)", () => {
		expect(() => calculatePanelHeight(toLength(0.03, m), 0)).toThrow();
	});
});

describe("calculatePanelArea", () => {
	it("multiplies width by height", () => {
		const A = calculatePanelArea(toLength(0.14, m), toLength(0.3, m));

		expect(Number(A)).toBeCloseTo(0.042, 6);
	});

	it("is commutative in width and height", () => {
		const a = calculatePanelArea(toLength(0.14, m), toLength(0.3, m));
		const b = calculatePanelArea(toLength(0.3, m), toLength(0.14, m));

		expect(Number(b)).toBeCloseTo(Number(a), 6);
	});

	it("scales linearly with each dimension", () => {
		const base = calculatePanelArea(toLength(0.14, m), toLength(0.3, m));
		const doubled = calculatePanelArea(
			toLength(0.28, m),
			toLength(0.3, m),
		);

		expect(Number(doubled)).toBeCloseTo(Number(base) * 2, 6);
	});

	it("returns a branded Area", () => {
		const A = calculatePanelArea(toLength(0.14, m), toLength(0.3, m));
		expect(typeof A).toBe("number");
	});
});

describe("calculatePanelVolume", () => {
	it("multiplies width by height by depth", () => {
		const V = calculatePanelVolume(
			toLength(0.14, m),
			toLength(0.3, m),
			toLength(0.1, m),
		);

		expect(Number(V)).toBeCloseTo(0.0042, 6);
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

		expect(Number(b)).toBeCloseTo(Number(a), 6);
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

		expect(Number(doubled)).toBeCloseTo(Number(base) * 2, 6);
	});

	it("returns a branded Volume", () => {
		const V = calculatePanelVolume(
			toLength(0.14, m),
			toLength(0.3, m),
			toLength(0.1, m),
		);
		expect(typeof V).toBe("number");
	});
});
