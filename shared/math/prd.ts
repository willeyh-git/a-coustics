/**
 * Primitive-Root Diffuser (PRD) math.
 *
 * A PRD is an acoustic diffuser that uses primitive-root number theory to create
 * a quasi-random scattering pattern.
 *
 * Formula: Depth = (g^k) mod p
 * Where:
 * - p is a prime number (the panel order).
 * - g is a primitive root of p.
 * - k is the well position (0 to p-2 or 1 to p-1).
 *
 * @param p - The prime panel order.
 * @returns An array of well depths.
 */
import { isPrime } from "#shared/utils/math-helpers";

/**
 * Finds the smallest primitive root for a prime p.
 *
 * @param p - The prime number.
 * @returns The smallest primitive root.
 */
export function findPrimitiveRoot(p: number): number {
	if (p <= 1) throw new Error("p must be greater than 1");
	if (p === 2) return 1;

	const phi = p - 1;
	const primeFactors: number[] = [];
	let n = phi;

	for (let i = 2; i * i <= n; i++) {
		if (n % i === 0) {
			primeFactors.push(i);
			while (n % i === 0) n /= i;
		}
	}
	if (n > 1) primeFactors.push(n);

	for (let g = 2; g < p; g++) {
		let ok = true;
		for (const factor of primeFactors) {
			if (powerMod(g, phi / factor, p) === 1) {
				ok = false;
				break;
			}
		}
		if (ok) return g;
	}
	return -1;
}

/**
 * Modular exponentiation to calculate (base^exp) % mod.
 */
function powerMod(base: number, exp: number, mod: number): number {
	let res = 1;
	base = base % mod;
	while (exp > 0) {
		if (exp % 2 === 1) res = (res * base) % mod;
		base = (base * base) % mod;
		exp = Math.floor(exp / 2);
	}
	return res;
}

/**
 * Calculates PRD well depths for a given prime order p.
 *
 * @param p - The prime panel order.
 * @returns An array of well depths.
 */
export function calculatePRDDepths(p: number): number[] {
	if (!isPrime(p)) throw new Error("p must be a prime number.");

	const g = findPrimitiveRoot(p);
	if (g === -1) throw new Error("No primitive root found.");

	const depths: number[] = [];
	for (let k = 0; k < p - 1; k++) {
		depths.push(powerMod(g, k, p));
	}
	return depths;
}

/**
 * Calculates PRD well depths for a given order, ensuring the order is prime.
 * If n is not prime, it finds the next prime number.
 *
 * @param n - The desired panel order.
 * @returns An object containing the depths and the final prime order.
 */
export function getPRDDepths(n: number) {
	let order = n;
	while (!isPrime(order)) {
		order++;
	}

	const depths = calculatePRDDepths(order);
	return { depths, order };
}
