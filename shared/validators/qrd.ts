import type { DesignQRDInput } from "@design/qrd";
import type { ValidationResult } from "@validators/common";
import {
	combine,
	validatePositiveFrequency,
	validatePrime,
} from "@validators/common";

/**
 * Unbranded, all-optional view of {@link DesignQRDInput}: the front door for
 * untrusted values from a UI form. Derived from the design input type so the
 * accepted field names cannot drift away from what `designQRD` consumes.
 */
export type ValidateQRDDesignInput = {
	[field in keyof DesignQRDInput]?: unknown;
};

/**
 * Validates a QRD design input.
 *
 * Checks: `prime` is a prime panel order within the accepted range;
 * `designFrequency` is a positive frequency.
 * @param input - The untrusted design input.
 * @returns `{ valid: true }` or every problem found in one pass.
 */
export function validateQRDDesign(
	input: ValidateQRDDesignInput,
): ValidationResult {
	return combine([
		validatePrime(input.prime),
		validatePositiveFrequency(input.designFrequency, "designFrequency"),
	]);
}
