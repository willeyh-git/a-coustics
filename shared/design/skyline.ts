import { designUnitDepth } from "../acoustics/design";
import { buildGrid, matrixToLengths } from "../math/grids";
import { findPrimitiveRoot, isPrimitiveRoot } from "../math/number-theory";
import { generatePRDSequence, generateQRDSequence } from "../math/sequences";
import type { Frequency, Length, Prime } from "../types/units";

/**
 * The 1D sequence source used to build the 2D skyline grid.
 */
export type SkylineSequenceType = "QRD" | "PRD";

export interface DesignSkylineInput {
	prime: Prime;
	designFrequency: Frequency;
	sequenceType?: SkylineSequenceType;
	primitiveRoot?: number;
}

export interface DesignSkylineResult {
	/** The 1D source sequence used to build the grid. */
	sequence: number[];
	/** The 2D grid of integer residues. */
	grid: number[][];
	/** The physical height of a single residue unit. */
	unitHeight: Length;
	/** The 2D grid of physical heights in meters. */
	heights: Length[][];
	/** The maximum residue value in the grid. */
	maxResidue: number;
	/** The maximum block height in meters. */
	maxHeight: Length;
	sequenceType: SkylineSequenceType;
	primitiveRoot: number;
}

/**
 * Design a Skyline diffuser: a 2D grid of block heights derived from a QRD or
 * PRD sequence via `Height(i, j) = (S(i) + S(j)) mod p`, scaled by the unit
 * height (the same unit depth used by QRD/PRD).
 *
 * @param input - The design parameters.
 * @returns The skyline grid, heights, and derived metrics.
 */
export function designSkyline(input: DesignSkylineInput): DesignSkylineResult {
	const {
		prime,
		designFrequency,
		sequenceType = "QRD",
		primitiveRoot: gInput,
	} = input;

	const type: SkylineSequenceType = sequenceType === "PRD" ? "PRD" : "QRD";

	let sequence: number[];
	let primitiveRoot: number;

	if (type === "PRD") {
		if (gInput === undefined) {
			primitiveRoot = findPrimitiveRoot(prime);
		} else if (isPrimitiveRoot(prime, gInput)) {
			primitiveRoot = gInput;
		} else {
			throw new RangeError(
				`Value ${gInput} must be a primitive root modulo ${prime}.`,
			);
		}
		sequence = generatePRDSequence(prime, primitiveRoot);
	} else {
		sequence = generateQRDSequence(prime);
		primitiveRoot = 0;
	}

	const unitHeight = designUnitDepth(designFrequency, prime);

	const grid = buildGrid(
		sequence,
		(i, j) => (sequence[i] + sequence[j]) % prime,
	);
	const heights = matrixToLengths(grid, unitHeight);

	let maxResidue = 0;
	for (const row of grid) {
		for (const value of row) {
			if (value > maxResidue) {
				maxResidue = value;
			}
		}
	}

	const maxHeight = matrixToLengths([[maxResidue]], unitHeight)[0][0];

	return {
		sequence,
		grid,
		unitHeight,
		heights,
		maxResidue,
		maxHeight,
		sequenceType: type,
		primitiveRoot,
	};
}
