import type { PositiveIntegerLike } from "@units/units";

/**
 * Result of the Extended Euclidean Algorithm.
 * Contains the greatest common divisor (gcd) and the Bézout coefficients (x, y)
 * such that ax + by = gcd(a, b).
 */
export interface ExtendedGcdResult {
	gcd: number;
	x: number;
	y: number;
}

/**
 * Computes the Extended Euclidean Algorithm.
 * Returns the greatest common divisor (gcd) of two numbers a and b,
 * along with the coefficients x and y such that ax + by = gcd(a, b).
 *
 * @param a A positive integer (any positive brand).
 * @param b A positive integer (any positive brand).
 * @returns An object containing the gcd and the Bézout coefficients.
 * @throws RangeError if a or b is negative.
 */
export function extendedGcd(
	a: PositiveIntegerLike,
	b: PositiveIntegerLike,
): ExtendedGcdResult {
	if (a < 0 || b < 0) {
		throw new RangeError("Arguments must be non-negative");
	}

	// Arithmetic strips the brand, and the loop drives the remainder down to 0,
	// so every state variable here is an unbranded `number` (the returned `gcd`
	// is unbranded too, see `ExtendedGcdResult`).
	let oldR: number = a;
	let r: number = b;
	let oldX: number = 1;
	let x: number = 0;
	let oldY: number = 0;
	let y: number = 1;

	while (r !== 0) {
		const quotient = Math.floor(oldR / r);
		[oldR, r] = [r, oldR - quotient * r];
		[oldX, x] = [x, oldX - quotient * x];
		[oldY, y] = [y, oldY - quotient * y];
	}

	return {
		gcd: oldR,
		x: oldX,
		y: oldY,
	};
}
