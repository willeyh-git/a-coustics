import { isPrimitiveRoot, isPrime } from "@math/number-theory";
function fail(field, message) {
    return { valid: false, errors: [{ field, message }] };
}
function ok() {
    return { valid: true };
}
/**
 * Merges several validation results into one, collecting every error across
 * all inputs. Used by the per-type validators so a single pass reports all
 * problems rather than stopping at the first.
 * @param results - The individual validation results to combine.
 */
export function combine(results) {
    const errors = [];
    for (const result of results) {
        if (!result.valid && result.errors) {
            errors.push(...result.errors);
        }
    }
    return errors.length ? { valid: false, errors } : { valid: true };
}
function isPlainNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}
/**
 * Validates that `value` is a non-empty array of finite, positive numbers,
 * used for an explicit frequency axis.
 * @param field - The field name, used in the error message (default "frequencyAxis").
 */
export function validatePositiveFrequencyArray(value, field = "frequencyAxis") {
    if (!Array.isArray(value) || value.length === 0) {
        return fail(field, `Value must be a non-empty array.`);
    }
    for (const entry of value) {
        if (typeof entry !== "number" || !Number.isFinite(entry) || entry <= 0) {
            return fail(field, `Every axis entry must be a positive number (got ${entry}).`);
        }
    }
    return ok();
}
/**
 * Validates that `value` is a finite, positive number (a frequency in Hz).
 * @param value - The untrusted value to validate.
 * @param field - The field name, used in the error message (default "frequency").
 */
export function validatePositiveFrequency(value, field = "frequency") {
    if (!isPlainNumber(value)) {
        return fail(field, `Value must be a number (got ${typeof value}).`);
    }
    if (value <= 0) {
        return fail(field, `Value must be greater than zero (got ${value}).`);
    }
    return ok();
}
/**
 * Validates that `value` is a finite, positive number (a length in m).
 * @param field - The field name, used in the error message (default "length").
 */
export function validatePositiveLength(value, field = "length") {
    if (!isPlainNumber(value)) {
        return fail(field, `Value must be a number (got ${typeof value}).`);
    }
    if (value <= 0) {
        return fail(field, `Value must be greater than zero (got ${value}).`);
    }
    return ok();
}
/**
 * Validates that `value` is a finite, positive number (a volume in m³).
 * @param field - The field name, used in the error message (default "volume").
 */
export function validatePositiveVolume(value, field = "volume") {
    if (!isPlainNumber(value)) {
        return fail(field, `Value must be a number (got ${typeof value}).`);
    }
    if (value <= 0) {
        return fail(field, `Value must be greater than zero (got ${value}).`);
    }
    return ok();
}
/**
 * Validates that `value` is a prime number.
 * @param field - The field name, used in the error message (default "prime").
 */
export function validatePrime(value, field = "prime") {
    if (!isPlainNumber(value) || !Number.isInteger(value)) {
        return fail(field, `Value must be an integer (got ${value}).`);
    }
    if (!isPrime(value)) {
        return fail(field, `Value ${value} is not a prime number.`);
    }
    return ok();
}
/**
 * Validates that `g` is a primitive root modulo `p`.
 * @param p - The prime modulus.
 * @param g - The candidate primitive root.
 * @param field - The field name, used in the error message (default "primitiveRoot").
 */
export function validatePrimitiveRoot(p, g, field = "primitiveRoot") {
    if (!isPlainNumber(g) || !Number.isInteger(g)) {
        return fail(field, `Value must be an integer (got ${g}).`);
    }
    if (!isPrime(p) || !isPrimitiveRoot(p, g)) {
        return fail(field, `Value ${g} must be a primitive root modulo ${p}.`);
    }
    return ok();
}
/**
 * Validates that `value` lies in the half-open range `[lo, hi)`.
 * @param field - The field name, used in the error message (default "ratio").
 */
export function validateRatioInRange(value, lo, hi, field = "ratio") {
    if (!isPlainNumber(value)) {
        return fail(field, `Value must be a number (got ${typeof value}).`);
    }
    if (value < lo || value >= hi) {
        return fail(field, `Value must satisfy ${lo} <= value < ${hi} (got ${value}).`);
    }
    return ok();
}
