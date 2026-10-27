# a-acoustics

A TypeScript application for calculating acoustic diffusion panels. It provides
a tested, strongly-typed core for computing diffuser geometry and acoustic
response across several diffuser types.

The project is scaffolded on [Nuxt 4](https://nuxt.com), but the physics and
mathematics core lives in [`shared/`](./shared) as framework-agnostic modules
and is fully unit-tested with Vitest, independent of the Nuxt app layer.

## Tech stack

- **Framework**: Nuxt 4 / Vue 3 (app layer in [`app/`](./app))
- **Language**: TypeScript (strict, `noUncheckedIndexedAccess`)
- **Core logic**: [`shared/`](./shared) — acoustics, geometry, math, design,
  validators, and shared types
- **Testing**: Vitest + @testing-library/vue
- **Linting / formatting**: Biome

## Getting started

Install dependencies (runs `nuxt prepare` via the `postinstall` hook):

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Other scripts:

| Command          | Description                                            |
| ---------------- | ------------------------------------------------------ |
| `npm run dev`    | Start the Nuxt development server                      |
| `npm run build`  | Build the application for production                   |
| `npm run test`   | Run the Vitest test suite (watch mode)                 |
| `npm run test --run` | Run the Vitest test suite once and exit            |
| `npm run typecheck`  | Type-check the app and shared modules              |
| `npm run lint`   | Lint with Biome (`--write` applies safe fixes)         |
| `npm run format` | Format with Biome                                      |

## Architecture

The separation between mathematics, geometry, acoustics, and design
coordination is intentional and should be preserved as new diffuser types are
added.

- **[`shared/math/`](./shared/math)** — number theory (primality, modular
  arithmetic, factorization), sequences (QRD/PRD generators), and branded
  physical-unit constructors. All entry into the math system goes through
  assertion + branding helpers.
- **[`shared/geometry/`](./shared/geometry)** — geometric calculations for
  panels and surfaces.
- **[`shared/acoustics/`](./shared/acoustics)** — acoustic models: wavelength /
  frequency, QRD and Helmholtz physics, material properties, and frequency
  response analysis.
- **[`shared/design/`](./shared/design)** — per-diffuser-type design
  coordination (QRD, PRD, poly, skyline, Helmholtz, abfusor).
- **[`shared/validators/`](./shared/validators)** — structured, non-throwing
  validation for every panel type.
- **[`shared/types/`](./shared/types)** — global TypeScript types and branded
  physical units.
- **[`app/`](./app)** — the Nuxt application layer on top of the core.

### Import paths

Shared modules are imported via aliases (see `tsconfig.paths.json`):

```
#shared/*        → shared/*
@acoustics/*     → shared/acoustics/*
@design/*        → shared/design/*
@geometry/*      → shared/geometry/*
@math/*          → shared/math/*
@units/*         → shared/types/*
@utils/*         → shared/utils/*
@validators/*    → shared/validators/*
```

## Diffuser types

See [`docs/`](./docs) for specifications and lookup per diffuser type:

- [QRD](./docs/QRD.md) — Quadratic Residue Diffuser
- [PRD](./docs/PRD.md) — Primitive Root Diffuser
- [POLY](./docs/POLY.md) — Polynomial diffusers
- [SKYLINE](./docs/SKYLINE.md) — Skyline diffusers
- [PYRAMID](./docs/PYRAMID.md) — Pyramid absorbers
- [BINARY-AMPLITUDE](./docs/BINARY-AMPLITUDE.md) — Binary amplitude diffusers
- [QBARREL](./docs/QBARREL.md) — QBarrel diffusers
- [FRACTAL](./docs/FRACTAL.md) — Fractal diffusers
- [Helmholtz](./docs/Helmholtz.md) — Helmholtz resonators
- [ABFUSOR](./docs/ABFUSOR.md) — ABFUSOR diffusers

## Testing approach

Core logic follows test-driven development: write the failing test first, then
implement. Invalid-input cases (non-finite values, out-of-range boundaries) are
tested alongside correctness cases so that malformed input is rejected at the
construction boundary (`as*` helpers) before it can reach the calculations.
