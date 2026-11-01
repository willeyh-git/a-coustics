import type { Density, FlowResistivity, Frequency, Length } from "@units/units";

/**
 * A diffuser/absorber panel type. A union of literals so it can be used as a
 * discriminated-union key (form drafts, stored panels) and as a mapped-type key
 * (the per-type form and validator lookup tables).
 */
export type PanelType =
	| "QRD"
	| "PRD"
	| "SKYLINE"
	| "POLY"
	| "HELMHOLTZ"
	| "ABFUSOR";

/**
 * Frequency Range.
 */
export interface FrequencyRange {
	min: Frequency;
	max: Frequency;
}

/**
 * A frequency-domain response: values sampled along a frequency axis.
 */
export interface FrequencyResponse {
	frequencies: Frequency[];
	values: number[];
}

/**
 * Material Properties.
 */
export interface MaterialProperties {
	density: Density;
	flowResistivity: FlowResistivity;
	thickness: Length;
	porosity?: number;
}
