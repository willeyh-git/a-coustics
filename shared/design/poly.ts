import { designUnitDepth } from "../acoustics/design";
import { matrixToLengths } from "../geometry/depths";
import { toLength } from "../geometry/scaling";
import { buildGrid } from "../math/grids";
import { getQuadraticResidues } from "../math/number-theory";
import type { Frequency, Length, Prime } from "../types/units";

/**
 * A coefficient (quadratic residue) used in the poly-diffuser residue rule.
 * It weights the squared index along one axis.
 */
export type PolyCoefficient = number;

export interface DesignPolyInput {
	prime: Prime;
	designFrequency: Frequency;
	/** Weight applied to i² (the row axis). Must be a quadratic residue mod p. */
	q1: PolyCoefficient;
	/** Weight applied to j² (the column axis). Must be a quadratic residue mod p. */
	q2: PolyCoefficient;
}

export interface DesignPolyResult {
	/** The coefficient applied to i² (the row axis). */
	q1: PolyCoefficient;
	/** The coefficient applied to j² (the column axis). */
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
 * @throws RangeError if `value` is not a quadratic residue mod p.
 */
function assertValidCoefficient(
	p: Prime,
	value: PolyCoefficient,
	name: string,
): void {
	if (!Number.isInteger(value)) {
		throw new RangeError(`Value ${name}=${value} must be an integer.`);
	}
	const residues = getQuadraticResidues(p);
	if (!residues.includes(value)) {
		throw new RangeError(
			`Value ${name}=${value} must be a quadratic residue modulo ${p}.`,
		);
	}
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
 * poly grid reuses the shared grid (`buildGrid`), geometry (`matrixToLengths`),
 * and acoustics (`designUnitDepth`) infrastructure.
 *
 * @param input - The design parameters.
 * @returns The poly grid, depths, and derived metrics.
 * @throws RangeError if `q1` or `q2` is not a quadratic residue modulo `prime`.
 */
export function designPoly(input: DesignPolyInput): DesignPolyResult {
	const { prime, designFrequency, q1, q2 } = input;

	assertValidCoefficient(prime, q1, "q1");
	assertValidCoefficient(prime, q2, "q2");

	const unitDepth = designUnitDepth(designFrequency, prime);

	const indices = Array.from({ length: prime }, (_, i) => i);
	const grid = buildGrid(
		indices,
		(i, j) => (q1 * (i * i) + q2 * (j * j)) % prime,
	);
	const depths = matrixToLengths(grid, unitDepth);

	let maxResidue = 0;
	for (const row of grid) {
		for (const value of row) {
			if (value > maxResidue) {
				maxResidue = value;
			}
		}
	}

	const maxDepth = toLength(maxResidue, unitDepth);

	return {
		q1,
		q2,
		grid,
		unitDepth,
		depths,
		maxResidue,
		maxDepth,
	};
}
