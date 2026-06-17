/**
 * Skyline Diffuser math.
 * 
 * A Skyline diffuser is a 2D quadratic diffuser that relies on the 
 * Schroeder quadratic-residue sequence to set well depths.
 * 
 * Formula: Depth = (well position)² mod N
 * Where:
 * - N is a prime number (the panel order).
 * - well position ranges from 0 to N-1.
 * 
 * Note: Unlike a standard QRD which is often symmetrical, a Skyline 
 * design can be aperiodic or follow specific sequences to target 
 * different frequencies.
 * 
 * @param n - The prime panel order.
 * @returns An array of well depths.
 */
import { isPrime } from '#shared/utils/math-helpers';

/**
 * Calculates well depths for a given panel order, ensuring the order is prime.
 * If n is not prime, it finds the next prime number.
 * 
 * @param n - The desired panel order.
 * @returns An object containing the depths and the final prime order.
 */
export function getSkylineDepths(n: number) {
  let order = n;
  while (!isPrime(order)) {
    order++;
  }
  
  const depths: number[] = [];
  for (let i = 0; i < order; i++) {
    depths.push((i * i) % order);
  }
  
  return { depths, order };
}

/**
 * Calculates well depths for a given prime order.
 * 
 * @param p - The prime panel order.
 * @returns An array of well depths.
 */
export function calculateSkylineDepths(p: number): number[] {
  if (!isPrime(p)) throw new Error('p must be a prime number.');
  
  const depths: number[] = [];
  for (let i = 0; i < p; i++) {
    depths.push((i * i) % p);
  }
  return depths;
}
