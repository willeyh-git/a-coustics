import { combine, validatePositiveFrequency, validatePrime } from "@validators/common";
import type { ValidationResult } from "@validators/common";

/**
 * Input for {@link validateQRDDesign}. Accepts a plain object of untrusted
 * values (e.g. from a UI form); fields are validated independently of their
 * runtime brand.
 */
export interface ValidateQRDDesignInput {
	prime?: unknown;
	designFrequency?: unknown;
}

/**
 * Validates a QRD design input.
 *
 * Checks: `prime` is prime; `designFrequency` is positive.
 * @param input - The untrusted design input.
 * @returns `{ valid: true }` or `{ valid: false; errors }` collecting every problem.
 */
export function validateQRDDesign(input: ValidateQRDDesignInput): ValidationResult {
	return combine([
		validatePrime(input.prime),
		validatePositiveFrequency(input.designFrequency, "designFrequency"),
	]);
}
