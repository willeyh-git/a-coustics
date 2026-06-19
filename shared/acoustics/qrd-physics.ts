/**
 * Calculates the unit depth for a QRD (Quadratic Residue Diffuser).
 * @param lambda The wavelength (λ₀) at the design frequency.
 * @param p The prime number used for the QRD sequence.
 * @returns The unit depth in meters.
 */
export function calculateUnitDepth(lambda: number, p: number): number {
	return lambda / (2 * p);
}
