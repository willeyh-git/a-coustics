<script lang="ts" setup>
import type {
	PanelFormControls,
	PanelFormFieldSpec,
	PanelFormSpec,
} from "@forms/common";
import { findSpecField } from "@forms/common";

const props = defineProps<{
	/** The form this control belongs to: the control takes its label, options and help from the spec. */
	spec: PanelFormSpec;
	/** The shared control text of that form; this control owns only its own key. */
	controls: PanelFormControls;
	/** Which entry of the shared control text this control owns. */
	fieldKey: string;
	/** Prefix that makes this control's id unique on the page. */
	idPrefix: string;
}>();

/** The field this control edits, looked up in the form's spec. */
const descriptor = computed<PanelFormFieldSpec>(() => {
	const found = findSpecField(props.spec, props.fieldKey);
	if (found !== undefined) {
		// The spec is the single source of the label, options and help text.
		return found;
	}

	console.error(
		`Select ${props.fieldKey} is not a field of the ${props.spec.panelType} form`,
	);

	return {
		key: props.fieldKey,
		label: props.fieldKey,
		kind: "select",
		optional: true,
	};
});

/** The options the form offers; a select with none is a spec bug. */
// biome-ignore lint/correctness/noUnusedVariables: the template below offers them as select options
const options = computed<readonly string[]>(() => {
	const offered = descriptor.value.options;

	if (offered === undefined) {
		console.error(
			`Select ${props.fieldKey} offers no options in the ${props.spec.panelType} form`,
		);

		return [];
	}

	return offered;
});

/** The id of this control. */
// biome-ignore lint/correctness/noUnusedVariables: the template below gives the select its id and its label its target
const controlId = computed<string>(() => `${props.idPrefix}-${props.fieldKey}`);

/** The option chosen; the control opens at whatever the form's state holds. */
const chosen = ref<string>(props.controls[props.fieldKey] ?? "");

watch(chosen, (option) => {
	props.controls[props.fieldKey] = option;
});
</script>

<template>
	<div class="panel-form-field" :data-fieldKey="fieldKey">
		<label :for="controlId">{{ descriptor.label }}</label>
		<select v-model="chosen" :id="controlId">
			<option v-for="option in options" :selected="option === chosen" :value="option">
				{{ option }}
			</option>
		</select>
		<span class="panel-form-value">{{ chosen }}</span>
		<p class="panel-form-options">Choose one of: {{ options.join(", ") }}</p>
		<p class="panel-form-description" v-if="descriptor.description">{{ descriptor.description }}</p>
	</div>
</template>
