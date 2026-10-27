import {
	asAcousticResistance,
	asFlowResistivity,
	asFrequency,
	asSurfaceResistance,
	assertInteger,
	assertNonNegativeInteger,
	assertPositiveInteger,
	assertPrime,
} from "@math/helpers";
import { describe, expect, it } from "vitest";

describe("Math Helpers", () => {
	describe("assertInteger", () => {
		it("should pass for integers", () => {
			expect(() => assertInteger(1)).not.toThrow();
			expect(() => assertInteger(0)).not.toThrow();
			expect(() => assertInteger(-5)).not.toThrow();
			expect(() => assertInteger(100)).not.toThrow();
		});

		it("should throw for non-integers", () => {
			expect(() => assertInteger(1.5)).toThrow(RangeError);
			expect(() => assertInteger(NaN)).toThrow(RangeError);
			expect(() => assertInteger(Infinity)).toThrow(RangeError);
		});
	});

	describe("assertNonNegativeInteger", () => {
		it("should pass for non-negative integers", () => {
			expect(() => assertNonNegativeInteger(0)).not.toThrow();
			expect(() => assertNonNegativeInteger(1)).not.toThrow();
			expect(() => assertNonNegativeInteger(100)).not.toThrow();
		});

		it("should throw for negative integers", () => {
			expect(() => assertNonNegativeInteger(-1)).toThrow(RangeError);
			expect(() => assertNonNegativeInteger(-100)).toThrow(RangeError);
		});

		it("should throw for non-integers", () => {
			expect(() => assertNonNegativeInteger(1.5)).toThrow(RangeError);
		});
	});

	describe("assertPositiveInteger", () => {
		it("should pass for positive integers", () => {
			expect(() => assertPositiveInteger(1)).not.toThrow();
			expect(() => assertPositiveInteger(100)).not.toThrow();
		});

		it("should throw for 0", () => {
			expect(() => assertPositiveInteger(0)).toThrow(RangeError);
		});

		it("should throw for negative integers", () => {
			expect(() => assertPositiveInteger(-1)).toThrow(RangeError);
			expect(() => assertPositiveInteger(-100)).toThrow(RangeError);
		});

		it("should throw for non-integers", () => {
			expect(() => assertPositiveInteger(1.5)).toThrow(RangeError);
		});
	});

	describe("assertPrime", () => {
		it("should pass for prime numbers", () => {
			expect(() => assertPrime(2)).not.toThrow();
			expect(() => assertPrime(3)).not.toThrow();
			expect(() => assertPrime(5)).not.toThrow();
			expect(() => assertPrime(7)).not.toThrow();
			expect(() => assertPrime(11)).not.toThrow();
			expect(() => assertPrime(13)).not.toThrow();
			expect(() => assertPrime(17)).not.toThrow();
			expect(() => assertPrime(19)).not.toThrow();
		});

		it("should throw for non-prime numbers", () => {
			expect(() => assertPrime(1)).toThrow(RangeError);
			expect(() => assertPrime(4)).toThrow(RangeError);
			expect(() => assertPrime(6)).toThrow(RangeError);
			expect(() => assertPrime(8)).toThrow(RangeError);
			expect(() => assertPrime(9)).toThrow(RangeError);
			expect(() => assertPrime(10)).toThrow(RangeError);
			expect(() => assertPrime(15)).toThrow(RangeError);
		});

		it("should throw for negative numbers", () => {
			expect(() => assertPrime(-2)).toThrow(RangeError);
			expect(() => assertPrime(-7)).toThrow(RangeError);
		});

		it("should throw for non-integers", () => {
			expect(() => assertPrime(1.5)).toThrow(RangeError);
			expect(() => assertPrime(2.1)).toThrow(RangeError);
		});
	});
});

describe("physical unit constructors", () => {
	describe("asFrequency", () => {
		it("accepts finite positive values", () => {
			expect(() => asFrequency(343)).not.toThrow();
			expect(() => asFrequency(0.5)).not.toThrow();
		});

		it("rejects non-finite values", () => {
			expect(() => asFrequency(NaN)).toThrow(RangeError);
			expect(() => asFrequency(Infinity)).toThrow(RangeError);
			expect(() => asFrequency(-Infinity)).toThrow(RangeError);
		});

		it("rejects non-positive values", () => {
			expect(() => asFrequency(0)).toThrow(RangeError);
			expect(() => asFrequency(-10)).toThrow(RangeError);
		});
	});

	describe("asAcousticResistance", () => {
		it("accepts finite positive values", () => {
			expect(() => asAcousticResistance(1000)).not.toThrow();
		});

		it("rejects non-finite values", () => {
			expect(() => asAcousticResistance(NaN)).toThrow(RangeError);
			expect(() => asAcousticResistance(Infinity)).toThrow(RangeError);
			expect(() => asAcousticResistance(-Infinity)).toThrow(RangeError);
		});

		it("rejects non-positive values", () => {
			expect(() => asAcousticResistance(0)).toThrow(RangeError);
		});
	});

	describe("asFlowResistivity", () => {
		it("accepts finite positive values", () => {
			expect(() => asFlowResistivity(5000)).not.toThrow();
		});

		it("rejects non-finite values", () => {
			expect(() => asFlowResistivity(NaN)).toThrow(RangeError);
			expect(() => asFlowResistivity(Infinity)).toThrow(RangeError);
			expect(() => asFlowResistivity(-Infinity)).toThrow(RangeError);
		});

		it("rejects non-positive values", () => {
			expect(() => asFlowResistivity(0)).toThrow(RangeError);
		});
	});

	describe("asSurfaceResistance", () => {
		it("accepts finite non-negative values", () => {
			expect(() => asSurfaceResistance(0)).not.toThrow();
			expect(() => asSurfaceResistance(2500)).not.toThrow();
		});

		it("rejects non-finite values", () => {
			expect(() => asSurfaceResistance(NaN)).toThrow(RangeError);
			expect(() => asSurfaceResistance(Infinity)).toThrow(RangeError);
			expect(() => asSurfaceResistance(-Infinity)).toThrow(RangeError);
		});

		it("rejects negative values", () => {
			expect(() => asSurfaceResistance(-1)).toThrow(RangeError);
		});
	});
});
