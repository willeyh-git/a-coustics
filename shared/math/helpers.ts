import { isPrime } from "./number-theory";

/**
 * Asserts that the given value is an integer.
 * @param n The value to check.
 * @throws RangeError if n is not an integer.
 */
export function assertInteger(n: number): void {
	if (!Number.isInteger(n)) {
		throw new RangeError(`Value ${n} must be an integer.`);
	}
}

/**
 * Asserts that the given value is a non-negative integer.
 * @param n The value to check.
 * @throws RangeError if n is not a non-negative integer.
 */
export function assertNonNegativeInteger(n: number): void {
	if (!Number.isInteger(n) || n < 0) {
		throw new RangeError(`Value ${n} must be a non-negative integer.`);
	}
}

/**
 * Asserts that the given value is a positive integer.
 * @param n The value to check.
 * @throws RangeError if n is not a positive integer.
 */
export function assertPositiveInteger(n: number): void {
	if (!Number.isInteger(n) || n <= 0) {
		throw new RangeError(`Value ${n} must be a positive integer.`);
	}
}

/**
 * Asserts that the given value is a prime number.
 * @param n The value to check.
 * @throws RangeError if n is not a prime number.
 */
export function assertPrime(n: number): void {
	if (!Number.isInteger(n) || !isPrime(n)) {
		throw new RangeError(`Value ${n} must be a prime number.`);
	}
}
