# Acoustic diffusers: formulas at a glance

Let c ≈ 343 m/s be the speed of sound in air.

## 1. QRD — Quadratic Residue Diffuser
```
r_n = n^2 mod N
d_n = r_n / N * c / (2 f_0)
```
- N: commonly an odd prime (sequence order).
- r_n: quadratic residue.
- d_n: well depth.
- f_0: design frequency parameter.

## 2. PRD — Primitive Root Diffuser
```
r_n = g^n mod p
d_n = r_n / p * c / (2 f_0)
```
- p: prime number.
- g: primitive root modulo p.
- r_n: sequence value.

Note: Exact normalization and indexing depend on the PRD design convention.

## 3. Skyline Diffuser
```
h_ij = r_ij × u
u  = λ₀ / (2p)
```
- h_ij: height of block at grid position (i,j).
- r_ij: residue from the 2D sequence, r_ij = (S(i) + S(j)) mod p, with S a QRD or PRD sequence.
- u: unit height derived from the design frequency (λ₀ = c / f_design, p the source prime).
- Equivalently, when a target maximum height H is given: h_ij = H × r_ij / R_max, where R_max is the maximum residue reached.
- H = R_max × u is the maximum block height.

## 4. Poly Diffuser
```
r_ij = (q1 * i² + q2 * j²) mod p
d_ij = r_ij × u
u  = λ₀ / (2p)
```
- p: prime number (grid order).
- q1, q2: nonzero quadratic-residue coefficients (congruence classes mod p) weighting the row (i²) and column (j²) axes.
- Convention: any integer coefficient is normalized to its canonical representative in [0, p); equivalent representatives give identical grids. Coefficients congruent to 0 mod p are rejected as degenerate (they collapse one axis).
- r_ij: residue at grid position (i, j).
- u: unit depth derived from the design frequency (λ₀ = c / f_design, p the source prime).
- Equivalently, when a target maximum depth d is given: d_ij = d × r_ij / R_max, where R_max is the maximum residue reached.
- d = R_max × u is the maximum well depth.

## 5. Fractal Diffuser
```
P_{k+1} = T(P_k)
h(x,y) = sum_{k=0}^K a_k P_k(x,y)
```
- P_k: pattern at recursion level k.
- T: recursive scaling or pattern-generation operation.
- a_k: scale or height weight.
- K: number of recursion levels.

This is a general mathematical model, not a unique fractal-diffuser formula.

## 6. Pyramid Diffuser

For a square-based pyramid with base width w and height H:
```
h(x,y) = H * (1 - 2 max(|x|,|y|) / w)
```
for |x|,|y| ≤ w/2.

- H: pyramid height.
- w: base width.
- x,y: coordinates measured from the pyramid's center.

This describes the surface geometry, not its complete acoustic performance.

## 7. QBarrel / Curved Diffuser

For a cylindrical convex surface:
```
z(x) = R - sqrt(R^2 - x^2)
theta = arcsin(x / R)
```
- R: radius of curvature.
- x: horizontal position from the center.
- z(x): surface sag relative to the center.
- theta: local surface-normal angle.

This describes the curvature; slats or QRD patterns can add further scattering.

## 8. ABFUSOR — Absorbing Binary Diffuser

Hybrid absorber/diffuser built on QRD well depths. Shallow wells (ascending by
depth, fraction `absorptiveRatio`) are filled with absorptive material and become
`ABSORPTIVE`; deep wells remain `DIFFUSIVE` (plain QRD depth).

Diffusive wells: identical diffusion profile to the underlying QRD design.

Absorptive wells are rigid-backed porous layers (Delany–Bazley equivalent fluid).
Let σ = complex flow resistivity, ρ₀ = air density, γ = 1.4, c = speed of sound,
Z₀ = ρ₀c (air characteristic impedance), L = layer thickness, f = frequency:

```
ρ̂ = ρ₀·α∞ + σ̂/(jω)         (α∞ ≈ 1 tortuosity; σ̂ = σ(1 + 0.0571·(100/f)^0.754 − j0.087·(100/f)^0.718))
ĉ = γp0 / (γ − (γ − 1)·F),  F = 1 / sqrt(1 + (0.59 − j0.124)·(100/f)^0.5)
Zc = sqrt(ρ̂ · ĉ)            (characteristic impedance)
k = ω · sqrt(ρ̂ / ĉ)         (wavenumber)
Zs = Rs + Zc · coth(j·k·L)   (Rs ≈ 0 rigid backing; backed-layer surface impedance)
α = 1 − |Zs − Z₀| / |Zs + Z₀| (normal-incidence power absorption)
```

The overall absorption profile is the per-well average (diffusive wells
contribute 0). A well's absorptive-layer thickness equals that well's QRD depth.

## Useful frequency estimate

For a well diffuser, a rough quarter-wavelength depth estimate is
```
d ≈ c / (4 f)
```
For example, at 500 Hz:
d ≈ 343 / (4 * 500) ≈ 0.172 m

That is approximately 17.2 cm. This is a rough acoustic scale, not a universal design formula for every diffuser.
