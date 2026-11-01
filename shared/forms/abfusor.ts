import type {
	DesignABFUSORInput,
	DesignABFUSORResult,
	PorousAbsorberSpec,
} from "@design/abfusor";
import type {
	FormFlowResistivityValue,
	FormFrequencyListValue,
	FormFrequencyValue,
	FormPrimeValue,
	FormRatioValue,
	FormSurfaceResistanceValue,
	PanelFormSpec,
	PanelFormSummary,
	PanelFormSummaryRow,
} from "@forms/common";
import {
	formatCount,
	formatMetres,
	formatPercent,
	PANEL_FLOW_RESISTIVITY_FIELD,
	PANEL_FREQUENCY_AXIS_FIELD,
	PANEL_FREQUENCY_FIELD,
	PANEL_PRIME_ORDER_FIELD,
	PANEL_RATIO_FIELD,
	PANEL_SURFACE_RESISTANCE_FIELD,
} from "@forms/common";
import { toFrequency } from "@geometry/scaling";
import { asFlowResistivity, asPrime, asSurfaceResistance } from "@math/helpers";
import { Hz } from "@units/units";
import { z } from "zod";

/**
 * The values an ABFUSOR form collects. `material` is a nested record: the
 * whole spec may be omitted (the design then uses the default foam), but once
 * any material control is filled in, `flowResistivity` is required. That
 * cross-field rule is not expressible as a zod shape check, so
 * `validateABFUSORDesign` reports it.
 */
export type ABFUSORFormFields = {
	readonly prime: FormPrimeValue;
	readonly designFrequency: FormFrequencyValue;
	readonly absorptiveRatio: FormRatioValue;
	readonly material?: {
		readonly flowResistivity: FormFlowResistivityValue;
		readonly surfaceResistance?: FormSurfaceResistanceValue;
	};
	readonly frequencyAxis?: FormFrequencyListValue;
};

export const ABFUSOR_FORM_FIELDS_SCHEMA: z.ZodType<ABFUSORFormFields> =
	z.object({
		prime: PANEL_PRIME_ORDER_FIELD,
		designFrequency: PANEL_FREQUENCY_FIELD,
		absorptiveRatio: PANEL_RATIO_FIELD,
		// Omitting the whole spec leaves the design's default foam in place; a
		// spec without a flow resistivity is caught by `validateABFUSORDesign`.
		material: z
			.object({
				flowResistivity: PANEL_FLOW_RESISTIVITY_FIELD,
				surfaceResistance: PANEL_SURFACE_RESISTANCE_FIELD.optional(),
			})
			.optional(),
		frequencyAxis: PANEL_FREQUENCY_AXIS_FIELD.optional(),
	});

export const ABFUSOR_FORM_SPEC: PanelFormSpec = {
	panelType: "ABFUSOR",
	title: "ABFUSOR hybrid panel",
	fields: [
		{
			key: "prime",
			label: "Prime order",
			kind: "primeOrder",
			optional: false,
			default: 7,
			description: "Number of wells in the underlying QRD layout.",
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
			key: "absorptiveRatio",
			label: "Absorptive share",
			kind: "ratio",
			optional: false,
			default: 0.25,
			description:
				"Share of the shallowest wells that are filled with absorptive material.",
		},
		{
			key: "material.flowResistivity",
			label: "Flow resistivity",
			kind: "flowResistivity",
			optional: true,
			unit: "rayls/m³",
			default: 5000,
			description:
				"Open-cell foam by default; leave blank to keep the design's default material.",
		},
		{
			key: "material.surfaceResistance",
			label: "Surface resistance",
			kind: "surfaceResistance",
			optional: true,
			unit: "rayls/m²",
			description:
				"Skin added in series with the porous layer. Blank means a free surface.",
		},
		{
			key: "frequencyAxis",
			label: "Frequency axis",
			kind: "frequencyList",
			optional: true,
			unit: "Hz",
			description:
				"Sample points for the absorption curves, separated by spaces.",
		},
	],
};

/**
 * Brands a validated ABFUSOR record for the math system. Flow and surface
 * resistivity carry their units through the `@math/helpers` constructors, the
 * only sanctioned entry points for those two quantities (scaling.ts covers the
 * length/area/volume/frequency/resistance scalars).
 * @param fields - The validated form fields.
 */
export function decodeABFUSORFormFields(
	fields: ABFUSORFormFields,
): DesignABFUSORInput {
	const input: DesignABFUSORInput = {
		prime: asPrime(fields.prime),
		designFrequency: toFrequency(fields.designFrequency, Hz),
		absorptiveRatio: fields.absorptiveRatio,
	};
	const material = fields.material;
	if (material !== undefined) {
		const materialSpec: PorousAbsorberSpec = {
			flowResistivity: asFlowResistivity(material.flowResistivity),
		};
		if (material.surfaceResistance !== undefined) {
			materialSpec.surfaceResistance = asSurfaceResistance(
				material.surfaceResistance,
			);
		}
		input.material = materialSpec;
	}
	if (fields.frequencyAxis !== undefined) {
		input.frequencyAxis = fields.frequencyAxis.map((value) =>
			toFrequency(value, Hz),
		);
	}
	return input;
}

/**
 * Turns an ABFUSOR design into label/value rows for the UI.
 * @param result - The design that was built from the submitted draft.
 */
export function summarizeABFUSORFormResult(
	result: DesignABFUSORResult,
): PanelFormSummary {
	const absorptiveWells = result.states.filter(
		(state) => state === "ABSORPTIVE",
	).length;
	const rows: PanelFormSummaryRow[] = [
		{ label: "Wells", value: formatCount(result.depths.length) },
		{ label: "Absorptive wells", value: formatCount(absorptiveWells) },
		{
			label: "Absorptive share",
			value: formatPercent(result.absorptiveFraction),
		},
		{ label: "Unit depth", value: formatMetres(result.unitDepth) },
		{ label: "Deepest well", value: formatMetres(result.maxDepth) },
		{ label: "Shallowest well", value: formatMetres(result.minDepth) },
		{ label: "Peak absorption", value: formatPercent(result.maxAbsorption) },
	];
	return { title: "ABFUSOR hybrid panel", rows };
}
