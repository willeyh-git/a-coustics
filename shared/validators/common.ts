import { asModulus, asPrime } from "@math/helpers";
import { isPrime, isPrimitiveRoot } from "@math/number-theory";
import type { Modulus, Prime } from "@units/units";

/**
 * One problem found in a design input.
 *
 * `field` names the offending input. Nested values use a dotted path (e.g.
 * `material.flowResistivity`) so the UI can point at exactly the control the
 * user has to fix. It is a plain `string` rather than the per-field
 * discriminated union sketched in `shared/pre-plan.md`: these shared
 * predicates are reused by every panel type, so the field names are not
 * statically known at this layer.
 */
export interface ValidationError {
	field: string;
	message: string;
}

/**
 * The structured result of a validation pass.
 *
 * Validation never throws for user errors (see the Validation Philosophy in
 * `shared/pre-plan.md`): validators return this instead, and thrown errors
 * stay reserved for programmer errors and impossible states.
 */
export type ValidationResult =
	| { valid: true }
	| { valid: false; errors: ValidationError[] };

/**
 * Range of accepted prime orders. Both bounds are engineering limits:
 *
 * - below {@link MIN_PRIME} there is no diffusing grid left to build (order 2
 *   gives only the zero and unit depths, i.e. a single open well);
 * - above {@link MAX_PRIME} a design stops being buildable and quotable: 2D
 *   (skyline / poly) grids grow as `p²`, so the bound caps one grid at `10⁴`
 *   wells, which is what keeps untrusted UI input from asking for an
 *   unbounded amount of work.
 */
export const MIN_PRIME = 3;
export const MAX_PRIME = 100;

/**
 * Renders an untrusted value for an error message. Strings are quoted and
 * containers are summarised, so `prime: "7"` reads differently from `prime: 7`
 * and a stray object never renders as `[object Object]` noise.
 * @param value - The value the user supplied.
 */
export function describeValue(value: unknown): string {
	if (typeof value === "string") {
		return `"${value}"`;
	}
	if (value === null || value === undefined || typeof value === "bigint") {
		return String(value);
	}
	if (Array.isArray(value)) {
		return `[array of ${value.length} entry(s)]`;
	}
	if (typeof value === "object") {
		return "[object]";
	}
	return String(value);
}

/** A result carrying no problems. */
export function ok(): ValidationResult {
	return { valid: true };
}

/**
 * A result carrying exactly one problem.
 * @param field - Dotted name of the offending input.
 * @param message - Human-readable explanation, safe for the UI.
 */
export function fail(field: string, message: string): ValidationResult {
	return { valid: false, errors: [{ field, message }] };
}

/**
 * Merges validation results into one, keeping every problem found.
 *
 * A single pass reports all problems rather than stopping at the first, so the
 * UI can show the whole list of things the user has to correct at once.
 * @param results - The per-field results to combine.
 */
export function combine(results: ValidationResult[]): ValidationResult {
	const errors: ValidationError[] = [];
	for (const result of results) {
		if (!result.valid) {
			errors.push(...result.errors);
		}
	}
	return errors.length === 0 ? ok() : { valid: false, errors };
}

/** True for a usable finite number; `NaN` and infinities are rejected. */
function isFiniteNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

/**
 * Narrows an untrusted value to a finite number, or `undefined` when it is not
 * one. Lets a validator report a user error first and then reuse the value
 * without a cast.
 * @param value - The untrusted value.
 */
export function asFiniteNumber(value: unknown): number | undefined {
	return isFiniteNumber(value) ? value : undefined;
}

/**
 * Narrows an untrusted value to a branded {@link Prime}, or `undefined` when it
 * is not a usable prime modulus.
 *
 * This is the validator layer's bridge into the branded math system: report a
 * user error with {@link validatePrime}, then thread the value through number
 * theory with this instead of a naked cast. The engineering bounds
 * ({@link MIN_PRIME}, {@link MAX_PRIME}) are a product decision applied only by
 * {@link validatePrime}, so a prime outside them still narrows here.
 * @param value - The untrusted value.
 */
export function asPrimeValue(value: unknown): Prime | undefined {
	if (
		typeof value !== "number" ||
		!Number.isInteger(value) ||
		!isPrime(value)
	) {
		return undefined;
	}
	return asPrime(value);
}

/**
 * Narrows an untrusted value to a branded {@link Modulus} for use with
 * modulo helpers, or `undefined` when it is not a usable prime modulus (every
 * residue rule in this project is defined over a prime).
 * @param value - The untrusted value.
 */
export function asModulusValue(value: unknown): Modulus | undefined {
	const prime = asPrimeValue(value);
	return prime === undefined ? undefined : asModulus(prime);
}

/**
 * Validates that a value is a finite, positive number.
 *
 * Unit-agnostic workhorse: frequencies, lengths, volumes, acoustic
 * resistivities and flow resistivities are all positive finite numbers at
 * runtime — their units are carried by the branded types in `shared/types`,
 * not by this predicate.
 * @param value - The untrusted value.
 * @param field - Dotted field name used in the error.
 */
export function validatePositiveNumber(
	value: unknown,
	field: string,
): ValidationResult {
	if (!isFiniteNumber(value)) {
		return fail(
			field,
			`Value must be a finite number (got ${describeValue(value)}).`,
		);
	}
	if (value <= 0) {
		return fail(field, `Value must be greater than zero (got ${value}).`);
	}
	return ok();
}

/**
 * Validates a frequency in Hz (a positive finite number).
 * @param value - The untrusted value.
 * @param field - Dotted field name used in the error.
 */
export function validatePositiveFrequency(
	value: unknown,
	field = "frequency",
): ValidationResult {
	return validatePositiveNumber(value, field);
}

/**
 * Validates that a value is a finite, non-negative number, as used by
 * quantities where zero is meaningful (a surface resistance, a zero-depth
 * projection). Use {@link validatePositiveNumber} when zero is not meaningful.
 * @param value - The untrusted value.
 * @param field - Dotted field name used in the error.
 */
export function validateNonNegativeNumber(
	value: unknown,
	field: string,
): ValidationResult {
	if (!isFiniteNumber(value)) {
		return fail(
			field,
			`Value must be a finite number (got ${describeValue(value)}).`,
		);
	}
	if (value < 0) {
		return fail(field, `Value must not be negative (got ${value}).`);
	}
	return ok();
}

/**
 * Validates a length in meters (a positive finite number).
 * @param value - The untrusted value.
 * @param field - Dotted field name used in the error.
 */
export function validatePositiveLength(
	value: unknown,
	field = "length",
): ValidationResult {
	return validatePositiveNumber(value, field);
}

/**
 * Validates a volume in cubic meters (a positive finite number).
 * @param value - The untrusted value.
 * @param field - Dotted field name used in the error.
 */
export function validatePositiveVolume(
	value: unknown,
	field = "volume",
): ValidationResult {
	return validatePositiveNumber(value, field);
}

/**
 * Validates a non-empty array of positive finite numbers, as used by an
 * explicit frequency axis. Reports the first bad entry by index.
 * @param value - The untrusted value.
 * @param field - Dotted field name used in the error.
 */
export function validatePositiveFrequencyArray(
	value: unknown,
	field = "frequencyAxis",
): ValidationResult {
	if (!Array.isArray(value) || value.length === 0) {
		return fail(
			field,
			`Value must be a non-empty array (got ${describeValue(value)}).`,
		);
	}
	for (let index = 0; index < value.length; index = index + 1) {
		const entry = value[index];
		if (!isFiniteNumber(entry) || entry <= 0) {
			return fail(
				field,
				`Every entry must be a positive finite number (entry ${index} was ` +
					`${describeValue(entry)}).`,
			);
		}
	}
	return ok();
}

/**
 * Validates an integer usable as a prime panel order: an integer, prime, and
 * inside {@link MIN_PRIME}..{@link MAX_PRIME}.
 * @param value - The untrusted value.
 * @param field - Dotted field name used in the error.
 */
export function validatePrime(
	value: unknown,
	field = "prime",
): ValidationResult {
	if (!isFiniteNumber(value) || !Number.isInteger(value)) {
		return fail(
			field,
			`Value must be an integer (got ${describeValue(value)}).`,
		);
	}
	if (value < MIN_PRIME || value > MAX_PRIME) {
		return fail(
			field,
			`Value ${value} must be a prime between ${MIN_PRIME} and ${MAX_PRIME}.`,
		);
	}
	if (!isPrime(value)) {
		return fail(field, `Value ${value} must be a prime number.`);
	}
	return ok();
}

/**
 * Validates that `g` is a primitive root modulo the prime `p`.
 *
 * `p` is branded to stop an unvalidated modulus reaching this predicate:
 * obtain one with {@link asPrime} from `@math/helpers` once
 * {@link validatePrime} has passed.
 * @param p - The prime modulus.
 * @param g - The candidate primitive root.
 * @param field - Dotted field name used in the error.
 */
export function validatePrimitiveRoot(
	p: Prime,
	g: unknown,
	field = "primitiveRoot",
): ValidationResult {
	if (!isFiniteNumber(g) || !Number.isInteger(g)) {
		return fail(field, `Value must be an integer (got ${describeValue(g)}).`);
	}
	if (!isPrimitiveRoot(p, g)) {
		// Same wording as the RangeError designPRD/designSkyline throw.
		return fail(field, `Value ${g} must be a primitive root modulo ${p}.`);
	}
	return ok();
}

/**
 * Validates that a value lies in the half-open range `[lo, hi)`.
 * @param value - The untrusted value.
 * @param lo - Inclusive lower bound.
 * @param hi - Exclusive upper bound.
 * @param field - Dotted field name used in the error.
 */
export function validateRatioInRange(
	value: unknown,
	lo: number,
	hi: number,
	field = "ratio",
): ValidationResult {
	if (!isFiniteNumber(value)) {
		return fail(
			field,
			`Value must be a finite number (got ${describeValue(value)}).`,
		);
	}
	if (value < lo || value >= hi) {
		// Matches the wording of the design-layer RangeError for a ratio.
		return fail(
			field,
			`${field} must satisfy ${lo} <= value < ${hi} (got ${value}).`,
		);
	}
	return ok();
}

/**
 * Validates that a value is one of a fixed set of options. Without this an
 * unknown option is silently reinterpreted by the design layer (e.g. a
 * mis-cased skyline source falls back to QRD), which reports "valid" for an
 * input the user did not ask for.
 * @param value - The untrusted value.
 * @param options - The accepted values.
 * @param field - Dotted field name used in the error.
 */
export function validateOneOf(
	value: unknown,
	options: readonly string[],
	field: string,
): ValidationResult {
	if (typeof value !== "string" || !options.includes(value)) {
		return fail(
			field,
			`Value must be one of: ${options.join(", ")} (got ${describeValue(value)}).`,
		);
	}
	return ok();
}
