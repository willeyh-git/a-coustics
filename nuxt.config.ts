// https://nuxt.com/docs/api/configuration/nuxt-config

import { fileURLToPath } from "node:url";
import { compilerOptions } from "./tsconfig.paths.json";

const sharedAlias: Record<string, string> = {};
for (const [pattern, [target]] of Object.entries(compilerOptions.paths)) {
	const alias = pattern.replace(/\/\*$/, "");
	const directory = target.replace(/\/\*$/, "");
	if (!directory) continue;
	sharedAlias[alias] = fileURLToPath(new URL(directory, import.meta.url));
}

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	modules: ["@nuxt/test-utils/module"],
	alias: sharedAlias,
});
