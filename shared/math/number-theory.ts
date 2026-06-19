/**
 * Checks if a number is prime.
 * @param n The number to check.
 * @returns True if prime, false otherwise.
 */
export function isPrime(n: number): boolean {
	if (n <= 1) return false;
	if (n <= 3) return true;
	if (n % 2 === 0 || n % 3 === 0) return false;

	for (let i = 5; i * i <= n; i += 6) {
		if (n % i === 0 || n % (i + 2) === 0) return false;
	}
	return true;
}

/**
 * Greatest Common Divisor of two numbers.
 */
export function gcd(a: number, b: number): number {
	while (b !== 0) {
		a %= b;
		[a, b] = [b, a];
	}
	return a;
}

/**
 * Checks if two numbers are coprime.
 */
export function isCoprime(a: number, b: number): boolean {
	return gcd(a, b) === 1;
}

/**
 * Modular exponentiation.
 * @param base The base.
 * @param exp The exponent.
 * @param mod The modulus.
 * @returns (base^exp) % mod.
 */
export function modPow(base: number, exp: number, mod: number): number {
	let res = 1;
	base = base % mod;
	while (exp > 0) {
		if (exp % 2 === 1) {
			res = (res * base) % mod;
		}
		base = (base * base) % mod;
		exp = Math.floor(exp / 2);
	}
	return res;
}

/**
 * Returns the set of quadratic residues modulo p.
 * Quadratic residues are numbers y such that there exists some x where x^2 ≡ y (mod p).
 *
 * @param p A prime number.
 * @returns An array of unique quadratic residues modulo p.
 * @throws Error if p is not prime.
 */
export function getQuadraticResidues(p: number): number[] {
	const residues = new Set<number>();
	for (let i = 0; i < p; i++) {
		residues.add((i * i) % p);
	}

	return Array.from(residues).sort((a, b) => a - b);
}
