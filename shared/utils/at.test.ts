import { at } from "@utils/at";
import { describe, expect, it } from "vitest";

describe("at", () => {
	it("returns the element at a valid index", () => {
		expect(at([10, 20, 30], 0)).toBe(10);
		expect(at([10, 20, 30], 1)).toBe(20);
		expect(at([10, 20, 30], 2)).toBe(30);
	});

	it("narrows past undefined (returns the element, not T | undefined)", () => {
		const value = at(["a", "b"], 1);
		// `value` is `string` here, not `string | undefined`.
		expect(value.toUpperCase()).toBe("B");
	});

	it("returns the last element at index length - 1", () => {
		expect(at([1, 2, 3], 2)).toBe(3);
	});

	it("throws for a negative index", () => {
		expect(() => at([1, 2, 3], -1)).toThrow(RangeError);
	});

	it("throws for an index at or beyond length", () => {
		expect(() => at([1, 2, 3], 3)).toThrow(RangeError);
		expect(() => at([1, 2, 3], 99)).toThrow(RangeError);
	});

	it("throws for a non-integer index", () => {
		expect(() => at([1, 2, 3], 1.5)).toThrow(RangeError);
		expect(() => at([1, 2, 3], NaN)).toThrow(RangeError);
	});

	it("throws for an empty array", () => {
		expect(() => at<number>([], 0)).toThrow(RangeError);
	});

	it("treats -0 as index 0", () => {
		expect(at([1, 2, 3], -0)).toBe(1);
	});

	it("accepts a readonly array", () => {
		const frozen: readonly number[] = [7, 8];
		expect(at(frozen, 1)).toBe(8);
	});

	// Element types that contain a missing value have no meaningful read: the
	// `NonNullable<T>` return type would otherwise be a lie.
	it("throws when the element itself is missing", () => {
		expect(() => at<string | undefined>([undefined], 0)).toThrow(RangeError);
		expect(() => at<string | null>(["a", null], 1)).toThrow(RangeError);
	});

	it("rejects a missing element only, not a falsy one", () => {
		expect(at([0, "", false], 0)).toBe(0);
		expect(at<number | undefined>([undefined, 5], 1)).toBe(5);
	});
});
