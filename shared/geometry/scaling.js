/**
 * Converts a scalar value into a Length using a unit multiplier.
 * This is the ONLY place raw number → Length conversion should happen.
 */
export function toLength(value, unit) {
    return (value * unit);
}
/**
 * Converts a scalar value into a Frequency using a unit multiplier.
 * This is the ONLY place raw number → Frequency conversion should happen.
 */
export function toFrequency(value, unit) {
    return (value * unit);
}
/**
 * Converts a scalar value into an Area using a unit multiplier.
 * This is the ONLY place raw number → Area conversion should happen.
 */
export function toArea(value, unit) {
    return (value * unit);
}
/**
 * Converts a scalar value into a Volume using a unit multiplier.
 * This is the ONLY place raw number → Volume conversion should happen.
 */
export function toVolume(value, unit) {
    return (value * unit);
}
/**
 * Converts a scalar value into a Density using a unit multiplier.
 * This is the ONLY place raw number → Density conversion should happen.
 */
export function toDensity(value, unit) {
    return (value * unit);
}
/**
 * Converts a scalar value into an AcousticResistance using a unit multiplier.
 * This is a pure scaling; validate the magnitude with
 * `asAcousticResistance` when entering from untrusted values.
 */
export function toAcousticResistance(value, unit) {
    return (value * unit);
}
