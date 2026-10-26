import { asPrime } from "@math/helpers";
import type { PositiveInteger, Prime } from "@units/units";

/**
 * Returns the prime factorization of a given integer.
 * @param n The number to factorize.
 * @returns An array of prime factors in ascending order.
 */
export function getPrimeFactors(n: PositiveInteger): Prime[] {
	if (!Number.isSafeInteger(n) || n < 1) {
		throw new RangeError("n must be a finite positive integer");
	}

	const factors: Prime[] = [];
	let d = 2;
	let temp: number = n;

	// Handle cases for numbers less than 2
	if (temp < 2) {
		return factors;
	}

	// Trial division
	while (d * d <= temp) {
		while (temp % d === 0) {
			factors.push(asPrime(d));
			temp /= d;
		}
		d++;
	}

	if (temp > 1) {
		factors.push(asPrime(temp));
	}

	return factors;
}
