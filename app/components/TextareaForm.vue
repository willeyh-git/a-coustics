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
	/** Prefix that makes this control's id unique on the page. */
	idPrefix: string;
}>();

/** The field this control edits, looked up in the form's spec. */
// biome-ignore lint/correctness/noUnusedVariables: the template below renders the field label, unit and help
const descriptor = computed<PanelFormFieldSpec>(() => {
	const found = findSpecField(props.spec, props.fieldKey);
	if (found !== undefined) {
		return found;
	}

	console.error(
		`Textarea ${props.fieldKey} is not a field of the ${props.spec.panelType} form`,
	);

	return {
		key: props.fieldKey,
		label: props.fieldKey,
		kind: "frequencyList",
		optional: true,
	};
});

// biome-ignore lint/correctness/noUnusedVariables: the template below gives the textarea its id and its label its target
const controlId = computed<string>(() => `${props.idPrefix}-${props.fieldKey}`);

/** The raw list text typed into this control; it opens at the form's state. */
const controlText = ref<string>(props.controls[props.fieldKey] ?? "");

/** The control's text as the value display shows it. */
// biome-ignore lint/correctness/noUnusedVariables: the template below shows the control's current text
const valueText = computed<string>(() => formatFormValue(controlText.value));

watch(controlText, (text) => {
	props.controls[props.fieldKey] = text;
});
</script>

<template>
	<div class="panel-form-field" :data-fieldKey="fieldKey">
		<label :for="controlId">{{ descriptor.label }}</label>
		<textarea v-model="controlText" :id="controlId" :rows="'3'"></textarea>
		<span class="panel-form-value">{{ valueText }}</span>
		<p class="panel-form-unit" v-if="descriptor.unit">{{ descriptor.unit }}</p>
		<p class="panel-form-hint">
			Separate the values with spaces, commas or new lines; blank means this panel has no frequency axis.
		</p>
		<p class="panel-form-description" v-if="descriptor.description">{{ descriptor.description }}</p>
	</div>
</template>
