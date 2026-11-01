<script lang="ts" setup>
import type {
	PanelFormControls,
	PanelFormFieldSpec,
	PanelFormSpec,
} from "@forms/common";
import { findControlError, findSpecField } from "@forms/common";
import type { ValidationError } from "@validators/common";

const props = defineProps<{
	/** The form this control belongs to: the control takes its label, unit and help from the spec. */
	spec: PanelFormSpec;
	/** The shared control text of that form; this control owns only its own key. */
	controls: PanelFormControls;
	/** Which entry of the shared control text this control owns. */
	fieldKey: string;
	/** Every problem with the current control values; this control shows the one that names its key. */
	errors: ValidationError[];
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

/** How to type a list into this control. */
// biome-ignore lint/correctness/noUnusedVariables: the template below passes it to UFormField
const listNote = computed<string>(
	() =>
		"Separate the values with spaces, commas or new lines; blank means this panel has no frequency axis.",
);

/**
 * The problem that names this control, or nothing when this control is clean.
 * Errors are keyed by the dotted control key, so a control only ever shows its
 * own problem and the user never has to match a list against the fields.
 */
// biome-ignore lint/correctness/noUnusedVariables: the template below passes it to UFormField
const fieldError = computed<string | undefined>(() =>
	findControlError(props.errors, props.fieldKey),
);

/** The raw list text typed into this control; it opens at the form's state. */
const controlText = ref<string>(props.controls[props.fieldKey] ?? "");

watch(controlText, (text) => {
	props.controls[props.fieldKey] = text;
});
</script>

<template>
	<div class="panel-form-field" :data-fieldKey="fieldKey">
		<UFormField
			:name="fieldKey"
			:label="descriptor.label"
			:hint="descriptor.unit"
			:description="descriptor.description"
			:help="listNote"
			:error="fieldError"
			:required="!descriptor.optional"
			class="panel-form-control"
		>
			<!-- The list stays plain text so an unparseable entry is named as wrong by
				the form rather than dropped or invented by the control. `UFormField`
				renders the label and wires it to the control below. -->
			<UTextarea
				v-model="controlText"
				:rows="3"
				autoresize
				:required="!descriptor.optional"
				:placeholder="descriptor.optional ? 'Optional' : 'Required'"
				class="panel-form-textarea"
			/>
		</UFormField>
	</div>
</template>
