import type { Frequency, Length } from "../types/units";

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
