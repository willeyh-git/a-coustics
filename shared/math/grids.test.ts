import { buildGrid, maxInGrid } from "@math/grids";
import { at } from "@utils/at";
import { describe, expect, it } from "vitest";

describe("buildGrid", () => {
	const sequence = [0, 1, 4, 2, 2, 4, 1];
	const p = 7;

	const skyline = buildGrid(sequence, (a, b) => (a + b) % p);

	// A matrix cell needs both indices narrowed: `matrix[i][j]` is rejected
	// because `matrix[i]` is `number[] | undefined`. `cellAt` narrows both, so a
	// wrong index fails loudly instead of comparing two `undefined`s as equal.
	function cellAt(matrix: number[][], i: number, j: number): number {
		return at(at(matrix, i), j);
	}

	it("produces a square n × n grid", () => {
		expect(skyline).toHaveLength(7);
		for (const row of skyline) {
			expect(row).toHaveLength(7);
		}
	});

	it("is symmetric across the diagonal", () => {
		for (let i = 0; i < 7; i++) {
			for (let j = 0; j < 7; j++) {
				expect(cellAt(skyline, i, j)).toBe(cellAt(skyline, j, i));
			}
		}
	});

	it("computes (S(i) + S(j)) mod p", () => {
		expect(skyline).toEqual([
			[0, 1, 4, 2, 2, 4, 1],
			[1, 2, 5, 3, 3, 5, 2],
			[4, 5, 1, 6, 6, 1, 5],
			[2, 3, 6, 4, 4, 6, 3],
			[2, 3, 6, 4, 4, 6, 3],
			[4, 5, 1, 6, 6, 1, 5],
			[1, 2, 5, 3, 3, 5, 2],
		]);
	});

	it("keeps every value within [0, p)", () => {
		for (const row of skyline) {
			for (const value of row) {
				expect(value).toBeGreaterThanOrEqual(0);
				expect(value).toBeLessThan(p);
			}
		}
	});
});

describe("maxInGrid", () => {
	it("returns the maximum residue of a grid", () => {
		expect(
			maxInGrid([
				[0, 1],
				[2, 6],
			]),
		).toBe(6);

		const qrdSequence = [0, 1, 4, 2, 2, 4, 1];
		const grid = buildGrid(qrdSequence, (a, b) => (a + b) % 7);
		expect(maxInGrid(grid)).toBe(6);
	});

	it("returns 0 for an empty grid and for all-zero grids", () => {
		expect(maxInGrid([])).toBe(0);
		expect(maxInGrid([[], []])).toBe(0);
		expect(
			maxInGrid([
				[0, 0],
				[0, 0],
			]),
		).toBe(0);
	});

	it("handles jagged rows", () => {
		expect(maxInGrid([[0, 5], [3]])).toBe(5);
		expect(maxInGrid([[0], [9, 1]])).toBe(9);
	});

	it("bounds every grid value", () => {
		const grid = [
			[2, 3, 1],
			[0, 6, 4],
		];
		const max = maxInGrid(grid);
		for (const row of grid) {
			for (const value of row) {
				expect(value).toBeLessThanOrEqual(max);
			}
		}
	});
});
