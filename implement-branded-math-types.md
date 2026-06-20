## 1. Mathematical Functions (`shared/math/`)

### `shared/math/number-theory.ts`
- `gcd(a: number, b: number)` -> `gcd(a: PositiveInteger, b: PositiveInteger)`
- `mod(n: number, m: number)` -> `mod(n: number, m: Modulus)`
- `modPow(base: number, exp: number, modulus: number)` -> `modPow(base: number, exp: number, modulus: Modulus)`
- `getQuadraticResidues(p: number)` -> `getQuadraticResidues(p: Prime)`
- `findPrimitiveRoot(p: number)` -> `findPrimitiveRoot(p: Prime)`

### `shared/math/factors.ts`
- `getPrimeFactors(n: number)` -> `getPrimeFactors(n: PositiveInteger)`
- Return type of `getPrimeFactors` should be `Prime[]`.

### `shared/math/sequences.ts`
- `generateQRDSequence(p: number)` -> `generateQRDSequence(p: Prime)`

### `shared/math/helpers.ts`
- `assertPositiveInteger(n: number)` -> `assertPositiveInteger(n: PositiveInteger)`
- `assertPrime(n: number)` -> `assertPrime(n: Prime)`

## 2. Design and Acoustics (`shared/design/`, `shared/acoustics/`)

### `shared/design/qrd.ts`
- `DesignQRDInput.prime`: `number` -> `Prime`

### `shared/acoustics/design.ts`
- `designUnitDepth(frequency: Frequency, p: number)` -> `designUnitDepth(frequency: Frequency, p: Prime)`

## 3. Tests

The following tests should be updated to use the branded types where appropriate. This may involve using type assertions if the test framework doesn't handle the brands automatically during input.

- `shared/math/number-theory/mod-inverse.test.ts`
- `shared/math/number-theory/isCoprime.test.ts`
- `shared/math/factors.test.ts`
- `shared/math/helpers.test.ts`
- `shared/math/sequences.test.ts`
- `shared/acoustics/design.test.ts`
