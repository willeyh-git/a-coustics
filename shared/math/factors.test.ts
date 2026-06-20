import { describe, expect, it } from "vitest";
import { getPrimeFactors } from "./factors";

describe("getPrimeFactors", () => {
	it("returns factors of a prime", () => {
		expect(getPrimeFactors(7)).toEqual([7]);
	});

	it("returns factors of a composite number", () => {
		expect(getPrimeFactors(12)).toEqual([2, 2, 3]);
	});

	it("returns factors in ascending order", () => {
		expect(getPrimeFactors(84)).toEqual([2, 2, 3, 7]);
	});

	it("returns empty array for 1", () => {
		expect(getPrimeFactors(1)).toEqual([]);
	});
	it("returns factors for powers of a prime", () => {
		expect(getPrimeFactors(64)).toEqual([2, 2, 2, 2, 2, 2]);
	});
	it("returns factors for semiprimes", () => {
		expect(getPrimeFactors(77)).toEqual([7, 11]);
	});
});
