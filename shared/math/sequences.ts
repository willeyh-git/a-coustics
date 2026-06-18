import { isPrime } from './number-theory';

/**
 * Generates a Quadratic Residue Diffuser (QRD) sequence for a given prime p.
 * The sequence is defined as S(i) = i^2 mod p for i from 0 to p-1.
 * 
 * @param p - A prime number.
 * @returns An array of integers representing the QRD sequence.
 * @throws Error if p is not prime.
 */
export function generateQRDSequence(p: number): number[] {
  if (!isPrime(p)) {
    throw new Error('p must be a prime number');
  }

  const sequence = new Array(p);
  for (let i = 0; i < p; i++) {
    sequence[i] = (i * i) % p;
  }
  return sequence;
}
