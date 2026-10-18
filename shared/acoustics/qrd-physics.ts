import { toLength } from "../geometry/scaling";
import type { Length } from "../types/units";
import { m } from "../types/units";

/**
 * Calculates the unit depth for a QRD (Quadratic Residue Diffuser).
 * @param lambda The wavelength (λ₀) at the design frequency.
 * @param p The prime number used for the QRD sequence.
 * @returns The unit depth in meters.
 */
export function calculateUnitDepth(lambda: Length, p: number): Length {
	return toLength(lambda / (2 * p), m);
}
