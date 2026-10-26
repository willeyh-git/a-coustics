import type { DesignSkylineInput, SkylineSequenceType } from "@design/skyline";
import type { ValidationResult } from "@validators/common";
import {
	asPrimeValue,
	combine,
	validateOneOf,
	validatePositiveFrequency,
	validatePrime,
	validatePrimitiveRoot,
} from "@validators/common";

/**
 * The sequence sources a skyline grid can be built from, as a runtime value to
 * check user input against. The declared element type keeps this list in sync
 * with {@link SkylineSequenceType}: adding a source to the union without
 * listing it here is a type error.
 */
export const SKYLINE_SEQUENCE_TYPES: SkylineSequenceType[] = ["QRD", "PRD"];

/**
 * Unbranded, all-optional view of {@link DesignSkylineInput}: the front door
 * for untrusted values from a UI form. Derived from the design input type so
 * the accepted field names cannot drift away from what `designSkyline`
 * consumes.
 */
export type ValidateSkylineDesignInput = {
	[field in keyof DesignSkylineInput]?: unknown;
};

/**
 * Validates a Skyline design input.
 *
 * Checks: `prime` is a prime panel order within the accepted range;
 * `designFrequency` is positive; when `sequenceType` is supplied it must be
 * one of {@link SKYLINE_SEQUENCE_TYPES} (`designSkyline` otherwise falls back
 * to QRD, so a mis-cased source must not read as valid); when the source is
 * `"PRD"` and `primitiveRoot` is supplied it must be a primitive root modulo
 * `prime`. Omitting the root is not an error — the design auto-selects one,
 * and a root supplied for a QRD source is simply not used.
 *
 * When `prime` is unusable the root is not checked: the prime error already
 * explains the problem.
 * @param input - The untrusted design input.
 * @returns `{ valid: true }` or every problem found in one pass.
 */
export function validateSkylineDesign(
	input: ValidateSkylineDesignInput,
): ValidationResult {
	const primeResult = validatePrime(input.prime);
	const checks: ValidationResult[] = [
		primeResult,
		validatePositiveFrequency(input.designFrequency, "designFrequency"),
	];

	if (input.sequenceType !== undefined) {
		checks.push(
			validateOneOf(input.sequenceType, SKYLINE_SEQUENCE_TYPES, "sequenceType"),
		);
	}

	const prime = asPrimeValue(input.prime);
	if (
		primeResult.valid &&
		prime !== undefined &&
		input.sequenceType === "PRD" &&
		input.primitiveRoot !== undefined
	) {
		checks.push(validatePrimitiveRoot(prime, input.primitiveRoot));
	}

	return combine(checks);
}
