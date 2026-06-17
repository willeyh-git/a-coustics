/**
 * Quadratic Residue Diffuser (QRD) math.
 *
 * A QRD is an acoustic treatment that scatters incident sound energy in many directions
 * using a series of wells of different depths.
 *
 * Formula: Depth = (well position)² mod N
 * Where:
 * - N is the panel order (must be a prime number).
 * - well position ranges from 0 to N-1.
 *
 * @param n - The panel order (must be prime).
 * @returns An array of well depths.
 */
import { isPrime } from "#shared/utils/math-helpers";

export function calculateQRDDepths(n: number): number[] {
	if (n <= 0) throw new Error("Panel order N must be positive.");

	const depths: number[] = [];
	for (let i = 0; i < n; i++) {
		depths.push((i * i) % n);
	}
	return depths;
}

/**
 * Calculates well depths for a given panel order, ensuring the order is prime.
 * If n is not prime, it finds the next prime number.
 *
 * @param n - The desired panel order.
 * @returns An object containing the depths and the final prime order.
 */
export function getQRDDepths(n: number) {
	let order = n;
	while (!isPrime(order)) {
		order++;
	}

	const depths = calculateQRDDepths(order);
	return { depths, order };
}
