import { describe, expect, it } from "vitest";
import { asInteger, asPositiveInteger, asPrime } from "../helpers";
import { findPrimitiveRoot, mod } from "../number-theory";

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
	it("throws primitive root of 4", () => {
		expect(() => findPrimitiveRoot(4)).toThrow();
	});
	it("throws primitive root of 15", () => {
		expect(() => findPrimitiveRoot(15)).toThrow();
	});
});
describe("findPrimitiveMod", () => {
	it("finds primitive mod of 5, 7", () => {
		expect(mod(asInteger(5), asPositiveInteger(7))).toBe(5);
	});
	it("finds primitive mod of 7, 7", () => {
		expect(mod(asInteger(7), asPositiveInteger(7))).toBe(0);
	});
	it("finds primitive mod of -1, 7", () => {
		expect(mod(asInteger(-1), asPositiveInteger(7))).toBe(6);
	});
	it("finds primitive mod of -8, 7", () => {
		expect(mod(asInteger(-8), asPositiveInteger(7))).toBe(6);
	});
});
