import type { PositiveIntegerLike } from "@units/units";
import { extendedGcd } from "@math/extended-gcd";
import { mod } from "@math/number-theory";

/**
 * Computes the modular multiplicative inverse of a modulo m.
 * The modular inverse is an integer x such that (a * x) % m = 1.
 * This exists if and only if a and m are coprime (i.e., gcd(a, m) = 1).
 *
 * @param a A positive integer (any positive brand).
 * @param m A positive integer modulus (any positive brand: `Prime`/`Modulus`
 * for prime-field congruence classes, `PositiveInteger` for a composite
 * modulus such as a ring `Z/mZ`).
 * @returns The modular inverse of a modulo m, in `[0, m)`.
 * @throws RangeError if a or m is not a positive integer, if a is 0, or if gcd(a, m) ≠ 1.
 */
export function modInverse(
	a: PositiveIntegerLike,
	m: PositiveIntegerLike,
): number {
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
		// Non-co-prime inputs are out of the function's domain, the same kind of
		// impossible state as the checks above, hence a `RangeError` (which is
		// also what this function's `@throws` documents).
		throw new RangeError(
			`Modular inverse does not exist (gcd(${a}, ${m}) = ${gcd} ≠ 1)`,
		);
	}

	// Reuse the shared non-negative remainder so the Bézout coefficient is
	// normalized by the same rule every other congruence helper uses.
	return mod(x, m);
}
