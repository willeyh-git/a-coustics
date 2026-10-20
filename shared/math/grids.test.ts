import { describe, expect, it } from "vitest";
import { toLength } from "../geometry/scaling";
import { m } from "../types/units";
import { buildGrid, matrixToLengths } from "./grids";

describe("buildGrid", () => {
	const sequence = [0, 1, 4, 2, 2, 4, 1];
	const p = 7;

	const skyline = buildGrid(
		sequence,
		(i, j) => (sequence[i] + sequence[j]) % p,
	);

	it("produces a square n × n grid", () => {
		expect(skyline).toHaveLength(7);
		for (const row of skyline) {
			expect(row).toHaveLength(7);
		}
	});

	it("is symmetric across the diagonal", () => {
		for (let i = 0; i < 7; i++) {
			for (let j = 0; j < 7; j++) {
				expect(skyline[i][j]).toBe(skyline[j][i]);
			}
		}
	});

	it("computes (S(i) + S(j)) mod p", () => {
		expect(skyline[0][0]).toBe(0);
		expect(skyline[0][1]).toBe(1);
		expect(skyline[1][0]).toBe(1);
		expect(skyline[2][2]).toBe((4 + 4) % p);
		expect(skyline[3][5]).toBe((2 + 4) % p);
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

describe("matrixToLengths", () => {
	const unit = toLength(1 / 14, m);

	it("scales every entry by the unit value", () => {
		const matrix = [
			[0, 1, 4],
			[2, 2, 4],
			[1, 0, 3],
		];
		const lengths = matrixToLengths(matrix, unit);

		expect(lengths).toHaveLength(3);
		expect(lengths[0][0]).toBeCloseTo(0, 6);
		expect(lengths[0][1]).toBeCloseTo(1 / 14, 6);
		expect(lengths[0][2]).toBeCloseTo(4 / 14, 6);
		expect(lengths[2][2]).toBeCloseTo(3 / 14, 6);
	});

	it("preserves the matrix shape", () => {
		const matrix = [
			[1, 2],
			[3, 4],
			[5, 6],
		];
		expect(matrixToLengths(matrix, unit)).toHaveLength(3);
		expect(matrixToLengths(matrix, unit)[0]).toHaveLength(2);
	});
});
