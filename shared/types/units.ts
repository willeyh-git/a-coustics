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
export type Length = Brand<number, "m">;

/**
 * Area in square meters.
 */
export type Area = Brand<number, "m²">;

/**
 * Volume in cubic meters.
 */
export type Volume = Brand<number, "m³">;

/**
 * Frequency in Hertz.
 */
export type Frequency = Brand<number, "Hz">;

/**
 * Density in kg/m³.
 */
export type Density = Brand<number, "kg/m³">;

/**
 * Flow resistivity in rayls/m³.
 */
export type FlowResistivity = Brand<number, "rayls/m³">;

/**
 * Surface (reluctance) resistance in rayls/m² (Pa·s/m²), added in series with
 * a porous absorber's front surface.
 */
export type SurfaceResistance = Brand<number, "rayls/m²">;

/**
 * Acoustic (neck) resistance of a Helmholtz resonator in rayls/m⁴
 * (Pa·s/m⁴).
 */
export type AcousticResistance = Brand<number, "rayls/m⁴">;

/**
 * Mathematical branded types.
 */
export type Prime = Brand<number, "prime">;
export type Modulus = Brand<number, "modulus">;
export type PositiveInteger = Brand<number, "positive">;
export type Integer = Brand<number, "integer">;
export type NonNegativeInteger = Brand<number, "nonNegativeInteger">;

/**
 * Base units constants.
 */
export const m = 1 as Length;
export const m2 = 1 as Area;
export const m3 = 1 as Volume;
export const Hz = 1 as Frequency;
export const kgPerM3 = 1 as Density;
export const raylsPerM4 = 1 as AcousticResistance;
export const raylsPerM3 = 1 as FlowResistivity;
export const raylsPerM2 = 1 as SurfaceResistance;
