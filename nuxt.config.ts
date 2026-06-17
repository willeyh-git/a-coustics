// https://nuxt.com/docs/api/configuration/nuxt-config
import { compilerOptions } from "./tsconfig.spec.json";

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	typescrpit: { compilerOptions },
	modules: ["@nuxt/test-utils/module"],
});
