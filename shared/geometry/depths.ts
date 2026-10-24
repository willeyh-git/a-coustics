import type { Length } from "@units/units";
import { toLength } from "@geometry/scaling";

/**
 * Converts a sequence of integers (residues) into physical depths
 * based on a unit depth.
 *
 * @param sequence - The sequence of residues (e.g., from QRD or PRD)
 * @param unitDepth - The depth of a single unit in meters
 * @returns An array of physical depths in meters
 */
export function sequenceToDepths(
	sequence: number[],
	unitDepth: Length,
): Length[] {
	return sequence.map((val) => toLength(val, unitDepth));
}

/**
 * Converts a 2D matrix of integer residues (e.g. from a Skyline or Poly
 * grid) into physical dimensions based on a unit value. This is the 2D
 * counterpart of `sequenceToDepths` and is shared by the grid-based
 * diffusers.
 *
 * @param matrix - A square (or rectangular) matrix of integer residues.
 * @param unit - The physical size of a single residue unit (e.g. unit depth/height).
 * @returns A matrix of physical lengths in meters.
 */
export function matrixToLengths(matrix: number[][], unit: Length): Length[][] {
	return matrix.map((row) => row.map((value) => toLength(value, unit)));
}
