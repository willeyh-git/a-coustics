import type { Length } from "../types/units";

/**
 * Converts a scalar value into a Length using a unit multiplier.
 * This is the ONLY place raw number → Length conversion should happen.
 */
export function toLength(value: number, unit: Length): Length {
	return (value * unit) as Length;
}
