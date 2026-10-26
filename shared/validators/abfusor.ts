import type { DesignABFUSORInput } from "@design/abfusor";
import type { ValidationResult } from "@validators/common";
import {
	combine,
	describeValue,
	fail,
	validateNonNegativeNumber,
	validatePositiveFrequencyArray,
	validatePositiveNumber,
	validatePrime,
	validateRatioInRange,
} from "@validators/common";

/**
 * Structural view of the absorber material spec, with every field left `unknown`
 * so nothing is read without validation.
 */
type MaterialSpecView = {
	flowResistivity?: unknown;
	surfaceResistance?: unknown;
};

/**
 * Unbranded, all-optional view of {@link DesignABFUSORInput}: the front door
 * for untrusted values from a UI form. Derived from the design input type so
 * the accepted field names cannot drift away from what `designABFUSOR`
 * consumes.
 */
export type ValidateABFUSORDesignInput = {
	[field in keyof DesignABFUSORInput]?: unknown;
};

/**
 * Narrows an untrusted value to a {@link MaterialSpecView}, or `undefined` when
 * it is not a plain object.
 *
 * The cast re-types only the *view*: every property is `unknown`, so no
 * property value is trusted — each one is validated before use. A non-object
 * (a string, a number, an array) is reported instead of being silently ignored,
 * which is what would otherwise let `material: "foam"` read as valid.
 * @param value - The untrusted `material` field.
 */
function asMaterialSpec(value: unknown): MaterialSpecView | undefined {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return undefined;
	}
	return value as MaterialSpecView;
}

/**
 * Validates an ABFUSOR design input.
 *
 * Checks: `prime` is a prime panel order within the accepted range;
 * `designFrequency` is positive; `absorptiveRatio` lies in `[0, 1)`; when
 * `material` is supplied it must be an object, its `flowResistivity` must be
 * present and positive, and its optional `surfaceResistance` must be
 * non-negative; when `frequencyAxis` is supplied it must be a non-empty array
 * of positive frequencies.
 *
 * `flowResistivity` is required once `material` is supplied: `designABFUSOR`
 * only falls back to the default material when the whole field is omitted, so a
 * spec without a flow resistivity would otherwise propagate `NaN` into the
 * absorption curves.
 * @param input - The untrusted design input.
 * @returns `{ valid: true }` or every problem found in one pass.
 */
export function validateABFUSORDesign(
	input: ValidateABFUSORDesignInput,
): ValidationResult {
	const checks: ValidationResult[] = [
		validatePrime(input.prime),
		validatePositiveNumber(input.designFrequency, "designFrequency"),
		validateRatioInRange(input.absorptiveRatio, 0, 1, "absorptiveRatio"),
	];

	if (input.material !== undefined) {
		const material = asMaterialSpec(input.material);
		if (material === undefined) {
			checks.push(
				fail(
					"material",
					`Value must be a material spec object (got ${describeValue(
						input.material,
					)}).`,
				),
			);
		} else if (material.flowResistivity === undefined) {
			checks.push(
				fail(
					"material.flowResistivity",
					"Value is required when a material spec is supplied.",
				),
			);
		} else {
			checks.push(
				validatePositiveNumber(
					material.flowResistivity,
					"material.flowResistivity",
				),
			);
			if (material.surfaceResistance !== undefined) {
				checks.push(
					validateNonNegativeNumber(
						material.surfaceResistance,
						"material.surfaceResistance",
					),
				);
			}
		}
	}

	if (input.frequencyAxis !== undefined) {
		checks.push(validatePositiveFrequencyArray(input.frequencyAxis));
	}

	return combine(checks);
}
