import type {
	DesignHelmholtzInput,
	DesignHelmholtzResult,
} from "@design/helmholtz";
import type {
	FormAcousticResistanceValue,
	FormFrequencyListValue,
	FormLengthValue,
	FormVolumeValue,
	PanelFormSpec,
	PanelFormSummary,
	PanelFormSummaryRow,
} from "@forms/common";
import {
	formatAcousticResistance,
	formatHertz,
	formatMetres,
	formatPlainNumber,
	formatSquareMetres,
	PANEL_ACOUSTIC_RESISTANCE_FIELD,
	PANEL_FREQUENCY_AXIS_FIELD,
	PANEL_LENGTH_FIELD,
	PANEL_VOLUME_FIELD,
} from "@forms/common";
import {
	toAcousticResistance,
	toFrequency,
	toLength,
	toVolume,
} from "@geometry/scaling";
import { Hz, m, m3, raylsPerM4 } from "@units/units";
import { z } from "zod";

/**
 * The values a Helmholtz form collects. Keys match `DesignHelmholtzInput` one
 * for one; `acousticResistance` and `frequencyAxis` are optional, so a blank
 * control leaves the resonator critically matched and the analysis axis
 * auto-generated around the resonant frequency.
 */
export type HELMHOLTZFormFields = {
	readonly neckRadius: FormLengthValue;
	readonly neckLength: FormLengthValue;
	readonly cavityVolume: FormVolumeValue;
	readonly acousticResistance?: FormAcousticResistanceValue;
	readonly frequencyAxis?: FormFrequencyListValue;
};

export const HELMHOLTZ_FORM_FIELDS_SCHEMA: z.ZodType<HELMHOLTZFormFields> =
	z.object({
		neckRadius: PANEL_LENGTH_FIELD,
		neckLength: PANEL_LENGTH_FIELD,
		cavityVolume: PANEL_VOLUME_FIELD,
		acousticResistance: PANEL_ACOUSTIC_RESISTANCE_FIELD.optional(),
		frequencyAxis: PANEL_FREQUENCY_AXIS_FIELD.optional(),
	});

export const HELMHOLTZ_FORM_SPEC: PanelFormSpec = {
	panelType: "HELMHOLTZ",
	title: "Helmholtz resonator",
	fields: [
		{
			key: "neckRadius",
			label: "Neck radius",
			kind: "length",
			optional: false,
			unit: "m",
			default: 0.15,
			description:
				"Radius of the opening; it also sets the neck area and the effective length.",
		},
		{
			key: "neckLength",
			label: "Neck length",
			kind: "length",
			optional: false,
			unit: "m",
			default: 0.1,
			description: "Plate thickness the neck passes through.",
		},
		{
			key: "cavityVolume",
			label: "Cavity volume",
			kind: "volume",
			optional: false,
			unit: "m³",
			default: 0.02,
			description: "Air volume behind the neck.",
		},
		{
			key: "acousticResistance",
			label: "Acoustic resistance",
			kind: "acousticResistance",
			optional: true,
			unit: "Pa·s/m⁴",
			description: "Leave blank to treat the resonator as critically matched.",
		},
		{
			key: "frequencyAxis",
			label: "Frequency axis",
			kind: "frequencyList",
			optional: true,
			unit: "Hz",
			description:
				"Frequencies to sample the absorption curve at, separated by spaces. Leave blank for an axis around the resonant frequency.",
		},
	],
};

export function decodeHELMHOLTZFormFields(
	fields: HELMHOLTZFormFields,
): DesignHelmholtzInput {
	const input: DesignHelmholtzInput = {
		// The design layer's spelling: `neckRadius` is the neck radius field.
		neckRadius: toLength(fields.neckRadius, m),
		neckLength: toLength(fields.neckLength, m),
		cavityVolume: toVolume(fields.cavityVolume, m3),
	};
	if (fields.acousticResistance !== undefined) {
		input.acousticResistance = toAcousticResistance(
			fields.acousticResistance,
			raylsPerM4,
		);
	}
	if (fields.frequencyAxis !== undefined) {
		input.frequencyAxis = fields.frequencyAxis.map((value) =>
			toFrequency(value, Hz),
		);
	}
	return input;
}

export function summarizeHELMHOLTZFormResult(
	result: DesignHelmholtzResult,
): PanelFormSummary {
	const rows: PanelFormSummaryRow[] = [
		{ label: "Neck area", value: formatSquareMetres(result.neckArea) },
		{ label: "Effective length", value: formatMetres(result.effectiveLength) },
		{
			label: "Resonant frequency",
			value: formatHertz(result.resonantFrequency),
		},
		{
			label: "Acoustic resistance",
			value: formatAcousticResistance(result.acousticResistance),
		},
		{
			label: "Normalised resistance",
			value: formatPlainNumber(result.normalizedResistance),
		},
		{ label: "Bandwidth at −3 dB", value: formatHertz(result.bandwidth) },
	];
	return { title: "Helmholtz resonator", rows };
}
