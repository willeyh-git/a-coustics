import type { DesignPolyInput, DesignPolyResult } from "@design/poly";
import type {
	FormCoefficientValue,
	FormFrequencyValue,
	FormPrimeValue,
	PanelFormSpec,
	PanelFormSummary,
	PanelFormSummaryRow,
} from "@forms/common";
import {
	formatCount,
	formatMetres,
	PANEL_COEFFICIENT_FIELD,
	PANEL_FREQUENCY_FIELD,
	PANEL_PRIME_ORDER_FIELD,
} from "@forms/common";
import { toFrequency } from "@geometry/scaling";
import { asPrime } from "@math/helpers";
import { Hz } from "@units/units";
import { z } from "zod";

/**
 * The values a Poly form collects. The coefficients are plain signed integers
 * here: congruence classes modulo the order are checked (and normalised) by
 * `validatePolyDesign` and `designPoly`, so the form only has to insist on an
 * integer.
 */
export type POLYFormFields = {
	readonly prime: FormPrimeValue;
	readonly designFrequency: FormFrequencyValue;
	readonly q1: FormCoefficientValue;
	readonly q2: FormCoefficientValue;
};

export const POLY_FORM_FIELDS_SCHEMA: z.ZodType<POLYFormFields> = z.object({
	prime: PANEL_PRIME_ORDER_FIELD,
	q1: PANEL_COEFFICIENT_FIELD,
	q2: PANEL_COEFFICIENT_FIELD,
	designFrequency: PANEL_FREQUENCY_FIELD,
});

export const POLY_FORM_SPEC: PanelFormSpec = {
	panelType: "POLY",
	title: "Poly diffuser",
	fields: [
		{
			key: "prime",
			label: "Prime order",
			kind: "primeOrder",
			optional: false,
			default: 7,
			description:
				"Grid side length; the panel has an order squared number of wells.",
		},
		{
			key: "designFrequency",
			label: "Design frequency",
			kind: "frequency",
			optional: false,
			unit: "Hz",
			default: 1000,
		},
		{
			key: "q1",
			label: "Row coefficient q1",
			kind: "coefficient",
			optional: false,
			default: 1,
			description:
				"Weight on i squared. Must be congruent to a non-zero quadratic residue modulo the order.",
		},
		{
			key: "q2",
			label: "Column coefficient q2",
			kind: "coefficient",
			optional: false,
			default: 1,
			description:
				"Weight on j squared. Equivalent values modulo the order give the same panel.",
		},
	],
};

export function decodePOLYFormFields(fields: POLYFormFields): DesignPolyInput {
	return {
		prime: asPrime(fields.prime),
		designFrequency: toFrequency(fields.designFrequency, Hz),
		q1: fields.q1,
		q2: fields.q2,
	};
}

export function summarizePOLYFormResult(
	result: DesignPolyResult,
): PanelFormSummary {
	const side = result.depths.length;
	const rows: PanelFormSummaryRow[] = [
		{ label: "Grid", value: `${side} x ${side}` },
		{ label: "Wells", value: formatCount(side * side) },
		{ label: "Coefficients used", value: `${result.q1}, ${result.q2}` },
		{ label: "Unit depth", value: formatMetres(result.unitDepth) },
		{ label: "Deepest well", value: formatMetres(result.maxDepth) },
		{ label: "Highest residue", value: formatCount(result.maxResidue) },
	];
	return { title: "Poly diffuser", rows };
}
