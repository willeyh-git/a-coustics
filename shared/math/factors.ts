import { asPrime } from "@math/helpers";
import type { PositiveInteger, Prime } from "@units/units";

/**
 * Returns the prime factorization of a given integer.
 *
 * `n` is a branded {@link PositiveInteger}: `asPositiveInteger`/
 * `assertPositiveInteger` validate it at construction (a finite, exactly
 * representable integer ≥ 1), so this function does not re-check the
 * parameter (branded-value contract).
 * @param n The number to factorize.
 * @returns An array of prime factors in ascending order.
 */
export function getPrimeFactors(n: PositiveInteger): Prime[] {
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
