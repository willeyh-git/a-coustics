/**
 * Abfusor math.
 *
 * An Abfusor is a hybrid panel that combines the properties of an absorber 
 * and a diffuser by using a series of slats.
 *
 * @param width - Total width of the panel.
 * @param height - Total height of the panel.
 * @param depth - Total depth of the panel.
 * @param numSlats - Number of slats.
 * @param slatWidth - Width of each slat.
 * @param slatSpacing - Spacing between slats.
 * @param slatDepthVariation - Variation in depth across slats.
 * @param absorberDepth - Depth of the absorption material.
 * @returns An object containing geometry calculations.
 */
import { isPrime } from "#shared/utils/math-helpers";

const SPEED_OF_SOUND = 343; // m/s

/**
 * Calculates the geometry and open area for an Abfusor.
 *
 * @param width - Total width of the panel.
 * @param height - Total height of the panel.
 * @param depth - Total depth of the panel.
 * @param numSlats - Number of slats.
 * @param slatWidth - Width of each slat.
 * @param slatSpacing - Spacing between slats.
 * @param slatDepthVariation - Variation in depth across slats.
 * @param absorberDepth - Depth of the absorption material.
 * @returns An object containing geometry calculations.
 */
export function calculateAbfusorGeometry(
	width: number,
	height: number,
	depth: number,
	numSlats: number,
	slatWidth: number,
	slatSpacing: number,
	slatDepthVariation: number,
	absorberDepth: number
): {
	openAreaPercentage: number;
	slatPositions: number[];
} {
	// Calculate open area percentage
	// Total width of slats = numSlats * slatWidth
	// Total width of gaps = (numSlats - 1) * slatSpacing
	
	const totalGapWidth = (numSlats - 1) * slatSpacing;
	const totalSlatGapWidth = numSlats * slatWidth + (numSlats - 1) * slatSpacing;
	
	// If totalSlatGapWidth is less than width, we assume the remainder is also gap or margin.
	// For this calculation, we'll use the proportion of gap to total slat/gap width.
	const openAreaPercentage = (totalGapWidth / totalSlatGapWidth) * 100;

	// Slat positions (centers)
	const slatPositions: number[] = [];
	let currentX = slatWidth / 2;
	for (let i = 0; i < numSlats; i++) {
		slatPositions.push(currentX);
		currentX += slatWidth + slatSpacing;
	}

	return {
		openAreaPercentage,
		slatPositions,
	};
}

/**
 * Calculates geometry for an Abfusor, ensuring consistency with user inputs.
 *
 * @param width - Total width of the panel.
 * @param height - Total height of the panel.
 * @param depth - Total depth of the panel.
 * @param numSlats - Number of slats.
 * @param slatWidth - Width of each slat.
 * @param slatSpacing - Spacing between slats.
 * @param slatDepthVariation - Variation in depth across slats.
 * @param absorberDepth - Depth of the absorption material.
 * @returns An object containing geometry calculations.
 */
export function getAbfusorGeometry(
	width: number,
	height: number,
	depth: number,
	numSlats: number,
	slatWidth: number,
	slatSpacing: number,
	slatDepthVariation: number,
	absorberDepth: number
) {
	const geometry = calculateAbfusorGeometry(
		width,
		height,
		depth,
		numSlats,
		slatWidth,
		slatSpacing,
		slatDepthVariation,
		absorberDepth
	);
	return {
		...geometry,
		width,
		height,
		depth,
		numSlats,
		slatWidth,
		slatSpacing,
		slatDepthVariation,
		absorberDepth,
	};
}

/**
 * Calculates acoustic properties for an Abfusor.
 * 
 * @param width - Total width of the panel.
 * @param height - Total height of the panel.
 * @param depth - Total depth of the panel.
 * @param numSlats - Number of slats.
 * @param slatWidth - Width of each slat.
 * @param slatSpacing - Spacing between slats.
 * @param slatDepthVariation - Variation in depth across slats.
 * @param absorberDepth - Depth of the absorption material.
 * @returns An object containing acoustic calculations.
 */
export function calculateAbfusorAcoustics(
	width: number,
	height: number,
	depth: number,
	numSlats: number,
	slatWidth: number,
	slatSpacing: number,
	slatDepthVariation: number,
	absorberDepth: number
): {
	openAreaPercentage: number;
	estimatedScattering: number; // 0-100
	estimatedAbsorption: number; // 0-100
} {
	const { openAreaPercentage } = calculateAbfusorGeometry(
		width,
		height,
		depth,
		numSlats,
		slatWidth,
		slatSpacing,
		slatDepthVariation,
		absorberDepth
	);

	// Scattering estimate: based on slat depth variation and spacing
	// More variation and smaller spacing = higher scattering
	const scattering = Math.min(100, (slatDepthVariation / depth) * 100 + (slatSpacing / slatWidth) * 20);

	// Absorption estimate: based on absorber depth and open area
	// More depth and less open area (more material) = higher absorption
	const absorption = Math.min(100, (absorberDepth / depth) * 100 + (100 - openAreaPercentage) * 0.5);

	return {
		openAreaPercentage,
		estimatedScattering: scattering,
		estimatedAbsorption: absorption,
	};
}

/**
 * Calculates both geometry and acoustics for an Abfusor.
 *
 * @param width - Total width of the panel.
 * @param height - Total height of the panel.
 * @param depth - Total depth of the panel.
 * @param numSlats - Number of slats.
 * @param slatWidth - Width of each slat.
 * @param slatSpacing - Spacing between slats.
 * @param slatDepthVariation - Variation in depth across slats.
 * @param absorberDepth - Depth of the absorption material.
 * @returns An object containing all calculations.
 */
export function getAbfusorCalculations(
	width: number,
	height: number,
	depth: number,
	numSlats: number,
	slatWidth: number,
	slatSpacing: number,
	slatDepthVariation: number,
	absorberDepth: number
) {
	const geometry = getAbfusorGeometry(
		width,
		height,
		depth,
		numSlats,
		slatWidth,
		slatSpacing,
		slatDepthVariation,
		absorberDepth
	);
	const acoustics = calculateAbfusorAcoustics(
		width,
		height,
		depth,
		numSlats,
		slatWidth,
		slatSpacing,
		slatDepthVariation,
		absorberDepth
	);

	return {
		...acoustics,
		...geometry,
		width,
		height,
		depth,
		numSlats,
		slatWidth,
		slatSpacing,
		slatDepthVariation,
		absorberDepth,
	};
}
