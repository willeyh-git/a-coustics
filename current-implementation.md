# Current Implementation

## Summary from @shared/pre-plan.md

The project aims to build a strongly-typed, test-driven Nuxt application for designing and analyzing acoustic treatment systems. 

**Key Engineering Principles:**
- **Strong Typing**: Strictly no `any` or `unknown` without justification. Use of branded primitive types for physical quantities (Length, Area, Volume, Frequency, Density, FlowResistivity).
- **Test Driven Development (TDD)**: New features must be developed using Vitest, with tests written before production code.
- **Separation of Concerns**: Logic is divided into three layers:
    1. **Number Theory**: Pure mathematics (primes, residues, modular arithmetic).
    2. **Geometry**: Conversion of math sequences into physical dimensions.
    3. **Acoustics**: Conversion of geometry into acoustic behavior.
- **Roadmap**: Foundations first (Math -> Geometry -> Acoustics), followed by specific panel implementations (QRD, PRD, Skyline, Poly, Helmholtz, ABFUSOR).

---

## Project Structure & Implementation

### `shared/types/`
- `units.ts`:
    - **Types**: `Length`, `Area`, `Volume`, `Frequency`, `Density`, `FlowResistivity` (Branded types).
    - **Constants**: `m` (Length), `Hz` (Frequency).
- `core.ts`:
    - **Interfaces**: `FrequencyRange`, `MaterialProperties`.

### `shared/math/`
- `number-theory.ts`:
    - **Methods**: `isPrime`, `gcd`, `isCoprime`, `modPow`, `getQuadraticResidues`.
- `extended-gcd.ts`:
    - **Methods**: `extendedGcd`.
- `factors.ts`:
    - **Methods**: `getPrimeFactors`.
- `helpers.ts`:
    - **Methods**: `clamp`.
- `sequences.ts`:
    - **Methods**: `generateQRDSequence`.
- **Tests**:
    - `number-theory/gcd.test.ts`
    - `number-theory/isCoprime.test.ts`
    - `number-theory/isPrime.test.ts`
    - `number-theory/residues.test.ts`
    - `number-theory/extended-gcd.test.ts`
    - `number-theory/primitive.test.ts`
    - `factors.test.ts`
    - `helpers.test.ts`
    - `sequences.test.ts`

### `shared/geometry/`
- `scaling.ts`:
    - **Methods**: `toLength`, `toFrequency` (scalar conversions).
- `depths.ts`:
    - **Methods**: `sequenceToDepths`.
- **Tests**:
    - `depths.test.ts`

### `shared/acoustics/`
- `constants.ts`:
    - **Constants**: `SPEED_OF_SOUND`.
- `frequency.ts`:
    - **Methods**: `calculateWavelength`, `frequencyFromWavelength`, `quarterWavelength`, `halfWavelength`.
- `qrd-physics.ts`:
    - **Methods**: `calculateUnitDepth` (QRD-specific physics).
- `design.ts`:
    - **Methods**: `designUnitDepth`.
- **Tests**:
    - `design.test.ts`

### `shared/design/`
- `qrd.ts`:
    - **Methods**: `designQRD` (high-level coordinator).
- **Tests**:
    - `qrd.test.ts`

### `app/`
- `app.vue`: Nuxt application entry point.
