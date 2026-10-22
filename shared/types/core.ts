import type {
	Density,
	FlowResistivity,
	Frequency,
	Length,
} from "./units";

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
