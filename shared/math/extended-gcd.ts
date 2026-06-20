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
 * @param a A non-negative integer.
 * @param b A non-negative integer.
 * @returns An object containing the gcd and the Bézout coefficients.
 * @throws RangeError if a or b is negative.
 */
export function extendedGcd(a: number, b: number): ExtendedGcdResult {
	if (a < 0 || b < 0) {
		throw new RangeError("Arguments must be non-negative");
	}

	if (b === 0) {
		return {
			gcd: a,
			x: 1,
			y: 0,
		};
	}

	const result = extendedGcd(b, a % b);
	const x = result.y;
	const y = result.x - Math.floor(a / b) * result.y;

	return {
		gcd: result.gcd,
		x: x,
		y: y,
	};
}
