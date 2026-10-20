import { describe, expect, it } from "vitest";
import { toFrequency } from "../geometry/scaling";
import { asPrime } from "../math/helpers";
import { getQuadraticResidues } from "../math/number-theory";
import { Hz } from "../types/units";
import { designPoly } from "./poly";
import { designSkyline } from "./skyline";

describe("designPoly", () => {
	const prime = asPrime(7);
	const freq = toFrequency(343, Hz);

	// Squares mod 7 for i = 0..6: [0,1,4,2,2,4,1]
	const squaresMod7 = [0, 1, 4, 2, 2, 4, 1];

	function expectedGrid(q1: number, q2: number, p: number): number[][] {
		const grid: number[][] = [];
		for (let i = 0; i < p; i++) {
			const row: number[] = [];
			for (let j = 0; j < p; j++) {
				row.push((q1 * squaresMod7[i] + q2 * squaresMod7[j]) % p);
			}
			grid.push(row);
		}
		return grid;
	}

	it("generates a square p × p grid", () => {
		const result = designPoly({ prime, designFrequency: freq, q1: 1, q2: 1 });

		expect(result.grid).toHaveLength(7);
		for (const row of result.grid) {
			expect(row).toHaveLength(7);
		}
	});

	it("computes S(i, j) = (q1 * i² + q2 * j²) mod p", () => {
		const result = designPoly({ prime, designFrequency: freq, q1: 1, q2: 1 });

		expect(result.grid).toEqual(expectedGrid(1, 1, 7));
		expect(result.grid[0][0]).toBe(0);
		expect(result.grid[0][1]).toBe(1);
		expect(result.grid[1][0]).toBe(1);
		expect(result.grid[2][2]).toBe((4 + 4) % 7);
	});

	it("produces an asymmetric grid when q1 ≠ q2", () => {
		const result = designPoly({ prime, designFrequency: freq, q1: 1, q2: 2 });

		expect(result.grid).toEqual(expectedGrid(1, 2, 7));
		// grid[0][1] uses q2 on j²; grid[1][0] uses q1 on i².
		expect(result.grid[0][1]).toBe((2 * 1) % 7);
		expect(result.grid[1][0]).toBe((1 * 1) % 7);
		expect(result.grid[0][1]).not.toBe(result.grid[1][0]);
	});

	it("uses the QRD unit depth as the poly unit depth", () => {
		const result = designPoly({ prime, designFrequency: freq, q1: 1, q2: 1 });

		// λ/(2p) = 1/14 at 343 Hz.
		expect(result.unitDepth).toBeCloseTo(1 / 14, 3);
	});

	it("converts the grid into physical depths", () => {
		const result = designPoly({ prime, designFrequency: freq, q1: 1, q2: 1 });

		expect(result.depths).toHaveLength(7);
		expect(result.depths[0][0]).toBeCloseTo(0, 3);
		expect(result.depths[1][1]).toBeCloseTo(2 / 14, 3);
		expect(result.depths[2][2]).toBeCloseTo(((4 + 4) % 7) / 14, 3);
	});

	it("reports the max residue and max depth", () => {
		const result = designPoly({ prime, designFrequency: freq, q1: 1, q2: 1 });

		// Max of (i² + j²) mod 7 over the grid is 6 (e.g. 4 + 2).
		expect(result.maxResidue).toBe(6);
		expect(result.maxDepth).toBeCloseTo(6 / 14, 3);
	});

	it("passes through the provided coefficients", () => {
		const result = designPoly({ prime, designFrequency: freq, q1: 1, q2: 2 });

		expect(result.q1).toBe(1);
		expect(result.q2).toBe(2);
	});

	it("normalizes equivalent coefficients modulo p", () => {
		// Congruence classes: 9 ≡ 2 (mod 7) and -3 ≡ 4 (mod 7), both QRs.
		const result = designPoly({ prime, designFrequency: freq, q1: 9, q2: -3 });

		expect(result.q1).toBe(2);
		expect(result.q2).toBe(4);
		expect(result.grid).toEqual(expectedGrid(2, 4, 7));
	});

	it("rejects coefficients congruent to 0 modulo p", () => {
		// 0 and the canonical-equivalent p collapse one axis of the rule.
		expect(() =>
			designPoly({ prime, designFrequency: freq, q1: 0, q2: 1 }),
		).toThrow(/congruent to 0/);
		expect(() =>
			designPoly({ prime, designFrequency: freq, q1: 7, q2: 1 }),
		).toThrow(/congruent to 0/);
	});

	it("rejects non-integer coefficients", () => {
		expect(() =>
			designPoly({ prime, designFrequency: freq, q1: 1.5, q2: 1 }),
		).toThrow(/must be an integer/);
		expect(() =>
			designPoly({ prime, designFrequency: freq, q1: 1, q2: 2.5 }),
		).toThrow(/must be an integer/);
	});

	it("rejects non-residue congruence classes out of range", () => {
		// 10 ≡ 3 (mod 7); 3 is not a quadratic residue modulo 7.
		expect(() =>
			designPoly({ prime, designFrequency: freq, q1: 10, q2: 1 }),
		).toThrow(/q1/);
	});

	it("matches the QRD-sourced skyline grid for q1 = q2 = 1", () => {
		const poly = designPoly({ prime, designFrequency: freq, q1: 1, q2: 1 });
		const skyline = designSkyline({
			prime,
			designFrequency: freq,
			sequenceType: "QRD",
		});

		expect(poly.grid).toEqual(skyline.grid);
		expect(poly.unitDepth).toBeCloseTo(skyline.unitHeight, 6);
		expect(poly.maxResidue).toBe(skyline.maxResidue);
	});

	it("validates that q1 is a quadratic residue mod p", () => {
		const valid = getQuadraticResidues(prime);
		// Pick a value that is NOT a quadratic residue mod 7.
		const invalid = valid.includes(3) ? 5 : 3;

		expect(() =>
			designPoly({ prime, designFrequency: freq, q1: invalid, q2: 1 }),
		).toThrow(/q1/);
	});

	it("validates that q2 is a quadratic residue mod p", () => {
		const valid = getQuadraticResidues(prime);
		const invalid = valid.includes(3) ? 5 : 3;

		expect(() =>
			designPoly({ prime, designFrequency: freq, q1: 1, q2: invalid }),
		).toThrow(/q2/);
	});

	it("accepts valid quadratic residues", () => {
		const result = designPoly({ prime, designFrequency: freq, q1: 2, q2: 4 });

		expect(result.grid).toEqual(expectedGrid(2, 4, 7));
	});

	it("handles the smallest prime (p = 3)", () => {
		const result = designPoly({
			prime: asPrime(3),
			designFrequency: freq,
			q1: 1,
			q2: 1,
		});

		// Squares mod 3: [0,1,1]. S(i,j) = (i² + j²) mod 3.
		expect(result.grid).toEqual([
			[0, 1, 1],
			[1, 2, 2],
			[1, 2, 2],
		]);
		expect(result.maxResidue).toBe(2);
		// Unit depth = λ/(2p) = 1/6 at 343 Hz.
		expect(result.unitDepth).toBeCloseTo(1 / 6, 3);
	});
});
