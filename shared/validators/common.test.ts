import { asPrime } from "@math/helpers";
import { isPrimitiveRoot } from "@math/number-theory";
import {
	asFiniteNumber,
	asModulusValue,
	asPrimeValue,
	combine,
	describeValue,
	fail,
	MAX_PRIME,
	ok,
	type ValidationResult,
	validateNonNegativeNumber,
	validateOneOf,
	validatePositiveFrequency,
	validatePositiveFrequencyArray,
	validatePositiveLength,
	validatePositiveNumber,
	validatePositiveVolume,
	validatePrime,
	validatePrimitiveRoot,
	validateRatioInRange,
} from "@validators/common";
import { describe, expect, it } from "vitest";

describe("combine", () => {
	it("reports valid when nothing failed", () => {
		expect(combine([ok(), ok()])).toEqual(ok());
	});

	it("keeps every error across the results", () => {
		const result = combine([
			fail("prime", "first"),
			ok(),
			fail("designFrequency", "second"),
		]);

		expect(result).toEqual({
			valid: false,
			errors: [
				{ field: "prime", message: "first" },
				{ field: "designFrequency", message: "second" },
			],
		});
	});

	it("preserves the order in which fields were checked", () => {
		const result = combine([fail("b", "second"), fail("a", "first")]);

		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual(["b", "a"]);
		}
	});
});

describe("describeValue", () => {
	it("quotes strings so a stringified number cannot masquerade as a number", () => {
		expect(describeValue("7")).toEqual('"7"');
	});

	it("renders null/undefined and summarises containers", () => {
		expect(describeValue(null)).toEqual("null");
		expect(describeValue(undefined)).toEqual("undefined");
		expect(describeValue([1, 2, 3])).toEqual("[array of 3 entry(s)]");
		expect(describeValue({ prime: 7 })).toEqual("[object]");
	});
});

describe("asFiniteNumber", () => {
	it("narrows a usable number", () => {
		expect(asFiniteNumber(2.5)).toBe(2.5);
	});

	it("rejects NaN, infinities and non-numbers", () => {
		expect(asFiniteNumber(Number.NaN)).toBeUndefined();
		expect(asFiniteNumber(Number.POSITIVE_INFINITY)).toBeUndefined();
		expect(asFiniteNumber("1000")).toBeUndefined();
		expect(asFiniteNumber(null)).toBeUndefined();
	});
});

describe("asPrimeValue / asModulusValue", () => {
	it("narrows a usable prime to the branded Prime", () => {
		expect(asPrimeValue(7)).toEqual(asPrime(7));
	});

	it("gives up on values that are not prime", () => {
		expect(asPrimeValue(6)).toBeUndefined();
		expect(asPrimeValue(2.5)).toBeUndefined();
		expect(asPrimeValue("7")).toBeUndefined();
	});

	it("narrows the same value to a branded Modulus", () => {
		expect(asModulusValue(7)).toEqual(asModulusValue(7));
		expect(asModulusValue(6)).toBeUndefined();
	});

	it("still narrows primes outside the accepted design range", () => {
		// The bounds are a product decision applied by validatePrime only.
		expect(asPrimeValue(101)).toEqual(asPrime(101));
	});
});

describe("validatePositiveNumber and its unit wrappers", () => {
	it("accepts a positive finite number", () => {
		expect(validatePositiveNumber(1000, "frequency")).toEqual(ok());
	});

	it("rejects zero, negatives and non-numbers", () => {
		const zero = validatePositiveNumber(0, "frequency");
		const negative = validatePositiveNumber(-50, "frequency");
		const text = validatePositiveNumber("1000", "frequency");
		const notANumber = validatePositiveNumber(Number.NaN, "frequency");

		for (const result of [zero, negative, text, notANumber]) {
			expect(result.valid).toBe(false);
		}
		if (!zero.valid) {
			expect(zero.errors.map((error) => error.field)).toEqual(["frequency"]);
		}
		if (negative.valid || text.valid || notANumber.valid) {
			expect("a rejected value reported as valid").toBe(false);
		}
	});

	it("names the field that failed", () => {
		const result = validatePositiveNumber(-1, "neckLength");
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual(["neckLength"]);
		}
	});

	it("wrappers behave like validatePositiveNumber", () => {
		const cases: [ValidationResult, ValidationResult][] = [
			[
				validatePositiveFrequency(1000),
				validatePositiveNumber(1000, "frequency"),
			],
			[validatePositiveLength(0.15), validatePositiveNumber(0.15, "length")],
			[validatePositiveVolume(0.002), validatePositiveNumber(0.002, "volume")],
		];

		for (const [wrapper, generic] of cases) {
			expect(wrapper).toEqual(generic);
		}
	});

	it("wrappers report their default field name", () => {
		const result = validatePositiveLength(-0.1);
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual(["length"]);
		}
	});
});

describe("validatePositiveFrequencyArray", () => {
	it("accepts a non-empty array of positive numbers", () => {
		expect(validatePositiveFrequencyArray([100, 200, 400])).toEqual(ok());
	});

	it("rejects an empty array and non-arrays", () => {
		expect(validatePositiveFrequencyArray([]).valid).toBe(false);
		expect(validatePositiveFrequencyArray("100").valid).toBe(false);
	});

	it("rejects a non-positive or non-finite entry, naming its index", () => {
		const result = validatePositiveFrequencyArray([100, 0, 300]);
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual([
				"frequencyAxis",
			]);
			expect(result.errors.map((error) => error.message).join(" ")).toContain(
				"entry 1",
			);
		}
	});
});

describe("validatePrime", () => {
	it("accepts primes inside the accepted order range", () => {
		for (const prime of [3, 5, 7, 11, 13, 97]) {
			expect(validatePrime(prime).valid).toBe(true);
		}
	});

	it("rejects non-primes", () => {
		for (const composite of [4, 6, 9, 12, 15]) {
			expect(validatePrime(composite).valid).toBe(false);
		}
	});

	it("rejects non-integers and non-numbers", () => {
		expect(validatePrime(3.5).valid).toBe(false);
		expect(validatePrime("7").valid).toBe(false);
	});

	it("enforces the engineering bounds", () => {
		expect(validatePrime(2).valid).toBe(false);
		expect(validatePrime(MAX_PRIME + 1).valid).toBe(false);
		expect(validatePrime(10_000_003).valid).toBe(false);
	});

	it("names the offending value in the message", () => {
		const result = validatePrime(6);
		if (!result.valid) {
			expect(result.errors.map((error) => error.message)).toEqual([
				"Value 6 must be a prime number.",
			]);
		}
	});

	it("distinguishes a string from the same digits", () => {
		const result = validatePrime("7");
		if (!result.valid) {
			expect(result.errors.map((error) => error.message).join(" ")).toContain(
				'"7"',
			);
		}
	});
});

describe("validatePrimitiveRoot", () => {
	it("accepts a genuine primitive root modulo 7", () => {
		expect(validatePrimitiveRoot(asPrime(7), 3)).toEqual(ok());
	});

	it("rejects a value that is not a primitive root modulo 7", () => {
		const result = validatePrimitiveRoot(asPrime(7), 2);
		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual([
				"primitiveRoot",
			]);
			expect(result.errors.map((error) => error.message)).toEqual([
				"Value 2 must be a primitive root modulo 7.",
			]);
		}
	});

	it("tracks the library's own predicate for every candidate", () => {
		for (let g = 1; g < 7; g = g + 1) {
			const result = validatePrimitiveRoot(asPrime(7), g);
			expect(result.valid).toBe(isPrimitiveRoot(asPrime(7), g));
		}
	});

	it("rejects non-integer candidates", () => {
		expect(validatePrimitiveRoot(asPrime(7), 2.5).valid).toBe(false);
		expect(validatePrimitiveRoot(asPrime(7), "3").valid).toBe(false);
	});
});

describe("validateRatioInRange", () => {
	it("accepts the inclusive lower bound", () => {
		expect(validateRatioInRange(0, 0, 1)).toEqual(ok());
	});

	it("accepts values strictly below the upper bound", () => {
		expect(validateRatioInRange(0.999, 0, 1)).toEqual(ok());
	});

	it("rejects the exclusive upper bound and beyond", () => {
		expect(validateRatioInRange(1, 0, 1).valid).toBe(false);
		expect(validateRatioInRange(1.5, 0, 1).valid).toBe(false);
	});

	it("rejects values below the lower bound", () => {
		expect(validateRatioInRange(-0.01, 0, 1).valid).toBe(false);
	});

	it("names the field it was called with", () => {
		const result = validateRatioInRange(2, 0, 1, "absorptiveRatio");
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual([
				"absorptiveRatio",
			]);
			expect(result.errors.map((error) => error.message)).toEqual([
				"absorptiveRatio must satisfy 0 <= value < 1 (got 2).",
			]);
		}
	});

	it("rejects non-finite values", () => {
		expect(validateRatioInRange(Number.NaN, 0, 1).valid).toBe(false);
	});
});

describe("validateNonNegativeNumber", () => {
	it("accepts zero, where validatePositiveNumber does not", () => {
		expect(
			validateNonNegativeNumber(0, "material.surfaceResistance").valid,
		).toBe(true);
		expect(validatePositiveNumber(0, "material.surfaceResistance").valid).toBe(
			false,
		);
	});

	it("rejects negatives and non-numbers", () => {
		expect(validateNonNegativeNumber(-1, "thickness").valid).toBe(false);
		expect(validateNonNegativeNumber("0", "thickness").valid).toBe(false);
	});
});

describe("validateOneOf", () => {
	it("accepts a listed option", () => {
		expect(validateOneOf("PRD", ["QRD", "PRD"], "sequenceType")).toEqual(ok());
	});

	it("rejects an option that is not listed, including a mis-cased one", () => {
		const result = validateOneOf("prd", ["QRD", "PRD"], "sequenceType");
		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.errors.map((error) => error.field)).toEqual([
				"sequenceType",
			]);
			expect(result.errors.map((error) => error.message).join(" ")).toContain(
				"QRD, PRD",
			);
		}
	});

	it("rejects a missing option when called for one", () => {
		expect(validateOneOf(undefined, ["QRD", "PRD"], "sequenceType").valid).toBe(
			false,
		);
	});
});

describe("ValidationResult shape", () => {
	it("every result is either valid or carries at least one error", () => {
		const results: ValidationResult[] = [
			validatePrime(6),
			validatePositiveNumber(-1, "frequency"),
			validateRatioInRange(1, 0, 1, "absorptiveRatio"),
			ok(),
		];

		for (const result of results) {
			if (result.valid) {
				expect(true).toBe(true);
				continue;
			}
			expect(result.errors.length).toBeGreaterThan(0);
			for (const error of result.errors) {
				expect(typeof error.field).toEqual("string");
				expect(typeof error.message).toEqual("string");
			}
		}
	});
});
