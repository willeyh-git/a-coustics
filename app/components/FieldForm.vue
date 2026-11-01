<script lang="ts" setup>
import type {
	PanelFormControls,
	PanelFormFieldSpec,
	PanelFormSpec,
} from "@forms/common";
import { findSpecField, formatFormValue } from "@forms/common";

const props = defineProps<{
	/** The form this control belongs to: the control takes its label, unit and help from the spec. */
	spec: PanelFormSpec;
	/** The shared control text of that form; this control owns only its own key. */
	controls: PanelFormControls;
	/** Which entry of the shared control text this control owns. */
	fieldKey: string;
	/** Prefix that makes this control's id unique on the page, so its label can point at it. */
	idPrefix: string;
}>();

/**
 * The field this control edits, looked up in the form's spec. A control naming
 * a field the form does not list is a developer bug: it warns and still renders
 * a labelled control rather than blanking the page.
 */
// biome-ignore lint/correctness/noUnusedVariables: the template below renders the field label, unit and help
const descriptor = computed<PanelFormFieldSpec>(() => {
	const found = findSpecField(props.spec, props.fieldKey);
	if (found !== undefined) {
		// The spec is the single source of the label, unit and help text, so a
		// page can never show wording that disagrees with the validation.
		return found;
	}

	console.error(
		`Field ${props.fieldKey} is not a field of the ${props.spec.panelType} form`,
	);

	return {
		key: props.fieldKey,
		label: props.fieldKey,
		kind: "count",
		optional: true,
	};
});

/** The document-unique id of this control. */
// biome-ignore lint/correctness/noUnusedVariables: the template below gives the input its id and its label its target
const controlId = computed<string>(() => `${props.idPrefix}-${props.fieldKey}`);

/** The raw text typed into this control; it opens at the form's state. */
const controlText = ref<string>(props.controls[props.fieldKey] ?? "");

/** The control's text as the value display shows it. */
// biome-ignore lint/correctness/noUnusedVariables: the template below shows the control's current text
const valueText = computed<string>(() => formatFormValue(controlText.value));

watch(controlText, (text) => {
	// The control writes its text into the form's state, which is what makes the
	// panel rebuild: the page reads that state and re-runs validation and design.
	props.controls[props.fieldKey] = text;
});
</script>

<template>
	<div class="panel-form-field" :data-fieldKey="fieldKey">
		<label :for="controlId">{{ descriptor.label }}</label>
		<!-- Every control takes plain text: an unparseable value stays in the field
			so the form can name it as wrong, rather than an input element silently
			inventing a number or clearing what the user typed. -->
		<input v-model="controlText" :id="controlId" type="text" :required="!descriptor.optional" />
		<span class="panel-form-value">{{ valueText }}</span>
		<p class="panel-form-unit" v-if="descriptor.unit">{{ descriptor.unit }}</p>
		<p class="panel-form-description" v-if="descriptor.description">{{ descriptor.description }}</p>
		<p class="panel-form-default" v-if="descriptor.default !== undefined">
			Leaving this blank uses {{ formatFormValue(descriptor.default) }}.
		</p>
	</div>
</template>
