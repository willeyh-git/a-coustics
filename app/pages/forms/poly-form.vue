<script lang="ts" setup>
import { designPoly } from "@design/poly";
import type { PanelFormSummary } from "@forms/common";
import { defaultControls } from "@forms/common";
import {
	NO_PANEL_FORM_SUMMARY,
	POLY_FORM_MODULE,
	submitPanelForm,
} from "@forms/panel";
import {
	decodePOLYFormFields,
	POLY_FORM_SPEC,
	summarizePOLYFormResult,
} from "@forms/poly";
import type { ValidationError } from "@validators/common";

definePageMeta({ path: "/forms/poly" });

/** The form this page offers: labels, units, defaults and options all come from
    this spec, which is the same data the validation below runs on. */
const spec = POLY_FORM_SPEC;

/** The form's editable state: one text value per control. A previously submitted
    panel reopens through the same state, by `draftFieldsToControls(spec, draft)`,
    which is what makes editing a submitted panel a re-submission of its values. */
const controls = reactive(defaultControls(spec));

/** The current submission: zod checks the shape first, then the panel validator adds
    its own rules; every problem is reported in one pass. */
const submission = computed(() => submitPanelForm(POLY_FORM_MODULE, controls));

/** Every problem with the values as they are now, or empty when they build a panel. */
// biome-ignore lint/correctness/noUnusedVariables: the template below passes it to <AppForm />
const errors = computed<ValidationError[]>(() => {
	const current = submission.value;
	if (current.valid) {
		return [];
	}
	return current.errors;
});

/** The panel these values produce, as display rows, or nothing when they are not a panel. */
// biome-ignore lint/correctness/noUnusedVariables: the template below passes it to <AppForm />
const summary = computed<PanelFormSummary>(() => {
	const current = submission.value;
	if (!current.valid) {
		return NO_PANEL_FORM_SUMMARY;
	}
	// The design re-runs on every edit, so the table is never stale.
	return summarizePOLYFormResult(
		designPoly(decodePOLYFormFields(current.draft.fields)),
	);
});
</script>

<template>
	<AppForm :spec="spec" :controls="controls" :errors="errors" :summary="summary" />

	<FieldForm :spec="spec" :controls="controls" fieldKey="prime" idPrefix="poly" />
	<FieldForm :spec="spec" :controls="controls" fieldKey="designFrequency" idPrefix="poly" />
	<FieldForm :spec="spec" :controls="controls" fieldKey="q1" idPrefix="poly" />
	<FieldForm :spec="spec" :controls="controls" fieldKey="q2" idPrefix="poly" />
</template>
