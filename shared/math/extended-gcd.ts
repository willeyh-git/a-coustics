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
 * @param a The first number.
 * @param b The second number.
 * @returns An object containing the gcd and the Bézout coefficients.
 */
export function extendedGcd(a: number, b: number): ExtendedGcdResult {
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
