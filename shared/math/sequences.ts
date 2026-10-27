import { isPrimitiveRoot, modPow } from "@math/number-theory";
import type { Prime } from "@units/units";

/**
 * Generates a Quadratic Residue Diffuser (QRD) sequence for a given prime p.
 * The sequence is defined as S(i) = i^2 mod p for i from 0 to p-1.
 *
 * `p` is a branded {@link Prime}: `asPrime` validated primality at
 * construction (see `shared/math/helpers.ts`), so this function does not
 * re-check it; invalid inputs cannot reach it.
 *
 * @param p - A prime number.
 * @returns An array of integers representing the QRD sequence.
 */
export function generateQRDSequence(p: Prime): number[] {
	const sequence = new Array(p);
	for (let i = 0; i < p; i++) {
		sequence[i] = (i * i) % p;
	}
	return sequence;
}

/**
 * Generates a Primitive Root Diffuser (PRD) sequence for a given prime p and
 * primitive root g. The sequence is defined as S(i) = g^i mod p for i from 0 to
 * p-1.
 *
 * `p` is a branded {@link Prime} (validated by `asPrime` at construction, see
 * {@link generateQRDSequence}). `g` is an unbranded value, so its contract is
 * enforced at this entry point instead.
 *
 * @param p - A prime number.
 * @param g - A primitive root modulo p.
 * @returns An array of integers representing the PRD sequence.
 * @throws RangeError if g is not a primitive root modulo p.
 */
export function generatePRDSequence(p: Prime, g: number): number[] {
	// `g` is the only unbranded parameter here, so it is validated here.
	if (!isPrimitiveRoot(p, g)) {
		throw new RangeError(`g must be a primitive root modulo ${p}`);
	}

	// Generate sequence S(i) = g^i mod p for i from 0 to p-1
	const sequence: number[] = [];

	for (let i = 0; i < p; i++) {
		sequence.push(modPow(g, i, p));
	}

	return sequence;
}
