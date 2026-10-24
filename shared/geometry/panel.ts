import { calculateWavelength } from "@acoustics/frequency";
import { toArea, toLength, toVolume } from "@geometry/scaling";
import { m, m2, m3 } from "@units/units";
import type { Area, Frequency, Length, Volume } from "@units/units";

/**
 * Derives the well width of a well diffuser from its highest operating
 * frequency.
 *
 * Each well must be no wider than half a wavelength at the highest frequency
 * the panel is meant to diffuse. Wider wells become electrically large at the
 * top of the band: adjacent wells diffract and leak energy past the diffuser,
 * and diffusion breaks down above this cutoff. The half-wavelength condition
 * therefore sets the narrowest usable well width for a given high-frequency
 * cutoff.
 *
 * ```text
 * w = λ_high / 2 = c / (2 · fHigh)
 * ```
 *
 * Assumption: dividers are treated as zero-thickness. Real panels add divider
 * (wall) thickness `t`, in which case the usable well opening is
 * `w = c / (2 · fHigh) − t`. Callers that must account for wall thickness use
 * {@link calculateWellWidthWithWall}; this function returns the ideal opening.
 *
 * @param fHigh - The highest frequency the panel must diffuse (Hz).
 * @returns The well width in meters.
 * @throws Error if `fHigh` is not positive. This is a programmer error — the
 * user-facing validator rejects non-positive frequencies before design runs.
 */
export function calculateWellWidth(fHigh: Frequency): Length {
	if (fHigh <= 0) {
		throw new Error("fHigh must be greater than zero");
	}

	const lambda = calculateWavelength(fHigh);

	return toLength(Number(lambda) / 2, m);
}

/**
 * Derives the well width of a well diffuser from its highest operating
 * frequency, subtracting the divider (wall) thickness `t`.
 *
 * See {@link calculateWellWidth} for the acoustic rationale. This variant
 * accounts for finite divider thickness, giving the usable well opening
 * `w = c / (2 · fHigh) − t`.
 *
 * @param fHigh - The highest frequency the panel must diffuse (Hz).
 * @param wallThickness - The divider thickness in meters.
 * @returns The usable well width in meters.
 * @throws Error if `fHigh` or `wallThickness` is not positive, or if the wall
 * thickness is not smaller than the half-wavelength opening.
 */
export function calculateWellWidthWithWall(
	fHigh: Frequency,
	wallThickness: Length,
): Length {
	if (fHigh <= 0) {
		throw new Error("fHigh must be greater than zero");
	}
	if (wallThickness < 0) {
		throw new Error("wallThickness must be non-negative");
	}

	const opening = calculateWellWidth(fHigh);
	const openingValue = Number(opening);

	if (Number(wallThickness) > openingValue) {
		throw new Error(
			"wallThickness must not exceed the half-wavelength well opening",
		);
	}

	return toLength(openingValue - Number(wallThickness), m);
}

/**
 * Computes the total panel width from the per-well cell width and the number
 * of wells (cells) across the panel.
 *
 * ```text
 * W = count · w
 * ```
 *
 * For QRD / PRD panels `count = p` (one well per residue). For Skyline / Poly
 * panels `count` is the number of cells along the relevant axis; note that a
 * PRD-sourced skyline has its first and last rows (or columns) coincide by
 * Fermat's little theorem, so the visible cell count is `p − 1`.
 *
 * @param cellWidth - The width of a single well / cell (m).
 * @param count - The number of cells across the panel (a raw count).
 * @returns The total panel width in meters.
 * @throws Error if `count` is not a positive integer. Programmer error.
 */
export function calculatePanelWidth(cellWidth: Length, count: number): Length {
	if (!Number.isInteger(count) || count <= 0) {
		throw new Error(`count must be a positive integer (got ${count})`);
	}

	return toLength(Number(cellWidth) * count, m);
}

/**
 * Computes the total panel height from the per-cell cell height and the number
 * of rows (cells) along the panel.
 *
 * ```text
 * H = count · cellHeight
 * ```
 *
 * Mirrors {@link calculatePanelWidth}. For 1D diffusers the vertical panel
 * height is often a free design input rather than `count · cellHeight`; pass
 * `count = 1` in that case to wrap a fixed height as a branded `Length`.
 *
 * @param cellHeight - The height of a single cell (m).
 * @param count - The number of cells along the panel (a raw count).
 * @returns The total panel height in meters.
 * @throws Error if `count` is not a positive integer. Programmer error.
 */
export function calculatePanelHeight(cellHeight: Length, count: number): Length {
	if (!Number.isInteger(count) || count <= 0) {
		throw new Error(`count must be a positive integer (got ${count})`);
	}

	return toLength(Number(cellHeight) * count, m);
}

/**
 * Computes the frontal area of a rectangular panel.
 *
 * ```text
 * A = W · H
 * ```
 *
 * @param width - The panel width in meters.
 * @param height - The panel height in meters.
 * @returns The panel area in square meters.
 */
export function calculatePanelArea(width: Length, height: Length): Area {
	return toArea(Number(width) * Number(height), m2);
}

/**
 * Computes the volume of a rectangular panel / cavity box.
 *
 * ```text
 * V = W · H · D
 * ```
 *
 * Diffusers are typically characterised by area rather than volume, but the
 * box volume is useful for Helmholtz cavities and for quoting panel depth.
 *
 * @param width - The panel width in meters.
 * @param height - The panel height in meters.
 * @param depth - The panel depth in meters.
 * @returns The panel volume in cubic meters.
 */
export function calculatePanelVolume(
	width: Length,
	height: Length,
	depth: Length,
): Volume {
	return toVolume(Number(width) * Number(height) * Number(depth), m3);
}
