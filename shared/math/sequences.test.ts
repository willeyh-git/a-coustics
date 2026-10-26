import { asPrime } from "@math/helpers";
import { findPrimitiveRoot, modPow } from "@math/number-theory";
import { generatePRDSequence, generateQRDSequence } from "@math/sequences";
import { describe, expect, it } from "vitest";

describe("generateQRDSequence", () => {
	describe("Core correctness", () => {
		it("should generate the correct QRD sequence for p=7", () => {
			expect(generateQRDSequence(asPrime(7))).toEqual([0, 1, 4, 2, 2, 4, 1]);
		});

		it("should generate correct sequences for other small primes", () => {
			expect(generateQRDSequence(asPrime(3))).toEqual([0, 1, 1]);
			expect(generateQRDSequence(asPrime(5))).toEqual([0, 1, 4, 4, 1]);
			expect(generateQRDSequence(asPrime(11))).toEqual([
				0, 1, 4, 9, 5, 3, 3, 5, 9, 4, 1,
			]);
		});

		it("should work for larger primes", () => {
			const p = 13;
			const sequence = generateQRDSequence(asPrime(p));
			expect(sequence.length).toBe(13);
			expect(sequence[1]).toBe(1);
			expect(sequence[2]).toBe(4);
			expect(sequence[3]).toBe(9);
		});
	});

	describe("Invariants", () => {
		it("should have a length equal to p", () => {
			const p = 13;
			const sequence = generateQRDSequence(asPrime(p));
			expect(sequence.length).toBe(p);
		});

		it("should have all elements within the modular bounds [0, p-1]", () => {
			const p = 17;
			const sequence = generateQRDSequence(asPrime(p));
			sequence.forEach((val) => {
				expect(val).toBeGreaterThanOrEqual(0);
				expect(val).toBeLessThan(p);
			});
		});

		it("should be idempotent (deterministic)", () => {
			const p = 7;
			const first = generateQRDSequence(asPrime(p));
			const second = generateQRDSequence(asPrime(p));
			expect(first).toEqual(second);
		});

		it("should satisfy i^2 mod p definition", () => {
			const p = 11;
			const sequence = generateQRDSequence(asPrime(p));

			const expected = Array.from({ length: p }, (_, i) => (i * i) % p);

			expect(sequence).toEqual(expected);
		});
	});

	describe("Constraints and Validations", () => {
		it("should succeed for prime numbers", () => {
			const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23];
			primes.forEach((p) => {
				expect(() => generateQRDSequence(asPrime(p))).not.toThrow();
			});
		});

		it("should always satisfy sequence[i] === i^2 mod p", () => {
			for (const p of [3, 5, 7, 11, 13]) {
				const seq = generateQRDSequence(asPrime(p));

				seq.forEach((val, i) => {
					expect(val).toBe((i * i) % p);
				});
			}
		});
	});
});

describe("generatePRDSequence", () => {
	describe("Core correctness", () => {
		it("should generate the correct PRD sequence for p=7 with primitive root 3", () => {
			expect(generatePRDSequence(asPrime(7), 3)).toEqual([1, 3, 2, 6, 4, 5, 1]);
		});

		it("should generate correct sequences for other small primes and roots", () => {
			expect(generatePRDSequence(asPrime(2), 1)).toEqual([1, 1]);
			expect(generatePRDSequence(asPrime(3), 2)).toEqual([1, 2, 1]);
			expect(generatePRDSequence(asPrime(5), 2)).toEqual([1, 2, 4, 3, 1]);
		});

		it("should work for larger primes", () => {
			const p = 11;
			const sequence = generatePRDSequence(asPrime(p), 2);
			expect(sequence.length).toBe(11);
			expect(sequence[0]).toBe(1);
			expect(sequence[1]).toBe(2);
			expect(sequence[2]).toBe(4);
		});
	});

	describe("Invariants", () => {
		it("should have a length equal to p", () => {
			const p = 13;
			const sequence = generatePRDSequence(asPrime(p), 2);
			expect(sequence.length).toBe(p);
		});

		it("should have all elements within the modular bounds [0, p-1]", () => {
			const p = 17;
			const sequence = generatePRDSequence(asPrime(p), 3);
			sequence.forEach((val) => {
				expect(val).toBeGreaterThanOrEqual(0);
				expect(val).toBeLessThan(p);
			});
		});

		it("should be idempotent (deterministic)", () => {
			const p = 7;
			const first = generatePRDSequence(asPrime(p), 3);
			const second = generatePRDSequence(asPrime(p), 3);
			expect(first).toEqual(second);
		});
	});

	describe("Constraints and Validations", () => {
		it("should succeed for prime numbers", () => {
			const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23];
			primes.forEach((p) => {
				const prime = asPrime(p);
				expect(() =>
					generatePRDSequence(prime, findPrimitiveRoot(prime)),
				).not.toThrow();
			});
		});

		it("should remain exact for large primes (no floating point drift)", () => {
			const prime = asPrime(97);
			const g = findPrimitiveRoot(prime);
			const sequence = generatePRDSequence(prime, g);

			expect(sequence).toHaveLength(97);
			expect(sequence[0]).toBe(1);
			expect(sequence[96]).toBe(1);

			for (let i = 0; i < 97; i++) {
				expect(sequence[i]).toBe(modPow(g, i, prime));
				expect(sequence[i]).toBeGreaterThanOrEqual(1);
				expect(sequence[i]).toBeLessThan(97);
			}

			// Sequence has period p-1 over i in [0, p-1]: exactly one repeat (last === first).
			expect(new Set(sequence).size).toBe(96);
		});

		it("should work with different primitive roots", () => {
			const p = 7;
			const sequence = generatePRDSequence(asPrime(p), 3);
			expect(sequence).toEqual([1, 3, 2, 6, 4, 5, 1]);
		});
	});
});

describe("generatePRDSequence primitive root validation", () => {
	it("produces values covering 1..p-1 for a valid primitive root", () => {
		const p = 7;
		const sequence = generatePRDSequence(asPrime(p), 3);

		// Sequence has p elements over one period; distinct values cover 1..p-1.
		const distinct = new Set(sequence);
		for (let v = 1; v < p; v++) {
			expect(distinct.has(v)).toBe(true);
		}
		expect(distinct.size).toBe(p - 1);
	});

	it("throws a RangeError for g = 1 (not a primitive root)", () => {
		expect(() => generatePRDSequence(asPrime(7), 1)).toThrow(RangeError);
	});

	it("throws a RangeError for g = 0", () => {
		expect(() => generatePRDSequence(asPrime(7), 0)).toThrow(RangeError);
	});

	it("throws a RangeError for g = p", () => {
		expect(() => generatePRDSequence(asPrime(7), 7)).toThrow(RangeError);
	});

	it("throws a RangeError for negative g", () => {
		expect(() => generatePRDSequence(asPrime(7), -1)).toThrow(RangeError);
	});

	it("throws a RangeError for fractional g", () => {
		expect(() => generatePRDSequence(asPrime(7), 3.5)).toThrow(RangeError);
	});
});

describe("sequence invariants (property-style)", () => {
	const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

	describe("generateQRDSequence", () => {
		it("has length p and all values within [0, p-1] for every prime", () => {
			for (const p of primes) {
				const seq = generateQRDSequence(asPrime(p));

				expect(seq).toHaveLength(p);
				seq.forEach((val) => {
					expect(val).toBeGreaterThanOrEqual(0);
					expect(val).toBeLessThan(p);
					expect(Number.isInteger(val)).toBe(true);
				});
			}
		});

		it("matches i^2 mod p for every index", () => {
			for (const p of primes) {
				const seq = generateQRDSequence(asPrime(p));
				seq.forEach((val, i) => {
					expect(val).toBe((i * i) % p);
				});
			}
		});
	});

	describe("generatePRDSequence", () => {
		it("covers 1..p-1 exactly once (plus one repeat) for a primitive root", () => {
			for (const p of primes) {
				const g = findPrimitiveRoot(asPrime(p));
				const seq = generatePRDSequence(asPrime(p), g);

				expect(seq).toHaveLength(p);

				const counts = new Map<number, number>();
				for (const val of seq) {
					counts.set(val, (counts.get(val) ?? 0) + 1);
				}

				// Period is p-1, so value 1 repeats (i=0 and i=p-1) and every
				// other value in 1..p-1 appears exactly once.
				expect(counts.get(1)).toBe(2);
				for (let v = 2; v < p; v++) {
					expect(counts.get(v)).toBe(1);
				}
			}
		});
	});
});
