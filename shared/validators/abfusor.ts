import {
	combine,
	validatePositiveFrequency,
	validatePositiveFrequencyArray,
	validatePrime,
	validateRatioInRange,
} from "@validators/common";
import type { ValidationResult } from "@validators/common";

/**
 * Input for {@link validateABFUSORDesign}.
 */
export interface ValidateABFUSORDesignInput {
	prime?: unknown;
	designFrequency?: unknown;
	absorptiveRatio?: unknown;
	material?: unknown;
	frequencyAxis?: unknown;
}

/**
 * Validates an ABFUSOR design input.
 *
 * Checks: `prime` is prime; `designFrequency` is positive; `absorptiveRatio`
 * in `[0, 1)`; when `material` is supplied its `flowResistivity` is positive;
 * when `frequencyAxis` is supplied it is a non-empty array of positive numbers.
 * @param input - The untrusted design input.
 */
export function validateABFUSORDesign(
	input: ValidateABFUSORDesignInput,
): ValidationResult {
	const checks: ValidationResult[] = [
		validatePrime(input.prime),
		validatePositiveFrequency(input.designFrequency, "designFrequency"),
		validateRatioInRange(input.absorptiveRatio, 0, 1, "absorptiveRatio"),
	];

	const material = input.material as { flowResistivity?: unknown } | undefined;
	if (material && material.flowResistivity !== undefined) {
		checks.push(
			validatePositiveFrequency(
				material.flowResistivity,
				"flowResistivity",
			),
		);
	}

	if (input.frequencyAxis !== undefined) {
		checks.push(validatePositiveFrequencyArray(input.frequencyAxis));
	}

	return combine(checks);
}
