import { describe, expect, it } from "vitest";
import { asInteger } from "../helpers";
import { isCoprime } from "../number-theory";

describe("isCoprime", () => {
	it("should return true for coprime numbers", () => {
		expect(isCoprime(asInteger(8), asInteger(9))).toBe(true);
		expect(isCoprime(asInteger(15), asInteger(28))).toBe(true);
		expect(isCoprime(asInteger(7), asInteger(13))).toBe(true);
	});

	it("should return false for non-coprime numbers", () => {
		expect(isCoprime(asInteger(8), asInteger(12))).toBe(false);
		expect(isCoprime(asInteger(15), asInteger(20))).toBe(false);
		expect(isCoprime(asInteger(10), asInteger(5))).toBe(false);
	});

	it("should be symmetric", () => {
		expect(isCoprime(asInteger(8), asInteger(9))).toBe(
			isCoprime(asInteger(9), asInteger(8)),
		);
		expect(isCoprime(asInteger(15), asInteger(28))).toBe(
			isCoprime(asInteger(28), asInteger(15)),
		);
	});
});
