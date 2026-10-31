import { toLength } from "@geometry/scaling";
import { getQuadraticResidues } from "@math/number-theory";
import type { Length, Prime } from "@units/units";
import { m } from "@units/units";

/**
 * Calculates the unit depth for a QRD (Quadratic Residue Diffuser).
 * @param lambda The wavelength (λ₀) at the design frequency.
 * @param p The prime number used for the QRD sequence.
 * @returns The unit depth in meters.
 */
export function calculateUnitDepth(lambda: Length, p: Prime): Length {
	return toLength(lambda / (2 * p), m);
}

/**
 * Calculates the maximum well depth for a QRD (Quadratic Residue Diffuser).
 *
 * Wells follow `d(i) = S(i) * unitDepth` with `S(i) = i² mod p`, so the deepest
 * well is `R_max * unitDepth`, where `R_max` is the largest quadratic residue
 * actually reached modulo `p`. Note that `R_max` is not always `p - 1`: `p - 1 ≡ -1`
 * is a residue only for `p = 2` or `p ≡ 1 (mod 4)`, so the often-quoted closed
 * form `((p - 1) * lambda) / (2p)` is an upper bound that is attained only for
 * those primes (it overestimates the deepest well for `p = 3`, `7`, `11`).
 * Since at least one of `p - 1`, `p - 2`, `p - 3` is always a residue
 * (`4 ≡ p - 3` or an earlier square), the maximum depth is always strictly
 * less than the design wavelength and approaches half of it (λ/2) as `p` grows.
 *
 * @param lambda The wavelength (λ₀) at the design frequency.
 * @param p The prime number used for the QRD sequence (validated branded value).
 * @returns The maximum well depth in meters.
 */
export function calculateMaxDepth(lambda: Length, p: Prime): Length {
	const maxResidue = getQuadraticResidues(p).reduce(
		(max, residue) => (residue > max ? residue : max),
		0,
	);
	return toLength((lambda * maxResidue) / (2 * p), m);
}
