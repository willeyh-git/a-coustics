import { isPrime, modPow } from "@math/number-theory";
import type { Prime } from "@units/units";

/**
 * Generates a Quadratic Residue Diffuser (QRD) sequence for a given prime p.
 * The sequence is defined as S(i) = i^2 mod p for i from 0 to p-1.
 *
 * @param p - A prime number.
 * @returns An array of integers representing the QRD sequence.
 * @throws Error if p is not prime.
 */
export function generateQRDSequence(p: Prime): number[] {
	if (!isPrime(p)) {
		throw new Error("p must be a prime number");
	}

	const sequence = new Array(p);
	for (let i = 0; i < p; i++) {
		sequence[i] = (i * i) % p;
	}
	return sequence;
}

/**
 * Generates a Primitive Root Diffuser (PRD) sequence for a given prime p and primitive root g.
 * The sequence is defined as S(i) = g^i mod p for i from 0 to p-1.
 *
 * @param p - A prime number.
 * @param g - A primitive root modulo p.
 * @returns An array of integers representing the PRD sequence.
 */
export function generatePRDSequence(p: Prime, g: number): number[] {
	if (!isPrime(p)) {
		throw new Error("p must be a prime number");
	}

	// Generate sequence S(i) = g^i mod p for i from 0 to p-1
	const sequence: number[] = [];

	for (let i = 0; i < p; i++) {
		sequence.push(modPow(g, i, p));
	}

	return sequence;
}
