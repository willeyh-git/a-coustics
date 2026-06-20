import { describe, expect, it } from "vitest";
import { getPrimeFactors } from "./factors";
import { asPositiveInteger } from "./helpers";

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
});
