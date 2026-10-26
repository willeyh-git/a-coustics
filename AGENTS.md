# Project Agent Instructions

This project is an application for calculating acoustic diffusion panels. It is built using the Nuxt 4 framework with Vue 3 and focuses on high precision and mathematical accuracy.

Implementation plan and detailed instructions in `shared/pre-plan.md`

## Tech Stack

- **Framework**: Nuxt 4, Vue 3
- **Language**: TypeScript (Strictly typed)
- **Testing**: Vitest, @testing-library/vue
- **Linting/Formatting**: Biome
- **Styling**: Tailwind CSS (implied by common Nuxt setups, though not explicitly seen in `package.json`, check if it's used)

## Coding Guidelines

### Import Paths

- **Aliases**: Import shared modules with an alias, not a relative path. Relative paths (`./`, `../`) are reserved for imports inside the same `shared/<area>/` directory.
  - `#shared/*` → `shared/*` (provided by Nuxt, prefer for cross-area imports when no shorter alias exists)
  - `@acoustics/*` → `shared/acoustics/*`
  - `@design/*` → `shared/design/*`
  - `@geometry/*` → `shared/geometry/*`
  - `@math/*` → `shared/math/*`
  - `@units/*` → `shared/types/*` (do not use `@types/*`, that name belongs to the npm `@types` namespace)
  - `@utils/*` → `shared/utils/*`
  - `@validators/*` → `shared/validators/*`
- **Single source of truth**: `tsconfig.paths.json` holds the alias map. `nuxt.config.ts` derives the Nuxt `alias` option from it (runtime + generated editor configs) and `vitest.config.ts` feeds it to `vite-tsconfig-paths` (Vitest resolves test files with its own Vite pipeline). Add new aliases only in `tsconfig.paths.json`; do not redeclare them in `tsconfig.json`.

### Type Safety

- **Strongly Typed**: Every function, variable, and object must have explicit types.
- **No `any`**: The use of `any` is strictly prohibited. Use `unknown` if the type cannot be determined, and perform type narrowing.
- **Shared Types**: Use the types defined in `shared/types/` where applicable.
- **Branded Types**: Use the types defined in `shared/types/` where applicable. All entry into the math system must be via assertion → branding. Use construction functions (e.g., `asPrime(n: number): Prime`) instead of just assertions to ensure runtime validation and type-safe arithmetic.
- **Branded parameters are invariant**: a `Prime` value is not assignable to a `PositiveInteger` parameter (and vice versa). Generic math (`mod`, `modPow`, `modInverse`, `gcd`, `extendedGcd`) accepts `PositiveIntegerLike` (= `PositiveInteger | Modulus | Prime`) so every positively-branded value can be passed without a cast; keep the narrow brand only where the function truly needs it (e.g. primality).
- **Indexed access** (`noUncheckedIndexedAccess` is on in the generated Nuxt configs): an array read yields `T | undefined`. Prefer `at(values, index)` from `@utils/at` for reads whose bounds are guaranteed by surrounding logic (it throws, which is reserved for impossible states); pass sequence **values** rather than indices across module boundaries (`buildGrid`) so the trap cannot arise at all.
- **Converting Scalar values**: Convert scalar values to branded types by scaling in `shared/geometry/scaling` where applicable.

### Development Workflow

- **Test Driven Development (TDD)**: New features should be developed using TDD. Write tests first using Vitest before implementing the logic.
- **Shared Logic**: Core calculation logic, physics models, and mathematical utilities should reside in the `shared/` directory to ensure reusability and separation of concerns.
- **Component Design**: Use headless UI patterns where possible and maintain clean component separation.

## Project Structure

- `app/`: Application specific logic, components, and pages.
- `shared/`: Core project logic.
  - `acoustics/`: Acoustic-specific calculations.
  - `design/`: Design-related logic and parameters.
  - `geometry/`: Geometric calculations for panels and surfaces.
  - `math/`: Fundamental mathematical functions, sequences, and number theory.
  - `physics/`: Physical properties and behavior models.
  - `types/`: Global TypeScript types and interfaces.
  - `validators/`: Structured, non-throwing validation for every panel type.
  - `utils/`: Helper functions.
- `tsconfig.paths.json`: alias map (single source of truth for shared-module import paths). Do not duplicate the map in `tsconfig.json` — that file only wires the editor to the `.nuxt/tsconfig.*.json` configs that Nuxt generates.
- `docs/`: Documentation and diffuser type lookup (individual files per diffuser type, e.g., `docs/QRD.md`, `docs/PRD.md`, `docs/SKYLINE.md`).

## Documentation

- Diffuser type specifications and lookup: `docs/`
- Implementation plan and detailed instructions: `shared/pre-plan.md`

## Development Commands

- `npm run dev`: Start development server.
- `npm run test`: Run all Vitest tests.
- `npm run lint`: Run Biome linting.
- `npm run format`: Run Biome formatting.
- `npm run typecheck`: Typecheck `shared/**` and `app/**` under the repo's `strict` + `noUncheckedIndexedAccess` settings (requires the configs generated by `nuxt prepare`).
- `npm run build`: Build for production.
