<script lang="ts" setup>
import type {
	PanelFormControls,
	PanelFormFieldSpec,
	PanelFormSpec,
	PanelFormSummary,
} from "@forms/common";
import type { ValidationError } from "@validators/common";

const props = defineProps<{
	/** Which panel this form is for, and every control it offers. */
	spec: PanelFormSpec;
	/** The current control text, shared with the controls on the page. */
	controls: PanelFormControls;
	/** Every problem with the current control values, one row each, or empty when the panel is valid. */
	errors: ValidationError[];
	/** The panel this form produced, as label/value rows, or an empty summary. */
	summary: PanelFormSummary;
}>();

/** One field of the form with the control text it currently carries. */
type PanelFormRow = { field: PanelFormFieldSpec; value: string };

/**
 * The form's fields with their current text: what the user has typed so far,
 * read from the state the controls on the page write into. This is what makes
 * the panel above rebuild: it is derived from that same state.
 */
// biome-ignore lint/correctness/noUnusedVariables: the template below renders the form's field list
const formRows = computed<readonly PanelFormRow[]>(() =>
	props.spec.fields.map((field) => ({
		field: field,
		value: props.controls[field.key] ?? "",
	})),
);
</script>

<template>
	<section class="panel-form" :data-panelType="spec.panelType">
		<h2 class="panel-form-heading">{{ spec.title }}</h2>

		<div class="panel-form-status" :aria-live="'polite'" :aria-atomic="'true'">
			<ul v-if="errors.length > 0" class="panel-form-errors">
				<li v-for="error in errors" class="panel-form-error">{{ error.field }}: {{ error.message }}</li>
			</ul>
			<p v-else class="panel-form-ok">
				These values build a {{ spec.title }}. Change any control below and the panel is rebuilt.
			</p>
		</div>

		<table class="panel-form-summary">
			<caption>{{ summary.title }}</caption>
			<tbody>
				<tr v-for="row in summary.rows">
					<th scope="row">{{ row.label }}</th>
					<td>{{ row.value }}</td>
				</tr>
			</tbody>
		</table>

		<dl class="panel-form-values">
			<template v-for="row in formRows" :key="row.field.key">
				<dt>
					{{ row.field.label }}
					<span v-if="row.field.unit" class="panel-form-unit">({{ row.field.unit }})</span>
					<span v-if="row.field.optional" class="panel-form-optional">(optional)</span>
					<span v-else class="panel-form-required">(required)</span>
				</dt>
				<dd>
					{{ row.value }}
					<span v-if="row.field.description" class="panel-form-help">{{ row.field.description }}</span>
				</dd>
			</template>
		</dl>
		<span class="panel-form-visually-hidden">
			Fields of the {{ spec.panelType }} form as they are now; the input controls follow below.
		</span>
	</section>
</template>
