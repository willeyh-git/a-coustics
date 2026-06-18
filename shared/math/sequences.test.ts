import { describe, expect, it } from "vitest";
import { generateQRDSequence } from "./sequences";

describe("generateQRDSequence", () => {
	describe("Core correctness", () => {
		it("should generate the correct QRD sequence for p=7", () => {
			expect(generateQRDSequence(7)).toEqual([0, 1, 4, 2, 2, 4, 1]);
		});

		it("should generate correct sequences for other small primes", () => {
			expect(generateQRDSequence(3)).toEqual([0, 1, 1]);
			expect(generateQRDSequence(5)).toEqual([0, 1, 4, 4, 1]);
			expect(generateQRDSequence(11)).toEqual([
				0, 1, 4, 9, 5, 3, 3, 5, 9, 4, 1,
			]);
		});

		it("should work for larger primes", () => {
			const p = 13;
			const sequence = generateQRDSequence(p);
			expect(sequence.length).toBe(13);
			expect(sequence[1]).toBe(1);
			expect(sequence[2]).toBe(4);
			expect(sequence[3]).toBe(9);
		});
	});

	describe("Invariants", () => {
		it("should have a length equal to p", () => {
			const p = 13;
			const sequence = generateQRDSequence(p);
			expect(sequence.length).toBe(p);
		});

		it("should have all elements within the modular bounds [0, p-1]", () => {
			const p = 17;
			const sequence = generateQRDSequence(p);
			sequence.forEach((val) => {
				expect(val).toBeGreaterThanOrEqual(0);
				expect(val).toBeLessThan(p);
			});
		});

		it("should be idempotent (deterministic)", () => {
			const p = 7;
			const first = generateQRDSequence(p);
			const second = generateQRDSequence(p);
			expect(first).toEqual(second);
		});

		it("should satisfy i^2 mod p definition", () => {
			const p = 11;
			const sequence = generateQRDSequence(p);

			const expected = Array.from({ length: p }, (_, i) => (i * i) % p);

			expect(sequence).toEqual(expected);
		});
	});

	describe("Constraints and Validations", () => {
		it("should throw an error if p is not a prime number", () => {
			const nonPrimes = [
				0, 1, 4, 6, 8, 9, 10, 12, 14, 15, 18, 20, 21, 25, 33, 100, 500, 1000,
				-1, -2, -3, -5, -7, -11,
			];
			nonPrimes.forEach((n) => {
				expect(() => generateQRDSequence(n)).toThrow(
					"p must be a prime number",
				);
			});
		});

		it("should succeed for prime numbers", () => {
			const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23];
			primes.forEach((p) => {
				expect(() => generateQRDSequence(p)).not.toThrow();
			});
		});

		it("should always satisfy sequence[i] === i^2 mod p", () => {
			for (const p of [3, 5, 7, 11, 13]) {
				const seq = generateQRDSequence(p);

				seq.forEach((val, i) => {
					expect(val).toBe((i * i) % p);
				});
			}
		});
	});
});
