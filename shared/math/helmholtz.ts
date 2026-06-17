/**
 * Helmholtz Resonator math.
 *
 * A Helmholtz resonator is a type of acoustic resonator that uses the 
 * principle of air volume and a neck to create a specific resonant frequency.
 *
 * @param width - Total width of the resonator.
 * @param height - Total height of the resonator.
 * @param depth - Total depth of the resonator.
 * @param faceThickness - Thickness of the front face.
 * @param neckDepth - Depth of the neck into the cavity.
 * @param slotWidth - Width of the slot/neck.
 * @param slotCount - Number of slots.
 * @param slotLength - Length of the slot.
 * @returns An object containing geometry calculations.
 */
import { isPrime } from "#shared/utils/math-helpers";

const SPEED_OF_SOUND = 343; // m/s

/**
 * Calculates the geometry and volume for a Helmholtz Resonator.
 *
 * @param width - Total width of the resonator.
 * @param height - Total height of the resonator.
 * @param depth - Total depth of the resonator.
 * @param faceThickness - Thickness of the front face.
 * @param neckDepth - Depth of the neck into the cavity.
 * @param slotWidth - Width of the slot/neck.
 * @param slotCount - Number of slots.
 * @param slotLength - Length of the slot.
 * @returns An object containing geometry calculations.
 */
export function calculateHelmholtzGeometry(
	width: number,
	height: number,
	depth: number,
	faceThickness: number,
	neckDepth: number,
	slotWidth: number,
	slotCount: number,
	slotLength: number
): {
	cavityVolume: number;
	openAreaPercentage: number;
	totalVolume: number;
} {
	// Cavity volume calculation:
	// V = (Width * Height * Depth) - (FaceArea * FaceThickness) - (NeckArea * NeckDepth)
	
	const totalVolume = width * height * depth;
	const faceVolume = width * height * faceThickness;
	
	// Neck area (assuming slots)
	const neckArea = slotWidth * slotLength * slotCount;
	const neckVolume = neckArea * neckDepth;

	const cavityVolume = totalVolume - faceVolume - neckVolume;

	// Open area percentage: (Total slot area) / (Total front area)
	const totalFrontArea = width * height;
	const openAreaPercentage = (neckArea / totalFrontArea) * 100;

	return {
		cavityVolume,
		openAreaPercentage,
		totalVolume,
	};
}

/**
 * Calculates the resonant frequency and other acoustic properties for a Helmholtz Resonator.
 *
 * @param width - Total width of the resonator.
 * @param height - Total height of the resonator.
 * @param depth - Total depth of the resonator.
 * @param faceThickness - Thickness of the front face.
 * @param neckDepth - Depth of the neck into the cavity.
 * @param slotWidth - Width of the slot/neck.
 * @param slotCount - Number of slots.
 * @param slotLength - Length of the slot.
 * @returns An object containing acoustic calculations.
 */
export function calculateHelmholtzAcoustics(
	width: number,
	height: number,
	depth: number,
	faceThickness: number,
	neckDepth: number,
	slotWidth: number,
	slotCount: number,
	slotLength: number
): {
	resonantFrequency: number;
	effectiveOperatingRange: number[];
	openAreaPercentage: number;
	cavityVolume: number;
} {
	const { cavityVolume, openAreaPercentage } = calculateHelmholtzGeometry(
		width,
		height,
		depth,
		faceThickness,
		neckDepth,
		slotWidth,
		slotCount,
		slotLength
	);

	// Neck area
	const neckArea = slotWidth * slotLength * slotCount;
	
	// Effective length L is the neck depth plus an end correction.
	// End correction is typically 0.85 * neck_radius (for cylindrical) 
	// or similar for slots. We'll use a simplified end correction.
	const effectiveLength = neckDepth + (slotWidth * 0.85);

	// Resonant Frequency: fr = (c / 2 * pi) * sqrt(A / (V * L))
	const resonantFrequency = (SPEED_OF_SOUND / (2 * Math.PI)) * 
		Math.sqrt(neckArea / (cavityVolume * effectiveLength));

	// Effective operating range (heuristic: +/- 50% of resonant frequency)
	const minFreq = resonantFrequency * 0.75;
	const maxFreq = resonantFrequency * 1.25;

	return {
		resonantFrequency,
		effectiveOperatingRange: [minFreq, maxFreq],
		openAreaPercentage,
		cavityVolume,
	};
}

/**
 * Calculates geometry and acoustics for a Helmholtz Resonator, ensuring consistency with user inputs.
 *
 * @param width - Total width of the resonator.
 * @param height - Total height of the resonator.
 * @param depth - Total depth of the resonator.
 * @param faceThickness - Thickness of the front face.
 * @param neckDepth - Depth of the neck into the cavity.
 * @param slotWidth - Width of the slot/neck.
 * @param slotCount - Number of slots.
 * @param slotLength - Length of the slot.
 * @returns An object containing geometry and acoustic calculations.
 */
export function getHelmholtzCalculations(
	width: number,
	height: number,
	depth: number,
	faceThickness: number,
	neckDepth: number,
	slotWidth: number,
	slotCount: number,
	slotLength: number
) {
	return {
		...calculateHelmholtzGeometry(
			width,
			height,
			depth,
			faceThickness,
			neckDepth,
			slotWidth,
			slotCount,
			slotLength
		),
		...calculateHelmholtzAcoustics(
			width,
			height,
			depth,
			faceThickness,
			neckDepth,
			slotWidth,
			slotCount,
			slotLength
		),
		width,
		height,
		depth,
		faceThickness,
		neckDepth,
		slotWidth,
		slotCount,
		slotLength,
	};
}
