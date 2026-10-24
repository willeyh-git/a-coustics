import { combine, validatePositiveFrequency, validatePositiveFrequencyArray, validatePrime, validateRatioInRange, } from "@validators/common";
/**
 * Validates an ABFUSOR design input.
 *
 * Checks: `prime` is prime; `designFrequency` is positive; `absorptiveRatio`
 * in `[0, 1)`; when `material` is supplied its `flowResistivity` is positive;
 * when `frequencyAxis` is supplied it is a non-empty array of positive numbers.
 * @param input - The untrusted design input.
 */
export function validateABFUSORDesign(input) {
    const checks = [
        validatePrime(input.prime),
        validatePositiveFrequency(input.designFrequency, "designFrequency"),
        validateRatioInRange(input.absorptiveRatio, 0, 1, "absorptiveRatio"),
    ];
    const material = input.material;
    if (material && material.flowResistivity !== undefined) {
        checks.push(validatePositiveFrequency(material.flowResistivity, "flowResistivity"));
    }
    if (input.frequencyAxis !== undefined) {
        checks.push(validatePositiveFrequencyArray(input.frequencyAxis));
    }
    return combine(checks);
}
