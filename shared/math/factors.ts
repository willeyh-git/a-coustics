/**
 * Returns the prime factorization of a given integer.
 * @param n The number to factorize.
 * @returns An array of prime factors in ascending order.
 */
export function getPrimeFactors(n: number): number[] {
	if (n < 1) {
		throw new RangeError("n must be a positive integer");
	}

	const factors: number[] = [];
	let d = 2;
	let temp = n;

	// Handle cases for numbers less than 2
	if (temp < 2) {
		return factors;
	}

	// Trial division
	while (d * d <= temp) {
		while (temp % d === 0) {
			factors.push(d);
			temp /= d;
		}
		d++;
	}

	if (temp > 1) {
		factors.push(temp);
	}

	return factors;
}
