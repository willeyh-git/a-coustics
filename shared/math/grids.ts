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
