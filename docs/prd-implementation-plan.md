# PRD Implementation Plan

## Overview
This document outlines the step-by-step approach for implementing the Primitive Root Diffuser (PRD) functionality, following TDD principles with branded types and helper methods.

## Step-by-Step Implementation Plan

### Phase 1: Setup and Test Structure

1. **Create the PRD math module**
   - Create `shared/math/prd.ts` file
   - Create `shared/math/prd.test.ts` file

2. **Define core PRD sequence generation function**
   - Implement `generatePRDSequence(p: Prime, g: number): number[]`
   - Follow pattern of existing `generateQRDSequence`

### Phase 2: Core Mathematical Implementation

3. **Implement the core PRD sequence generator**
   - For prime p and primitive root g
   - Generate S(i) = g^i mod p for i from 0 to p-1
   - Return array of sequence values

4. **Write test cases for PRD sequence generation**
   - Test with known primitive root examples 
   - Verify correct sequence generation
   - Validate error handling for invalid inputs

### Phase 3: Integration Testing

5. **Implement PRD design module**
   - Create `shared/design/prd.ts` file
   - Implement `designPRD()` function
   - Use existing geometry and acoustics utilities

6. **Write comprehensive tests for PRD design**
   - Test complete design workflow
   - Verify unit depth calculations
   - Validate sequence generation integration

### Phase 4: Validation

7. **Add validation functions**
   - Ensure input parameters are valid
   - Validate that g is a primitive root of p

8. **Test edge cases**
   - Invalid primes
   - Invalid primitive roots
   - Boundary conditions

## Detailed Implementation Steps

### Step 1: Create PRD Math Module Structure

```bash
touch shared/math/prd.ts
touch shared/math/prd.test.ts
```

### Step 2: Implement Core PRD Sequence Generation

In `shared/math/prd.ts`, implement:

```typescript
import type { Prime } from "../types/units";
import { findPrimitiveRoot } from "./number-theory";

/**
 * Generates a Primitive Root Diffuser (PRD) sequence for a given prime p and primitive root g.
 * The sequence is defined as S(i) = g^i mod p for i from 0 to p-1.
 * 
 * @param p - A prime number.
 * @param g - A primitive root modulo p.
 * @returns An array of integers representing the PRD sequence.
 */
export function generatePRDSequence(p: Prime, g: number): number[] {
  // Implementation here
}
```

### Step 3: Write Initial Test Cases

In `shared/math/prd.test.ts`, implement:

```typescript
import { describe, it, expect } from "vitest";
import { generatePRDSequence } from "./prd";

describe("generatePRDSequence", () => {
  it("should generate correct PRD sequence for prime 7 with primitive root 3", () => {
    // Test case based on pre-plan example
    const result = generatePRDSequence(7, 3);
    expect(result).toEqual([1, 3, 2, 6, 4, 5]);
  });

  it("should handle edge cases properly", () => {
    // Test edge cases and error conditions
  });
});
```