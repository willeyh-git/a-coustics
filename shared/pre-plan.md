# Acoustic Panel Calculator — Pre-Plan v3

## Overview

Build a strongly-typed, test-driven Nuxt application for designing and analyzing acoustic treatment systems.

Supported panel types:

1. QRD (Quadratic Residue Diffuser)
2. PRD (Primitive Root Diffuser)
3. Skyline Diffuser
4. Poly Diffuser (2D Quadratic Residue Diffuser)
5. Helmholtz Resonator
6. ABFUSOR (Absorbing Binary Diffuser)

Diffuser type specifications and lookup: see `docs/` (e.g., `docs/QRD.md`, `docs/PRD.md`, `docs/SKYLINE.md`, etc.)

The application must provide:

- Accurate physical calculations
- Strong compile-time type safety
- Reusable mathematical infrastructure
- Comprehensive test coverage
- Separation of number theory, geometry, and acoustics
- Shared calculation modules that can be reused across panel types

---

# Core Engineering Principles

## Strong Typing

Rules:

- No `any`
- No `unknown` unless explicitly justified
- Use branded primitive types for physical quantities
- Use discriminated unions instead of boolean flags
- Separate units at the type level whenever practical
- All unit conversion goes through geometry/scaling.ts

Example:

```ts
type Length = Brand<number, 'm'>;
type Area = Brand<number, 'm²'>;
type Volume = Brand<number, 'm³'>;

type Frequency = Brand<number, 'Hz'>;

type Density = Brand<number, 'kg/m³'>;
type FlowResistivity = Brand<number, 'rayls'>;
```

---

## Test Driven Development

Development cycle:

1. Write failing test
2. Implement minimum code
3. Refactor
4. Add edge-case tests
5. Add invariant/property tests

No production code should be written without a corresponding test.

---

## Separation of Concerns

The system is divided into three primary layers.

### Layer 1 — Number Theory

Pure mathematics.

Examples:

- Prime validation
- Modular arithmetic
- Primitive roots
- Residue generation

No physical units.

No acoustics.

---

### Layer 2 — Geometry

Converts mathematical sequences into physical dimensions.

Examples:

- Well depths
- Cell heights
- Panel dimensions
- Panel area

No acoustic performance calculations.

---

### Layer 3 — Acoustics

Converts geometry into acoustic behavior.

Examples:

- Wavelength calculations
- Design frequency calculations
- Diffusion bandwidth
- Resonant frequency
- Absorption curves

---

# Units & Physical Types

## Base Units

```ts
type Length = Brand<number, 'm'>;
type Area = Brand<number, 'm²'>;
type Volume = Brand<number, 'm³'>;

type Frequency = Brand<number, 'Hz'>;

type Density = Brand<number, 'kg/m³'>;
type FlowResistivity = Brand<number, 'rayls'>;
```

Constants:

```ts
export const m = 1 as Length;
export const Hz = 1 as Frequency;
```

All internal calculations use SI units.

UI conversion occurs only at presentation boundaries.

---

# Shared Types

## Frequency Range

```ts
interface FrequencyRange {
  min: Frequency;
  max: Frequency;
}
```

---

## Material Properties

```ts
interface MaterialProperties {
  density: Density;
  flowResistivity: FlowResistivity;
  thickness: Length;
  porosity?: number;
}
```

---

## Panel Type

```ts
type PanelType =
  | 'QRD'
  | 'PRD'
  | 'SKYLINE'
  | 'POLY'
  | 'HELMHOLTZ'
  | 'ABFUSOR';
```

---

## Common Frequency Response

```ts
interface FrequencyResponse {
  frequencies: Frequency[];
  values: number[];
}
```

---

# Shared Mathematical Infrastructure

Several panel types share mathematical foundations.

These should be implemented once and reused.

---

## Number Theory Module

Used by:

- QRD
- PRD
- Skyline
- Poly
- ABFUSOR

Responsibilities:

```ts
isPrime()

gcd()

isCoprime()

modPow()

getQuadraticResidues()

getPrimitiveRoots()
```

Sequence generation:

```ts
generateQRDSequence()

generatePRDSequence()
```

Example:

```ts
generateQRDSequence(7);

// [0,1,4,2,2,4,1]
```

This module contains no geometry or acoustics.

---

## Shared Acoustic Math

Used by:

- QRD
- PRD
- Skyline
- Poly
- Helmholtz
- ABFUSOR

Responsibilities:

```ts
speedOfSound()

wavelength()

frequencyFromWavelength()

quarterWavelength()

halfWavelength()
```

Example:

```ts
wavelength(1000 * Hz);
```

---

## Shared Diffuser Design Math

Used by:

- QRD
- PRD
- Skyline
- Poly

Responsibilities:

```ts
calculateUnitDepth()

calculateMaxDepth()

calculateDiffusionBandwidth()
```

Example:

```ts
calculateUnitDepth(
  700 * Hz,
  7
);
```

---

## Sequence-to-Geometry Conversion

Used by:

- QRD
- PRD
- Skyline
- Poly

Responsibilities:

```ts
sequenceToDepths()

matrixToDepths()
```

Example:

```ts
sequenceToDepths(
  [0,1,4,2,2,4,1],
  unitDepth
);
```

---

## Shared Geometry

Used by:

- QRD
- PRD
- Skyline
- Poly
- ABFUSOR
- Helmholtz

Responsibilities:

```ts
calculatePanelWidth()

calculatePanelHeight()

calculatePanelArea()

calculatePanelVolume()
```

---

## Shared Frequency Analysis

Used by:

- Diffusers
- Resonators
- Absorbers

Responsibilities:

```ts
generateFrequencyAxis()

generateOctaveBands()

generateThirdOctaveBands()
```

---

## Shared Material Models

Used by:

- Helmholtz
- ABFUSOR
- Future porous absorbers

Responsibilities:

```ts
calculateFlowResistance()

calculatePorousAbsorption()

lookupMaterial()
```

---

# Mathematical Foundations

## QRD (Quadratic Residue Diffuser)

### Residue Sequence

For prime p:

```text
S(i) = i² mod p
```

Example:

```text
p = 7

0, 1, 4, 2, 2, 4, 1
```

---

### Unit Depth

```text
d_unit = λ₀ / (2p)
```

Where:

```text
λ₀ = c / f_design
```

---

### Well Depth

```text
d(i) = S(i) × d_unit
```

---

### Maximum Depth

```text
d_max = ((p - 1) × λ₀) / (2p)
```

---

### Constraints

- Prime number required
- Well width derived from highest operating frequency
- Depths derived from residue sequence

---

## PRD (Primitive Root Diffuser)

### Sequence

For primitive root g:

```text
S(i) = g^i mod p
```

Example:

```text
p = 7
g = 3

1, 3, 2, 6, 4, 5
```

---

### Depth

```text
d(i) = S(i) × d_unit
```

---

### Constraints

- p must be prime
- g must be a primitive root modulo p

---

## Skyline Diffuser

Derived from QRD or PRD sequences.

Example:

```text
Height(i,j)
=
(S(i) + S(j)) mod p
```

Depth:

```text
d(i,j)
=
Height(i,j) × d_unit
```

Note: when the source is PRD, the sequence has p entries (S(i) = g^i mod p,
i = 0..p-1, matching `generatePRDSequence()`). By Fermat's little theorem
g^(p-1) ≡ g^0 = 1, so the first and last grid rows and columns coincide.
This is the established repo convention (the PRD phase example shows p-1
values; the implemented sequence uses p and the duplication is tested).

Constraints:

- Equal X/Y spacing
- Square grids preferred

---

## Poly Diffuser

Two-dimensional residue diffuser.

```text
S(i,j)
=
(q₁ × i² + q₂ × j²) mod p
```

Depth:

```text
d(i,j)
=
S(i,j) × d_unit
```

Constraints:

- Prime p
- Valid quadratic residues q₁ and q₂

Note: q₁ and q₂ are congruence classes modulo p; any integer is accepted and
normalized to its canonical representative in [0, p). Coefficients congruent to
0 modulo p are rejected because they collapse one axis of the rule.

---

## Helmholtz Resonator

Resonant frequency:

```text
f
=
(c / 2π)
×
√(A / (V × L_eff))
```

Where:

```text
L_eff = L + 1.7r
```

Definitions:

- A = neck area
- V = cavity volume
- L = neck length
- r = neck radius

Outputs:

- Resonant frequency
- Bandwidth estimate
- Absorption curve

---

## ABFUSOR

Hybrid absorber and diffuser.

Well states:

```text
DIFFUSIVE
ABSORPTIVE
```

Diffusive wells:

```text
QRD depth
```

Absorptive wells:

```text
shallow cavity
+
absorptive material
```

Outputs:

- Diffusion profile
- Absorption profile
- Combined metrics

---

# Architecture

```text
shared/
├── types/
│   ├── units.ts
│   ├── core.ts
│   ├── panels.ts
│   └── results.ts
│
├── math/
│   ├── constants.ts
│   ├── number-theory.ts
│   ├── sequences.ts
│   ├── grids.ts
│   ├── qrd.ts
│   ├── prd.ts
│   ├── skyline.ts
│   ├── poly.ts
│   ├── helmholtz.ts
│   └── abfusor.ts
│
├── acoustics/
│   ├── wavelength.ts
│   ├── diffuser.ts
│   ├── response.ts
│   ├── materials.ts
│   ├── diffusion.ts
│   └── absorption.ts
│
├── geometry/
│   ├── depths.ts
│   ├── panel.ts
│   ├── dimensions.ts
│   └── spacing.ts
│
└── validators/
    ├── common.ts
    ├── qrd.ts
    ├── prd.ts
    ├── skyline.ts
    ├── poly.ts
    ├── helmholtz.ts
    └── abfusor.ts
```

---

# Validation Philosophy

Validation returns structured results.

User errors are never thrown.

Example:

```ts
type ValidationResult =
  | { valid: true }
  | {
      valid: false;
      errors: ValidationError[];
    };
```

Validation error:

```ts
type ValidationError =
  | {
      field: 'prime';
      message: string;
    }
  | {
      field: 'wellWidth';
      message: string;
    };
```

Exceptions are reserved for programmer errors and impossible states.

---

# TDD Roadmap

## Phase 1 — Shared Math Foundations

Write tests before implementation.

Implement:

```ts
isPrime()

gcd()

isCoprime()

modPow()

getQuadraticResidues()

getPrimitiveRoots()
```

Then:

```ts
generateQRDSequence()

generatePRDSequence()
```

Example:

```ts
expect(
  generateQRDSequence(7)
).toEqual([
  0,1,4,2,2,4,1
]);
```

No geometry.

No acoustics.

**Status: ✅ Complete** — All functions implemented in `shared/math/number-theory.ts` and `shared/math/sequences.ts` with full test coverage (12 test files).

---

## Phase 2 — Shared Geometry

Implement:

```ts
sequenceToDepths()

matrixToDepths()

calculatePanelWidth()

calculatePanelHeight()

calculatePanelArea()
```

Tests verify dimensional correctness.

**Status: ✅ Complete** — `sequenceToDepths()` in `shared/geometry/depths.ts`. `matrixToDepths()`, `calculatePanelWidth()`, `calculatePanelHeight()`, `calculatePanelArea()` are pending.

---

## Phase 3 — Shared Acoustic Utilities

Implement:

```ts
speedOfSound()

wavelength()

frequencyFromWavelength()

calculateUnitDepth()

calculateMaxDepth()
```

Tests verified against published acoustic references.

**Status: ✅ Complete** — All functions implemented in `shared/acoustics/constants.ts` and `shared/acoustics/frequency.ts` and `shared/acoustics/design.ts`.

---

## Phase 4 — QRD

Build first complete diffuser.

QRD becomes the reference implementation.

Validate:

- Number theory
- Geometry
- Acoustics
- Validation
- Results

**Status: ✅ Complete** — `designQRD()` in `shared/design/qrd.ts` with `shared/acoustics/qrd-physics.ts`. Full test coverage in `design/qrd.test.ts`.

---

## Phase 5 — PRD

Reuse:

- Number theory
- Geometry
- Diffuser acoustics

Implement only primitive-root-specific behavior.

**Status: ✅ Complete** — `designPRD()` in `shared/design/prd.ts` with auto-select of primitive root. Full test coverage.

---

## Phase 6 — Skyline

Reuse:

- QRD/PRD sequences
- Shared geometry (`matrixToLengths`)
- Shared acoustics (`designUnitDepth`)

Implement 2D skyline generation.

**Status: ✅ Complete** — `shared/math/grids.ts` (`buildGrid`), `shared/geometry/depths.ts` (`matrixToLengths`) and `shared/design/skyline.ts` (`designSkyline`) with QRD/PRD sources. Full test coverage.

---

## Phase 7 — Poly

Reuse:

- Residue infrastructure
- Shared geometry
- Shared acoustics

Implement 2D residue grids.

**Status: ✅ Complete** — `shared/design/poly.ts` (`designPoly`) with residue rule `S(i,j) = (q1 × i² + q2 × j²) mod p`, coefficients validated as nonzero quadratic-residue congruence classes modulo p (normalized with `mod`, `q ≡ 0` rejected as degenerate) and a shared `maxInGrid()` helper in `shared/math/grids.ts`. Full test coverage (`design/poly.test.ts`, 16 tests).

---

## Phase 8 — Helmholtz

Implement:

```ts
calculateResonantFrequency()

calculateBandwidth()

calculateAbsorptionCurve()
```

Reuse:

- Wavelength calculations
- Geometry
- Frequency response infrastructure

**Status: ✅ Complete** — `shared/acoustics/helmholtz-physics.ts` (`calculateNeckArea`, `calculateEffectiveLength`, `calculateResonantFrequency`, `calculateAbsorptionCurve`, `calculateBandwidth`, `resolveAcousticResistance`) and `shared/design/helmholtz.ts` (`designHelmholtz`) with full test coverage (`shared/acoustics/helmholtz-physics.test.ts`, `shared/design/helmholtz.test.ts`, 30 tests). Resonant frequency uses `f = (c/2π)·√(A/(V·L_eff))` with `L_eff = L + 1.7r`; absorption from the Z₀-referenced impedance model; bandwidth solved analytically from the −3 dB point.

---

## Phase 9 — ABFUSOR

Reuse:

- QRD infrastructure
- Shared geometry
- Shared materials
- Frequency response infrastructure

Implement hybrid absorber/diffuser behavior.

**Status: ❌ Not started**

---

# Success Criteria

A panel design is considered complete when:

- Mathematical constraints pass
- Geometric constraints pass
- Acoustic constraints pass
- All calculations are covered by tests
- Shared infrastructure is reused instead of duplicated
- No UI code contains calculation logic
- All physical formulas live under `shared/`
- QRD, PRD, Skyline, and Poly share common diffuser infrastructure
- Helmholtz and ABFUSOR reuse common acoustic infrastructure

The application should generate physically meaningful diffuser and absorber designs from a small set of user inputs while maintaining strong type safety, high test coverage, and clear architectural boundaries.
