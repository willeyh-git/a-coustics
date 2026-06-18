export type Brand<T, K extends string> = T & { __brand: K };

// This is a helper to cast a value to a branded type
export const asLength = (value: number) => ({ __brand: 'm', value });
export const asArea = (value: number) => ({ __brand: 'm²', value });
export const asVolume = (value: number) => ({ __brand: 'm³', value });
export const asFrequency = (value: number) => ({ __brand: 'Hz', value });
export const asDensity = (value: number) => ({ __brand: 'kg/m³', value });
export const asFlowResistivity = (value: number) => ({ __brand: 'rayls', value });

// Alternatively, using type aliases as suggested in pre-plan
export type Length = Brand<number, 'm'>;
export type Area = Brand<number, 'm²'>;
export type Volume = Brand<number, 'm³'>;
export type Frequency = Brand<number, 'Hz'>;
export type Density = Brand<number, 'kg/m³'>;
export type FlowResistivity = Brand<number, 'rayls'>;

export const m = 1 as Length;
export const Hz = 1 as Frequency;
