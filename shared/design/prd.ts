import { designUnitDepth } from "../acoustics/design";
import { sequenceToDepths } from "../geometry/depths";
import { findPrimitiveRoot, isPrimitiveRoot } from "../math/number-theory";
import { generatePRDSequence } from "../math/sequences";
import type { Frequency, Length, Prime } from "../types/units";

export interface DesignPRDInput {
	prime: Prime;
	primitiveRoot?: number;
	designFrequency: Frequency;
}

export interface DesignPRDResult {
	sequence: number[];
	unitDepth: Length;
	depths: Length[];
	primitiveRoot: number;
}

export function designPRD(input: DesignPRDInput): DesignPRDResult {
	const { prime, primitiveRoot: gInput, designFrequency } = input;

	let g: number;
	if (gInput === undefined) {
		g = findPrimitiveRoot(prime);
	} else if (isPrimitiveRoot(prime, gInput)) {
		g = gInput;
	} else {
		throw new RangeError(
			`Value ${gInput} must be a primitive root modulo ${prime}.`,
		);
	}

	const unitDepth = designUnitDepth(designFrequency, prime);

	const sequence = generatePRDSequence(prime, g);
	const depths = sequenceToDepths(sequence, unitDepth);

	return {
		sequence,
		unitDepth,
		depths,
		primitiveRoot: g,
	};
}
