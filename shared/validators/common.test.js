import { describe, expect, it } from "vitest";
import { validatePositiveFrequency, validatePositiveLength, validatePositiveVolume, validatePrime, validatePrimitiveRoot, validateRatioInRange, } from "@validators/common";
import { isPrimitiveRoot } from "@math/number-theory";
describe("validatePositiveFrequency", () => {
    it("accepts a positive frequency", () => {
        expect(validatePositiveFrequency(1000)).toEqual({ valid: true });
    });
    it("rejects zero and negatives", () => {
        const zero = validatePositiveFrequency(0);
        const neg = validatePositiveFrequency(-50);
        expect(zero.valid).toBe(false);
        expect(neg.valid).toBe(false);
        if (!zero.valid || !neg.valid) {
            expect(zero.errors[0].field).toBe("frequency");
            expect(neg.errors[0].field).toBe("frequency");
        }
    });
    it("rejects non-numbers", () => {
        expect(validatePositiveFrequency("1000").valid).toBe(false);
        expect(validatePositiveFrequency(null).valid).toBe(false);
        expect(validatePositiveFrequency(NaN).valid).toBe(false);
    });
});
describe("validatePositiveLength", () => {
    it("accepts a positive length", () => {
        expect(validatePositiveLength(0.15)).toEqual({ valid: true });
    });
    it("rejects zero, negatives and non-numbers", () => {
        expect(validatePositiveLength(0).valid).toBe(false);
        expect(validatePositiveLength(-0.1).valid).toBe(false);
        expect(validatePositiveLength(undefined).valid).toBe(false);
    });
});
describe("validatePositiveVolume", () => {
    it("accepts a positive volume", () => {
        expect(validatePositiveVolume(0.002)).toEqual({ valid: true });
    });
    it("rejects non-positive and non-numbers", () => {
        expect(validatePositiveVolume(0).valid).toBe(false);
        expect(validatePositiveVolume("2").valid).toBe(false);
    });
});
describe("validatePrime", () => {
    it("accepts primes", () => {
        for (const p of [2, 3, 5, 7, 11, 13, 101]) {
            expect(validatePrime(p).valid).toBe(true);
        }
    });
    it("rejects non-primes", () => {
        for (const n of [0, 1, 4, 6, 9, 100]) {
            expect(validatePrime(n).valid).toBe(false);
        }
    });
    it("rejects non-integers and non-numbers", () => {
        expect(validatePrime(3.5).valid).toBe(false);
        expect(validatePrime("7").valid).toBe(false);
    });
});
describe("validatePrimitiveRoot", () => {
    it("accepts a genuine primitive root", () => {
        // 3 is a primitive root modulo 7
        expect(validatePrimitiveRoot(7, 3)).toEqual({ valid: true });
    });
    it("rejects a non-primitive root", () => {
        // 2 is not a primitive root modulo 7
        const result = validatePrimitiveRoot(7, 2);
        expect(result.valid).toBe(false);
        if (!result.valid) {
            expect(result.errors[0].field).toBe("primitiveRoot");
        }
    });
    it("tracks the library's own primitive-root predicate", () => {
        for (let g = 1; g < 7; g++) {
            const res = validatePrimitiveRoot(7, g);
            expect(res.valid).toBe(isPrimitiveRoot(7, g));
        }
    });
    it("rejects non-integer inputs", () => {
        expect(validatePrimitiveRoot(7, 2.5).valid).toBe(false);
        expect(validatePrimitiveRoot(7, null).valid).toBe(false);
    });
});
describe("validateRatioInRange", () => {
    it("accepts values inside a closed-open range", () => {
        expect(validateRatioInRange(0, 0, 1)).toEqual({ valid: true });
        expect(validateRatioInRange(0.999, 0, 1)).toEqual({ valid: true });
    });
    it("rejects values below the lower bound", () => {
        expect(validateRatioInRange(-0.01, 0, 1).valid).toBe(false);
    });
    it("rejects values at or above the upper bound", () => {
        expect(validateRatioInRange(1, 0, 1).valid).toBe(false);
        expect(validateRatioInRange(1.5, 0, 1).valid).toBe(false);
    });
    it("reports the field name", () => {
        const result = validateRatioInRange(2, 0, 1);
        if (!result.valid) {
            expect(result.errors[0].field).toBe("ratio");
        }
    });
    it("is a valid ValidationResult in all cases", () => {
        const cases = [
            validateRatioInRange(0.5, 0, 1),
            validateRatioInRange(2, 0, 1),
        ];
        for (const c of cases) {
            expect(typeof c.valid).toBe("boolean");
        }
    });
});
