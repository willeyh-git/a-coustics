<script lang="ts" setup>
import type {
	PanelFormControls,
	PanelFormFieldSpec,
	PanelFormSpec,
} from "@forms/common";
import { findControlError, findSpecField } from "@forms/common";
import type { ValidationError } from "@validators/common";

const props = defineProps<{
	/** The form this control belongs to: the control takes its label, options and help from the spec. */
	spec: PanelFormSpec;
	/** The shared control text of that form; this control owns only its own key. */
	controls: PanelFormControls;
	/** Which entry of the shared control text this control owns. */
	fieldKey: string;
	/** Every problem with the current control values; this control shows the one that names its key. */
	errors: ValidationError[];
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

/** What a select may be set to, shown next to its label. */
// biome-ignore lint/correctness/noUnusedVariables: the template below passes it to UFormField
const optionsHint = computed<string>(
	() => `Choose one of: ${options.value.join(", ")}`,
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

/** The option chosen; the control opens at whatever the form's state holds. */
const chosen = ref<string>(props.controls[props.fieldKey] ?? "");

watch(chosen, (option) => {
	props.controls[props.fieldKey] = option;
});
</script>

<template>
	<div class="panel-form-field" :data-fieldKey="fieldKey">
		<UFormField
			:name="fieldKey"
			:label="descriptor.label"
			:hint="optionsHint"
			:description="descriptor.description"
			:error="fieldError"
			:required="!descriptor.optional"
			class="panel-form-control"
		>
			<!-- The option stays a string the form can name as wrong, so an option the
				form does not offer is reported rather than silently dropped. `UFormField`
				renders the label and wires it to the control below. -->
			<USelect
				v-model="chosen"
				:items="[...options]"
				:required="!descriptor.optional"
				:placeholder="descriptor.optional ? 'Optional' : 'Required'"
				class="panel-form-select"
			/>
		</UFormField>
	</div>
</template>
