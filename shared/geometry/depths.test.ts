import { describe, expect, it } from "vitest";
import { m } from "../types/units";
import { sequenceToDepths } from "./depths";
import { toLength } from "./scaling";

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
			const valA = a[i];
			const valB = b[i];
			if (valA === undefined || valB === undefined) {
				throw new Error(`Depth at index ${i} is undefined`);
			}
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
