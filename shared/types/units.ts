/**
 * Brand types for physical quantities.
 * @template T - The underlying primitive type.
 * @template Name - The unit name.
 */
export type Brand<T, Name> = {
	__brand: Name;
} & T;

/**
 * Length in meters.
 */
export type Length = Brand<number, 'm'>;

/**
 * Area in square meters.
 */
export type Area = Brand<number, 'm²'>;

/**
 * Volume in cubic meters.
 */
export type Volume = Brand<number, 'm³'>;

/**
 * Frequency in Hertz.
 */
export type Frequency = Brand<number, 'Hz'>;

/**
 * Density in kg/m³.
 */
export type Density = Brand<number, 'kg/m³'>;

/**
 * Flow Resistivity in rayls.
 */
export type FlowResistivity = Brand<number, 'rayls'>;

/**
 * Base units constants.
 */
export const m = 1 as Length;
export const Hz = 1 as Frequency;
