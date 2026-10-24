import { calculateWavelength } from "@acoustics/frequency";
import { calculateUnitDepth } from "@acoustics/qrd-physics";
import { isPrime } from "@math/number-theory";
import type { Frequency, Length, Prime } from "@units/units";

/**
 * Derives the unit depth for a QRD design based on frequency and prime number.
 * @param frequency The design frequency in Hz.
 * @param p The prime number for the QRD sequence.
 * @returns The unit depth in meters.
 * @throws Error if frequency is non-positive or p is not prime.
 */
export function designUnitDepth(frequency: Frequency, p: Prime): Length {
	if (frequency <= 0) {
		throw new Error("Frequency must be greater than zero");
	}
	if (!isPrime(p)) {
		throw new Error("p must be a prime number");
	}

	const lambda = calculateWavelength(frequency);
	return calculateUnitDepth(lambda, p);
}
