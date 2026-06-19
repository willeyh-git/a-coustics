import type { Density, FlowResistivity, Frequency, Length } from "./units";

/**
 * Frequency Range.
 */
export interface FrequencyRange {
	min: Frequency;
	max: Frequency;
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
