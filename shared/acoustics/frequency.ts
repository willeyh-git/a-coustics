import { toFrequency, toLength } from "@geometry/scaling";
import type { Frequency, Length } from "@units/units";
import { Hz, m } from "@units/units";
import { SPEED_OF_SOUND } from "@acoustics/constants";

/**
 * Calculates the wavelength for a given frequency.
 * @param frequency Frequency in Hz.
 * @returns Wavelength in meters.
 */
export function calculateWavelength(frequency: Frequency): Length {
	return toLength(SPEED_OF_SOUND / frequency, m);
}

/**
 * Calculates the frequency for a given wavelength.
 * @param wavelength Wavelength in meters.
 * @returns Frequency in Hz.
 */
export function frequencyFromWavelength(wavelength: Length): Frequency {
	return toFrequency(SPEED_OF_SOUND / wavelength, Hz);
}

/**
 * Calculates the quarter wavelength.
 * @param frequency Frequency in Hz.
 * @returns Quarter wavelength in meters.
 */
export function quarterWavelength(frequency: Frequency): Length {
	return toLength(SPEED_OF_SOUND / frequency / 4, m);
}

/**
 * Calculates the half wavelength.
 * @param frequency Frequency in Hz.
 * @returns Half wavelength in meters.
 */
export function halfWavelength(frequency: Frequency): Length {
	return toLength(SPEED_OF_SOUND / frequency / 2, m);
}
