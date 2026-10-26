import {
	generateFrequencyAxis,
	generateOctaveBands,
	generateThirdOctaveBands,
	OCTAVE_BAND_CENTERS_HZ,
	octaveBandCenters,
	THIRD_OCTAVE_BAND_CENTERS_HZ,
	thirdOctaveBandCenters,
} from "@acoustics/response";

import { toFrequency } from "@geometry/scaling";
import type { FrequencyRange } from "@units/core";
import type { Frequency } from "@units/units";
import { Hz } from "@units/units";
import { describe, expect, it } from "vitest";

const F = (hz: number): Frequency => toFrequency(hz, Hz);

describe("generateFrequencyAxis", () => {
	it("spans from center/3 to center*3 logarithmically", () => {
		const axis = generateFrequencyAxis(F(900), 400);
		expect(axis).toHaveLength(400);
		expect(Number(axis[0])).toBeCloseTo(300, 6); // 900 / 3
		expect(Number(axis[axis.length - 1])).toBeCloseTo(2700, 6); // 900 * 3
	});

	it("is strictly increasing with a constant per-step log ratio", () => {
		const points = 100;
		const axis = generateFrequencyAxis(F(600), points);
		const expectedRatio =
			(Number(axis[axis.length - 1]) / Number(axis[0])) ** (1 / (points - 1));
		for (let i = 1; i < axis.length; i = i + 1) {
			const ratio = Number(axis[i]) / Number(axis[i - 1]);
			expect(ratio).toBeCloseTo(expectedRatio, 6);
		}
	});

	it("throws when fewer than two points are requested", () => {
		expect(() => generateFrequencyAxis(F(1000), 1)).toThrow(RangeError);
	});
});

describe("octaveBandCenters / thirdOctaveBandCenters", () => {
	it("exposes the ISO 266 preferred frequencies", () => {
		expect(THIRD_OCTAVE_BAND_CENTERS_HZ[0]).toBe(10);
		expect(THIRD_OCTAVE_BAND_CENTERS_HZ).toContain(3150);
		expect(OCTAVE_BAND_CENTERS_HZ).toContain(1000);
		expect(OCTAVE_BAND_CENTERS_HZ).toContain(4000);
	});

	it("includes bands whose interval overlaps the range and excludes others", () => {
		const range: FrequencyRange = { min: F(100), max: F(400) };
		const centers = octaveBandCenters(range).map((c) => Number(c));
		// A full octave is wide ([f/√2, f·√2]), so many adjacent centers qualify.
		for (const keep of [100, 200, 400]) {
			expect(centers).toContain(keep);
		}
		// 50 Hz band tops out below 100 Hz; 800 Hz band starts above 400 Hz.
		for (const skip of [50, 800]) {
			expect(centers).not.toContain(skip);
		}
	});

	it("only keeps the single octave band touching a narrow span", () => {
		const range: FrequencyRange = { min: F(130), max: F(140) };
		const centers = octaveBandCenters(range).map((c) => Number(c));
		// 125-band [~88,~177] spans 130..140; 100-band tops at ~141 (borderline),
		// 160-band starts at ~113 — assert the unambiguous members.
		expect(centers).toContain(125);
		expect(centers).not.toContain(80);
		expect(centers).not.toContain(250);
	});

	it("returns a single third-octave band for a tight range", () => {
		const range: FrequencyRange = { min: F(123), max: F(127) };
		expect(thirdOctaveBandCenters(range).map((c) => Number(c))).toEqual([125]);
	});
});

describe("generateOctaveBands", () => {
	it("aggregates each sample into its nearest octave band", () => {
		// Avoid equidistant ties: pick samples clearly inside one band each.
		const response = {
			frequencies: [F(95), F(105), F(185), F(215), F(790), F(810)],
			values: [0.1, 0.3, 0.2, 0.4, 0.7, 0.9],
		};
		const bands = generateOctaveBands(response);
		// band 100: mean(0.1, 0.3) = 0.2 ; 200: mean(0.2, 0.4) = 0.3 ; 800: 0.8
		expect(bands.frequencies.map((c) => Number(c))).toEqual([100, 200, 800]);
		// Averaged values are compared with tolerance for floating-point noise.
		expect(bands.values[0]).toBeCloseTo(0.2, 6);
		expect(bands.values[1]).toBeCloseTo(0.3, 6);
		expect(bands.values[2]).toBeCloseTo(0.8, 6);
	});

	it("omits bands that contain no samples", () => {
		const bands = generateOctaveBands({
			frequencies: [F(110), F(820)],
			values: [0.2, 0.8],
		});
		expect(bands.frequencies.map((c) => Number(c))).toEqual([100, 800]);
	});

	it("returns band centers as branded Frequency values", () => {
		const bands = generateOctaveBands({
			frequencies: [F(110)],
			values: [0.5],
		});
		// A brand is a phantom type; at runtime it is a number, so assert the
		// numeric value rather than typeof (which the repo forbids for brands).
		expect(bands.frequencies[0]).toBe(100);
	});
});

describe("generateThirdOctaveBands", () => {
	it("aggregates samples into their nearest third-octave band", () => {
		const response = {
			frequencies: [F(118), F(132), F(1600)],
			values: [0.1, 0.3, 0.9],
		};
		const bands = generateThirdOctaveBands(response);
		// 118 and 132 are both nearest to 125 ; 1600 stands alone.
		expect(bands.frequencies.map((c) => Number(c))).toEqual([125, 1600]);
		expect(bands.values).toEqual([0.2, 0.9]);
	});

	it("omits empty bands", () => {
		const bands = generateThirdOctaveBands({
			frequencies: [F(630)],
			values: [0.6],
		});
		expect(bands.frequencies.map((c) => Number(c))).toEqual([630]);
	});

	it("assigns a sample by the exact ISO band edge, not a linear midpoint", () => {
		// The 100 Hz third-octave band upper edge is 100 * 10^(1/20) ~= 112.2 Hz.
		// A sample at 112.5 Hz sits just past that edge, so it belongs to the 125
		// Hz band even though it is arithmetically closer to 100 than to 125.
		// Pure nearest-center (linear) distance would mis-assign it to 100.
		const bands = generateThirdOctaveBands({
			frequencies: [F(112.5)],
			values: [0.42],
		});
		expect(bands.frequencies.map((c) => Number(c))).toEqual([125]);
		expect(bands.values[0]).toBeCloseTo(0.42, 6);
	});
});
