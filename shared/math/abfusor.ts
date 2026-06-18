/**
 * Configuration object for Abfusor calculations.
 *
 * @category Types
 */
export interface AbfusorConfig {
	/** Total width of the panel (mm). Must be > 0 and >= occupied slat width. */
	width: number;
	/** Total height of the panel (mm). Reserved for future expansion. */
	height: number;
	/** Total depth of the panel (mm). Must be > 0. */
	depth: number;
	/** Number of slats (must be >= 1). */
	numSlats: number;
	/** Width of each slat in mm (must be > 0). */
	slatWidth: number;
	/** Spacing between slats in mm (>= 0). */
	slatSpacing: number;
	/** Depth variation across slats in mm. Must be >= 0 and <= depth. */
	slatDepthVariation: number;
	/** Depth of absorption backing in mm. Must be >= 0 and <= depth. */
	absorberDepth: number;
}

import type { AbfusorGeometry, AbfusorAcoustics } from "#shared/types/acoustics";

/**
 * Rounds a number to 2 decimal places.
 */
const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Validates an Abfusor configuration and throws if invalid.
 *
 * @param config - Configuration to validate.
 * @throws Error if any constraint is violated.
 */
function validateConfig(config: AbfusorConfig): void {
	// Check all values are finite numbers first
	for (const [key, value] of Object.entries(config)) {
		if (!Number.isFinite(value)) {
			throw new Error(
				`Configuration value "${key}" must be a finite number, got ${value}`
			);
		}
	}

	// Physical dimension validations - all panel dimensions must be positive
	if (config.width <= 0) {
		throw new Error("width must be > 0");
	}

	if (config.height <= 0) {
		throw new Error("height must be > 0");
	}

	if (config.depth <= 0) {
		throw new Error("depth must be > 0");
	}

	// Functional constraint validations
	if (config.numSlats < 1) {
		throw new Error("numSlats must be >= 1");
	}

	if (config.slatWidth <= 0) {
		throw new Error("slatWidth must be > 0");
	}

	if (config.slatSpacing < 0) {
		throw new Error("slatSpacing must be >= 0");
	}

	if (config.slatDepthVariation < 0 || config.slatDepthVariation > config.depth) {
		throw new Error(
			`slatDepthVariation (${config.slatDepthVariation}) must be >= 0 and <= depth (${config.depth})`
		);
	}

	if (config.absorberDepth < 0 || config.absorberDepth > config.depth) {
		throw new Error(
			`absorberDepth (${config.absorberDepth}) must be >= 0 and <= depth (${config.depth})`
		);
	}

	// Validate that slat layout fits within panel width
	const occupiedWidth =
		config.numSlats * config.slatWidth +
		(config.numSlats - 1) * config.slatSpacing;

	if (occupiedWidth > config.width) {
		throw new Error(
			`Slat layout (${occupiedWidth.toFixed(0)}mm) exceeds panel width (${config.width.toFixed(0)}mm)`
		);
	}
}

/**
 * Calculates the geometry and open area for an Abfusor.
 *
 * @param config - Configuration object containing all parameters.
 * @returns Geometry data including open area percentage and slat positions.
 */
function calculateAbfusorGeometry(config: AbfusorConfig): AbfusorGeometry {
	// Extract only the parameters we actually need for geometry calculation
	const { numSlats, slatWidth, slatSpacing } = config;

	// Calculate total gap width (sum of all spacing between slats)
	const totalGapWidth = (numSlats - 1) * slatSpacing;

	// Calculate total panel width occupied by slats and gaps
	const totalSlatGapWidth = numSlats * slatWidth + (numSlats - 1) * slatSpacing;

	// Open area percentage: ratio of gap area to total slat+gap area
	const openAreaPercentage =
		totalSlatGapWidth > 0
			? round2((totalGapWidth / totalSlatGapWidth) * 100)
			: 0;

	// Calculate slat positions from left edge
	const slatPositions: number[] = [];
	let currentX = slatWidth / 2; // Start centered on first slat
	for (let i = 0; i < numSlats; i++) {
		slatPositions.push(round2(currentX));
		currentX += slatWidth + slatSpacing;
	}

	return { openAreaPercentage, slatPositions };
}

/**
 * Calculates acoustic scattering performance for an Abfusor.
 *
 * Heuristic estimate of scattering performance based on slat spacing and depth variation.
 * This is not a physically derived acoustic model and should be considered a comparative design metric.
 *
 * @param config - Configuration object containing all parameters.
 * @param openAreaPercentage - Open area percentage from geometry calculation (must match config).
 * @returns Acoustic performance metrics including scattering and absorption.
 */
function calculateAbfusorScattering(
	config: AbfusorConfig,
	openAreaPercentage: number
): AbfusorAcoustics {
	// Extract parameters we actually need for scattering calculation
	const { slatWidth, slatSpacing, slatDepthVariation, depth, absorberDepth } = config;

	// Density factor: logarithmic ratio of spacing to width
	// Higher values indicate more open structure
	const densityFactor = Math.log10(1 + slatSpacing / slatWidth);

	// Variation factor: normalized depth variation as percentage
	// Greater variation = more effective diffusion
	const variationFactor = (slatDepthVariation / depth) * 100;

	// Combined spreading factor with proper scaling
	// The divisor of 4 normalizes the range to approximately 0-50%
	const factor = (variationFactor + densityFactor) * 0.25;

	// Calculate absorption based on absorber depth and open area
	// Deeper absorbers + lower open area = higher absorption
	let absorption = (absorberDepth / depth) * 100 + (100 - openAreaPercentage) * 0.5;
	absorption = Math.min(100, Math.max(0, absorption));

	// Calculate spread percentage with bounds
	const spreadPercent = Math.min(100, Math.max(0, factor));

	return { openAreaPercentage, spreadPercent, absorption };
}

/**
 * Calculates both geometry and acoustics for an Abfusor.
 *
 * @param config - Configuration object containing all parameters.
 * @returns Complete Abfusor calculation results including geometry and acoustics.
 */
export function getAbfusorCalculations(config: AbfusorConfig): AbfusorGeometry & AbfusorAcoustics {
	validateConfig(config);

	const geometry = calculateAbfusorGeometry(config);
	const acoustics = calculateAbfusorScattering(config, geometry.openAreaPercentage);

	return { ...acoustics, ...geometry };
}
