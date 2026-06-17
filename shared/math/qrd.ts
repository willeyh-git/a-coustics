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

const SPEED_OF_SOUND = 343; // m/s

/**
 * Calculates well depths for a given panel order.
 *
 * @param n - The panel order (must be positive).
 * @returns An array of well depths.
 */
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

/**
 * Calculates acoustic properties for a QRD.
 * 
 * @param width - Total width of the panel.
 * @param height - Total height of the panel.
 * @param depth - Maximum depth of the wells.
 * @param wells - Number of wells.
 * @returns An object containing acoustic calculations.
 */
export function calculateQRDAcoustics(
	width: number,
	height: number,
	depth: number,
	wells: number
): {
	designFrequency: number;
	minFrequency: number;
	maxFrequency: number;
	effectiveBandwidth: number;
} {
	const wellWidth = width / wells;
	
	// Design wavelength λd = wellWidth * (1 + wellDepth / wellWidth)
	// For a QRD, the design frequency is typically based on the average well depth
	// or a specific targeted depth.
	const avgDepth = depth / 2; // Simplified average depth
	const wavelengthD = wellWidth * (1 + avgDepth / wellWidth);
	const designFrequency = SPEED_OF_SOUND / wavelengthD;

	// Min/Max frequencies based on the range of depths (0 to depth)
	const minWavelength = wellWidth * (1 + 0 / wellWidth);
	const maxWavelength = wellWidth * (1 + depth / wellWidth);
	
	const minFrequency = SPEED_OF_SOUND / maxWavelength;
	const maxFrequency = SPEED_OF_SOUND / minWavelength;

	// Effective bandwidth (heuristic: 20% of design frequency)
	const effectiveBandwidth = designFrequency * 0.2;

	return {
		designFrequency,
		minFrequency,
		maxFrequency,
		effectiveBandwidth,
	};
}

/**
 * Calculates both geometry and acoustics for a QRD.
 *
 * @param width - Total width of the panel.
 * @param height - Total height of the panel.
 * @param depth - Maximum depth of the wells.
 * @param wells - Number of wells.
 * @returns An object containing all calculations.
 */
export function getQRDCalculations(
	width: number,
	height: number,
	depth: number,
	wells: number
) {
	const order = wells; // Assuming wells = order for simplicity in this basic implementation
	const depths = calculateQRDDepths(order);
	
	const acoustics = calculateQRDAcoustics(width, height, depth, wells);

	return {
		...acoustics,
		depths,
		order,
		width,
		height,
		depth,
		wells,
	};
}
