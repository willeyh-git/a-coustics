import { getQuadraticResidues, mod } from "@math/number-theory";
import {
	asFiniteNumber,
	asModulusValue,
	asPrimeValue,
	combine,
	describeValue,
	fail,
	ok,
	validatePositiveFrequency,
	validatePrime,
} from "@validators/common";
import type { DesignPolyInput } from "@design/poly";
import type { Modulus, Prime } from "@units/units";
import type { ValidationResult } from "@validators/common";

/**
 * Unbranded, all-optional view of {@link DesignPolyInput}: the front door for
 * untrusted values from a UI form. Derived from the design input type so the
 * accepted field names cannot drift away from what `designPoly` consumes.
 */
export type ValidatePolyDesignInput = {
	[field in keyof DesignPolyInput]?: unknown;
};

/**
 * Validates one poly coefficient (`q1` or `q2`) against a usable prime order.
 *
 * A coefficient is a congruence class modulo `p`: it must be an integer, it
 * must not be congruent to `0` (which collapses one axis of the rule), and its
 * class must be a quadratic residue modulo `p`. Messages mirror the
 * `RangeError`s `designPoly` throws for the same three problems, so wiring the
 * validator in front of the design keeps the user-visible wording stable.
 * @param p - The validated prime order.
 * @param modulus - The same order as a branded modulus, for `mod`.
 * @param value - The untrusted coefficient.
 * @param field - Field name used in the error (`q1` or `q2`).
 */
function validatePolyCoefficient(
	p: Prime,
	modulus: Modulus,
	value: unknown,
	field: string,
): ValidationResult {
	const number = asFiniteNumber(value);
	if (number === undefined || !Number.isInteger(number)) {
		return fail(
			field,
			`Value ${field}=${describeValue(value)} must be an integer.`,
		);
	}

	// Convention: equivalent coefficients (q, q + p, q - p) describe the same
	// congruence class, so the canonical representative in [0, p) is checked and
	// reported.
	const canonical = mod(number, modulus);

	// 0 is a quadratic residue (0 = 0² mod p) but collapses one axis of the
	// rule and yields a physically repeating, degenerate grid.
	if (canonical === 0) {
		return fail(
			field,
			`Value ${field}=${describeValue(value)} must not be congruent to 0 ` +
				`modulo ${p}.`,
		);
	}

	if (!getQuadraticResidues(p).includes(canonical)) {
		return fail(
			field,
			`Value ${field}=${describeValue(value)} must be congruent to a ` +
				`quadratic residue modulo ${p}.`,
		);
	}

	return ok();
}

/**
 * Validates a Poly design input.
 *
 * Checks: `prime` is a prime panel order within the accepted range;
 * `designFrequency` is positive; `q1` and `q2` are valid quadratic-residue
 * coefficients modulo `prime`. When `prime` is unusable the coefficients are
 * not checked — they are congruence classes modulo that prime, so the prime
 * error alone explains why the design cannot be built.
 * @param input - The untrusted design input.
 * @returns `{ valid: true }` or every problem found in one pass.
 */
export function validatePolyDesign(
	input: ValidatePolyDesignInput,
): ValidationResult {
	const primeResult = validatePrime(input.prime);
	const checks: ValidationResult[] = [
		primeResult,
		validatePositiveFrequency(input.designFrequency, "designFrequency"),
	];

	const prime = asPrimeValue(input.prime);
	const modulus = asModulusValue(input.prime);
	if (primeResult.valid && prime !== undefined && modulus !== undefined) {
		checks.push(
			validatePolyCoefficient(prime, modulus, input.q1, "q1"),
			validatePolyCoefficient(prime, modulus, input.q2, "q2"),
		);
	}

	return combine(checks);
}
