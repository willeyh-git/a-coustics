import { SPEED_OF_SOUND } from "./constants";

/**
 * Calculates the wavelength for a given frequency.
 * @param frequency Frequency in Hz.
 * @returns Wavelength in meters.
 */
export function calculateWavelength(frequency: number): number {
	return SPEED_OF_SOUND / frequency;
}

/**
 * Calculates the frequency for a given wavelength.
 * @param wavelength Wavelength in meters.
 * @returns Frequency in Hz.
 */
export function frequencyFromWavelength(wavelength: number): number {
	return SPEED_OF_SOUND / wavelength;
}

/**
 * Calculates the quarter wavelength.
 * @param frequency Frequency in Hz.
 * @returns Quarter wavelength in meters.
 */
export function quarterWavelength(frequency: number): number {
	return (SPEED_OF_SOUND / frequency) / 4;
}

/**
 * Calculates the half wavelength.
 * @param frequency Frequency in Hz.
 * @returns Half wavelength in meters.
 */
export function halfWavelength(frequency: number): number {
	return (SPEED_OF_SOUND / frequency) / 2;
}
