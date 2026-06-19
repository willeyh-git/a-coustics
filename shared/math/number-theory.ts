/**
 * Checks if a number is prime.
 * @param n The number to check.
 * @returns True if prime, false otherwise.
 * @throws Error if n is less than 2.
 */
export function isPrime(n: number): boolean {
	if (n < 2) {
		throw new Error("Number must be at least 2");
	}
	for (let i = 2; i <= Math.sqrt(n); i++) {
		if (n % i === 0) {
			return false;
		}
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
