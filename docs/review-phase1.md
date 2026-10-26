Review findings

I inspected the current math, geometry, and acoustics implementation, including the QRD/PRD sequence generators and branded physical-unit helpers. These are the main issues I would address first.

1. High priority — isPrime() can hang on Infinity

File: shared/math/number-theory.ts, lines 9–16

The primality check doesn't reject non-finite or non-integer inputs before entering its trial-division algorithm.
GitHub
ts

export function isPrime(n: number): boolean {
    if (n <= 1) return false;
    // ...
    for (let i = 5; i * i <= n; i += 6) {
        // ...
    }
    return true;
}

Why it matters:

    isPrime(4.5) can return true.

    isPrime(NaN) returns true.

    isPrime(Infinity) never terminates because i * i <= Infinity remains true.

Since this function is used to validate diffuser parameters, malformed input can result in incorrect results or a blocked execution thread.

Recommended fix:
ts

export function isPrime(n: number): boolean {
    if (!Number.isSafeInteger(n) || n < 2) {
        return false;
    }

    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;

    for (let i = 5; i <= n / i; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) {
            return false;
        }
    }

    return true;
}

The safe-integer check rejects NaN, infinity, fractions, and integers outside JavaScript's precisely representable integer range. The division-based loop condition also avoids overflowing i * i.
2. High priority — Physical-unit constructors accept invalid numeric values

File: shared/math/helpers.ts, lines 117–163

The constructors asFrequency(), asAcousticResistance(), asFlowResistivity(), and asSurfaceResistance() use comparisons to validate their inputs, but do not reject non-finite values.
GitHub

For example:
ts

export function asFrequency(n: number): Frequency {
    if (n <= 0) {
        throw new RangeError(
            `Value ${n} must be a positive number.`,
        );
    }
    return n as Frequency;
}

Both asFrequency(NaN) and asFrequency(Infinity) pass this validation. The same problem affects the other constructors mentioned above.

Why it matters: These branded types are intended to enforce valid physical quantities. Once invalid numbers enter the calculation pipeline, results can silently become NaN or infinity and propagate into generated designs.

Recommended fix: Require Number.isFinite(n) in addition to the appropriate range check. For example:
ts

export function asFrequency(n: number): Frequency {
    if (!Number.isFinite(n) || n <= 0) {
        throw new RangeError(
            `Value ${n} must be a finite, positive frequency.`,
        );
    }

    return n as Frequency;
}

Apply the corresponding finite-value validation to the other physical-unit constructors, and add tests for NaN, positive infinity, negative infinity, zero, and negative values.
3. Medium priority — PRD sequence generation doesn't validate its primitive root

File: shared/math/sequences.ts, lines 20–39

generatePRDSequence(p, g) checks whether p is prime but doesn't check whether g is a primitive root modulo p.
GitHub
+1
ts

export function generatePRDSequence(
    p: Prime,
    g: number,
): number[] {
    if (!isPrime(p)) {
        throw new Error("p must be a prime number");
    }

    const sequence: number[] = [];

    for (let i = 0; i < p; i++) {
        sequence.push(modPow(g, i, p));
    }

    return sequence;
}

For example, generatePRDSequence(7, 2) happens to use a valid primitive root, but generatePRDSequence(7, 1) produces a sequence of all ones rather than a full-period PRD sequence.

Recommended fix: Validate g using the existing isPrimitiveRoot(p, g) function before generating the sequence. Reject invalid inputs with a clear RangeError.

Also test g = 0, g = 1, g = p, negative values, and non-integers.
4. Medium priority — modPow() doesn't validate its exponent

File: shared/math/number-theory.ts, lines 68–83

The modular exponentiation implementation assumes that the exponent is a non-negative integer but never enforces that assumption.
GitHub

For a negative exponent, the loop never executes and the function returns 1, which is generally not the correct modular exponentiation result.

Recommended fix: Validate that exp is a non-negative safe integer before running the algorithm. Also validate the modulus at runtime if this function can be called with untrusted or unvalidated values.

Add tests for negative, fractional, NaN, and infinite exponents.
5. Medium priority — Physical calculations rely on callers to enforce valid inputs

Files: shared/acoustics/frequency.ts, shared/acoustics/design.ts, shared/acoustics/qrd-physics.ts

The core calculations are straightforward, but validation is inconsistent across the public functions. For example, calculateWavelength() divides the speed of sound by a frequency without checking it, while designUnitDepth() checks only whether the frequency is less than or equal to zero. Neither check rejects NaN.
GitHub
+2

This means invalid values can bypass validation and produce nonsensical physical dimensions.

Recommended fix:

    Establish a consistent contract for public calculation functions.

    Validate physical inputs at API boundaries, including finiteness and valid ranges.

    Decide whether low-level functions should validate independently or explicitly require validated branded values.

    Test boundary conditions such as zero frequency, negative frequency, and non-finite values.

I would avoid adding repetitive checks to every internal function if the architecture guarantees validated inputs. The important part is making that guarantee explicit and reliable.
6. Medium priority — Prime factorization also has unsafe numeric boundaries

File: shared/math/factors.ts, lines 8–34

getPrimeFactors() checks n < 1, but that condition alone doesn't establish that n is a finite positive integer.
GitHub

The branded parameter helps prevent accidental misuse at compile time, but callers can still pass invalid values from JavaScript, external inputs, or type assertions.

Recommended fix: Validate with Number.isSafeInteger(n) && n > 0 before factorization. This also prevents pathological cases such as Infinity, which can cause the trial-division loop to run indefinitely.

Add tests for 1, ordinary primes, composite numbers, NaN, infinity, fractional values, and values outside the safe-integer range.
Broader engineering assessment

Beyond the individual defects, I would address these points as the project develops.

Area
 
Assessment
 
Recommendation

Type safety
 
Branded units are a good foundation, but brands alone don't validate runtime values.
 
Centralize validation and use constructors consistently.

Mathematical correctness
 
The number-theory functions are small and understandable, but input contracts need tightening.
 
Add property-based tests and reference-value tests.

Acoustic correctness
 
The wavelength and QRD depth formulas are easy to follow.
 
Verify expected results against established acoustic references, including the conventions used for diffuser design frequency.

Architecture
 
The separation between mathematics, geometry, acoustics, and design coordination is sensible.
 
Preserve these boundaries as additional diffuser types are introduced.

Testing
 
Vitest and a dedicated test suite are configured.
 
Ensure invalid-input cases, integration tests, and CI execution are covered.

Developer experience
 
The package still identifies itself as nuxt-app, and the README contains the Nuxt starter instructions.
 
Replace these with the project name, actual setup instructions, examples, and test commands.

The architecture and test-oriented approach are documented in the repository's implementation notes.
