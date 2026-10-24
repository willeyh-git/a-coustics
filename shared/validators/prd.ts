import {
	asPrimeValue,
	combine,
	validatePositiveFrequency,
	validatePrime,
	validatePrimitiveRoot,
} from "@validators/common";
import type { DesignPRDInput } from "@design/prd";
import type { ValidationResult } from "@validators/common";

/**
 * Unbranded, all-optional view of {@link DesignPRDInput}: the front door for
 * untrusted values from a UI form. Derived from the design input type so the
 * accepted field names cannot drift away from what `designPRD` consumes.
 */
export type ValidatePRDDesignInput = {
	[field in keyof DesignPRDInput]?: unknown;
};

/**
 * Validates a PRD design input.
 *
 * Checks: `prime` is a prime panel order within the accepted range;
 * `designFrequency` is positive; when `primitiveRoot` is supplied it must be a
 * primitive root modulo `prime`. Omitting the root is not an error — the
 * design auto-selects one.
 *
 * When `prime` is unusable the root is not checked: the prime error already
 * explains the problem, and reporting a root error against a non-prime
 * modulus would be a second, misleading message for the same cause.
 * @param input - The untrusted design input.
 * @returns `{ valid: true }` or every problem found in one pass.
 */
export function validatePRDDesign(
	input: ValidatePRDDesignInput,
): ValidationResult {
	const primeResult = validatePrime(input.prime);
	const checks: ValidationResult[] = [
		primeResult,
		validatePositiveFrequency(input.designFrequency, "designFrequency"),
	];

	const prime = asPrimeValue(input.prime);
	if (
		primeResult.valid &&
		prime !== undefined &&
		input.primitiveRoot !== undefined
	) {
		checks.push(validatePrimitiveRoot(prime, input.primitiveRoot));
	}

	return combine(checks);
}
