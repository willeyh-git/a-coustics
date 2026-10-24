import { getQuadraticResidues, isPrime, mod } from "@math/number-theory";
import {
	combine,
	validatePositiveFrequency,
	validatePrime,
	type ValidationResult,
} from "@validators/common";

/**
 * Input for {@link validatePolyDesign}.
 */
export interface ValidatePolyDesignInput {
	prime?: unknown;
	designFrequency?: unknown;
	q1?: unknown;
	q2?: unknown;
}

/**
 * Validates a single poly-diffuser coefficient (`q1` or `q2`) against a valid
 * prime modulus.
 *
 * A coefficient is a congruence class modulo `p`: it must be an integer, not
 * congruent to 0 mod p (which collapses one axis), and congruent to a
 * quadratic residue mod p. Only validated when `p` itself is prime.
 */
function validatePolyCoefficient(
	p: unknown,
	value: unknown,
	field: string,
): ValidationResult {
	if (typeof p !== "number" || !Number.isInteger(p) || !isPrime(p)) {
		return {
			valid: false,
			errors: [
				{
					field,
					message: "Cannot validate coefficient without a valid prime.",
				},
			],
		};
	}
	if (!Number.isInteger(value)) {
		return { valid: false, errors: [{ field, message: `Value must be an integer (got ${value}).` }] };
	}
	const canonical = mod(value, p);
	if (canonical === 0) {
		return { valid: false, errors: [{ field, message: `Value ${value} must not be congruent to 0 modulo ${p}.` }] };
	}
	if (!getQuadraticResidues(p).includes(canonical)) {
		return { valid: false, errors: [{ field, message: `Value ${value} must be congruent to a quadratic residue modulo ${p}.` }] };
	}
	return { valid: true };
}

/**
 * Validates a Poly design input.
 *
 * Checks: `prime` is prime; `designFrequency` is positive; `q1` and `q2` are
 * valid quadratic-residue coefficients modulo `prime`.
 * @param input - The untrusted design input.
 */
export function validatePolyDesign(input: ValidatePolyDesignInput): ValidationResult {
	const primeCheck = validatePrime(input.prime);

	return combine([
		primeCheck,
		validatePositiveFrequency(input.designFrequency, "designFrequency"),
		validatePolyCoefficient(input.prime, input.q1, "q1"),
		validatePolyCoefficient(input.prime, input.q2, "q2"),
	]);
}
