import {
	combine,
	validatePositiveFrequency,
	validatePrime,
	validatePrimitiveRoot,
} from "@validators/common";
import type { ValidationResult } from "@validators/common";

/**
 * Input for {@link validateSkylineDesign}.
 */
export interface ValidateSkylineDesignInput {
	prime?: unknown;
	designFrequency?: unknown;
	sequenceType?: unknown;
	primitiveRoot?: unknown;
}

/**
 * Validates a Skyline design input.
 *
 * Checks: `prime` is prime; `designFrequency` is positive; when
 * `sequenceType` is `"PRD"` and `primitiveRoot` is supplied, it must be a
 * primitive root modulo `prime`. (When the PRD root is omitted the design
 * auto-selects one, which is not a user error.)
 * @param input - The untrusted design input.
 */
export function validateSkylineDesign(
	input: ValidateSkylineDesignInput,
): ValidationResult {
	const checks: ValidationResult[] = [
		validatePrime(input.prime),
		validatePositiveFrequency(input.designFrequency, "designFrequency"),
	];

	const isPRD = input.sequenceType === "PRD";
	if (isPRD && input.primitiveRoot !== undefined) {
		const p = input.prime;
		if (typeof p === "number" && Number.isInteger(p)) {
			checks.push(validatePrimitiveRoot(p, input.primitiveRoot));
		} else {
			checks.push({
				valid: false,
				errors: [
					{
						field: "primitiveRoot",
						message: "Cannot validate primitiveRoot without a valid prime.",
					},
				],
			});
		}
	}

	return combine(checks);
}
