# Current Implementation Status

This document tracks the current state of the acoustic diffuser implementation.

## Overall Progress: ~40% Complete

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Shared Math Foundations | ✅ Complete |
| 2 | Shared Geometry | ✅ Complete |
| 3 | Shared Acoustic Utilities | ✅ Complete |
| 4 | QRD (Quadratic Residue Diffuser) | ✅ Complete |
| 5 | PRD (Primitive Root Diffuser) | ✅ Complete |
| 6 | Skyline Diffuser | ❌ Not started |
| 7 | Poly Diffuser | ❌ Not started |
| 8 | Helmholtz Resonator | ❌ Not started |
| 9 | ABFUSOR | ❌ Not started |

## Completed Work

### Phase 1 — Shared Math Foundations

**Files:**
- `shared/math/number-theory.ts` — `isPrime()`, `gcd()`, `isCoprime()`, `mod()`, `modPow()`, `getQuadraticResidues()`, `findPrimitiveRoot()`, `isPrimitiveRoot()`
- `shared/math/sequences.ts` — `generateQRDSequence()`, `generatePRDSequence()`
- `shared/math/helpers.ts` — Type assertion and construction helpers
- `shared/math/number-theory/` — Extended GCD, modular inverse (submodule)

**Test coverage:** 12 test files covering all number theory and sequence functions.

### Phase 2 — Shared Geometry

**Files:**
- `shared/geometry/depths.ts` — `sequenceToDepths()`
- `shared/geometry/scaling.ts` — Unit conversion utilities

**Test coverage:** `geometry/depths.test.ts`

### Phase 3 — Shared Acoustic Utilities

**Files:**
- `shared/acoustics/constants.ts` — `SPEED_OF_SOUND`
- `shared/acoustics/frequency.ts` — `calculateWavelength()`, `frequencyFromWavelength()`, `quarterWavelength()`, `halfWavelength()`
- `shared/acoustics/design.ts` — `designUnitDepth()`

**Test coverage:** `acoustics/design.test.ts`

### Phase 4 — QRD (Reference Implementation)

**Files:**
- `shared/design/qrd.ts` — `designQRD()` with `DesignQRDInput` / `DesignQRDResult` types
- `shared/acoustics/qrd-physics.ts` — `calculateUnitDepth()` for QRD

**Test coverage:** `design/qrd.test.ts`

## Completed Work

### Phase 1 — Shared Math Foundations

**Files:**
- `shared/math/number-theory.ts` — `isPrime()`, `gcd()`, `isCoprime()`, `mod()`, `modPow()`, `getQuadraticResidues()`, `findPrimitiveRoot()`, `isPrimitiveRoot()`
- `shared/math/sequences.ts` — `generateQRDSequence()`, `generatePRDSequence()`
- `shared/math/helpers.ts` — Type assertion and construction helpers
- `shared/math/number-theory/` — Extended GCD, modular inverse (submodule)

**Test coverage:** 12 test files covering all number theory and sequence functions.

### Phase 2 — Shared Geometry

**Files:**
- `shared/geometry/depths.ts` — `sequenceToDepths()`
- `shared/geometry/scaling.ts` — Unit conversion utilities

**Test coverage:** `geometry/depths.test.ts`

### Phase 3 — Shared Acoustic Utilities

**Files:**
- `shared/acoustics/constants.ts` — `SPEED_OF_SOUND`
- `shared/acoustics/frequency.ts` — `calculateWavelength()`, `frequencyFromWavelength()`, `quarterWavelength()`, `halfWavelength()`
- `shared/acoustics/design.ts` — `designUnitDepth()`

**Test coverage:** `acoustics/design.test.ts`

### Phase 4 — QRD (Reference Implementation)

**Files:**
- `shared/design/qrd.ts` — `designQRD()` with `DesignQRDInput` / `DesignQRDResult` types
- `shared/acoustics/qrd-physics.ts` — `calculateUnitDepth()` for QRD

**Test coverage:** `design/qrd.test.ts`

### Phase 5 — PRD

**Files:**
- `shared/design/prd.ts` — `designPRD()` with `DesignPRDInput` / `DesignPRDResult` types
- Auto-selects primitive root via `findPrimitiveRoot()` if not provided
- Rejects explicitly provided non-primitive roots via `isPrimitiveRoot()`
- `generatePRDSequence()` uses `modPow()` (exact for large primes)

**Test coverage:** `design/prd.test.ts` (7 tests)

## Not Started

- Phase 6 — Skyline Diffuser
- Phase 7 — Poly Diffuser
- Phase 8 — Helmholtz Resonator
- Phase 9 — ABFUSOR

## Missing Infrastructure

The pre-plan calls for these modules which do not yet exist:

- `shared/validators/` — Validation functions for all panel types
- `shared/math/grids.ts` — 2D grid generation for Skyline/Poly
- `shared/acoustics/response.ts` — Shared frequency analysis (`generateOctaveBands()`, `generateThirdOctaveBands()`)
- `shared/acoustics/materials.ts` — Material models for Helmholtz/ABFUSOR

## UI

Only a skeleton `app/app.vue` exists. No UI components built yet.
