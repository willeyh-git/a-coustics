/**
 * Safe array access that narrows past `undefined`.
 *
 * Under `noUncheckedIndexedAccess`, indexing an array yields `T | undefined`
 * even when the index is known to be in bounds. This function performs the
 * access and narrows to a non-nullable element, throwing when the read cannot
 * succeed. Both failure modes are programmer errors (an impossible state for a
 * correct caller), consistent with the project's policy that exceptions are
 * reserved for impossible states.
 *
 * Prefer this over type assertions (`x[i]!`) for in-bounds lookups whose
 * bounds are guaranteed by the surrounding logic rather than by a type. Where a
 * lookup is *expected* to miss (an optional hit), do not use this: use
 * `values[index]` and handle the `undefined`, or search with `find`.
 *
 * Not to be confused with `Array.prototype.at` (`values.at(index)`), which is a
 * different operation: it returns `undefined` for an out-of-range index and
 * counts negative indices from the end, whereas `at(values, -1)` throws. The
 * two are not interchangeable.
 *
 * @param values The array to read from.
 * @param index The index to read.
 * @returns The non-missing element at `index`.
 * @throws RangeError if `index` is not an integer in `[0, values.length)`.
 * @throws RangeError if the element at `index` is `undefined`/`null`; element
 * types that contain a missing value have no meaningful read here, which is why
 * the return type is `NonNullable<T>`.
 */
export function at<T>(values: readonly T[], index: number): NonNullable<T> {
	if (!Number.isInteger(index) || index < 0 || index >= values.length) {
		throw new RangeError(
			`Index ${index} is out of bounds for array of length ${values.length}`,
		);
	}

	// `noUncheckedIndexedAccess` types the read as `T | undefined`; the bounds
	// check above ruled out an out-of-bounds index, so a missing value here
	// means the element type itself contains `undefined`/`null`. Rejecting it is
	// what makes the `NonNullable<T>` return type honest.
	const value = values[index];
	if (value === undefined || value === null) {
		throw new RangeError(
			`Element at index ${index} of array of length ${values.length} is missing`,
		);
	}

	// The narrowing above is a type-level fact, so return `value` itself instead
	// of asserting `value as NonNullable<T>`.
	return value;
}
