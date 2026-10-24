import { designUnitDepth } from "@acoustics/design";
import { matrixToLengths } from "@geometry/depths";
import { toLength } from "@geometry/scaling";
import { buildGrid, maxInGrid } from "@math/grids";
import { getQuadraticResidues, mod } from "@math/number-theory";
import type { Frequency, Length, Prime } from "@units/units";

/**
 * A coefficient (quadratic residue) used in the poly-diffuser residue rule.
 * It weights the squared index along one axis.
 *
 * Coefficients are congruence classes modulo p: any integer may be supplied,
 * and it is normalized to its canonical representative in `[0, p)` (see
 * {@link normalizeValidCoefficient}). Coefficients congruent to 0 modulo p are
 * rejected because they collapse one axis of the rule.
 */
export type PolyCoefficient = number;

export interface DesignPolyInput {
	prime: Prime;
	designFrequency: Frequency;
	/** Weight applied to i² (the row axis). Must be congruent to a nonzero quadratic residue mod p. */
	q1: PolyCoefficient;
	/** Weight applied to j² (the column axis). Must be congruent to a nonzero quadratic residue mod p. */
	q2: PolyCoefficient;
}

export interface DesignPolyResult {
	/** The normalized coefficient applied to i² (canonical representative in [0, p)). */
	q1: PolyCoefficient;
	/** The normalized coefficient applied to j² (canonical representative in [0, p)). */
	q2: PolyCoefficient;
	/** The 2D grid of integer residues S(i, j) = (q1 * i² + q2 * j²) mod p. */
	grid: number[][];
	/** The physical depth of a single residue unit in meters. */
	unitDepth: Length;
	/** The 2D grid of physical depths in meters. */
	depths: Length[][];
	/** The maximum residue value in the grid. */
	maxResidue: number;
	/** The maximum well depth in meters. */
	maxDepth: Length;
}

/**
 * Validates that a poly-diffuser coefficient is a valid quadratic residue
 * modulo p.
 *
 * @param p - The prime modulus.
 * @param value - The coefficient to validate.
 * @param name - The coefficient name, used in the error message.
 * @returns The normalized coefficient: the canonical representative of `value`
 * in `[0, p)`, valid for use in the residue rule.
 * @throws RangeError if `value` is not an integer, if it is congruent to 0
 * modulo p (a degenerate axis-collapse), or if its congruence class is not a
 * quadratic residue modulo p.
 */
function normalizeValidCoefficient(
	p: Prime,
	value: PolyCoefficient,
	name: string,
): number {
	if (!Number.isInteger(value)) {
		throw new RangeError(`Value ${name}=${value} must be an integer.`);
	}

	// Convention: a coefficient is a congruence class modulo p, so any integer
	// is accepted and normalized to its canonical representative in [0, p).
	// Mathematically equivalent coefficients (e.g. q, q + p, q - p) therefore
	// produce identical grids.
	const canonical = mod(value, p);

	// 0 is a quadratic residue (0 = 0² mod p), but it collapses one axis of the
	// rule and yields a physically degenerate, repeating grid; it is rejected.
	if (canonical === 0) {
		throw new RangeError(
			`Value ${name}=${value} must not be congruent to 0 modulo ${p}.`,
		);
	}

	const residues = getQuadraticResidues(p);
	if (!residues.includes(canonical)) {
		throw new RangeError(
			`Value ${name}=${value} must be congruent to a quadratic residue modulo ${p}.`,
		);
	}

	return canonical;
}

/**
 * Design a Poly diffuser: a two-dimensional residue diffuser whose well depths
 * are derived from the rule
 *
 * ```text
 * S(i, j) = (q1 * i² + q2 * j²) mod p
 * d(i, j) = S(i, j) × d_unit
 * ```
 *
 * The unit depth is the same QRD unit depth used by the 1D diffusers, so the
 * poly grid reuses the shared grid (`buildGrid`, `maxInGrid`), geometry
 * (`matrixToLengths`), and acoustics (`designUnitDepth`) infrastructure.
 *
 * Coefficients are validated as congruence classes modulo p: any integer is
 * accepted, normalized with {@link mod} to its canonical representative in
 * `[0, p)`, and that normalized value is what the result reports. Coefficients
 * congruent to 0 modulo p are rejected because they collapse one axis and
 * yield a repeating, physically degenerate grid. When `q1 = q2 = 1`, the rule
 * coincides with the QRD-sourced Skyline grid `(S(i) + S(j)) mod p`.
 *
 * @param input - The design parameters.
 * @returns The poly grid, depths, and derived metrics.
 * @throws RangeError if `q1` or `q2` is not an integer, is congruent to 0
 * modulo `prime`, or is not congruent to a quadratic residue modulo `prime`.
 */
export function designPoly(input: DesignPolyInput): DesignPolyResult {
	const { prime, designFrequency, q1, q2 } = input;

	// Coefficients are congruence classes modulo p; use the canonical
	// representatives so equivalent inputs (q, q + p, q - p) produce identical
	// grids and identical reported coefficients.
	const residue1 = normalizeValidCoefficient(prime, q1, "q1");
	const residue2 = normalizeValidCoefficient(prime, q2, "q2");

	const unitDepth = designUnitDepth(designFrequency, prime);

	const indices = Array.from({ length: prime }, (_, i) => i);
	const grid = buildGrid(
		indices,
		(i, j) => (residue1 * (i * i) + residue2 * (j * j)) % prime,
	);
	const depths = matrixToLengths(grid, unitDepth);

	const maxResidue = maxInGrid(grid);

	const maxDepth = toLength(maxResidue, unitDepth);

	return {
		q1: residue1,
		q2: residue2,
		grid,
		unitDepth,
		depths,
		maxResidue,
		maxDepth,
	};
}
