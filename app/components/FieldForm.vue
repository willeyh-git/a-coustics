<script lang="ts" setup>
import type {
	PanelFormControls,
	PanelFormFieldSpec,
	PanelFormSpec,
} from "@forms/common";
import {
	findControlError,
	findSpecField,
	formatFormValue,
} from "@forms/common";
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

/**
 * The field this control edits, looked up in the form's spec. A control naming
 * a field the form does not list is a developer bug: it warns and still renders
 * a labelled control rather than blanking the page.
 */
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

/**
 * The problem that names this control, or nothing when this control is clean.
 * Errors are keyed by the dotted control key, so a control only ever shows its
 * own problem and the user never has to match a list against the fields.
 */
// biome-ignore lint/correctness/noUnusedVariables: the template below passes it to UFormField
const fieldError = computed<string | undefined>(() =>
	findControlError(props.errors, props.fieldKey),
);

/** The note that tells the user what a blank control means. */
// biome-ignore lint/correctness/noUnusedVariables: the template below passes it to UFormField
const defaultNote = computed<string | undefined>(() => {
	const fallback = descriptor.value.default;
	if (fallback === undefined) {
		return undefined;
	}
	return `Leaving this blank uses ${formatFormValue(fallback)}.`;
});

/** The raw text typed into this control; it opens at the form's state. */
const controlText = ref<string>(props.controls[props.fieldKey] ?? "");

watch(controlText, (text) => {
	// The control writes its text into the form's state, which is what makes the
	// panel rebuild: the page reads that state and re-runs validation and design.
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
			:help="defaultNote"
			:error="fieldError"
			:required="!descriptor.optional"
			class="panel-form-control"
		>
			<!-- Every control takes plain text: an unparseable value stays in the field
				so the form can name it as wrong, rather than an input element silently
				inventing a number or clearing what the user typed. `UFormField` renders
				the label and wires it to the control below, so the control needs no id
				of its own. -->
			<UInput
				v-model="controlText"
				:required="!descriptor.optional"
				:placeholder="descriptor.optional ? 'Optional' : 'Required'"
				class="panel-form-input"
			/>
		</UFormField>
	</div>
</template>
