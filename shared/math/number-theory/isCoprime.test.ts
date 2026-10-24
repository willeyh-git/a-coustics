import { describe, expect, it } from "vitest";
import { asPositiveInteger } from "@math/helpers";
import { isCoprime } from "@math/number-theory";

describe("isCoprime", () => {
	it("should return true for coprime numbers", () => {
		expect(isCoprime(asPositiveInteger(8), asPositiveInteger(9))).toBe(true);
		expect(isCoprime(asPositiveInteger(15), asPositiveInteger(28))).toBe(true);
		expect(isCoprime(asPositiveInteger(7), asPositiveInteger(13))).toBe(true);
	});

	it("should return false for non-coprime numbers", () => {
		expect(isCoprime(asPositiveInteger(8), asPositiveInteger(12))).toBe(false);
		expect(isCoprime(asPositiveInteger(15), asPositiveInteger(20))).toBe(false);
		expect(isCoprime(asPositiveInteger(10), asPositiveInteger(5))).toBe(false);
	});

	it("should be symmetric", () => {
		expect(isCoprime(asPositiveInteger(8), asPositiveInteger(9))).toBe(
			isCoprime(asPositiveInteger(9), asPositiveInteger(8)),
		);
		expect(isCoprime(asPositiveInteger(15), asPositiveInteger(28))).toBe(
			isCoprime(asPositiveInteger(28), asPositiveInteger(15)),
		);
	});
});
