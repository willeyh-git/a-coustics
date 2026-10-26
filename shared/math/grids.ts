/**
 * Builds a 2D grid from a 1D sequence using a combine function.
 *
 * `combine` receives the **sequence values** at a cell, not the cell
 * coordinates: a grid rule such as `Height(i, j) = (S(i) + S(j)) mod p`
 * becomes `(a, b) => (a + b) % p`. Passing values instead of indices keeps the
 * sequence inside this function, so a rule can never re-index it and silently
 * compute `undefined + undefined → NaN` under
 * `noUncheckedIndexedAccess`. The sequence still only contributes its length
 * and its values, so a rule that needs coordinates can pass a coordinate
 * sequence (e.g. `0..p-1`).
 *
 * The resulting grid is symmetric if and only if `combine` is symmetric in its
 * arguments (e.g. Poly rules with unequal coefficients are not).
 *
 * Note: residue-to-length conversion (`matrixToLengths`) lives in the geometry
 * layer (`shared/geometry/depths.ts`); this module stays free of physical
 * units, per the number-theory layering rule.
 *
 * @param sequence - The 1D source sequence of length `n`.
 * @param combine - Function producing the grid value from the pair of sequence
 * values at a cell.
 * @returns An `n × n` matrix of integers.
 */
export function buildGrid(
	sequence: number[],
	combine: (a: number, b: number) => number,
): number[][] {
	const grid: number[][] = [];

	// Iterating values keeps `combine` in terms of sequence values and avoids
	// indexing `sequence` (which would yield `number | undefined`).
	for (const a of sequence) {
		const row: number[] = [];
		for (const b of sequence) {
			row.push(combine(a, b));
		}
		grid.push(row);
	}

	return grid;
}

/**
 * Finds the maximum residue value in a 2D grid of integer residues.
 * Shared by the grid-based diffusers (Skyline, Poly) to derive `R_max`, the
 * maximum residue reached, used to compute the maximum physical dimension.
 *
 * Residues are assumed non-negative (they come from a `mod p` rule), so an
 * empty grid yields 0.
 *
 * @param grid - A matrix of non-negative integer residues.
 * @returns The maximum residue value in the grid.
 */
export function maxInGrid(grid: number[][]): number {
	let max = 0;
	for (const row of grid) {
		for (const value of row) {
			if (value > max) {
				max = value;
			}
		}
	}
	return max;
}
