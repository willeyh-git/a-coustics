import type { Modulus, PositiveInteger } from "../../types/units";
import { extendedGcd } from "../extended-gcd";

/**
 * Computes the modular multiplicative inverse of a modulo m.
 * The modular inverse is an integer x such that (a * x) % m = 1.
 * This exists if and only if a and m are coprime (i.e., gcd(a, m) = 1).
 *
 * @param a The number to find the inverse for.
 * @param m The modulus.
 * @returns The modular inverse of a modulo m.
 * @throws RangeError if a or m is not a positive integer, if a is 0, or if gcd(a, m) ≠ 1.
 */
export function modInverse(a: PositiveInteger, m: Modulus): number {
	// Domain validation
	if (!Number.isFinite(a) || !Number.isFinite(m)) {
		throw new RangeError("Arguments must be finite numbers");
	}

	if (!Number.isInteger(a) || !Number.isInteger(m)) {
		throw new RangeError("Arguments must be integers");
	}

	if (m <= 0) {
		throw new RangeError("Modulus must be positive");
	}

	if (a < 0) {
		throw new RangeError("a must be non-negative");
	}

	if (a === 0) {
		throw new RangeError("a cannot be zero");
	}

	const { gcd, x } = extendedGcd(a, m);

	if (gcd !== 1) {
		throw new Error("Modular inverse does not exist (gcd(a, m) !== 1)");
	}

	// x can be negative, so we normalize it to be positive
	return ((x % m) + m) % m;
}
