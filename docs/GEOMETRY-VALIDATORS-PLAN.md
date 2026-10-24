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
A.1 calculateWellWidth        (needs @acoustics/frequency.calculateWavelength — exists)
A.2–A.5 panel width/height/area/volume  (pure geometry; no deps)
B.1 common.ts                 (needs @math/number-theory — exists)
B.2 per-type validators        (needs B.1; each design type exists for reference)
B.3 refactor design* (follow-up)
```

No phase depends on another across A/B except B.1 before B.2. All inputs
already exist in `shared/design/*` to reference against.

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

## Files to create

| File | Part |
|------|------|
| `shared/geometry/panel.ts` | A |
| `shared/geometry/panel.test.ts` | A |
| `shared/validators/common.ts` | B |
| `shared/validators/common.test.ts` | B |
| `shared/validators/qrd.ts` + `.test.ts` | B |
| `shared/validators/prd.ts` + `.test.ts` | B |
| `shared/validators/skyline.ts` + `.test.ts` | B |
| `shared/validators/poly.ts` + `.test.ts` | B |
| `shared/validators/helmholtz.ts` + `.test.ts` | B |
| `shared/validators/abfusor.ts` + `.test.ts` | B |

Optionally (follow-up): `shared/acoustics/qrd-physics.ts` `calculateMaxDepth`;
refactor `shared/design/*` to validate-and-return.
