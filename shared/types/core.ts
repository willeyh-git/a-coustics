// Strongly-typed core types for acoustic panel calculations
// All dimensions are in meters (SI) unless otherwise specified.

namespace LengthUtils {
  // Branded type for length in meters
  export type Length = Brand<number, 'm'>;

  // Unit utility for branded types
  export interface Unit<T> {
    value: T;
  }

  // Helper to create a unit instance (public method)
  export function m(value: number): Length {
    validateLength(value);
    return value as Length; // Type assertion for branded type
  }
}

// Private helper to validate length (camelCase)
function validateLength(value: number): void {
  if (value < 0) {
    throw new Error('Length must be positive');
  }
}

// Re-export types and utilities for easier access
export type Length = LengthUtils.Length;
export interface Unit<T> extends LengthUtils.Unit<T> {};
export const m = LengthUtils.m;

// Base interface for all panel types
export interface PanelBase {
  id: string;
  name: string;
  type: PanelType;
}

// Discriminated union for panel types
export type PanelType =
  | 'QRD'
  | 'PRD'
  | 'SKYLINE'
  | 'POLY'
  | 'HELMHOLTZ'
  | 'ABFUSOR';

// Frequency range for calculations (in Hz)
export interface FrequencyRange {
  min: number;      // Minimum frequency in Hz
  max: number;      // Maximum frequency in Hz
}

// Material properties for absorbers
export interface MaterialProperties {
  density: LengthUtils.Length;           // kg/m³
  flowResistivity: LengthUtils.Length;   // Pa·s/m² (Rayls)
  thickness: LengthUtils.Length;         // m
  porosity?: number;                     // 0-1, optional for some materials
}