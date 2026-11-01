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
		<UCard class="panel-form-card" variant="outline">
			<template #header>
				<h2 class="panel-form-heading text-xl leading-tight">{{ spec.title }}</h2>
			</template>

			<div class="panel-form-status" :aria-live="'polite'" :aria-atomic="'true'">
				<template v-if="errors.length > 0">
					<UAlert
						v-for="error in errors"
						:key="error.field"
						orientation="horizontal"
						color="error"
						variant="soft"
						:title="error.field"
						:description="error.message"
						class="panel-form-error"
					/>
				</template>
				<UAlert
					v-else
					orientation="horizontal"
					color="success"
					variant="soft"
					:title="`These values build a ${spec.title}.`"
					:description="'Change any control below and the panel is rebuilt.'"
					class="panel-form-ok"
				/>
			</div>

			<UTable
				v-if="summary.rows.length > 0"
				class="panel-form-summary"
				:caption="summary.title"
				:data="[...summary.rows]"
				:columns="[
					{ accessorKey: 'label', header: 'Property' },
					{ accessorKey: 'value', header: 'Value' },
				]"
			/>

			<dl class="panel-form-values divide-y divide-default">
				<template v-for="row in formRows" :key="row.field.key">
					<dt class="panel-form-value-label pe-4 flex content-center justify-between gap-1">
						{{ row.field.label }}
						<UBadge
							v-if="row.field.unit"
							class="panel-form-unit"
							:label="row.field.unit"
							color="neutral"
							variant="subtle"
							size="xs"
						/>
						<UBadge
							class="panel-form-requirement"
							:label="row.field.optional ? 'optional' : 'required'"
							:color="row.field.optional ? 'neutral' : 'warning'"
							variant="subtle"
							size="xs"
						/>
					</dt>
					<dd class="panel-form-value ps-4">
						{{ row.value }}
					</dd>
				</template>
			</dl>
			<span class="panel-form-visually-hidden sr-only">
				Fields of the {{ spec.panelType }} form as they are now; the input controls follow below.
			</span>
		</UCard>
	</section>
</template>
