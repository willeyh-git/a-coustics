# Current Implementation Status

This document tracks the current state of the acoustic diffuser implementation.

## Overall Progress: ~92% Complete

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Shared Math Foundations | ✅ Complete |
| 2 | Shared Geometry | ✅ Complete |
| 3 | Shared Acoustic Utilities | ✅ Complete |
| 4 | QRD (Quadratic Residue Diffuser) | ✅ Complete |
| 5 | PRD (Primitive Root Diffuser) | ✅ Complete |
| 6 | Skyline Diffuser | ✅ Complete |
| 7 | Poly Diffuser | ✅ Complete |
| 8 | Helmholtz Resonator | ✅ Complete |
| 9 | ABFUSOR | ✅ Complete |

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

### Phase 6 — Skyline

**Files:**
- `shared/math/grids.ts` — `buildGrid()` (2D grid generation shared with Poly)
- `shared/geometry/depths.ts` — `matrixToLengths()` (2D counterpart of `sequenceToDepths()`)
- `shared/design/skyline.ts` — `designSkyline()` with `DesignSkylineInput` / `DesignSkylineResult` types
- Supports QRD or PRD sequence source (`Height(i,j) = (S(i) + S(j)) mod p`)
- PRD convention: source sequence has p entries; first/last grid rows and columns coincide (g^(p-1) = g^0 = 1)
- QRD result omits `primitiveRoot` (no sentinel value)

**Test coverage:** `math/grids.test.ts`, `design/skyline.test.ts` (19 tests); `matrixToLengths` covered in `geometry/depths.test.ts`

### Phase 7 — Poly

**Files:**
- `shared/design/poly.ts` — `designPoly()` with `DesignPolyInput` / `DesignPolyResult` types and `PolyCoefficient` type
- Residue rule `S(i,j) = (q1 × i² + q2 × j²) mod p`, scaled by the QRD unit depth
- Reuses shared infrastructure: `buildGrid` and `maxInGrid` (grids.ts), `matrixToLengths` (depths.ts), `designUnitDepth` (acoustics/design.ts)
- Treats `q1` and `q2` as congruence classes modulo `p`: any integer is accepted, normalized with `mod()`, then validated as a nonzero quadratic residue via `getQuadraticResidues()`; `q ≡ 0` is rejected as a degenerate axis-collapse
- Reports the normalized coefficients and supports asymmetric grids when `q1 ≠ q2`; with `q1 = q2 = 1` the grid coincides with the QRD-sourced Skyline grid
- Adds `maxInGrid()` to `shared/math/grids.ts`, shared with Skyline (`designSkyline` now uses it), covered by `math/grids.test.ts`

**Test coverage:** `design/poly.test.ts` (16 tests)

## Not Started

- Shared validators (`shared/validators/`) — now implemented (see below).
- Shared frequency analysis (`shared/acoustics/response.ts`) — now implemented
  (see below).
- UI components (only a skeleton `app/app.vue` exists)

## Phase 9 — ABFUSOR (Absorbing Binary Diffuser)

**Files:**
- `shared/acoustics/materials.ts` — rigid-backed porous-absorber model (Delany–Bazley equivalent fluid). `calculatePorousAbsorption()` computes the normal-incidence power-absorption coefficient of a porous layer from its complex flow resistivity, density, thermal bulk modulus, characteristic impedance and wavenumber, then the backed-layer surface impedance `Zs = Rs + Zc·coth(j·k·L)` and `α = 1 - |Zs - Z₀| / |Zs + Z₀|`. Also `porousAbsorptionResponse()` and `DEFAULT_FLOW_RESISTIVITY_FOAM`.
- `shared/design/abfusor.ts` — `designABFUSOR()` with `DesignABFUSORInput` / `DesignABFUSORResult` / `ABFUSORWell` / `ABFUSORWellState` types.

**Model:**
- Hybrid absorber/diffuser built on the QRD infrastructure: the same QRD sequence and well depths are generated, then the shallowest `absorptiveRatio` fraction of wells (by ascending depth) are converted from `DIFFUSIVE` to `ABSORPTIVE` (completely filled with absorptive material), while the deep wells remain diffusive. Shallow wells are poor phase-modulators, so filling them costs little diffusion while adding genuine absorption.
- `designABFUSOR` reuses `designUnitDepth`, `generateQRDSequence`, `sequenceToDepths` and the shared frequency-axis pattern. For each absorptive well the porous layer thickness equals that well's depth; the overall absorption curve is the per-well average (diffusive wells contribute 0). Rejects `absorptiveRatio` outside `[0, 1)`, non-prime order, and non-positive flow resistivity.
- Outputs per-well state and absorption, the overall absorption profile, peak absorption, and absorptive/diffusive fractions.

**Test coverage:** `acoustics/materials.test.ts` (7), `design/abfusor.test.ts` (10).

## Phase 8 — Helmholtz Resonator

**Files:**
- `shared/acoustics/helmholtz-physics.ts` — `calculateNeckArea()`, `calculateEffectiveLength()` (`L + 1.7r`), `calculateResonantFrequency()` (`f = (c/2π)·√(A/(V·L_eff))`), `calculateAbsorptionCurve()` (impedance model `α = 4r/((r+1)²+x²)`), `calculateBandwidth()` (analytic −3 dB solution, numerically stable root form), `resolveAcousticResistance()` (shared default/validation)
- `shared/design/helmholtz.ts` — `designHelmholtz()` with `DesignHelmholtzInput` / `DesignHelmholtzResult` types
- `shared/acoustics/helmholtz-physics.test.ts`, `shared/design/helmholtz.test.ts`

**Model:**
- Lumped-parameter mass–spring resonator. Neck area `A = πr²`, effective neck length `L_eff = L + 1.7r` (both-ends end correction), cavity volume `V`.
- Resonant frequency `f₀ = (c/2π)·√(A/(V·L_eff))`.
- Absorption coefficient derived from the Z₀-referenced specific impedance `z = r + jx`; peaks at `f₀` where `x = 0`. Default assumes a critically-matched neck (`r = 1`, `α = 1` at resonance); an explicit `acousticResistance` (rayls/m⁴) overrides this.
- Bandwidth is the −3 dB (half-power) width, solved analytically from `α = 0.5` (lower cutoff computed as `2b/(x₀ + root)` to avoid cancellation) so it is independent of any sampling axis; returns 0 when absorption never reaches 0.5 (over- or under-damped). All inputs, including an explicit `acousticResistance`, must be positive.
- `designHelmholtz` returns the resonant frequency, normalized/acoustic resistance, an absorption curve over a logarithmic axis (f₀/3 … f₀·3, or an explicit `frequencyAxis`), and the bandwidth.

**Test coverage:** 30 tests across the two files; the closed-form bandwidth is verified against half-power crossings located by bisection on the absorption curve.


## Missing Infrastructure

The pre-plan calls for these modules which do not yet exist:

- `shared/validators/` — Validation functions for all panel types (now implemented).
- `shared/acoustics/response.ts` — Shared frequency analysis (`generateFrequencyAxis()`,
  `generateOctaveBands()`, `generateThirdOctaveBands()`, plus the ISO 266 band
  center tables). Now implemented.
- `shared/acoustics/materials.ts` (Shared Material Models for Helmholtz/ABFUSOR) is now implemented (Phase 9).

`shared/math/grids.ts` (2D grid generation for Skyline/Poly) is now implemented.

## Shared Frequency Analysis (`shared/acoustics/response.ts`)

Implemented (TDD, `shared/acoustics/response.test.ts`). Replaces the private,
duplicated `generateFrequencyAxis` copies that previously lived in
`shared/design/helmholtz.ts` and `shared/design/abfusor.ts`, both of which now
import the shared version.

- `generateFrequencyAxis(center, points = 400)` — logarithmic axis from
  `center/3` to `center*3` (the default sweep used by the design modules).
- `OCTAVE_BAND_CENTERS_HZ` / `THIRD_OCTAVE_BAND_CENTERS_HZ` — ISO 266 preferred
  band-center tables.
- `octaveBandCenters(range)` / `thirdOctaveBandCenters(range)` — band centers
  whose interval overlaps a `FrequencyRange`, branded.
- `generateOctaveBands(response)` / `generateThirdOctaveBands(response)` —
  aggregate a finely-sampled `FrequencyResponse` into per-band arithmetic means.
  Each sample is assigned to the band whose ISO edge interval contains it, so
  boundaries are the exact ISO band edges (not a linear midpoint); bands with no
  samples are omitted. Third-octave bands tile the spectrum exactly; octave
  bands use two interleaved ISO alignments that overlap, so a sample in an
  overlap goes to the nearest center among the covering bands.

## UI

Only a skeleton `app/app.vue` exists. No UI components built yet.
