import {
	combine,
	validatePositiveNumber,
	validatePositiveFrequencyArray,
	validatePositiveLength,
	validatePositiveVolume,
} from "@validators/common";
import type { DesignHelmholtzInput } from "@design/helmholtz";
import type { ValidationResult } from "@validators/common";

/**
 * Unbranded, all-optional view of {@link DesignHelmholtzInput}: the front door
 * for untrusted values from a UI form. Derived from the design input type so
 * the accepted field names cannot drift away from what `designHelmholtz`
 * consumes.
 */
export type ValidateHelmholtzDesignInput = {
	[field in keyof DesignHelmholtzInput]?: unknown;
};

/**
 * Validates a Helmholtz resonator design input.
 *
 * Checks: `neckRadius` and `neckLength` are positive lengths; `cavityVolume` is
 * a positive volume; when
 * `acousticResistance` is supplied it is a positive acoustic resistance; when
 * `frequencyAxis` is supplied it is a non-empty array of positive
 * frequencies.
 *
 * Every quantity is checked as a plain positive number: units live in the
 * branded types in `shared/types/`, so a validator cannot tell a metre from a
 * hertz and must not try.
 * @param input - The untrusted design input.
 * @returns `{ valid: true }` or every problem found in one pass.
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
		// Unit-agnostic: an acoustic resistance (rayls/m⁴) is a positive finite
		// number; its unit lives in the branded types, not in this predicate.
		checks.push(
			validatePositiveNumber(input.acousticResistance, "acousticResistance"),
		);
	}

	if (input.frequencyAxis !== undefined) {
		checks.push(validatePositiveFrequencyArray(input.frequencyAxis));
	}

	return combine(checks);
}
