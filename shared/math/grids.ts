import { toLength } from "../geometry/scaling";
import type { Length } from "../types/units";

/**
 * Converts a 2D matrix of integer residues into a 2D matrix of physical
 * dimensions (heights or depths) based on a single unit value.
 *
 * This is the 2D counterpart of `sequenceToDepths` and is shared by the
 * grid-based diffusers (Skyline, Poly).
 *
 * @param matrix - A square (or rectangular) matrix of integer residues.
 * @param unit - The physical size of a single residue unit (e.g. unit depth/height).
 * @returns A matrix of physical lengths in meters.
 */
export function matrixToLengths(matrix: number[][], unit: Length): Length[][] {
	return matrix.map((row) => row.map((value) => toLength(value, unit)));
}

/**
 * Builds a symmetric 2D grid from a 1D sequence using a combine function.
 *
 * The skyline convention is `Height(i, j) = (S(i) + S(j)) mod p`, but the
 * combine function is parameterized so other grid-based diffusers (Poly) can
 * reuse this infrastructure.
 *
 * @param sequence - The 1D source sequence of length `n`.
 * @param combine - Function producing the grid value from indices `i`, `j`.
 * @returns An `n × n` matrix of integers.
 */
export function buildGrid(
	sequence: number[],
	combine: (i: number, j: number) => number,
): number[][] {
	const n = sequence.length;
	const grid: number[][] = [];

	for (let i = 0; i < n; i++) {
		const row: number[] = new Array(n);
		for (let j = 0; j < n; j++) {
			row[j] = combine(i, j);
		}
		grid.push(row);
	}

	return grid;
}
