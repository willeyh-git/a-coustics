import { matrixToLengths, sequenceToDepths } from "@geometry/depths";
import { toLength } from "@geometry/scaling";
import { m } from "@units/units";
import { at } from "@utils/at";
import { describe, expect, it } from "vitest";

describe("sequenceToDepths", () => {
	it("should map sequence values linearly to depths", () => {
		const result = sequenceToDepths([0, 1, 4, 2, 2, 4, 1], toLength(0.01, m));

		expect(result).toEqual([0, 0.01, 0.04, 0.02, 0.02, 0.04, 0.01]);
	});

	it("should preserve zero values", () => {
		const result = sequenceToDepths([0, 0, 0, 0], toLength(0.01, m));

		expect(result).toEqual([0, 0, 0, 0]);
	});

	it("should scale linearly with unitDepth", () => {
		const seq = [1, 2, 3];

		const a = sequenceToDepths(seq, toLength(0.01, m));
		const b = sequenceToDepths(seq, toLength(0.02, m));

		for (let i = 0; i < seq.length; i++) {
			const valA = at(a, i);
			const valB = at(b, i);
			expect(valB).toBeCloseTo(valA * 2);
		}
	});

	it("should preserve array length", () => {
		const seq = [1, 2, 3, 4, 5];

		const result = sequenceToDepths(seq, toLength(0.01, m));

		expect(result).toHaveLength(seq.length);
	});

	it("should return only Length values", () => {
		const result = sequenceToDepths([1, 2, 3], toLength(0.01, m));

		result.forEach((v) => {
			expect(typeof v).toBe("number");
		});
	});

	it("should scale values correctly and preserve zero", () => {
		const result = sequenceToDepths([0, 1, 2], toLength(0.01, m));

		expect(result[0]).toBe(0);
		expect(result[1]).toBe(0.01);
		expect(result[2]).toBe(0.02);
	});
});

describe("matrixToLengths", () => {
	const unit = toLength(1 / 14, m);

	// Both indices need narrowing before a cell can be read (see `at`).
	function cellAt(matrix: number[][], i: number, j: number): number {
		return at(at(matrix, i), j);
	}

	it("scales every entry by the unit value", () => {
		const matrix = [
			[0, 1, 4],
			[2, 2, 4],
			[1, 0, 3],
		];
		const lengths = matrixToLengths(matrix, unit);

		expect(lengths).toHaveLength(3);
		expect(cellAt(lengths, 0, 0)).toBeCloseTo(0, 6);
		expect(cellAt(lengths, 0, 1)).toBeCloseTo(1 / 14, 6);
		expect(cellAt(lengths, 0, 2)).toBeCloseTo(4 / 14, 6);
		expect(cellAt(lengths, 2, 2)).toBeCloseTo(3 / 14, 6);
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
