# Phase 1 Review — Implementation Plan

Source: `docs/review-phase1.md`. This plan covers only the findings that are
valid and actionable for the current codebase. Each item follows the project's
TDD convention: **write the failing tests first, then implement**, then
`npm run test`, `npm run typecheck`, `npm run lint`.

A note on scope: findings #2, #4, and #6 partly overlap. They are grouped under
a single "validate numeric boundaries" workstream below, but each file gets its
own test additions.

---

## Workstream A — `isPrime()` must not hang or misjudge non-finite input

**Valid.** `isPrime` is called at the top of `assertPrime`, which is called by
`asPrime`, `asModulus`, and `assertPrime` itself. A hang on `Infinity` (or a
wrong `true` on `NaN`/`4.5`) therefore corrupts every branded constructor. This
is the highest-leverage fix.

**Files:** `shared/math/number-theory.ts`, `shared/math/number-theory/isPrime.test.ts`

Steps:
1. Add tests to `isPrime.test.ts`:
   - `isPrime(NaN)` → `false`
   - `isPrime(Infinity)` / `isPrime(-Infinity)` → `false`
   - `isPrime(4.5)` → `false`
   - `isPrime(9007199254740993)` (> `Number.MAX_SAFE_INTEGER`) → `false`
   - keep existing prime/composite/negative/small-case tests passing.
2. Replace the body of `isPrime` with the safe-integer guard and division-based
   loop bound:
   ```ts
   export function isPrime(n: number): boolean {
       if (!Number.isSafeInteger(n) || n < 2) return false;
       if (n <= 3) return true;
       if (n % 2 === 0 || n % 3 === 0) return false;
       for (let i = 5; i <= n / i; i += 6) {
           if (n % i === 0 || n % (i + 2) === 0) return false;
       }
       return true;
   }
   ```
   The `i <= n / i` bound avoids `i * i` overflow for large primes.
3. Re-run tests + typecheck.

---

## Workstream B — Physical-unit constructors must reject non-finite values

**Valid.** `asFrequency`, `asAcousticResistance`, `asFlowResistivity`,
`asSurfaceResistance` only compare magnitude (`n <= 0` / `n < 0`), so
`NaN` and `±Infinity` pass through and silently poison downstream calcs. The
integer constructors (`assertInteger`, etc.) already use `Number.isInteger`,
which rejects `NaN`/`Infinity` — only the four unit constructors are exposed.

**Files:** `shared/math/helpers.ts`, `shared/math/helpers.test.ts`

Steps:
1. Add `Number.isFinite(n)` to the guard of each of the four constructors:
   - `asFrequency`: `!Number.isFinite(n) || n <= 0`
   - `asAcousticResistance`: `!Number.isFinite(n) || n <= 0`
   - `asFlowResistivity`: `!Number.isFinite(n) || n <= 0`
   - `asSurfaceResistance`: `!Number.isFinite(n) || n < 0`
   (keep the existing range semantics; `asSurfaceResistance` still allows `0`.)
2. Extend `helpers.test.ts` with `describe` blocks for the four constructors
   asserting `toThrow(RangeError)` for `NaN`, `Infinity`, `-Infinity` (and `0`
   / negatives where the range forbids them) and `not.toThrow` for valid values.
3. Re-run tests + typecheck.

---

## Workstream C — PRD sequence must validate its primitive root

**Valid.** `generatePRDSequence(p, g)` only checks `isPrime(p)`. A non-primitive
root (e.g. `g = 1`, `g = p`, `g = 0`) yields a degenerate/all-ones sequence with
no error. `isPrimitiveRoot(p, g)` already exists and is the correct validator.

**Files:** `shared/math/sequences.ts`, `shared/math/sequences.test.ts`

Steps:
1. Add tests to `sequences.test.ts`:
   - `generatePRDSequence(7, 3)` returns `p` distinct values covering `1..p-1`
     (valid primitive root sanity check).
   - `generatePRDSequence(7, 1)` throws `RangeError`.
   - `generatePRDSequence(7, 0)`, `generatePRDSequence(7, 7)`, negative `g`,
     fractional `g` → `RangeError`.
   - keep existing QRD/PRD tests passing.
2. In `generatePRDSequence`, validate `g` before the loop:
   ```ts
   if (!isPrimitiveRoot(p, g)) {
       throw new RangeError(`g must be a primitive root modulo ${p}`);
   }
   ```
3. Re-run tests + typecheck.

---

## Workstream D — `modPow()` must validate its exponent

**Valid.** A negative exponent makes the loop body never run and returns `1`,
which is wrong for modular exponentiation. The exponent is used in
`generatePRDSequence` (now guarded by C) and internally by
`hasFullMultiplicativeOrder`, but the public function should still enforce its
contract.

**Files:** `shared/math/number-theory.ts`, `shared/math/number-theory/*.test.ts`
(the existing tests live under the `number-theory/` directory)

Steps:
1. Add tests for `modPow`:
   - negative exponent → throws
   - fractional / `NaN` / `Infinity` exponent → throws
   - `modPow(base, 0, m)` → `1 % m` behaviour unchanged
   - keep existing residue/primitive tests passing.
2. Guard the top of `modPow`:
   ```ts
   if (!Number.isSafeInteger(exp) || exp < 0) {
       throw new RangeError("exp must be a non-negative integer");
   }
   ```
   (Modulus is already `PositiveIntegerLike`-branded at the type level; runtime
   guard is optional — leave as-is to avoid redundant work on the hot path.)
3. Re-run tests + typecheck.

---

## Workstream E — Prime-factorization boundaries

**Valid.** `getPrimeFactors` checks `n < 1` but not finiteness/integer-ness, so
`Infinity` runs the trial-division loop indefinitely and `NaN`/fractions behave
nonsensically. The `PositiveInteger` brand only guards at compile time.

**Files:** `shared/math/factors.ts`, `shared/math/factors.test.ts`

Steps:
1. Add tests:
   - `getPrimeFactors(Infinity)` / `NaN` / `2.5` → `RangeError` (or a bounded
     throw), `getPrimeFactors(1)` → `[]`, `getPrimeFactors(MAX_SAFE_INTEGER)`
     (prime) → `[MAX_SAFE_INTEGER]`.
2. Prepend `if (!Number.isSafeInteger(n) || n < 1) throw new RangeError(...)`.
3. Re-run tests + typecheck.

---

## Workstream F — Public acoustic calculation contract (design decision, not blanket checks)

**Partially valid — implement as a decision, not as redundant guards.** The
review itself warns against adding repetitive checks to every internal function.
In the current code:

- `calculateWavelength`, `quarterWavelength`, `halfWavelength` accept a branded
  `Frequency`; `designUnitDepth` accepts branded `Frequency` + `Prime`. Those
  brands are produced by `asFrequency`/`asPrime` (fixed in B/A), so invalid
  values already cannot enter through the public API today.
- `designUnitDepth`'s manual `frequency <= 0` check is **redundant** with
  `asFrequency` and should be removed to avoid duplicated, inconsistent logic.

Decision:
1. Remove the redundant `if (frequency <= 0)` guard in `shared/acoustics/design.ts`
   (document in the JSDoc that inputs are validated branded values).
2. Do **not** add NaN/finiteness checks into `calculateWavelength` etc. The
   validation contract lives in the constructors (Workstreams A + B). Update the
   JSDoc on the public acoustics functions to state: "parameters are validated
   branded values; construction via `as*` enforces finiteness and ranges."
3. Add one integration test in `shared/acoustics/design.test.ts` asserting that
   constructing via `asFrequency(NaN)` throws before `designUnitDepth` is even
   reached — this locks the "validate at the boundary" contract.

---

## Broader engineering assessment — actionable items

### DX: project identity (valid)
`package.json` name is `"nuxt-app"` and `README.md` still reads "Nuxt Minimal
Starter" with Nuxt starter instructions.

Steps:
1. Rename the package to the project name (e.g. `"a-acoustics"`) in
   `package.json`.
2. Rewrite `README.md`: project purpose, setup (`npm install`, `npm run dev`,
   `npm run test`, `npm run typecheck`), brief architecture note pointing at
   `shared/` and `docs/`, and a diffuser-types overview linking `docs/`.

### Testing: invalid-input + integration coverage (valid, incremental)
- Covered by Workstreams A–E (invalid-input unit tests).
- Add an integration test verifying a full QRD and PRD design round-trips
  through `shared/design/qrd.test.ts` / `prd.test.ts` with validated inputs and
  rejects invalid ones — extend existing design tests rather than create a new
  suite.

### Acoustic correctness: verify formulas against references (valid, needs research)
Not a code change yet — it requires sourcing authoritative references for:
- wavelength = `c / f` (c = speed of sound; confirm the constant in
  `shared/acoustics/constants.ts`),
- QRD unit depth = `λ₀ / (2p)`,
- the diffuser design-frequency convention.

Steps:
1. Identify 1–2 authoritative references (e.g. Anderson & Sifford, *Acoustic
   Diffusion Designs*; ISO 17200 for diffusion coefficient).
2. Add reference-value tests in `shared/acoustics/response.test.ts` /
   `design.test.ts` asserting the formulas reproduce known numbers within a
   tolerance.
3. Only after confirmation, treat any deviation as a bug fix.

### Property-based / reference-value tests (valid, optional)
- Consider adding a small property test: for prime `p`, `generateQRDSequence(p)`
  has length `p` and all values in `[0, p-1]`; for a valid primitive root `g`,
  `generatePRDSequence(p, g)` is a permutation of `[0, p-1]`. Use `vitest`'s
  built-in or `fast-check` if adopted. Low priority; only if time permits.

### Preserve architecture boundaries (no action)
The math / geometry / acoustics / design separation is sound. Keep it as new
diffuser types (poly, skyline, Helmholtz, abfusor) are added — this is a
maintenance guideline, not a task.

---

## Suggested execution order
1. Workstream A (isPrime) — unblocks everything that brands a value.
2. Workstream B (unit constructors).
3. Workstream E (factors) — same validation pattern, quick.
4. Workstream C (PRD) and D (modPow).
5. Workstream F (acoustic contract decision).
6. DX README/package rename.
7. Acoustic-reference verification and property tests last (research-dependent).
