import { isPrime } from "@math/number-theory";
import type {
	AcousticResistance,
	FlowResistivity,
	Frequency,
	Integer,
	Modulus,
	NonNegativeInteger,
	PositiveInteger,
	Prime,
	SurfaceResistance,
} from "@units/units";

/**
 * Asserts that the given value is an integer.
 * @param n The value to check.
 * @throws RangeError if n is not an integer.
 */
export function assertInteger(n: number): asserts n is Integer {
	if (!Number.isInteger(n)) {
		throw new RangeError(`Value ${n} must be an integer.`);
	}
}

/**
 * Asserts that the given value is a non-negative integer.
 * @param n The value to check.
 * @throws RangeError if n is not a non-negative integer.
 */
export function assertNonNegativeInteger(
	n: number,
): asserts n is NonNegativeInteger {
	if (!Number.isInteger(n) || n < 0) {
		throw new RangeError(`Value ${n} must be a non-negative integer.`);
	}
}

/**
 * Asserts that the given value is a positive integer.
 * @param n The value to check.
 * @throws RangeError if n is not a positive integer.
 */
export function assertPositiveInteger(n: number): asserts n is PositiveInteger {
	if (!Number.isInteger(n) || n <= 0) {
		throw new RangeError(`Value ${n} must be a positive integer.`);
	}
}

/**
 * Asserts that the given value is a prime number.
 * @param n The value to check.
 * @throws RangeError if n is not a prime number.
 */
export function assertPrime(n: number): asserts n is Prime {
	if (!Number.isInteger(n) || !isPrime(n)) {
		throw new RangeError(`Value ${n} must be a prime number.`);
	}
}

/**
 * Asserts that the given value is a usable modulus.
 *
 * Every residue rule in this project (quadratic residues, primitive roots,
 * skyline/poly grids) is only defined over a prime modulus, so a modulus is
 * validated with the same primality check as a {@link Prime}.
 * @param n The value to check.
 * @throws RangeError if n is not a prime number.
 */
export function assertModulus(n: number): asserts n is Modulus {
	assertPrime(n);
}

/**
 * Constructs a Modulus from a number.
 * @param n The number to convert.
 * @returns The branded Modulus.
 * @throws RangeError if n is not a prime number.
 */
export function asModulus(n: number): Modulus {
	assertModulus(n);
	return n;
}

/**
 * Constructs a PositiveInteger from a number.
 * @param n The number to convert.
 * @returns The branded PositiveInteger.
 * @throws RangeError if n is not a positive integer.
 */
export function asPositiveInteger(n: number): PositiveInteger {
	assertPositiveInteger(n);
	return n;
}

/**
 * Constructs a Prime from a number.
 * @param n The number to convert.
 * @returns The branded Prime.
 * @throws RangeError if n is not a prime number.
 */
export function asPrime(n: number): Prime {
	assertPrime(n);
	return n;
}

/**
 * Constructs an Integer from a number.
 * @param n The number to convert.
 * @returns The branded Integer.
 * @throws RangeError if n is not an integer.
 */
export function asInteger(n: number): Integer {
	assertInteger(n);
	return n;
}

/**
 * Constructs a NonNegativeInteger from a number.
 * @param n The number to convert.
 * @returns The branded NonNegativeInteger.
 * @throws RangeError if n is not a non-negative integer.
 */
export function asNonNegativeInteger(n: number): NonNegativeInteger {
	assertNonNegativeInteger(n);
	return n;
}

/**
 * Constructs a Frequency from a number.
 * @param n The number to convert.
 * @returns The branded Frequency.
 * @throws RangeError if n is not a positive number.
 */
export function asFrequency(n: number): Frequency {
	if (!Number.isFinite(n) || n <= 0) {
		throw new RangeError(`Value ${n} must be a finite, positive frequency.`);
	}
	return n as Frequency;
}

/**
 * Constructs an AcousticResistance from a number (rayls/m⁴).
 * @param n The number to convert.
 * @returns The branded AcousticResistance.
 * @throws RangeError if n is not a positive number.
 */
export function asAcousticResistance(n: number): AcousticResistance {
	if (!Number.isFinite(n) || n <= 0) {
		throw new RangeError(
			`Value ${n} must be a finite, positive acoustic resistance.`,
		);
	}
	return n as AcousticResistance;
}

/**
 * Constructs a FlowResistivity from a number (rayls/m³).
 * @param n The number to convert.
 * @returns The branded FlowResistivity.
 * @throws RangeError if n is not a positive number.
 */
export function asFlowResistivity(n: number): FlowResistivity {
	if (!Number.isFinite(n) || n <= 0) {
		throw new RangeError(
			`Value ${n} must be a finite, positive flow resistivity.`,
		);
	}
	return n as FlowResistivity;
}

/**
 * Constructs a SurfaceResistance from a number (rayls/m²).
 * @param n The number to convert.
 * @returns The branded SurfaceResistance.
 * @throws RangeError if n is not a non-negative number.
 */
export function asSurfaceResistance(n: number): SurfaceResistance {
	if (!Number.isFinite(n) || n < 0) {
		throw new RangeError(
			`Value ${n} must be a finite, non-negative number.`,
		);
	}
	return n as SurfaceResistance;
}
