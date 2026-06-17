# AGENTS.md

## Project Overview

This project is an acoustic panel design and analysis application built with Nuxt and TypeScript.

The goal is to allow users to configure acoustic treatment products and receive engineering calculations, acoustic estimates, and eventually 3D visualizations.

Users define panel dimensions and configuration parameters and the application calculates:

* Physical dimensions
* Acoustic operating ranges
* Diffusion characteristics
* Resonant frequencies
* Surface coverage
* Material requirements
* Cut lists

Future versions will include Three.js-based 3D visualization and interactive design tools.

---

## Supported Panel Types

### Diffusers

#### QRD (Quadratic Residue Diffuser)

Configurable parameters may include:

* Width
* Height
* Maximum depth
* Number of wells
* Design frequency
* Prime number selection
* Well width
* Cell wall thickness
* With or without internal dividers
* Horizontal orientation
* Vertical orientation

Expected outputs:

* Well depth sequence
* Maximum design frequency
* Minimum design frequency
* Effective diffusion bandwidth
* Physical dimensions

---

#### Skyline Diffuser (2D QRD)

Configurable parameters may include:

* Width
* Height
* Maximum depth
* Number of rows
* Number of columns
* Prime number selection
* Cell size

Expected outputs:

* Cell height map
* Effective bandwidth
* Design frequency range
* Physical dimensions

---

#### PRD (Primitive Root Diffuser)

Configurable parameters may include:

* Width
* Height
* Number of wells
* Prime number
* Primitive root
* Maximum depth
* Well width

Expected outputs:

* Well depth sequence
* Effective diffusion bandwidth
* Design frequency range

---

#### Poly Diffuser

Configurable parameters may include:

* Width
* Height
* Curve depth
* Radius
* Material thickness

Expected outputs:

* Radius calculations
* Arc geometry
* Effective scattering range
* Material dimensions

---

### Hybrid Panels

#### Abfusor

Combination absorber and diffuser.

Configurable parameters may include:

* Width
* Height
* Depth
* Number of slats
* Slat width
* Slat spacing
* Slat depth variation
* Absorber depth
* Absorber material

Expected outputs:

* Open area percentage
* Estimated scattering behaviour
* Estimated absorption behaviour
* Material usage

---

### Resonant Absorbers

#### Helmholtz Resonator

Configurable parameters may include:

* Width
* Height
* Depth
* Cavity volume
* Slot width
* Slot count
* Slot length
* Neck depth
* Face thickness

Expected outputs:

* Resonant frequency
* Effective operating range
* Open area percentage
* Cavity volume

---

## Development Philosophy

This project is calculation-first.

Priority order:

1. Correct mathematics
2. Strong typing
3. Comprehensive tests
4. API stability
5. User interface
6. Visualization

No visual feature should be implemented before underlying calculations are tested and verified.

---

## Architecture

### Shared Code

All reusable business logic lives in:

```text
./shared
```

Shared modules are imported using:

```ts
import { something } from '#shared/...'
```

Calculation logic must never depend on UI components.

Shared code should remain framework-agnostic whenever possible.

---

## TypeScript Rules

Use strict TypeScript.

### Never

```ts
any
```

### Instead

```ts
unknown
```

and perform proper narrowing.

Example:

```ts
function parse(input: unknown): Result {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Invalid input')
  }

  return transform(input)
}
```

---

## Testing

This is a test-driven codebase.

### Test File Naming

```text
*.spec.ts
```

Examples:

```text
qrd.spec.ts
helmholtz.spec.ts
poly.spec.ts
```

### Test Runner

```bash
npx vitest
```

### Expectations

New calculation features should be developed using TDD:

1. Write failing test
2. Implement calculation
3. Make test pass
4. Refactor

Every acoustic formula should have tests covering:

* Typical values
* Boundary conditions
* Invalid inputs
* Unit conversions
* Regression scenarios

---

## Domain Model Direction

Each panel type should expose:

```ts
interface PanelCalculation<TConfig, TResult> {
  calculate(config: TConfig): TResult
}
```

Example:

```ts
interface QrdConfig {
  width: number
  height: number
  depth: number
  wells: number
}

interface QrdResult {
  wellDepths: number[]
  minFrequency: number
  maxFrequency: number
}
```

This pattern should remain consistent across all panel types.

---

## Future Features

### Material Estimation

Generate:

* Timber requirements
* Sheet goods requirements
* Fastener estimates
* Absorber material quantities

---

### Cut Lists

Generate:

* Piece dimensions
* Quantities
* Optimized cutting information

---

### Three.js Visualization

Future versions will support:

* 3D panel rendering
* Interactive inspection
* Material previews
* Dimension overlays
* Exportable models

Three.js rendering should consume existing calculation results and never duplicate acoustic calculations.

---

## Guiding Principle

Users should be able to answer the question:

> "This is the panel I want to build. What will it look like, what frequencies will it affect, and what materials do I need?"

with accurate, tested, reproducible calculations.

