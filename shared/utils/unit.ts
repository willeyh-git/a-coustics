// Unit conversion utilities
// All calculations use meters (SI) as base; conversions are for display only.

import { Meter, Millimeter, Centimeter } from '../types/core.js'

/**
 * Convert meters to millimeters (for display)
 */
export function toMillimeters(value: Meter): number {
  return value * 1000
}

/**
 * Convert millimeters to meters (for calculations)
 */
export function fromMillimeters(value: Millimeter): Meter {
  return value / 1000
}

/**
 * Convert meters to centimeters (for display)
 */
export function toCentimeters(value: Meter): number {
  return value * 100
}

/**
 * Convert centimeters to meters (for calculations)
 */
export function fromCentimeters(value: Centimeter): Meter {
  return value / 100
}

/**
 * Format a length for display with appropriate precision.
 * - < 1 m: show in mm
 * - ≥ 1 m: show in m, rounded to 2 decimal places
 */
export function formatLength(value: Meter): string {
  const mm = toMillimeters(value)
  if (mm >= 1000) {
    return `${(value / 1000).toFixed(2)} m`
  }
  return `${Math.round(mm)} mm`
}

/**
 * Format a frequency for display.
 */
export function formatFrequency(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} kHz`
  }
  return `${Math.round(value)} Hz`
}

/**
 * Format a percentage for display.
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}
