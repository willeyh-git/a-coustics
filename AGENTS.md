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

### Type Safety

- **Strongly Typed**: Every function, variable, and object must have explicit types.
- **No `any`**: The use of `any` is strictly prohibited. Use `unknown` if the type cannot be determined, and perform type narrowing.
- **Shared Types**: Use the types defined in `shared/types/` where applicable.
- **Branded Types**: Use the types defined in `shared/types/` where applicable.
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
  - `utils/`: Helper functions.
- `public/`: Static assets.

## Development Commands

- `npm run dev`: Start development server.
- `npm run test`: Run all Vitest tests.
- `npm run lint`: Run Biome linting.
- `npm run format`: Run Biome formatting.
- `npm run build`: Build for production.
