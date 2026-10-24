import { toLength } from "@geometry/scaling";
import type { Length } from "@units/units";
import { m } from "@units/units";

/**
 * Calculates the unit depth for a QRD (Quadratic Residue Diffuser).
 * @param lambda The wavelength (λ₀) at the design frequency.
 * @param p The prime number used for the QRD sequence.
 * @returns The unit depth in meters.
 */
export function calculateUnitDepth(lambda: Length, p: number): Length {
	return toLength(lambda / (2 * p), m);
}
