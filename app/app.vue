<script lang="ts" setup>
import { findPanelType, PANEL_FORM_SPECS, PANEL_TYPES } from "@forms/panel";
import type { PanelType } from "@units/core";

/** One entry of the form index: which panel, where to find it, and its title. */
type PanelFormNavEntry = { panelType: PanelType; href: string; title: string };

/** The nav is the same on every page, so it is built once. */
// biome-ignore lint/correctness/noUnusedVariables: the template below renders it as the form index
const navItems = computed<readonly PanelFormNavEntry[]>(() =>
	PANEL_TYPES.map((panelType) => ({
		panelType: panelType,
		href: `/forms/${panelType.toLowerCase()}`,
		title: PANEL_FORM_SPECS[panelType].title,
	})),
);

/**
 * The panel the current path asks for, or `null` when it names no form.
 *
 * The path is handed in rather than read here: `$route` only exists at the
 * component's template and property boundary, so a component function takes the
 * path as data instead of reaching for the route.
 * @param path - The path of the URL being answered.
 */
const currentFormPanelType = (path: string): PanelType | null => {
	const segments = path.split("/").filter((segment) => segment !== "");
	if (segments.length !== 2 || segments[0] !== "forms") {
		return null;
	}
	const panelType = findPanelType(segments[1] ?? "");
	if (panelType === undefined) {
		return null;
	}
	return panelType;
};

/** The page heading: the title of the form being filled in, or the index heading. */
// biome-ignore lint/correctness/noUnusedVariables: the template below renders it as the page heading
const heading = (path: string): string => {
	const panelType = currentFormPanelType(path);
	if (panelType === null) {
		return "Panel forms";
	}
	return PANEL_FORM_SPECS[panelType].title;
};
</script>

<template>
  <UApp>
    <main class="panel-form-app">
      <h1 class="app-heading">{{ heading($route.path) }}</h1>

      <nav class="panel-form-nav">
        <ul>
          <li v-for="item in navItems">
            <a
              :href="item.href"
              :data-panelType="item.panelType"
              :aria-current="item.panelType === currentFormPanelType($route.path) ? 'true' : undefined"
            >
              {{ item.title }}
            </a>
          </li>
        </ul>
      </nav>

      <NuxtPage />

      <p class="app-note">
        Each form collects the values a panel needs, rejects the values that cannot build one, and
        shows the panel the current values produce. Every value stays editable: change one and the
        panel below is rebuilt from the new values.
      </p>
      <p class="app-index-note" v-if="currentFormPanelType($route.path) === null">
        Pick a panel above to open its form.
      </p>
    </main>
  </UApp>
</template>
