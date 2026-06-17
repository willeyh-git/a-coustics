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

const SPEED_OF_SOUND = 343; // m/s

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

/**
 * Calculates acoustic properties for a Skyline Diffuser.
 * 
 * @param width - Total width of the panel.
 * @param height - Total height of the panel.
 * @param depth - Maximum depth of the cells.
 * @param rows - Number of rows.
 * @param cols - Number of columns.
 * @returns An object containing acoustic calculations.
 */
export function calculateSkylineAcoustics(
	width: number,
	height: number,
	depth: number,
	rows: number,
	cols: number
): {
	designFrequency: number;
	minFrequency: number;
	maxFrequency: number;
	effectiveBandwidth: number;
} {
	const cellWidth = width / cols;
	const cellHeight = height / rows;

	// For Skyline, the depth is often distributed across rows.
	// We use the average cell dimension to estimate the design frequency.
	const avgCellDim = (cellWidth + cellHeight) / 2;
	
	// Design wavelength λd = avgCellDim * (1 + depth / avgCellDim)
	const wavelengthD = avgCellDim * (1 + depth / avgCellDim);
	const designFrequency = SPEED_OF_SOUND / wavelengthD;

	// Min/Max frequencies
	const minWavelength = avgCellDim * (1 + 0 / avgCellDim);
	const maxWavelength = avgCellDim * (1 + depth / avgCellDim);
	
	const minFrequency = SPEED_OF_SOUND / maxWavelength;
	const maxFrequency = SPEED_OF_SOUND / minWavelength;

	// Effective bandwidth
	const effectiveBandwidth = designFrequency * 0.2;

	return {
		designFrequency,
		minFrequency,
		maxFrequency,
		effectiveBandwidth,
	};
}

/**
 * Calculates both geometry and acoustics for a Skyline Diffuser.
 *
 * @param width - Total width of the panel.
 * @param height - Total height of the panel.
 * @param depth - Maximum depth of the cells.
 * @param rows - Number of rows.
 * @param cols - Number of columns.
 * @returns An object containing all calculations.
 */
export function getSkylineCalculations(
	width: number,
	height: number,
	depth: number,
	rows: number,
	cols: number
) {
	const order = rows * cols;
	const depths = getSkylineDepths(order).depths;
	
	const acoustics = calculateSkylineAcoustics(width, height, depth, rows, cols);

	return {
		...acoustics,
		depths,
		order,
		width,
		height,
		depth,
		rows,
		cols,
	};
}
