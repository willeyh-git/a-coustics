/**
 * Builds a 2D grid from a 1D sequence using a combine function.
 *
 * The skyline convention is `Height(i, j) = (S(i) + S(j)) mod p`, but the
 * combine function is parameterized so other grid-based diffusers (Poly) can
 * reuse this infrastructure. The resulting grid is symmetric if and only if
 * `combine` is symmetric in its arguments (e.g. Poly rules with unequal
 * coefficients are not).
 *
 * Note: residue-to-length conversion (`matrixToLengths`) lives in the geometry
 * layer (`shared/geometry/depths.ts`); this module stays free of physical
 * units, per the number-theory layering rule.
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
