import type { Area, Frequency, Length, Volume } from "../types/units";

/**
 * Converts a scalar value into a Length using a unit multiplier.
 * This is the ONLY place raw number → Length conversion should happen.
 */
export function toLength(value: number, unit: Length): Length {
	return (value * unit) as Length;
}

/**
 * Converts a scalar value into a Frequency using a unit multiplier.
 * This is the ONLY place raw number → Frequency conversion should happen.
 */
export function toFrequency(value: number, unit: Frequency): Frequency {
	return (value * unit) as Frequency;
}

/**
 * Converts a scalar value into an Area using a unit multiplier.
 * This is the ONLY place raw number → Area conversion should happen.
 */
export function toArea(value: number, unit: Area): Area {
	return (value * unit) as Area;
}

/**
 * Converts a scalar value into a Volume using a unit multiplier.
 * This is the ONLY place raw number → Volume conversion should happen.
 */
export function toVolume(value: number, unit: Volume): Volume {
	return (value * unit) as Volume;
}
