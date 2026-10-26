import { calculateWavelength } from "@acoustics/frequency";
import { calculateUnitDepth } from "@acoustics/qrd-physics";
import type { Frequency, Length, Prime } from "@units/units";

/**
 * Derives the unit depth for a QRD design based on frequency and prime number.
 *
 * Both parameters are validated branded values: `asFrequency` enforces a finite,
 * positive frequency and `asPrime` enforces a prime modulus, so invalid inputs
 * are rejected at construction (see `shared/math/helpers.ts`) and never reach
 * this function.
 *
 * @param frequency The design frequency in Hz (validated branded value).
 * @param p The prime number for the QRD sequence (validated branded value).
 * @returns The unit depth in meters.
 */
export function designUnitDepth(frequency: Frequency, p: Prime): Length {
	const lambda = calculateWavelength(frequency);
	return calculateUnitDepth(lambda, p);
}
