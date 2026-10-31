import { calculateMaxDepth, calculateUnitDepth } from "@acoustics/qrd-physics";
import { toLength } from "@geometry/scaling";
import { asPrime } from "@math/helpers";
import { m } from "@units/units";
import { describe, expect, it } from "vitest";

describe("QRD calculateMaxDepth", () => {
	it("equals the largest residue reached times the unit depth", () => {
		const lambda = m; // 1 m wavelength

		// p = 7: residues {0,1,2,4}; deepest well 4 × λ/(2·7) = 4/14. The bound
		// (p - 1) × λ/(2p) = 6/14 does not apply: p - 1 = 6 is a non-residue.
		// p = 11: residues {0,1,3,4,5,9}; deepest well 9 × λ/(2·11) = 9/22.
		// p = 3: residues {0,1}; deepest well 1 × λ/(2·3) = 1/6.
		expect(calculateMaxDepth(lambda, asPrime(7))).toBeCloseTo(4 / 14, 10);
		expect(calculateMaxDepth(lambda, asPrime(11))).toBeCloseTo(9 / 22, 10);
		expect(calculateMaxDepth(lambda, asPrime(3))).toBeCloseTo(1 / 6, 10);
	});

	it("attains the closed-form bound ((p - 1) * lambda) / (2p) iff -1 is a residue", () => {
		// p ≡ 1 (mod 4) ⇒ p - 1 ≡ -1 is a quadratic residue, so the bound is the
		// deepest well (p = 5: 4/10, p = 13: 12/26, p = 17: 16/34).
		const lambda = m;

		for (const p of [asPrime(5), asPrime(13), asPrime(17)]) {
			// The bound is (p - 1) times the unit depth.
			// `m` and the result are both Length (value 1), so this is (p - 1) × λ/(2p).
			const bound = Number(p - 1) * calculateUnitDepth(lambda, p);

			expect(calculateMaxDepth(lambda, p)).toBeCloseTo(bound, 10);
		}
	});

	it("stays strictly below the bound when p ≡ 3 (mod 4)", () => {
		// p - 1 is a non-residue, so ((p - 1) * λ)/(2p) overestimates the
		// deepest well (e.g. p = 7: bound 6/14 vs. actual 4/14).
		const lambda = m;

		for (const p of [asPrime(3), asPrime(7), asPrime(11)]) {
			const bound = Number(p - 1) * calculateUnitDepth(lambda, p);

			expect(calculateMaxDepth(lambda, p)).toBeLessThan(bound);
		}
	});

	it("is always less than the design wavelength", () => {
		const lambda = m;

		// R_max ≤ p - 1 < 2p, so depth < λ; p = 2 (residues {0,1}) is the
		// smallest admissible prime.
		for (const p of [asPrime(2), asPrime(3), asPrime(7), asPrime(97)]) {
			// Length is a branded number, so the comparison is numeric.
			expect(calculateMaxDepth(lambda, p)).toBeLessThan(lambda);
		}
	});

	it("approaches half the design wavelength as the prime increases", () => {
		// R_max ∈ {p - 1, p - 2, p - 3}, so R_max/(2p) → 1/2 from below.
		const lambda = m;

		const small = calculateMaxDepth(lambda, asPrime(5));
		const large = calculateMaxDepth(lambda, asPrime(97));

		expect(large).toBeGreaterThan(small);
		// Half the wavelength as a plain number; the depth stays below it.
		// lambda === 1, so this is 0.5 (96/194 ≈ 0.4948).
		const halfLambda = Number(lambda) / 2;
		expect(large).toBeLessThan(halfLambda);
	});

	it("scales linearly with the wavelength", () => {
		// Non-unit wavelengths only: with λ = m = 1 the scaling identity
		// degenerates into comparing a value with itself.
		// 686 Hz ⇒ λ₀ = 343/686 = 0.5 m; 0.686 m keeps float noise visible.
		const unitLambda = m;
		const scaledLambda = toLength(0.686, m);
		const p = asPrime(7);

		const scaled = calculateMaxDepth(scaledLambda, p);
		const atUnit = Number(calculateMaxDepth(unitLambda, p));

		expect(scaled).toBeCloseTo(0.686 * atUnit, 10);
	});

	it("returns a positive depth", () => {
		// For p ≥ 2, 1 is always a residue, so the maximum depth is positive.
		// This checks magnitude only; the Length brand is a compile-time
		// distinction that is erased at runtime.
		const result = calculateMaxDepth(m, asPrime(7));

		expect(result).toBeGreaterThan(0);
	});
});
