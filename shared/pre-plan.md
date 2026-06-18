# Acoustic Panel Calculator — Pre-Plan

## Overview & Goals

Build a strongly-typed, test-driven Nuxt application that calculates optimal dimensions for six acoustic panel types:

1. **QRD** (Quadratic Residue Diffuser)
2. **PRD** (Prime Residue Diffuser) 
3. **Skyline** (Binary diffuser with skyline profile)
4. **Poly** (Polynomial diffuser / 2D QRD)
5. **Helmholtz** (Resonant absorber)
6. **ABFUSOR** (Absorbing Binary Diffuser — hybrid absorber/diffuser)

### Core Principles
- **Strong typing**: No `any` or `unknown` without explicit justification; prefer discriminated unions and branded types
- **Test-driven development**: Write tests before implementation; shared math lives in `shared/`
- **Shared code isolation**: All mathematical models, constants, and utilities live under `./shared/
- **Reusability**: Math functions should be composable and testable independently of UI

---

## Common Interfaces & Shared Types

### Core Domain Types (`shared/types/core.ts`)

```typescript
// Physical dimensions (always positive, with units)
type Length = Brand<number, 'm'>;  // meters — primary unit
const m: Unit<Length> = 1;

interface PanelBase {
  id: string;
  name: string;
  type: PanelType;
}

type PanelType = 
  | 'QRD'
  | 'PRD'
  | 'SKYLINE'
  | 'POLY'
  | 'HELMHOLTZ'
  | 'ABFUSOR';

// Frequency range for calculations
type FrequencyRange = {
  min: Length;      // Hz — minimum target frequency
  max: Length;      // Hz — maximum target frequency
};

// Material properties
type MaterialProperties = {
  density: Length;           // kg/m³
  flowResistivity: Length;   // Pa·s/m² (Rayls)
  thickness: Length;         // m
  porosity?: number;         // 0-1, optional for some materials
};
```

### Panel-Specific Types (`shared/types/panels.ts`)

```typescript
// QRD / PRD / Skyline / Poly — all share these base properties
interface ResiduePanelBase {
  wellDepth: Length;         // m — depth of each well
  wellWidth: Length;         // m — width of each well (QRD/PRD) or cell size (Skyline)
  wellSpacing: Length;       // m — center-to-center spacing between wells/cells
  numWells: number;          // total number of wells in the panel
  maxDepth: Length;          // m — maximum depth across all wells
  minDepth: Length;          // m — minimum depth across all wells
}

// Helmholtz-specific
type HelmholtzPanel = {
  neckDiameter: Length;      // m — diameter of the resonator neck
  neckLength: Length;        // m — length of the neck (including flange)
  cavityVolume: Length³;     // m³ — volume of the air cavity behind the panel
  panelArea: Length²;        // m² — total area of the perforated panel
  porosity: number;          // 0-1 — fraction of open area in the neck
};

// ABFUSOR-specific (hybrid absorber/diffuser)
type AbfusorPanel = {
  wellDepth: Length;
  wellWidth: Length;
  wellSpacing: Length;
  numWells: number;
  maxDepth: Length;
  minDepth: Level;
  absorptionMaterial?: MaterialProperties; // optional backing absorber
};
```

### Calculation Results (`shared/types/results.ts`)

```typescript
interface QRDResult {
  wellDepths: Length[];      // individual depth for each well
  frequencyResponse: FrequencyResponse;
  diffusionCoefficient: number; // average over target range
}

interface HelmholtzResult {
  resonantFrequency: Length;  // Hz — primary resonance
  bandwidth: Length;          // Hz — -3dB bandwidth
  absorptionCoefficients: AbsorptionCurve; // frequency → alpha
}

// Common response types
interface FrequencyResponse {
  frequencies: Length[];
  diffusionCoefficients: number[];
}

interface AbsorptionCurve {
  frequencies: Length[];
  coefficients: number[]; // 0-1 absorption coefficient
}
```

---

## Mathematical Foundations

### QRD (Quadratic Residue Diffuser)

**Core formula**: Well depth for well `i` is:

```
d_i = d_max × (q × i² mod p) / q
```

Where:
- `p` = prime number (typically 7, 11, 13, or 17)
- `q` = quadratic residue modulo `p` (e.g., for p=7: q=2, 4; for p=11: q=3, 4, 5, 9)
- `d_max` = maximum depth
- `i` = well index from 0 to p-1

**Key constraints**:
- Well spacing must be ≥ 2× wavelength at target frequency (typically 1.7–2.0 m for mid-range)
- Number of wells per row = prime number
- Panel width = numWells × wellSpacing

### PRD (Prime Residue Diffuser)

**Core formula**: Well depth for well `i` is:

```
d_i = d_max × ((a × i + b) mod p) / q
```

Where:
- `p` = prime number
- `q` = quadratic residue modulo `p`
- `a`, `b` = coprime integers (gcd(a, p) = 1)
- `d_max` = maximum depth

**Key constraints**:
- Same spacing rules as QRD
- More flexible than QRD — can achieve any phase distribution
- Often used when specific diffusion patterns are needed

### Skyline Diffuser

**Core formula**: Binary diffuser with skyline profile. Each cell is either:
- **High** (depth = d_max) → contributes +1 to the skyline
- **Low** (depth = 0 or shallow) → contributes 0

The skyline sequence must be a valid binary diffusion sequence (typically derived from QRD/PRD sequences).

**Key constraints**:
- Cell spacing typically 2.5–3.0 m for mid-range frequencies
- Number of cells per row = prime number
- Skyline profile should have no consecutive identical values (alternating high/low)

### Poly Diffuser (Polynomial / 2D QRD)

**Core formula**: Two-dimensional quadratic residue:

```
d_{i,j} = d_max × ((q₁ × i² + q₂ × j²) mod p) / q
```

Where `i` and `j` are row/column indices, and `q₁`, `q₂` are quadratic residues.

**Key constraints**:
- Requires square or rectangular panel with equal well spacing in both dimensions
- Well depth varies across the panel (not uniform like QRD/PRD)
- Often used for large panels where 1D diffusion is insufficient

### Helmholtz Resonator

**Core formula**: Resonant frequency:

```
f = c × √(ρ₀ / (2π)) × √((A / V) × (1 / L_eff))
```

Where:
- `c` = speed of sound (~343 m/s at 20°C)
- `ρ₀` = air density (~1.2 kg/m³)
- `A` = total open area of necks = porosity × (π × r²) × numNecks
- `V` = cavity volume behind panel
- `L_eff` = effective length = L + 1.7×r (end correction for flanged opening)
- `r` = radius of neck

**Key constraints**:
- Neck diameter typically 20–50 mm
- Cavity depth must be > 4× wavelength at target frequency to avoid standing waves
- Multiple resonators can be tuned to different frequencies using varying cavity volumes or neck sizes

### ABFUSOR (Absorbing Binary Diffuser)

**Core formula**: Hybrid of binary diffuser + Helmholtz absorber.

Each well is either:
- **Diffusive** (empty, depth = d_max) → scatters sound
- **Absorptive** (filled with porous material, shallow depth) → absorbs sound at specific frequencies

The absorption frequency for each absorptive well is tuned by the cavity volume behind it.

**Key constraints**:
- Requires backing cavity with variable volumes per well
- Absorption material must be placed only in absorptive wells
- Diffusive wells remain empty to maintain scattering

---

## Architecture & Module Design

### Directory Structure

```
shared/
├── types/
│   ├── core.ts          # Length, FrequencyRange, MaterialProperties
│   └── panels.ts        # Panel-specific interfaces
├── math/
│   ├── constants.ts     # Speed of sound, air density, etc.
│   ├── qrd-prd.ts       # QRD/PRD algorithms and validation
│   ├── skyline.ts       # Skyline sequence generation
│   ├── poly.ts          # 2D polynomial diffuser
│   ├── helmholtz.ts     # Resonator calculations
│   └── abfusor.ts       # Hybrid absorber/diffuser
├── utils/
│   ├── frequency.ts     # Frequency conversion, octave bands
│   └── geometry.ts      # Panel dimensions, spacing validation
└── validators.ts        # Input validation for all panel types
```

### Module Responsibilities

#### `shared/math/constants.ts`
```typescript
export const SPEED_OF_SOUND = 343.0; // m/s at 20°C
export const AIR_DENSITY = 1.2041;   // kg/m³ at 20°C, 1 atm
export const AIR_PRESSURE = 101325;  // Pa
export const TEMPERATURE_20C = 293.15; // K
```

#### `shared/math/qrd-prd.ts`
```typescript
// Generate quadratic residues for a given prime
function getQuadraticResidues(p: number): number[];

// Validate that (a, p) are coprime
function isCoprime(a: number, p: number): boolean;

// Calculate well depths for QRD/PRD
function calculateWellDepths(
  prime: number,
  quadraticResidue: number,
  a?: number,
  b?: number,
  maxDepth: Length,
  numWells: number
): Length[];
```

#### `shared/math/skyline.ts`
```typescript
// Generate skyline sequence from QRD/PRD base
function generateSkylineSequence(
  prime: number,
  quadraticResidue: number,
  a?: number,
  b?: number
): boolean[];

// Validate skyline alternation (no consecutive identical values)
function validateSkylineAlternation(sequence: boolean[]): void;
```

#### `shared/math/poly.ts`
```typescript
interface PolyConfig {
  prime: number;
  q1: number; // quadratic residue for rows
  q2: number; // quadratic residue for columns
  maxDepth: Length;
  numWellsPerRow: number;
  numWellsPerColumn: number;
}

function calculatePolyDepths(config: PolyConfig): Length[][];
```

#### `shared/math/helmholtz.ts`
```typescript
interface HelmholtzConfig {
  neckDiameter: Length;
  neckLength: Length;
  cavityVolume: Length³;
  panelArea: Length²;
  porosity: number;
}

function calculateResonantFrequency(config: HelmholtzConfig): Length;
function calculateAbsorptionCurve(
  config: HelmholtzConfig,
  frequencyRange: FrequencyRange
): AbsorptionCurve;
```

#### `shared/math/abfusor.ts`
```typescript
interface AbfusorConfig {
  wellDepth: Length;
  wellWidth: Length;
  wellSpacing: Length;
  numWells: number;
  maxDepth: Length;
  minDepth: Length;
  absorptionMaterial?: MaterialProperties;
}

function calculateAbfusorDepths(
  config: AbfusorConfig,
  skylineSequence: boolean[]
): Length[];
```

#### `shared/validators.ts`
```typescript
interface ValidationErrors {
  [key: string]: string[];
}

function validateQRD(config: QRDConfig): ValidationErrors;
function validateHelmholtz(config: HelmholtzConfig): ValidationErrors;
// ... etc for each panel type
```

---

## Testing Strategy

### Unit Tests (`shared/math/*.test.ts`)

**Test before implementation**: Write tests that define expected behavior, then implement the math to pass them.

```typescript
// Example: QRD well depth calculation
import { calculateWellDepths } from './qrd-prd';
import { m } from '../types/core';

describe('QRD well depth calculation', () => {
  it('calculates correct depths for p=7, q=2', () => {
    const maxDepth = 10 * m;
    const depths = calculateWellDepths(7, 2, undefined, undefined, maxDepth, 7);
    
    // Expected: [0, 5.714..., 11.428..., 17.142..., 22.857..., 28.571..., 34.285...]
    expect(depths).toHaveLength(7);
    expect(depths[0]).toBeCloseTo(0, 3);
    expect(depths[6]).toBeCloseTo(maxDepth, 3);
  });

  it('throws for invalid quadratic residue', () => {
    // q=1 is not a valid quadratic residue mod 7
    expect(() => calculateWellDepths(7, 1, undefined, undefined, m, 7))
      .toThrow('Invalid quadratic residue');
  });
});
```

### Integration Tests (`shared/math/integration.test.ts`)

Test complete panel calculations end-to-end:

```typescript
describe('QRD full calculation', () => {
  it('produces valid well depths and frequency response', async () => {
    const config: QRDConfig = {
      prime: 7,
      quadraticResidue: 2,
      maxDepth: 10 * m,
      wellSpacing: 2.5 * m,
      numWells: 49, // 7×7 grid
    };

    const result = await calculateQRD(config);
    
    expect(result.wellDepths).toHaveLength(49);
    expect(result.frequencyResponse.frequencies).toHaveLength(10); // default octave bands
    expect(result.diffusionCoefficient).toBeGreaterThan(0.7);
  });
});
```

### Validation Tests (`shared/validators.test.ts`)

```typescript
describe('QRD validation', () => {
  it('rejects well spacing too small for target frequency', () => {
    const errors = validateQRD({
      prime: 7,
      quadraticResidue: 2,
      maxDepth: 10 * m,
      wellSpacing: 0.5 * m, // Too small — wavelength at 500Hz is ~0.68m
      numWells: 49,
    });
    
    expect(errors.wellSpacing).toContain(
      'Well spacing must be ≥ 1.7× wavelength at target frequency'
    );
  });
});
```

---

## Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
- [ ] Set up `shared/types/` with core interfaces
- [ ] Implement `constants.ts` and unit tests
- [ ] Build validation framework in `validators.ts`
- [ ] Write test suite for all validators before implementation

### Phase 2: QRD & PRD (Week 2)
- [ ] Implement quadratic residue generation
- [ ] Implement well depth calculation
- [ ] Write unit tests for math functions
- [ ] Integration test with validation

### Phase 3: Skyline & Poly (Week 3)
- [ ] Skyline sequence generation from QRD/PRD base
- [ ] 2D polynomial diffuser algorithm
- [ ] Unit and integration tests

### Phase 4: Helmholtz (Week 4)
- [ ] Resonant frequency calculation
- [ ] Absorption curve over frequency range
- [ ] End correction calculations for flanged/unflanged necks
- [ ] Tests for temperature/pressure variations

### Phase 5: ABFUSOR (Week 5)
- [ ] Hybrid absorber/diffuser algorithm
- [ ] Cavity volume tuning per well
- [ ] Material absorption integration
- [ ] Tests with real material data

### Phase 6: Nuxt Integration & UI (Week 6+)
- [ ] Composables for panel calculations (`useQRD()`, `useHelmholtz()`, etc.)
- [ ] Form validation and error handling
- [ ] Results visualization components
- [ ] End-to-end tests with real user flows

---

## Key Design Decisions

### 1. Unit System: Meters (SI)
All calculations use meters as the base unit. Convert to mm/cm for display only.

### 2. Frequency Resolution
Default frequency range: **50 Hz – 4 kHz** (human speech and music range).
Octave bands used by default, but full-resolution curves available on request.

### 3. Temperature Compensation
Speed of sound varies with temperature:
```
c = 331.3 × √(T / 273.15)   // T in Kelvin
```
Provide a `temperature` parameter (default 20°C) for accurate calculations.

### 4. Material Database
Store material properties in a separate module with standardized units:
- Flow resistivity: Pa·s/m² (Rayls)
- Density: kg/m³
- Porosity: dimensionless 0–1

### 5. Error Handling
Use discriminated unions for validation errors — never `any` or generic strings.

```typescript
type ValidationErrors = {
  prime?: string[];
  quadraticResidue?: string[];
  wellSpacing?: string[];
  // ...
};
```

---

## Next Steps
1. Review this pre-plan with the team
2. Write first test suite (QRD math functions)
3. Implement QRD to pass tests
4. Iterate based on test failures and edge cases
