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
    <main class="panel-form-app flex-1 min-w-0 p-6 overflow-y-auto">
      <h1 class="app-heading text-2xl leading-tight mb-4">{{ heading($route.path) }}</h1>

      <nav class="panel-form-nav mb-4">
        <ul class="list-none grid-cols-3 gap-4">
          <li v-for="item in navItems">
            <a
              :href="item.href"
              :data-panelType="item.panelType"
              :aria-current="item.panelType === currentFormPanelType($route.path) ? 'true' : undefined"
              class="text-sm block pe-4 rounded-md text-primary"
            >
              {{ item.title }}
            </a>
          </li>
        </ul>
      </nav>

      <NuxtPage />

      <UAlert
        class="app-note"
        color="info"
        variant="subtle"
        title="How the forms work"
        description="Each form collects the values a panel needs, rejects the values that cannot build one, and shows the panel the current values produce. Every value stays editable: change one and the panel below is rebuilt from the new values."
      />
      <UAlert
        v-if="currentFormPanelType($route.path) === null"
        class="app-index-note"
        color="primary"
        variant="subtle"
        orientation="horizontal"
        icon="i-lucide-arrow-right"
        title="Pick a panel"
        description="Pick a panel above to open its form."
      />
    </main>
  </UApp>
</template>
