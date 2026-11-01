import type { DesignQRDInput, DesignQRDResult } from "@design/qrd";
import type {
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
	PANEL_FREQUENCY_FIELD,
	PANEL_PRIME_ORDER_FIELD,
} from "@forms/common";
import { toFrequency } from "@geometry/scaling";
import { asPrime } from "@math/helpers";
import { Hz } from "@units/units";
import { at } from "@utils/at";
import { z } from "zod";

/**
 * The values a QRD form collects, before any branding. Keys match the
 * design input's keys (`shared/design/qrd.ts`) one-for-one, so a zod error and
 * the design validator's error name the same control, and the decoded record
 * can be handed to `validateQRDDesign` and `designQRD` without renaming.
 * Each quantity carries its zod unit brand, so a metre value cannot be wired
 * to a hertz field.
 */
export type QRDFormFields = {
	readonly prime: FormPrimeValue;
	readonly designFrequency: FormFrequencyValue;
};

/**
 * zod schema for a QRD form's field record. Annotated with {@link QRDFormFields}
 * so the schema and the type cannot drift apart: the annotation is what turns
 * zod's inferred shape into a compile-time contract.
 */
export const QRD_FORM_FIELDS_SCHEMA: z.ZodType<QRDFormFields> = z.object({
	prime: PANEL_PRIME_ORDER_FIELD,
	designFrequency: PANEL_FREQUENCY_FIELD,
});

/** The form the user fills in: two controls, defaults that build a panel. */
export const QRD_FORM_SPEC: PanelFormSpec = {
	panelType: "QRD",
	title: "QRD diffuser",
	fields: [
		{
			key: "prime",
			label: "Prime order",
			kind: "primeOrder",
			optional: false,
			default: 7,
			description:
				"Number of wells. A prime order spreads the reflections as evenly as possible.",
		},
		{
			key: "designFrequency",
			label: "Design frequency",
			kind: "frequency",
			optional: false,
			unit: "Hz",
			default: 1000,
			description:
				"Centre frequency of the diffusion; the deepest well is about half a wavelength.",
		},
	],
};

/**
 * Brands a validated QRD record for the math system. Only reachable after
 * the zod schema and `validateQRDDesign` (primality of the order) have both
 * passed, which is what {@link asPrime} relies on.
 * @param fields - The validated form fields.
 */
export function decodeQRDFormFields(fields: QRDFormFields): DesignQRDInput {
	return {
		prime: asPrime(fields.prime),
		designFrequency: toFrequency(fields.designFrequency, Hz),
	};
}

/**
 * Turns a QRD design into label/value rows for the UI, so no formatting or
 * number handling lives in the Vue layer.
 * @param result - The design that was built from the submitted draft.
 */
export function summarizeQRDFormResult(
	result: DesignQRDResult,
): PanelFormSummary {
	const rows: PanelFormSummaryRow[] = [
		{
			label: "Wells",
			value: formatCount(result.depths.length),
		},
		{
			label: "Unit depth",
			value: formatMetres(result.unitDepth),
		},
		{
			label: "Deepest well",
			value: formatMetres(
				result.depths.reduce(
					(deepest, depth) => (depth > deepest ? depth : deepest),
					// A valid design has a prime order >= 2, so at least one well.
					at(result.depths, 0),
				),
			),
		},
		{
			label: "Well residues",
			value: formatSequenceList(result.sequence),
		},
	];
	return { title: "QRD diffuser", rows };
}
