import type {
	DesignSkylineInput,
	DesignSkylineResult,
	SkylineSequenceType,
} from "@design/skyline";
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
 * The values a Skyline form collects. `sequenceType` is written as zod enum
 * literals so the decoded value is {@link SkylineSequenceType} itself, not just
 * any string that parses: the annotation on the schema is what rejects a drift
 * between this form and the design layer's union.
 */
export type SkylineFormFields = {
	readonly prime: FormPrimeValue;
	readonly designFrequency: FormFrequencyValue;
	readonly sequenceType?: SkylineSequenceType;
	readonly primitiveRoot?: FormCountValue;
};

/**
 * zod schema for a Skyline form's field record.
 */
export const SKYLINE_FORM_FIELDS_SCHEMA: z.ZodType<SkylineFormFields> =
	z.object({
		prime: PANEL_PRIME_ORDER_FIELD,
		// Literal options, so the decoded source is the design layer's union.
		sequenceType: z.enum(["QRD", "PRD"]).optional(),
		primitiveRoot: PANEL_COUNT_FIELD.optional(),
		designFrequency: PANEL_FREQUENCY_FIELD,
	});

export const SKYLINE_FORM_SPEC: PanelFormSpec = {
	panelType: "SKYLINE",
	title: "Skyline diffuser",
	fields: [
		{
			key: "prime",
			label: "Prime order",
			kind: "primeOrder",
			optional: false,
			default: 7,
			description:
				"Grid side length; the panel has an order squared number of blocks.",
		},
		{
			key: "sequenceType",
			label: "Sequence source",
			kind: "select",
			optional: true,
			options: ["QRD", "PRD"],
			default: "QRD",
			description: "Which residue sequence builds the skyline grid.",
		},
		{
			key: "primitiveRoot",
			label: "Primitive root",
			kind: "count",
			optional: true,
			description:
				"Only used when the source is PRD. Leave blank for the smallest valid root.",
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

/**
 * Brands a validated Skyline record for the math system.
 * @param fields - The validated form fields.
 */
export function decodeSkylineFormFields(
	fields: SkylineFormFields,
): DesignSkylineInput {
	const input: DesignSkylineInput = {
		prime: asPrime(fields.prime),
		designFrequency: toFrequency(fields.designFrequency, Hz),
	};
	if (fields.sequenceType !== undefined) {
		input.sequenceType = fields.sequenceType;
	}
	if (fields.primitiveRoot !== undefined) {
		input.primitiveRoot = fields.primitiveRoot;
	}
	return input;
}

/**
 * Turns a Skyline design into label/value rows for the UI.
 * @param result - The design that was built from the submitted draft.
 */
export function summarizeSkylineFormResult(
	result: DesignSkylineResult,
): PanelFormSummary {
	const side = result.heights.length;
	const rows: PanelFormSummaryRow[] = [
		{ label: "Grid", value: `${side} x ${side}` },
		{ label: "Blocks", value: formatCount(side * side) },
		{ label: "Sequence source", value: result.sequenceType },
		{ label: "Unit height", value: formatMetres(result.unitHeight) },
		{ label: "Tallest block", value: formatMetres(result.maxHeight) },
		{ label: "Source residues", value: formatSequenceList(result.sequence) },
	];
	return { title: "Skyline diffuser", rows };
}
