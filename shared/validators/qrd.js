import { combine, validatePositiveFrequency, validatePrime } from "@validators/common";
/**
 * Validates a QRD design input.
 *
 * Checks: `prime` is prime; `designFrequency` is positive.
 * @param input - The untrusted design input.
 * @returns `{ valid: true }` or `{ valid: false; errors }` collecting every problem.
 */
export function validateQRDDesign(input) {
    return combine([
        validatePrime(input.prime),
        validatePositiveFrequency(input.designFrequency, "designFrequency"),
    ]);
}
