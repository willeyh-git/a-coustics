import { designUnitDepth } from "../acoustics/design";
import { sequenceToDepths } from "../geometry/depths";
import { generateQRDSequence } from "../math/sequences";
import type { Frequency, Length, Prime } from "../types/units";

export interface DesignQRDInput {
	prime: Prime;
	designFrequency: Frequency;
}

export interface DesignQRDResult {
	sequence: number[];
	unitDepth: Length;
	depths: Length[];
}

export function designQRD(input: DesignQRDInput): DesignQRDResult {
	const { prime, designFrequency } = input;

	const unitDepth = designUnitDepth(designFrequency, prime) as Length;

	const sequence = generateQRDSequence(prime);
	const depths = sequenceToDepths(sequence, unitDepth);

	return {
		sequence,
		unitDepth,
		depths,
	};
}
