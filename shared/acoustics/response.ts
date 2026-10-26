import { toFrequency } from "@geometry/scaling";
import type { FrequencyRange, FrequencyResponse } from "@units/core";
import type { Frequency } from "@units/units";
import { Hz } from "@units/units";
import { at } from "@utils/at";

/**
 * ISO 266 preferred third-octave band center frequencies (Hz).
 *
 * These are the standard ISO 266 nominal centers (rounded `1000·10^(n/10)`),
 * spanning 10 Hz to 20 kHz.
 */
export const THIRD_OCTAVE_BAND_CENTERS_HZ: readonly number[] = [
	10, 12.5, 16, 20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400,
	500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000,
	10000, 12500, 16000, 20000,
];

/**
 * ISO 266 preferred octave band center frequencies (Hz).
 *
 * The octave series is every third member of the third-octave series, i.e. the
 * nominal centers `f_c = 1000·10^(m/3)`.
 */
export const OCTAVE_BAND_CENTERS_HZ: readonly number[] = [
	25, 31.5, 50, 63, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000,
	1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000,
	20000,
];

/**
 * Build a logarithmically spaced frequency axis from `center / 3` to
 * `center * 3`, the default sweep used by the design modules when no explicit
 * axis is supplied.
 *
 * @param center - The geometric center of the axis.
 * @param points - Number of samples (must be at least 2).
 */
export function generateFrequencyAxis(
	center: Frequency,
	points = 400,
): Frequency[] {
	if (points < 2) {
		throw new RangeError(`points must be at least 2 (got ${points})`);
	}
	const c = Number(center);
	const lo = c / 3;
	const hi = c * 3;
	const axis: Frequency[] = [];
	for (let i = 0; i < points; i = i + 1) {
		const t = i / (points - 1);
		const f = lo * (hi / lo) ** t;
		axis.push(toFrequency(f, Hz));
	}
	return axis;
}

/**
 * Band edges for a center frequency. An octave band spans
 * `[f/√2, f·√2]`; a third-octave band spans `[f·10^(-1/20), f·10^(1/20)]`.
 */
function octaveEdges(center: number): [number, number] {
	const spread = Math.SQRT2;
	return [center / spread, center * spread];
}

function thirdOctaveEdges(center: number): [number, number] {
	const spread = 10 ** (1 / 20);
	return [center / spread, center * spread];
}

/**
 * Brand-centered-band centers (Hz) whose band interval overlaps `[min, max]`,
 * returned as sorted `Frequency` values.
 */
function bandCentersInRange(
	centers: readonly number[],
	edges: (center: number) => [number, number],
	range: FrequencyRange,
): Frequency[] {
	const min = Number(range.min);
	const max = Number(range.max);
	const result: Frequency[] = [];
	for (const center of centers) {
		const [lo, hi] = edges(center);
		// A band is kept when its interval touches the analysis range.
		if (lo <= max && hi >= min) {
			result.push(toFrequency(center, Hz));
		}
	}
	return result;
}

/**
 * Octave band center frequencies (Hz) overlapping the given range, branded.
 */
export function octaveBandCenters(range: FrequencyRange): Frequency[] {
	return bandCentersInRange(OCTAVE_BAND_CENTERS_HZ, octaveEdges, range);
}

/**
 * Third-octave band center frequencies (Hz) overlapping the given range,
 * branded.
 */
export function thirdOctaveBandCenters(range: FrequencyRange): Frequency[] {
	return bandCentersInRange(
		THIRD_OCTAVE_BAND_CENTERS_HZ,
		thirdOctaveEdges,
		range,
	);
}

/**
 * Nearest band center by linear distance — every sample lands in exactly one
 * band. Ties resolve to the lower center.
 */
function nearestBandCenter(value: number, centers: readonly number[]): number {
	let bestCenter: number | undefined;
	let bestDistance = Infinity;
	for (const center of centers) {
		const distance = Math.abs(value - center);
		if (distance < bestDistance) {
			bestCenter = center;
			bestDistance = distance;
		}
	}
	if (bestCenter === undefined) {
		throw new RangeError("no band centers available");
	}
	return bestCenter;
}

/**
 * Aggregate a finely-sampled response into octave bands.
 *
 * Each sample is assigned to its nearest octave band center; the band value is
 * the arithmetic mean of the samples it contains. Bands with no samples are
 * omitted. Returns a {@link FrequencyResponse} whose `frequencies` are the
 * populated band centers and whose `values` are the per-band means.
 */
export function generateOctaveBands(
	response: FrequencyResponse,
): FrequencyResponse {
	return aggregateBands(response, OCTAVE_BAND_CENTERS_HZ);
}

/**
 * Aggregate a finely-sampled response into third-octave bands. See
 * {@link generateOctaveBands} for the aggregation semantics.
 */
export function generateThirdOctaveBands(
	response: FrequencyResponse,
): FrequencyResponse {
	return aggregateBands(response, THIRD_OCTAVE_BAND_CENTERS_HZ);
}

function aggregateBands(
	response: FrequencyResponse,
	centers: readonly number[],
): FrequencyResponse {
	const sums = new Map<number, { sum: number; count: number }>();
	for (let i = 0; i < response.frequencies.length; i = i + 1) {
		// Both arrays are produced together with equal length; the read is
		// guaranteed in bounds, so use `at` (which throws on the impossible case)
		// rather than leaving the value unbranded under noUncheckedIndexedAccess.
		const frequency = at(response.frequencies, i);
		const value = at(response.values, i);
		const center = nearestBandCenter(Number(frequency), centers);
		const bucket = sums.get(center);
		if (bucket === undefined) {
			sums.set(center, { sum: value, count: 1 });
		} else {
			bucket.sum = bucket.sum + value;
			bucket.count = bucket.count + 1;
		}
	}

	const frequencies: Frequency[] = [];
	const values: number[] = [];
	for (const [center, { sum, count }] of sums) {
		frequencies.push(toFrequency(center, Hz));
		values.push(sum / count);
	}
	return { frequencies, values };
}
