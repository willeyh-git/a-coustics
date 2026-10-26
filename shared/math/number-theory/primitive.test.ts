import { asInteger, asModulus, asPrime } from "@math/helpers";
import { findPrimitiveRoot, isPrimitiveRoot, mod } from "@math/number-theory";
import { describe, expect, it } from "vitest";

describe("findPrimitiveRoot", () => {
	it("finds primitive root of 3", () => {
		expect(findPrimitiveRoot(asPrime(3))).toBe(2);
	});

	it("finds primitive root of 5", () => {
		expect(findPrimitiveRoot(asPrime(5))).toBe(2);
	});

	it("finds primitive root of 7", () => {
		expect(findPrimitiveRoot(asPrime(7))).toBe(3);
	});
	it("finds primitive root of 11", () => {
		expect(findPrimitiveRoot(asPrime(11))).toBe(2);
	});
	it("finds primitive root of 13", () => {
		expect(findPrimitiveRoot(asPrime(13))).toBe(2);
	});
	it("finds primitive root of 17", () => {
		expect(findPrimitiveRoot(asPrime(17))).toBe(3);
	});
	// `findPrimitiveRoot` takes a branded `Prime`, so a non-prime literal is
	// rejected by `asPrime` before `findPrimitiveRoot` is entered. (Primality
	// itself is covered in `number-theory/isPrime.test.ts`; these assertions
	// only pin that a non-prime cannot be passed at all.)
	it("rejects a non-prime 4 at construction", () => {
		expect(() => findPrimitiveRoot(asPrime(4))).toThrow();
	});
	it("rejects a non-prime 15 at construction", () => {
		expect(() => findPrimitiveRoot(asPrime(15))).toThrow();
	});
});

describe("isPrimitiveRoot", () => {
	it("should accept primitive roots", () => {
		expect(isPrimitiveRoot(asPrime(7), 3)).toBe(true);
		expect(isPrimitiveRoot(asPrime(7), 5)).toBe(true);
		expect(isPrimitiveRoot(asPrime(11), 2)).toBe(true);
		expect(isPrimitiveRoot(asPrime(2), 1)).toBe(true);
	});

	it("should reject non-primitive roots", () => {
		expect(isPrimitiveRoot(asPrime(7), 2)).toBe(false);
		expect(isPrimitiveRoot(asPrime(7), 1)).toBe(false);
		expect(isPrimitiveRoot(asPrime(11), 3)).toBe(false);
	});

	it("should reject non-integers and out-of-range values", () => {
		expect(isPrimitiveRoot(asPrime(7), 3.5)).toBe(false);
		expect(isPrimitiveRoot(asPrime(7), 0)).toBe(false);
		expect(isPrimitiveRoot(asPrime(7), 7)).toBe(false);
		expect(isPrimitiveRoot(asPrime(7), -1)).toBe(false);
	});
});
describe("findPrimitiveMod", () => {
	it("finds primitive mod of 5, 7", () => {
		expect(mod(asInteger(5), asModulus(7))).toBe(5);
	});
	it("finds primitive mod of 7, 7", () => {
		expect(mod(asInteger(7), asModulus(7))).toBe(0);
	});
	it("finds primitive mod of -1, 7", () => {
		expect(mod(asInteger(-1), asModulus(7))).toBe(6);
	});
	it("finds primitive mod of -8, 7", () => {
		expect(mod(asInteger(-8), asModulus(7))).toBe(6);
	});
});
