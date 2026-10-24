import { defineVitestConfig } from "@nuxt/test-utils/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";

export default defineVitestConfig({
	vite: {
		// Vitest resolves test files with its own Vite pipeline, so the `alias`
		// map in `nuxt.config.ts` does not apply here. `tsconfig.paths.json` is
		// the single source of truth for both.
		plugins: [
			tsconfigPaths({
				projects: [
					fileURLToPath(new URL("./tsconfig.paths.json", import.meta.url)),
				],
			}),
		],
	},
	test: {
		environment: "nuxt",
	},
});
