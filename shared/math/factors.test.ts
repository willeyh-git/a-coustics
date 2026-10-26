import { getPrimeFactors } from "@math/factors";
import { asPositiveInteger } from "@math/helpers";
import { describe, expect, it } from "vitest";

describe("getPrimeFactors", () => {
	it("returns factors of a prime", () => {
		expect(getPrimeFactors(asPositiveInteger(7))).toEqual([7]);
	});

	it("returns factors of a composite number", () => {
		expect(getPrimeFactors(asPositiveInteger(12))).toEqual([2, 2, 3]);
	});

	it("returns factors in ascending order", () => {
		expect(getPrimeFactors(asPositiveInteger(84))).toEqual([2, 2, 3, 7]);
	});

	it("returns empty array for 1", () => {
		expect(getPrimeFactors(asPositiveInteger(1))).toEqual([]);
	});
	it("returns factors for powers of a prime", () => {
		expect(getPrimeFactors(asPositiveInteger(64))).toEqual([2, 2, 2, 2, 2, 2]);
	});
	it("returns factors for semiprimes", () => {
		expect(getPrimeFactors(asPositiveInteger(77))).toEqual([7, 11]);
	});

	describe("non-finite and non-integer boundaries", () => {
		it("throws for Infinity", () => {
			expect(() => getPrimeFactors(Infinity as unknown as PositiveInteger)).toThrow(
				RangeError,
			);
		});

		it("throws for -Infinity", () => {
			expect(() =>
				getPrimeFactors(-Infinity as unknown as PositiveInteger),
			).toThrow(RangeError);
		});

		it("throws for NaN", () => {
			expect(() => getPrimeFactors(NaN as unknown as PositiveInteger)).toThrow(
				RangeError,
			);
		});

		it("throws for fractional values", () => {
			expect(() => getPrimeFactors(2.5 as unknown as PositiveInteger)).toThrow(
				RangeError,
			);
		});

		it("returns itself for a large safe prime", () => {
			// Largest prime below Number.MAX_SAFE_INTEGER (MAX_SAFE_INTEGER itself is composite).
			const LARGE_PRIME = 9007199254740881;
			expect(getPrimeFactors(asPositiveInteger(LARGE_PRIME))).toEqual([
				LARGE_PRIME,
			]);
		});
	});
});
