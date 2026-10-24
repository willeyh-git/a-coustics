import { halfWavelength } from "@acoustics/frequency";
import { toArea, toLength, toVolume } from "@geometry/scaling";
import { m, m2, m3 } from "@units/units";
import type { Area, Frequency, Length, Volume } from "@units/units";

/**
 * Derives the well width (opening) of a well diffuser from its highest
 * operating frequency.
 *
 * Each well must be no wider than half a wavelength at the highest frequency
 * the panel is meant to diffuse. Wider wells become electrically large at the
 * top of the band: adjacent wells diffract and leak energy past the diffuser,
 * and diffusion breaks down above this cutoff. The half-wavelength condition
 * therefore sets the widest usable well opening for a given high-frequency
 * cutoff.
 *
 * ```text
 * w = λ_high / 2 = c / (2 · fHigh)
 * ```
 *
 * Assumption: dividers are treated as zero-thickness, so this is the ideal
 * opening. Real panels add divider (wall) thickness `t`, in which case the
 * usable opening is `w = c / (2 · fHigh) − t`; use
 * {@link calculateWellWidthWithWall} for that. No default wall thickness is
 * assumed here or there — it is always a caller-supplied value.
 *
 * @param fHigh - The highest frequency the panel must diffuse (Hz).
 * @returns The well opening in meters.
 * @throws Error if `fHigh` is not positive. This is a programmer error: the
 * user-facing validator (`@validators/*`) rejects non-positive frequencies
 * before any design or geometry code runs.
 */
export function calculateWellWidth(fHigh: Frequency): Length {
	if (fHigh <= 0) {
		throw new Error(`fHigh must be greater than zero (got ${fHigh}).`);
	}

	return halfWavelength(fHigh);
}

/**
 * Derives the usable well opening of a well diffuser from its highest
 * operating frequency, subtracting the divider (wall) thickness `t`.
 *
 * See {@link calculateWellWidth} for the acoustic rationale. A wall thickness
 * of `0` reproduces {@link calculateWellWidth}; a wall thickness that leaves
 * no positive opening is rejected because it cannot describe a physical well.
 *
 * ```text
 * w = c / (2 · fHigh) − t
 * ```
 *
 * @param fHigh - The highest frequency the panel must diffuse (Hz).
 * @param wallThickness - The divider thickness in meters (may be zero).
 * @returns The usable well opening in meters (always positive).
 * @throws Error if `fHigh` is not positive, if `wallThickness` is negative, or
 * if `wallThickness` is not smaller than the half-wavelength opening. All are
 * programmer errors; the user-facing validators reject these inputs first.
 */
export function calculateWellWidthWithWall(
	fHigh: Frequency,
	wallThickness: Length,
): Length {
	if (fHigh <= 0) {
		throw new Error(`fHigh must be greater than zero (got ${fHigh}).`);
	}
	if (wallThickness < 0) {
		throw new Error(
			`wallThickness must be non-negative (got ${wallThickness}).`,
		);
	}

	const opening = Number(halfWavelength(fHigh));
	const wall = Number(wallThickness);

	if (wall >= opening) {
		throw new Error(
			`wallThickness must be smaller than the half-wavelength well opening ` +
				`(${opening} m) so the well keeps a positive opening (got ${wall} m).`,
		);
	}

	return toLength(opening - wall, m);
}

/**
 * Computes the total panel width from the per-well cell width and the number
 * of wells (cells) across the panel.
 *
 * ```text
 * W = count · w
 * ```
 *
 * `count` is a bare count, not a physical quantity, so it stays an unbranded
 * integer while every size is branded. QRD / PRD panels use `count = p` (one
 * well per residue); Skyline / Poly panels use the number of cells along the
 * relevant axis. Note that a PRD-sourced skyline has its first and last rows
 * (and columns) coincide by Fermat's little theorem, so the *visible* cell
 * count is `p − 1`; the caller passes whichever count it intends to build.
 *
 * Divider thickness is not modelled here: a physical panel is
 * `count · w + (count − 1) · t`, and callers that need it add it explicitly.
 *
 * @param cellWidth - The opening width of a single well / cell (m).
 * @param count - The number of cells across the panel (positive integer).
 * @returns The total panel width in meters.
 * @throws Error if `count` is not a positive safe integer. Programmer error;
 * the user-facing validators reject non-positive and non-integer orders.
 */
export function calculatePanelWidth(cellWidth: Length, count: number): Length {
	if (!Number.isSafeInteger(count) || count <= 0) {
		throw new Error(`count must be a positive safe integer (got ${count}).`);
	}

	return toLength(Number(cellWidth) * count, m);
}

/**
 * Computes the total panel height from the per-cell height and the number of
 * rows along the panel. Mirrors {@link calculatePanelWidth}.
 *
 * For 1D diffusers the vertical panel height is usually a free design input
 * rather than `count · cellHeight`; pass `count = 1` in that case.
 *
 * ```text
 * H = count · cellHeight
 * ```
 *
 * @param cellHeight - The height of a single cell (m).
 * @param count - The number of cells along the panel (positive integer).
 * @returns The total panel height in meters.
 * @throws Error if `count` is not a positive safe integer. Programmer error.
 */
export function calculatePanelHeight(
	cellHeight: Length,
	count: number,
): Length {
	if (!Number.isSafeInteger(count) || count <= 0) {
		throw new Error(`count must be a positive safe integer (got ${count}).`);
	}

	return toLength(Number(cellHeight) * count, m);
}

/**
 * Computes the frontal (plan) area of a rectangular panel.
 *
 * ```text
 * A = W · H
 * ```
 *
 * @param width - The panel width in meters (must be positive).
 * @param height - The panel height in meters (must be positive).
 * @returns The panel area in square meters.
 * @throws Error if `width` or `height` is not positive. Programmer error: a
 * non-positive `Length` is only reachable through a scaling misuse, which the
 * guards here turn into a loud failure instead of a nonsensical area.
 */
export function calculatePanelArea(width: Length, height: Length): Area {
	if (width <= 0 || height <= 0) {
		throw new Error(
			`width and height must both be positive (got ${width} and ${height}).`,
		);
	}

	return toArea(Number(width) * Number(height), m2);
}

/**
 * Computes the volume of a rectangular panel or cavity box.
 *
 * ```text
 * V = W · H · D
 * ```
 *
 * Diffusers are characterised by plan area rather than volume, but the box
 * volume is what a Helmholtz cavity backing or a quoted panel depth needs.
 * `depth` may be zero, which projects the box down to its plan area
 * (`V = 0`) rather than being an error.
 *
 * @param width - The panel width in meters (must be positive).
 * @param height - The panel height in meters (must be positive).
 * @param depth - The panel depth in meters (must be non-negative).
 * @returns The panel volume in cubic meters.
 * @throws Error if `width` or `height` is not positive, or if `depth` is
 * negative. Programmer error.
 */
export function calculatePanelVolume(
	width: Length,
	height: Length,
	depth: Length,
): Volume {
	if (width <= 0 || height <= 0 || depth < 0) {
		throw new Error(
			`width and height must be positive and depth non-negative ` +
				`(got ${width}, ${height}, ${depth}).`,
		);
	}

	return toVolume(Number(width) * Number(height) * Number(depth), m3);
}
