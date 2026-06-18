# Acoustic Panel Calculator — Pre-Plan v2

## Overview

Build a strongly-typed, test-driven Nuxt application for designing and analyzing acoustic treatment systems.

Supported panel types:

1. QRD (Quadratic Residue Diffuser)
2. PRD (Primitive Root Diffuser)
3. Skyline Diffuser
4. Poly Diffuser (2D QRD / Polynomial Diffuser)
5. Helmholtz Resonator
6. ABFUSOR (Absorbing Binary Diffuser)

---

# Core Engineering Principles

## Strong Typing

* No `any`
* No `unknown` unless explicitly justified
* Use branded units for physical quantities
* Prefer discriminated unions over boolean flags

## Test Driven Development

Tests define behavior before implementation.

Development cycle:

1. Write failing test
2. Implement minimum code
3. Refactor
4. Add property/invariant tests

## Separation of Concerns

The system is divided into three layers:

### Layer 1 — Number Theory

Pure mathematical sequence generation.

Examples:

* Prime validation
* Quadratic residues
* Primitive roots
* Sequence generation

### Layer 2 — Geometry

Convert mathematical sequences into physical dimensions.

Examples:

* Well depths
* Cell heights
* Panel dimensions

### Layer 3 — Acoustics

Convert geometry into acoustic performance.

Examples:

* Design frequency
* Diffusion bandwidth
* Resonant frequency
* Absorption curves

No module should mix responsibilities across layers.

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

```ts
export const m = 1 as Length;
export const Hz = 1 as Frequency;
```

All internal calculations use SI units.

UI conversions occur only at display boundaries.

---

# Shared Types

## Frequency Range

```ts
interface FrequencyRange {
  min: Frequency;
  max: Frequency;
}
```

## Material Properties

```ts
interface MaterialProperties {
  density: Density;
  flowResistivity: FlowResistivity;
  thickness: Length;
  porosity?: number;
}
```

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

Sequence:
0, 1, 4, 2, 2, 4, 1
```

### Well Depth

Standard QRD depth:

```text
d(i) = S(i) × d_unit
```

Where:

```text
d_unit = λ₀ / (2p)

λ₀ = c / f_design
```

Definitions:

* c = speed of sound
* f_design = design frequency
* p = prime number

Maximum depth:

```text
d_max = ((p - 1) × λ₀) / (2p)
```

### Constraints

* p must be prime
* Well widths chosen from highest design frequency
* Depths derived from residue sequence

---

## PRD (Primitive Root Diffuser)

### Primitive Root Sequence

Choose primitive root g of prime p.

Sequence:

```text
S(i) = g^i mod p
```

Example:

```text
p = 7
g = 3

1, 3, 2, 6, 4, 5
```

### Well Depth

```text
d(i) = S(i) × d_unit
```

Where:

```text
d_unit = λ₀ / (2p)
```

### Constraints

* p must be prime
* g must be a primitive root modulo p

---

## Skyline Diffuser

Skyline diffusers are derived from QRD or PRD sequences.

Example:

```text
Height(i,j)
=
(S(i) + S(j)) mod p
```

Depth:

```text
d(i,j) = Height(i,j) × d_unit
```

Constraints:

* Square grid preferred
* Equal cell spacing in X and Y

---

## Poly Diffuser

Two-dimensional quadratic residue diffuser:

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

* p prime
* q₁ and q₂ valid residues

---

## Helmholtz Resonator

Resonant frequency:

```text
f =
(c / 2π)
×
√(A / (V × L_eff))
```

Where:

```text
L_eff = L + 1.7r
```

Definitions:

* A = neck area
* V = cavity volume
* L = neck length
* r = neck radius

Outputs:

* Resonant frequency
* Bandwidth estimate
* Absorption curve

---

## ABFUSOR

Hybrid absorber/diffuser.

Each well is classified as:

```text
DIFFUSIVE
or
ABSORPTIVE
```

Diffusive wells:

```text
depth = QRD depth
```

Absorptive wells:

```text
depth = shallow cavity
+
absorptive material
```

Outputs:

* Diffusion profile
* Absorption profile
* Combined performance metrics

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
│   ├── primes.ts
│   ├── residues.ts
│   ├── qrd.ts
│   ├── prd.ts
│   ├── skyline.ts
│   ├── poly.ts
│   ├── helmholtz.ts
│   └── abfusor.ts
│
├── geometry/
│   ├── depths.ts
│   ├── dimensions.ts
│   └── spacing.ts
│
├── acoustics/
│   ├── diffusion.ts
│   ├── absorption.ts
│   └── frequency.ts
│
└── validators/
    ├── qrd.ts
    ├── prd.ts
    ├── skyline.ts
    ├── poly.ts
    ├── helmholtz.ts
    └── abfusor.ts
```

---

# TDD Roadmap

## Phase 1 — Number Theory

Write tests first.

### Primes

```ts
isPrime()
```

### Coprime

```ts
isCoprime()
```

### Quadratic Residues

```ts
getQuadraticResidues()
```

### Primitive Roots

```ts
getPrimitiveRoots()
```

Example:

```ts
expect(generateQRDSequence(7))
  .toEqual([0,1,4,2,2,4,1]);
```

No acoustic calculations yet.

---

## Phase 2 — Geometry

Convert sequences into dimensions.

Functions:

```ts
sequenceToDepths()
calculatePanelWidth()
calculatePanelHeight()
```

Example:

```ts
expect(
  sequenceToDepths(
    [0,1,4,2,2,4,1],
    10 * m
  )
);
```

---

## Phase 3 — QRD / PRD Design

Introduce design frequency.

Functions:

```ts
designQRD()
designPRD()
```

Outputs:

```ts
{
  depths,
  unitDepth,
  maxDepth,
  bandwidth
}
```

---

## Phase 4 — Skyline & Poly

Implement 2D diffusion.

Tests:

* symmetry
* valid residue generation
* dimension calculations

---

## Phase 5 — Helmholtz

Implement:

```ts
calculateResonantFrequency()
calculateBandwidth()
calculateAbsorptionCurve()
```

Tests verified against published reference calculations.

---

## Phase 6 — ABFUSOR

Combine:

* QRD geometry
* porous absorption
* cavity tuning

Outputs:

* diffusion metrics
* absorption metrics

---

# Validation Philosophy

Validation returns structured errors.

```ts
type ValidationResult =
  | { valid: true }
  | {
      valid: false;
      errors: ValidationError[];
    };
```

Example:

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

Never throw for user input validation.

Reserve exceptions for programmer errors.

---

# Success Criteria

A panel design is considered valid when:

* Mathematical constraints pass
* Geometric constraints pass
* Acoustic constraints pass
* All calculations are reproducible through tests
* No UI code contains calculation logic
* All acoustic formulas live under `shared/`

The application should be able to generate diffuser and absorber designs from a small set of physical inputs while maintaining full type safety and test coverage.

