import {
	combine,
	validatePositiveFrequency,
	validatePositiveFrequencyArray,
	validatePositiveLength,
	validatePositiveVolume,
	type ValidationResult,
} from "@validators/common";

/**
 * Input for {@link validateHelmholtzDesign}.
 */
export interface ValidateHelmholtzDesignInput {
	neckRadius?: unknown;
	neckLength?: unknown;
	cavityVolume?: unknown;
	acousticResistance?: unknown;
	frequencyAxis?: unknown;
}

/**
 * Validates a Helmholtz resonator design input.
 *
 * Checks: `neckRadius`, `neckLength` positive; `cavityVolume` positive; when
 * `acousticResistance` is supplied it is positive; when `frequencyAxis` is
 * supplied it is a non-empty array of positive numbers.
 * @param input - The untrusted design input.
 */
export function validateHelmholtzDesign(
	input: ValidateHelmholtzDesignInput,
): ValidationResult {
	const checks: ValidationResult[] = [
		validatePositiveLength(input.neckRadius, "neckRadius"),
		validatePositiveLength(input.neckLength, "neckLength"),
		validatePositiveVolume(input.cavityVolume, "cavityVolume"),
	];

	if (input.acousticResistance !== undefined) {
		checks.push(
			validatePositiveFrequency(input.acousticResistance, "acousticResistance"),
		);
	}

	if (input.frequencyAxis !== undefined) {
		checks.push(validatePositiveFrequencyArray(input.frequencyAxis));
	}

	return combine(checks);
}
