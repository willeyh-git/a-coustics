import { describe, expect, it } from "vitest";
import { toLength, toFrequency } from "@geometry/scaling";
import { asFlowResistivity } from "@math/helpers";
import { at } from "@utils/at";
import type { Frequency } from "@units/units";
import { Hz, m } from "@units/units";
import {
	calculatePorousAbsorption,
	type PorousMaterial,
} from "@acoustics/materials";

const axis = (freqs: number[]): Frequency[] =>
	freqs.map((f) => toFrequency(f, Hz));

const material = (
	thickness: number,
	flowResistivity: number,
): PorousMaterial => ({
	thickness: toLength(thickness, m),
	flowResistivity: asFlowResistivity(flowResistivity),
});

describe("calculatePorousAbsorption", () => {
	it("keeps every coefficient within the physical [0, 1] range", () => {
		const f = axis([125, 250, 500, 1000, 2000, 4000]);
		const alpha = calculatePorousAbsorption(f, {
			material: material(0.05, 50000),
		});
		expect(alpha).toHaveLength(f.length);
		for (const v of alpha) {
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThanOrEqual(1);
		}
	});

	it("absorbs strongly across the mid and high bands for a thick layer", () => {
		const f = axis([250, 500, 1000, 2000, 4000]);
		const alpha = calculatePorousAbsorption(f, {
			material: material(0.1, 20000),
		});
		// A 10 cm moderate-resistivity layer is an effective absorber.
		expect(Math.max(...alpha)).toBeGreaterThan(0.8);
		expect(alpha[3]).toBeGreaterThan(0.6); // ~1 kHz
	});

	it("absorbs poorly at low frequencies when thin (rigid-backed layer)", () => {
		const f = axis([125, 250, 500, 1000]);
		const alpha = calculatePorousAbsorption(f, {
			material: material(0.01, 20000),
		});
		// A 1 cm rigid-backed layer transmits most low-frequency energy.
		expect(alpha[0]).toBeLessThan(0.05);
	});

	it("absorbs more low-frequency energy as thickness increases", () => {
		const mid = toFrequency(2000, Hz);
		const thin = at(
			calculatePorousAbsorption([mid], {
				material: material(0.02, 40000),
			}),
			0,
		);
		const thick = at(
			calculatePorousAbsorption([mid], {
				material: material(0.06, 40000),
			}),
			0,
		);
		expect(thick).toBeGreaterThan(thin);
		expect(thick).toBeGreaterThan(0.5);
	});

	it("absorbs nothing when the layer thickness is zero", () => {
		const f = axis([250, 500, 1000]);
		const alpha = calculatePorousAbsorption(f, {
			material: material(0, 50000),
		});
		expect(alpha).toEqual([0, 0, 0]);
	});

	it("rejects a non-positive flow resistivity", () => {
		expect(() =>
			calculatePorousAbsorption(axis([500]), { material: material(0.05, 0) }),
		).toThrow(RangeError);
	});

	it("rejects a non-positive thickness", () => {
		expect(() =>
			calculatePorousAbsorption(axis([500]), {
				material: material(-0.01, 50000),
			}),
		).toThrow(RangeError);
	});
});
