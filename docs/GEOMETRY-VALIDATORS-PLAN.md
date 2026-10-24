# Geometry & Validators Implementation Plan

Supersedes / refines the corresponding sections of `shared/pre-plan.md`
(Phases 2 and the "Validation Philosophy"). This plan is the concrete,
TDD-ready spec for the two architecture areas that are defined but not yet
implemented:

- **Shared geometry** — panel width / height / area / volume and the QRD
  well-width rule.
- **Validators** — structured, non-throwing validation for every panel type.

## Why these two first

Both are foundational shared layers that every `shared/design/*` module
depends on, and both are currently missing or non-conformant:

1. No panel-dimension geometry exists, so a design cannot report the physical
   size of the panel it produces.
2. The plan's *Validation Philosophy* ("User errors are never thrown") is not
   implemented anywhere. The design functions currently `throw RangeError`
   for user errors (non-prime order, bad primitive root, out-of-range ratio),
   which violates that rule. Validators restore conformance.

Status of the rest of the roadmap (all 9 phases): complete. This work is
additive — it does not change existing design outputs.

---

## Conventions (already in place — keep them)

- Branded physical types in `shared/types/units.ts`: `Length`, `Area`,
  `Volume`, `Frequency`, `Prime`, … No `any`.
- The **only** raw-number → branded conversion is in
  `shared/geometry/scaling.ts` (`toLength`, `toArea`, `toVolume`, …). New
  geometry code uses these, never `as Length` directly.
- Layering: geometry takes already-computed acoustics values (unit depth,
  well width) and turns counts + scalars into physical sizes. It does not do
  acoustic performance math.
- Import aliases: `@geometry/*` → `shared/geometry/*`, `@units/*` →
  `shared/types/*`.
- TDD: write the failing test, implement the minimum, refactor, add
  edge-case + invariant tests. No production code without a test.

---

# Part A — Shared Geometry

New file: `shared/geometry/panel.ts` (+ `panel.test.ts`). Keep the existing
`depths.ts` / `scaling.ts` untouched.

All functions are pure, unit-branded, and free of acoustics/number theory.
They bridge *counts + scalar sizes → physical panel dimensions*.

## A.1 Well width from highest operating frequency

```ts
export function calculateWellWidth(fHigh: Frequency): Length;
```

The well width is set by the **highest** frequency the panel must diffuse. At
that frequency each well must be no wider than half a wavelength, or adjacent
wells diffract and leak energy past the diffuser (diffusion breaks down above
this cutoff).

```
w = λ_high / 2 = c / (2 · fHigh)
```

Reuses `calculateWavelength()` from `@acoustics/frequency` (this is the one
place acoustics feeds *into* geometry — a width, not a performance number).

Caveat / assumption (document in the JSDoc): this assumes zero-thickness
dividers. Real panels add divider thickness `t`, giving
`w = c/(2·fHigh) − t`. Provide `calculateWellWidth(fHigh)` for the ideal case
and a variant `calculateWellWidthWithWall(fHigh, wallThickness)` if wall
thickness must be accounted for. Do **not** invent a default wall thickness.

Edge cases: `fHigh ≤ 0` → throw (programmer error; validated upstream by the
validator). Return a positive `Length`.

## A.2 Panel width

```ts
export function calculatePanelWidth(cellWidth: Length, count: number): Length;
```

```
W = count · w
```

- QRD / PRD: `count = p` (one well per residue).
- Skyline / Poly: `count = p` along each axis (the grid is `p × p`; note the
  PRD-sourced skyline's first and last rows/columns coincide by Fermat, so the
  *visible* cell count is `p − 1` — document this and let the caller pass the
  intended `count`).

`count` is a raw `number` (a count, not a branded quantity). Guard `count`
against non-integer / ≤ 0 with a throw (programmer error; the validator covers
the user-facing case).

## A.3 Panel height

```ts
export function calculatePanelHeight(cellHeight: Length, count: number): Length;
```

```
H = count · cellHeight
```

Symmetric to width. For 1D diffusers the vertical panel height is often a free
design input rather than `count · cellHeight`; this function covers the
grid-based (Skyline/Poly) case and any panel built from a uniform cell grid.
Callers that want a fixed height pass `count = 1`.

## A.4 Panel area

```ts
export function calculatePanelArea(width: Length, height: Length): Area;
```

```
A = W · H
```

## A.5 Panel volume

```ts
export function calculatePanelVolume(width: Length, height: Length, depth: Length): Volume;
```

```
V = W · H · D
```

Generic box volume. Most useful for Helmholtz cavity/backing and for quoting
panel mass/depth; diffusers report area, not volume.

## A.6 (Optional, adjacent) Maximum depth

The roadmap lists `calculateMaxDepth` under Phase 3 but it is not implemented
(`qrd-physics.ts` only has `calculateUnitDepth`). If in scope:

```ts
export function calculateMaxDepth(lambda: Length, p: number): Length; // ((p-1)·λ)/(2p)
```

This is acoustic, not geometric — implement it in
`shared/acoustics/qrd-physics.ts` alongside `calculateUnitDepth`, not in
geometry. Recommend deferring until Part B is done unless it's needed to write
a geometry test.

### Test plan (`panel.test.ts`)

- `calculateWellWidth`: known frequency → known width (e.g. `c = 343`,
  `fHigh = 1000` ⇒ `w = 0.1715 m`); half-wavelength invariant
  `calculateWellWidth(f) === calculateWavelength(f) / 2`; throws on `fHigh ≤ 0`.
- `calculatePanelWidth`: `p` wells ⇒ `W = p·w`; scaling linearity
  (`width(2w, 2p) === 2·width(w,p)`).
- `calculatePanelHeight`: same invariants as width.
- `calculatePanelArea`: units correct (m²); matches `width·height` numerically;
  commutative.
- `calculatePanelVolume`: m³ units; matches `width·height·depth`; a panel with
  `depth → 0` area is recovered when projecting.
- Branding invariants: every return value carries the correct brand and is
  constructible only via `to*` (no naked casts in the implementation).

---

# Part B — Validators

New files under a new directory `shared/validators/`:

```
shared/validators/
├── common.ts        (types + shared predicates)
├── qrd.ts
├── prd.ts
├── skyline.ts
├── poly.ts
├── helmholtz.ts
└── abfusor.ts
```

Plus a test file per module. TDD: each `*.test.ts` first asserts the
`ValidationResult` shape for valid and invalid inputs.

## B.1 Common types & helpers (`common.ts`)

```ts
export interface ValidationError {
  field: string;   // input field name, e.g. "prime", "absorptiveRatio"
  message: string; // human-readable, UI-friendly
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] };
```

Rule: a validator collects **all** errors in one pass (does not stop at the
first), so the UI can show every problem at once.

Shared predicates (return `ValidationResult`, never throw for user error):

```ts
export function validatePositiveFrequency(f: unknown): ValidationResult;
export function validatePositiveLength(l: unknown): ValidationResult;
export function validatePositiveVolume(v: unknown): ValidationResult;
export function validatePrime(n: unknown): ValidationResult;
export function validatePrimitiveRoot(p: number, g: unknown): ValidationResult;
export function validateRatioInRange(r: unknown, lo: number, hi: number): ValidationResult;
```

- `validatePrime` uses `isPrime()` from `@math/number-theory`.
- `validatePrimitiveRoot` uses `isPrimitiveRoot()`; message names the offending
  value.
- Numeric predicates accept `unknown` (the validator is the front door for
  untrusted/UI input) and narrow internally. They do **not** brand — they
  validate; the design function still receives branded types.

## B.2 Per-type validators

Each module exports one `validate*Design(input): ValidationResult`. Each
validates exactly the fields its design function consumes. Keep messages
consistent with the `RangeError` messages the design functions currently emit,
so behavior is preserved when the validators are wired in.

### `qrd.ts` — `validateQRDDesign(input: DesignQRDInput)`
- `prime` is prime.
- `designFrequency` positive.

### `prd.ts` — `validatePRDDesign(input: DesignPRDInput)`
- `prime` is prime.
- `designFrequency` positive.
- if `primitiveRoot` supplied: must be a primitive root mod `prime`
  (`validatePrimitiveRoot`).

### `skyline.ts` — `validateSkylineDesign(input: DesignSkylineInput)`
- `prime` is prime.
- `designFrequency` positive.
- if `sequenceType === "PRD"` and `primitiveRoot` supplied: validate it.
  (When omitted, the design auto-selects a root — that's not a user error.)

### `poly.ts` — `validatePolyDesign(input: DesignPolyInput)`
- `prime` is prime.
- `designFrequency` positive.
- `q1`, `q2`: integer; not congruent to 0 mod p; congruent to a quadratic
  residue mod p. Mirror `normalizeValidCoefficient` in `design/poly.ts`
  (collect both errors).

### `helmholtz.ts` — `validateHelmholtzDesign(input: DesignHelmholtzInput)`
- `neckRadius`, `neckLength` positive lengths.
- `cavityVolume` positive.
- if `acousticResistance` supplied: positive.
- if `frequencyAxis` supplied: non-empty and every entry positive.

### `abfusor.ts` — `validateABFUSORDesign(input: DesignABFUSORInput)`
- `prime` is prime.
- `designFrequency` positive.
- `absorptiveRatio` in `[0, 1)` (inclusive 0, exclusive 1).
- if `material` supplied: `flowResistivity` positive.
- if `frequencyAxis` supplied: non-empty and positive.

## B.3 Relationship to existing `throw`s

Per the Validation Philosophy: "Exceptions are reserved for programmer errors
and impossible states." Two options — pick one and be consistent:

- **Option A (recommended, non-breaking):** validators are a new user-facing
  layer. The design functions keep their guards for the *impossible-after
  validation* cases, but the prime/root/ratio checks that are genuine user
  errors are surfaced by the validator and removed from the throw path. This
  is a gradual migration: add validators first (Part B), then optionally
  refactor each `design*` to validate-and-return rather than throw.
- **Option B (full refactor):** every `design*` calls its validator at the top
  and returns a union result `{ ok: true; result } | { ok: false; errors }`.
  Larger change; do only after Part A + B are green.

Recommend **A**: deliver validators now (additive, no behavior change), and
file the `design*` refactor as a follow-up so this plan ships incrementally.

### Test plan (per module)

- Valid input ⇒ `{ valid: true }`.
- Each invalid field ⇒ `{ valid: false; errors }` containing that field, and
  **all** invalid fields at once (multi-error collection).
- Boundary values: `absorptiveRatio = 0` (valid), `= 1` (invalid), just under
  1 (valid); `q ≡ 0 mod p` (invalid); non-integer `q1` (invalid);
  `fHigh ≤ 0` rejected by validator (well-width throw is the programmer guard).
- Branding: validators accept `unknown` and never leak unbranded values into
  results — results contain only strings.

---

## Ordering & dependencies

```
PART A — geometry (foundation; must be stable and green first)
A.1 calculateWellWidth / calculateWellWidthWithWall
                                (needs @acoustics/frequency.halfWavelength — exists)
A.2–A.5 panel width/height/area/volume  (pure geometry; no deps)
  └─ panel.test.ts green (32 tests); full suite green; lint clean

PART B — validators (built on top of stable geometry)
B.1 common.ts                 (needs @math/number-theory — exists)
B.2 per-type validators        (needs B.1; each design type exists for reference)
B.3 refactor design* (follow-up)
```

No phase depends on another across A/B except B.1 before B.2. All inputs
already exist in `shared/design/*` to reference against.

**Execution order used:** Part A fully implemented and green before any
Part B code was written.

## Acceptance criteria (per the plan's Success Criteria)

- Every new function has a passing test before it is considered done.
- New geometry lives in `shared/geometry/panel.ts`; validators in
  `shared/validators/`. No calculation logic leaks into `app/`.
- Validators return `ValidationResult`; user errors are not thrown from the
  validator layer.
- No `any`; all conversions go through `scaling.ts`.
- Existing design outputs are unchanged (additive).

## Suggested test-count targets (parity with existing modules)

Existing design modules carry ~7–30 tests each. Target:
- `panel.test.ts`: ≥ 12
- `validators/common.test.ts`: ≥ 12
- each `validators/*.test.ts`: ≥ 6 (valid + one invalid per field + boundaries)

## Files created

| File | Part | Status |
|------|------|--------|
| `shared/geometry/panel.ts` | A | ✅ |
| `shared/geometry/panel.test.ts` | A | ✅ (32 tests) |
| `shared/validators/common.ts` | B | ✅ |
| `shared/validators/common.test.ts` | B | ✅ (41 tests) |
| `shared/validators/qrd.ts` + `.test.ts` | B | ✅ (6 tests) |
| `shared/validators/prd.ts` + `.test.ts` | B | ✅ (6 tests) |
| `shared/validators/skyline.ts` + `.test.ts` | B | ✅ (9 tests) |
| `shared/validators/poly.ts` + `.test.ts` | B | ✅ (7 tests) |
| `shared/validators/helmholtz.ts` + `.test.ts` | B | ✅ (8 tests) |
| `shared/validators/abfusor.ts` + `.test.ts` | B | ✅ (11 tests) |
| `tsconfig.paths.json` added `@validators/*` alias | infra | ✅ |
| `shared/math/helpers.ts` added `assertModulus` / `asModulus` | infra | ✅ |
| `AGENTS.md` documents the `@validators/*` alias and `shared/validators/` | infra | ✅ |

**Result:** 88 validator tests + 32 geometry tests pass; full suite 29 files /
322 tests green; `biome lint` and `biome format` clean; the new files also
type-check clean under `tsc` (see "Review round 2").

## Review round 2 — findings and what was done about them

A second-pass review of the change above found, and this round fixed:

1. **Nothing in the workflow type-checked the code.** `npm run test` (Vitest
   through esbuild) and `biome lint` both ignore types, so the change shipped
   with 21 `tsc` errors in its own files. Fixing them was only possible once a
   check existed: the files were verified with
   `tsc -p .nuxt/tsconfig.shared.json` (the Nuxt-generated project, which
   carries the alias map and the repo's `strict` + `noUncheckedIndexedAccess`
   settings).
2. **Committed `.js` build artifacts.** 16 `.js` files sat beside their `.ts`
   sources in `shared/` and were tracked by git. They are TypeScript compiler
   output — a bare `tsc` run with no `--outDir` and no `"compile": false` emits
   next to the sources — and they were silently corrupting the suite: Vitest
   collected `panel.test.js` and `common.test.js` as test files, which is why
   the suite above reported 31 files / 318 tests rather than the real 29 / 277,
   and it made Vite warn about duplicated `@units/units` imports. Fix: deleted
   from disk and from the index, and `.gitignore` now carries
   `shared/**/*.js` so the next stray emission cannot be committed again.
3. **`panel.test.ts` built frequencies with the `Length` converter**
   (`toLength(1000, Hz)`), which the branded types reject but nothing checked;
   all `m` and `Hz` constants are `1`, so the tests passed while being unit-
   incoherent. Now uses `toFrequency(…, Hz)`.
4. **`calculateWellWidthWithWall` shipped untested** despite being an exported
   new function; it now has six tests (divider subtraction, the zero-thickness
   identity with `calculateWellWidth`, positivity, the two guard throws).
5. **Five tests asserted `typeof value === "number"` on branded results** — a
   tautology, since a brand is a phantom type erased at runtime. Replaced with
   real boundary/invariant tests.
6. **Guard policy in `panel.ts` was inconsistent with its own docs:** a
   `wallThickness` equal to the opening yielded a zero-width well (its JSDoc
   promised a positive one), negative thickness was accepted under a doc saying
   "must be positive", and `calculatePanelArea`/`calculatePanelVolume` accepted
   any length. Now: `wallThickness` non-negative, opening strictly positive,
   plan dimensions positive, `depth` non-negative so a zero-depth box projects
   onto its plan area. `count` also moved from `isInteger` to
   `isSafeInteger`.
7. **`calculateWellWidth` re-derived the half wavelength by hand** instead of
   reusing `halfWavelength()` from `@acoustics/frequency`, duplicating acoustic
   knowledge in the geometry layer. Now delegates to it.
8. **One root cause reported as three errors.** A bad `prime` in `poly` also
   produced two "cannot validate coefficient" errors, and `prd`/`skyline` only
   suppressed the follow-on root error for non-integer primes, so `prime: 8`
   still complained that `3` "must be a primitive root modulo 8". Coefficient
   and root follow-ups are now gated on the prime actually having validated.
9. **Prime order had no range bound**, so untrusted UI input could request a
   `10⁶`-entry sequence or a `10¹²`-cell poly grid. `validatePrime` now
   enforces `MIN_PRIME = 3` … `MAX_PRIME = 100` (2D grids grow as `p²`,
   bounded at `10⁴` wells); `MIN_PRIME` also removes the physically meaningless
   order-2 panel.
10. **`sequenceType` was not validated**, so `"prd"` fell back to QRD inside
    `designSkyline` while the validator said the input was fine. Now checked
    against `SKYLINE_SEQUENCE_TYPES`, whose element type is
    `SkylineSequenceType` so the list cannot drift from the union.
11. **A supplied material without `flowResistivity` passed validation**, and
    `designABFUSOR` only defaults the whole field, so it propagated `NaN` into
    the absorption curves. `material` must now be an object (a non-object used
    to be ignored), `material.flowResistivity` is required when a spec is
    supplied, and the optional `material.surfaceResistance` is checked
    non-negative.
12. **Unit confusion in the shared predicates:** three byte-identical
    Length/Volume/Frequency bodies, and `validatePositiveFrequency` was used
    for `acousticResistance` and `flowResistivity`. There is now one
    `validatePositiveNumber` body plus thin unit wrappers, and unit-bearing
    call sites use the unit-agnostic form with a comment saying why.
13. **Validator input types restated the design input shapes**, which can drift
    silently. Each module now derives its input type from the design input
    (`{ [field in keyof Design<Input>]?: unknown }`), and error `field`s for
    nested values use dotted paths (`material.flowResistivity`).
14. **Number-theory predicates were called with unbranded numbers**
    (`isPrimitiveRoot(p, g)` with `p: number`, `mod(value, p)` with
    `value: unknown`) — the project's rule is that entry into the math system
    goes through assertion → branding. Added the non-throwing narrowing
    bridges `asPrimeValue` / `asModulusValue` in `common.ts` (built on
    `asPrime`, and on a new `asModulus` / `assertModulus` in
    `@math/helpers`), and `validatePrimitiveRoot` now takes a branded
    `Prime` modulus.
15. **Test assertions were skippable.** Every per-type test guarded its
    assertions with `if (!result.valid)`, which passes vacuously when the
    precondition is wrong, and asserted `errors[0].field` (ordering-coupled and
    invalid under `noUncheckedIndexedAccess`). They now compare the whole
    `errors` list — fields and, for the representative cases, the exact
    message — so the user-facing wording is covered by tests too.
16. **`combine` had a dead guard and a swallowing branch**: `result.errors`
    was tested on a narrowed union (always truthy), and a `valid: false`
    result carrying `errors: []` returned `{ valid: true }`, i.e. an invalid
    input reported as valid. Both removed.
17. **Message wording drifted from the `RangeError`s the design layer emits**
    (`Value q1=… must be an integer.`, `Value g must be a primitive root modulo
    p.`, `absorptiveRatio must satisfy 0 <= … < 1 (got …)`). The validator
    messages now mirror them, so wiring the validators in front of the design
    keeps the user-visible text stable.

Still open from that review (not code defects in this change):

- **The rest of the repo is not `tsc`-clean.** ~117 errors remain in files this
  change did not touch (`shared/math/number-theory.ts`, `shared/design/abfusor.ts`,
  several `*.test.ts` indexing under `noUncheckedIndexedAccess`, …). They are a
  separate chore; a `tsc` gate in the workflow would surface them all at once
  once the repo is clean. This change's own files are clean.
- **The validators are still not consumed by `app/`** (Option A of B.3).

## Still pending (follow-ups)

- `shared/acoustics/qrd-physics.ts` `calculateMaxDepth` (acoustic, deferred).
- **Part B.3:** refactor `shared/design/*` to validate-and-return. Option A was
  chosen — validators are a new non-breaking front door; the `design*` functions
  still `throw` for now. Not yet done.

Optionally (follow-up): `shared/acoustics/qrd-physics.ts` `calculateMaxDepth`;
refactor `shared/design/*` to validate-and-return.
