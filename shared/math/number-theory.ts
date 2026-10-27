import { getPrimeFactors } from "@math/factors";
import { asPositiveInteger } from "@math/helpers";
import type { PositiveIntegerLike, Prime } from "@units/units";

/**
 * Checks if a number is prime.
 * @param n The number to check.
 * @returns True if prime, false otherwise.
 */
export function isPrime(n: number): boolean {
	if (!Number.isSafeInteger(n) || n < 2) return false;
	if (n <= 3) return true;
	if (n % 2 === 0 || n % 3 === 0) return false;

	for (let i = 5; i <= n / i; i += 6) {
		if (n % i === 0 || n % (i + 2) === 0) return false;
	}
	return true;
}

/**
 * Greatest Common Divisor of two positive integers.
 *
 * @param a A positive integer.
 * @param b A positive integer.
 * @returns The greatest common divisor of a and b.
 * @throws RangeError if a or b is negative.
 */
export function gcd(a: PositiveIntegerLike, b: PositiveIntegerLike): number {
	if (a < 0 || b < 0) {
		throw new RangeError("Arguments must be non-negative");
	}
	// Arithmetic strips the brand, so work over plain numbers internally and
	// return a plain number (the return type is unbranded).
	let x: number = a;
	let y: number = b;
	while (y !== 0) {
		x %= y;
		[x, y] = [y, x];
	}
	return x;
}

/**
 * Checks if two positive integers are coprime.
 */
export function isCoprime(
	a: PositiveIntegerLike,
	b: PositiveIntegerLike,
): boolean {
	return gcd(a, b) === 1;
}

/**
 * Returns the mathematical modulo of n by m.
 * Unlike the JavaScript % operator, which is a remainder operator,
 * this function returns a non-negative result.
 *
 * @param n The number to be modulated.
 * @param m A positive integer acting as the modulus.
 * @returns The non-negative remainder of n / m.
 */
export function mod(n: number, m: PositiveIntegerLike): number {
	return ((n % m) + m) % m;
}

/**
 * Modular exponentiation.
 *
 * `base` and `exp` are unbranded values, so their contracts are enforced here.
 * `modulus` is a branded {@link PositiveIntegerLike}, validated at
 * construction (`asModulus`/`assertModulus`), so it is not re-checked
 * (branded-value contract).
 *
 * @param base The base (an integer; negative bases are reduced first).
 * @param exp The exponent (a non-negative safe integer).
 * @param modulus A positive integer modulus.
 * @returns (base^exp) % modulus.
 * @throws RangeError if base is not an integer or exp is not a
 * non-negative safe integer.
 */
export function modPow(
	base: number,
	exp: number,
	modulus: PositiveIntegerLike,
): number {
	// Large but exactly representable integer bases are accepted: `mod` reduces
	// the base into [0, modulus) before any multiplication can lose precision.
	if (!Number.isInteger(base)) {
		throw new RangeError("base must be an integer");
	}
	if (!Number.isSafeInteger(exp) || exp < 0) {
		throw new RangeError("exp must be a non-negative integer");
	}
	let res = 1;
	base = mod(base, modulus);
	while (exp > 0) {
		if (exp % 2 === 1) {
			res = mod(res * base, modulus);
		}
		base = mod(base * base, modulus);
		exp = Math.floor(exp / 2);
	}
	return res;
}

/**
 * Returns the set of quadratic residues modulo p.
 * Quadratic residues are numbers y such that there exists some x where
 * x^2 ≡ y (mod p).
 *
 * `p` is a branded {@link Prime} validated by `asPrime` at construction, so
 * primality is not re-checked here (branded-value contract).
 *
 * @param p A prime number.
 * @returns An array of unique quadratic residues modulo p.
 */
export function getQuadraticResidues(p: Prime): number[] {
	const residues = new Set<number>();
	for (let i = 0; i < p; i++) {
		residues.add(mod(i * i, p));
	}

	return Array.from(residues).sort((a, b) => a - b);
}

/**
 * Unique prime factors of `p - 1` for a prime `p`.
 *
 * `p - 1` is a plain `number` once arithmetic strips the `Prime` brand, so the
 * assertion exists only to brand it for {@link getPrimeFactors}; `p ≥ 2` makes
 * `p - 1` positive, hence the assertion cannot fail here.
 */
function uniquePrimeFactorsBelow(p: Prime): Prime[] {
	return Array.from(new Set(getPrimeFactors(asPositiveInteger(p - 1))));
}

/**
 * Whether an already-reduced residue generates the full multiplicative group
 * modulo `p`: `g` is a primitive root iff `g^((p-1)/q) ≢ 1 (mod p)` for every
 * prime factor `q` of `p - 1`.
 *
 * `factorsOfPhi` is a parameter because `findPrimitiveRoot` tests many
 * candidate bases against the same `p`; recomputing the factorization per
 * candidate would repeat the same work `p` times.
 */
function hasFullMultiplicativeOrder(
	r: number,
	p: Prime,
	factorsOfPhi: Prime[],
): boolean {
	if (r === 0) {
		return false;
	}
	const phi = p - 1;

	return factorsOfPhi.every((q) => modPow(r, phi / q, p) !== 1);
}

/**
 * Checks whether g is a primitive root modulo p.
 * g is a primitive root modulo p iff its multiplicative order modulo p is p - 1,
 * i.e. g^((p-1)/q) ≢ 1 (mod p) for every prime factor q of p - 1.
 *
 * `p` is a branded {@link Prime}, so primality is enforced at construction and
 * not re-checked; `g` is an unbranded value and is rejected (rather than
 * thrown for) when it is not an integer, keeping this a total predicate.
 *
 * @param p A prime number.
 * @param g The candidate base.
 * @returns True if g is a primitive root modulo p, false otherwise.
 */
export function isPrimitiveRoot(p: Prime, g: number): boolean {
	if (!Number.isInteger(g)) {
		return false;
	}

	return hasFullMultiplicativeOrder(mod(g, p), p, uniquePrimeFactorsBelow(p));
}

/**
 * Finds the smallest primitive root modulo p.
 * A primitive root modulo p is a number g such that every number coprime to p
 * is congruent to a power of g modulo p.
 *
 * `p` is a branded {@link Prime}, so primality is enforced at construction and
 * not re-checked (branded-value contract). Every prime has a primitive root,
 * so the loop below always returns; the throw at the end guards an
 * impossible state.
 *
 * @param p A prime number.
 * @returns The smallest primitive root modulo p.
 */
export function findPrimitiveRoot(p: Prime): number {
	const factorsOfPhi = uniquePrimeFactorsBelow(p);
	for (let g = 1; g < p; g++) {
		if (hasFullMultiplicativeOrder(mod(g, p), p, factorsOfPhi)) {
			return g;
		}
	}
	throw new Error(
		`Invariant violation: primitive root not found for prime ${p}`,
	);
}
