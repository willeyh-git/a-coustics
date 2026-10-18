import type { Length } from "../types/units";
import { toLength } from "./scaling";

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
