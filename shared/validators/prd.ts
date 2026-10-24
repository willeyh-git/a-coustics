import {
	combine,
	validatePositiveFrequency,
	validatePrime,
	validatePrimitiveRoot,
} from "@validators/common";
import type { ValidationResult } from "@validators/common";

/**
 * Input for {@link validatePRDDesign}.
 */
export interface ValidatePRDDesignInput {
	prime?: unknown;
	primitiveRoot?: unknown;
	designFrequency?: unknown;
}

/**
 * Validates a PRD design input.
 *
 * Checks: `prime` is prime; `designFrequency` is positive; when `primitiveRoot`
 * is supplied it must be a primitive root modulo `prime`.
 * @param input - The untrusted design input.
 */
export function validatePRDDesign(input: ValidatePRDDesignInput): ValidationResult {
	const checks: ValidationResult[] = [
		validatePrime(input.prime),
		validatePositiveFrequency(input.designFrequency, "designFrequency"),
	];

	if (input.primitiveRoot !== undefined) {
		const p = input.prime;
		if (typeof p === "number" && Number.isInteger(p)) {
			checks.push(validatePrimitiveRoot(p, input.primitiveRoot));
		} else {
			// Cannot meaningfully validate a root without a valid prime; the
			// prime error above already explains the problem.
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
