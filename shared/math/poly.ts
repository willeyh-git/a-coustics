/**
 * Poly Diffuser math.
 *
 * A Poly Diffuser is a curved acoustic treatment that scatters sound
 * by reflecting it off a curved surface.
 *
 * @param width - Total width of the panel.
 * @param height - Total height of the panel.
 * @param curveDepth - The maximum depth of the curve from the plane.
 * @param radius - The radius of the curvature.
 * @param thickness - Material thickness.
 * @returns An object containing geometry calculations.
 */
import { isPrime } from "#shared/utils/math-helpers";

const SPEED_OF_SOUND = 343; // m/s

/**
 * Calculates the radius and arc geometry for a Poly Diffuser.
 *
 * @param width - Total width of the panel.
 * @param height - Total height of the panel.
 * @param curveDepth - The maximum depth of the curve from the plane.
 * @param thickness - Material thickness.
 * @returns An object containing the radius and other geometry metrics.
 */
export function calculatePolyGeometry(
	width: number,
	height: number,
	curveDepth: number,
	thickness: number
): {
	radius: number;
	arcAngle: number;
	surfaceArea: number;
} {
	// Radius calculation based on width and depth
	// R^2 = (R - curveDepth)^2 + (width/2)^2
	// R^2 = R^2 - 2*R*curveDepth + curveDepth^2 + (width^2 / 4)
	// 2*R*curveDepth = curveDepth^2 + (width^2 / 4)
	// R = (curveDepth^2 + (width^2 / 4)) / (2 * curveDepth)
	
	if (curveDepth <= 0) {
		throw new Error("curveDepth must be positive.");
	}

	const radius = (Math.pow(curveDepth, 2) + Math.pow(width, 2) / 4) / (2 * curveDepth);
	
	// Arc angle calculation (theta = 2 * arcsin( (width/2) / R ))
	const arcAngle = 2 * Math.asin((width / 2) / radius);
	
	// Surface Area (approximate)
	// Area = ArcLength * height
	// ArcLength = R * theta
	const surfaceArea = radius * arcAngle * height;

	return {
		radius,
		arcAngle,
		surfaceArea,
	};
}

/**
 * Calculates geometry for a Poly Diffuser, ensuring consistency with user inputs.
 *
 * @param width - Total width of the panel.
 * @param height - Total height of the panel.
 * @param curveDepth - The maximum depth of the curve.
 * @param thickness - Material thickness.
 * @returns An object containing geometry calculations.
 */
export function getPolyGeometry(
	width: number,
	height: number,
	curveDepth: number,
	thickness: number
) {
	const geometry = calculatePolyGeometry(width, height, curveDepth, thickness);
	return {
		...geometry,
		width,
		height,
		thickness,
	};
}

/**
 * Calculates acoustic properties for a Poly Diffuser.
 * 
 * @param width - Total width of the panel.
 * @param height - Total height of the panel.
 * @param depth - Maximum depth of the curve.
 * @returns An object containing acoustic calculations.
 */
export function calculatePolyAcoustics(
	width: number,
	height: number,
	depth: number
): {
	designFrequency: number;
	minFrequency: number;
	maxFrequency: number;
	effectiveBandwidth: number;
} {
	// For a curved surface, the scattering is most effective at frequencies 
	// where the wavelength is comparable to the radius of curvature.
	// f = c / (2 * R)
	
	// Let's use the radius calculated from width and depth as a base.
	const radius = (Math.pow(depth, 2) + Math.pow(width, 2) / 4) / (2 * depth);
	const designFrequency = SPEED_OF_SOUND / (2 * radius);

	// Range based on the curvature extremes
	const minFrequency = designFrequency * 0.5;
	const maxFrequency = designFrequency * 1.5;

	// Bandwidth (heuristic: 30% of design frequency)
	const effectiveBandwidth = designFrequency * 0.3;

	return {
		designFrequency,
		minFrequency,
		maxFrequency,
		effectiveBandwidth,
	};
}

/**
 * Calculates both geometry and acoustics for a Poly Diffuser.
 *
 * @param width - Total width of the panel.
 * @param height - Total height of the panel.
 * @param depth - Maximum depth of the curve.
 * @param thickness - Material thickness.
 * @returns An object containing all calculations.
 */
export function getPolyCalculations(
	width: number,
	height: number,
	depth: number,
	thickness: number
) {
	const geometry = getPolyGeometry(width, height, depth, thickness);
	const acoustics = calculatePolyAcoustics(width, height, depth);

	return {
		...acoustics,
		...geometry,
		width,
		height,
		depth,
		thickness,
	};
}
