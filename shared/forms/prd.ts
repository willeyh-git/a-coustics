import type { DesignPRDInput, DesignPRDResult } from "@design/prd";
import type {
	FormCountValue,
	FormFrequencyValue,
	FormPrimeValue,
	PanelFormSpec,
	PanelFormSummary,
	PanelFormSummaryRow,
} from "@forms/common";
import {
	formatCount,
	formatMetres,
	formatSequenceList,
	PANEL_COUNT_FIELD,
	PANEL_FREQUENCY_FIELD,
	PANEL_PRIME_ORDER_FIELD,
} from "@forms/common";
import { toFrequency } from "@geometry/scaling";
import { asPrime } from "@math/helpers";
import { Hz } from "@units/units";
import { z } from "zod";

/**
 * The values a PRD form collects. `primitiveRoot` is optional because
 * {@link designPRD} selects the smallest primitive root when the user leaves
 * the control blank.
 */
export type PRDFormFields = {
	readonly prime: FormPrimeValue;
	readonly designFrequency: FormFrequencyValue;
	readonly primitiveRoot?: FormCountValue;
};

/**
 * zod schema for a PRD form's field record.
 */
export const PRD_FORM_FIELDS_SCHEMA: z.ZodType<PRDFormFields> = z.object({
	prime: PANEL_PRIME_ORDER_FIELD,
	// Blank is omitted, so `designPRD` picks the smallest primitive root.
	primitiveRoot: PANEL_COUNT_FIELD.optional(),
	designFrequency: PANEL_FREQUENCY_FIELD,
});

export const PRD_FORM_SPEC: PanelFormSpec = {
	panelType: "PRD",
	title: "PRD diffuser",
	fields: [
		{
			key: "prime",
			label: "Prime order",
			kind: "primeOrder",
			optional: false,
			default: 7,
			description: "Number of wells; must be prime.",
		},
		{
			key: "primitiveRoot",
			label: "Primitive root",
			kind: "count",
			optional: true,
			description:
				"Generator modulo the prime. Leave blank to use the smallest valid root.",
		},
		{
			key: "designFrequency",
			label: "Design frequency",
			kind: "frequency",
			optional: false,
			unit: "Hz",
			default: 1000,
		},
	],
};

export function decodePRDFormFields(fields: PRDFormFields): DesignPRDInput {
	const input: DesignPRDInput = {
		prime: asPrime(fields.prime),
		designFrequency: toFrequency(fields.designFrequency, Hz),
	};
	if (fields.primitiveRoot !== undefined) {
		input.primitiveRoot = fields.primitiveRoot;
	}
	return input;
}

export function summarizePRDFormResult(
	result: DesignPRDResult,
): PanelFormSummary {
	const rows: PanelFormSummaryRow[] = [
		{ label: "Wells", value: formatCount(result.depths.length) },
		{ label: "Primitive root used", value: formatCount(result.primitiveRoot) },
		{ label: "Unit depth", value: formatMetres(result.unitDepth) },
		{ label: "Well residues", value: formatSequenceList(result.sequence) },
	];
	return { title: "PRD diffuser", rows };
}
