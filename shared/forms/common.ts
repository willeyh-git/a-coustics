import type { PanelType } from "@units/core";
import type {
	AcousticResistance,
	Area,
	FlowResistivity,
	Frequency,
	Length,
	SurfaceResistance,
	Volume,
} from "@units/units";
import type { ValidationError } from "@validators/common";
import { describeValue, MAX_PRIME, MIN_PRIME } from "@validators/common";
import { $brand, z } from "zod";

/**
 * zod v4 exports a unique symbol used by its `.brand()` schemas. The form
 * layer brands the *plain* numbers a user supplies (a metre value is not a hertz
 * value) so a control can never be wired to the wrong quantity; the brands live
 * only in this layer. Everything that reaches the math system is re-branded with
 * the repo brands in `shared/types/units.ts` through `@geometry/scaling` or the
 * `@math/helpers` constructors, which is where runtime validation happens.
 */
type FormUnitBrand<T extends string> = { [$brand]: { [k in T]: true } };

/** A frequency in hertz typed in through a form control. */
export type FormFrequencyValue = number & FormUnitBrand<"hertz">;

/** A length in metres typed in through a form control. */
export type FormLengthValue = number & FormUnitBrand<"metre">;

/** A volume in cubic metres typed in through a form control. */
export type FormVolumeValue = number & FormUnitBrand<"cubicMetre">;

/** A prime panel order typed in through a form control. */
export type FormPrimeValue = number & FormUnitBrand<"primeOrder">;

/** A signed whole-number coefficient (a poly-diffuser weight). */
export type FormCoefficientValue = number & FormUnitBrand<"coefficient">;

/** A positive whole number (e.g. a primitive root candidate). */
export type FormCountValue = number & FormUnitBrand<"count">;

/** A fraction in `[0, 1)` (e.g. the absorptive share of an ABFUSOR). */
export type FormRatioValue = number & FormUnitBrand<"ratio">;

/** An acoustic (neck) resistance in Pa·s/m⁴. */
export type FormAcousticResistanceValue = number &
	FormUnitBrand<"pascalSecondPerMetre4">;

/** A flow resistivity in rayls/m³. */
export type FormFlowResistivityValue = number &
	FormUnitBrand<"raylsPerCubicMetre">;

/** A surface (reluctance) resistance in rayls/m². */
export type FormSurfaceResistanceValue = number &
	FormUnitBrand<"raylsPerSquareMetre">;

/** An explicit frequency axis entered through one control (Hz per entry). */
export type FormFrequencyListValue = readonly FormFrequencyValue[];

/**
 * Leaf schemas shared by every panel form. They are composed inline by the
 * per-type schemas in `shared/forms/<type>.ts`, so a constraint (and its unit
 * brand) is stated once for all panels that take that quantity.
 */
export const PANEL_PRIME_ORDER_FIELD = z
	.number()
	.int()
	.gte(MIN_PRIME)
	.lte(MAX_PRIME)
	.brand("primeOrder");

/** A positive frequency in hertz. */
export const PANEL_FREQUENCY_FIELD = z.number().positive().brand("hertz");

/** A positive length in metres. */
export const PANEL_LENGTH_FIELD = z.number().positive().brand("metre");

/** A positive volume in cubic metres. */
export const PANEL_VOLUME_FIELD = z.number().positive().brand("cubicMetre");

/** A positive acoustic resistance in Pa·s/m⁴. */
export const PANEL_ACOUSTIC_RESISTANCE_FIELD = z
	.number()
	.positive()
	.brand("pascalSecondPerMetre4");

/** A signed whole number. */
export const PANEL_COEFFICIENT_FIELD = z.number().int().brand("coefficient");

/** A positive whole number. */
export const PANEL_COUNT_FIELD = z.number().int().positive().brand("count");

/** A fraction in `[0, 1)`. */
export const PANEL_RATIO_FIELD = z.number().gte(0).lt(1).brand("ratio");

/** A positive flow resistivity in rayls/m³. */
export const PANEL_FLOW_RESISTIVITY_FIELD = z
	.number()
	.positive()
	.brand("raylsPerCubicMetre");

/** A surface resistance of zero or more, in rayls/m². */
export const PANEL_SURFACE_RESISTANCE_FIELD = z
	.number()
	.nonnegative()
	.brand("raylsPerSquareMetre");

/** A non-empty frequency axis (Hz per entry). */
export const PANEL_FREQUENCY_AXIS_FIELD = z.array(PANEL_FREQUENCY_FIELD).min(1);

/**
 * The kind of value a control feeds, which decides both the zod leaf that
 * guards it and the control the UI renders. Kept as an open union so the
 * requirement table below cannot silently forget a kind.
 */
export type PanelFormFieldKind =
	| "coefficient"
	| "count"
	| "frequency"
	| "frequencyList"
	| "length"
	| "primeOrder"
	| "ratio"
	| "acousticResistance"
	| "flowResistivity"
	| "surfaceResistance"
	| "volume"
	| "select";

/**
 * How each kind is described to the user when a control is rejected. `select`
 * is overridden per field with its actual options.
 */
export const FIELD_REQUIREMENT: Record<PanelFormFieldKind, string> = {
	coefficient:
		"a whole number (equivalent values modulo the order are normalised)",
	count: "a whole number greater than zero",
	frequency: "a number of hertz greater than zero",
	frequencyList:
		"one or more positive frequencies of hertz, separated by spaces or commas",
	length: "a number of metres greater than zero",
	primeOrder: `a prime whole-number panel order between ${MIN_PRIME} and ${MAX_PRIME}`,
	ratio: "a fraction from 0 up to, but not including, 1",
	acousticResistance:
		"an acoustic resistance in pascal-seconds per metre to the fourth power, greater than zero",
	flowResistivity:
		"a flow resistivity in rayls per cubic metre, greater than zero",
	surfaceResistance:
		"a surface resistance in rayls per square metre, of zero or more",
	volume: "a volume in cubic metres greater than zero",
	select: "one of the listed options",
};

/** A value a control can carry once its text has been parsed. */
export type PanelFormValue = number | string | number[];

/**
 * The editable state of a form: one text value per control, keyed by the
 * dotted field key. Plain JSON, so it is already the shape a panel draft is
 * stored in (IndexedDB later, `JSON.stringify` today), which is what lets a
 * previously submitted form be reopened: the draft is the form's state.
 */
export type PanelFormControls = Record<string, string>;

/** One field of a panel form: the control the user sees and edits. */
export interface PanelFormFieldSpec {
	/** Dotted key, so a nested value names the exact control (e.g. `material.flowResistivity`). */
	key: string;
	/** Text shown above the control. */
	label: string;
	kind: PanelFormFieldKind;
	/** `true` when the control may be left blank. */
	optional: boolean;
	/** Unit shown next to the label, presentation only. */
	unit?: string;
	/** Longer explanation shown under the label. */
	description?: string;
	/** Options offered by a `select` control. */
	options?: readonly string[];
	/** Value the control opens with, so a form starts from a buildable panel. */
	default?: PanelFormValue;
}

/** Everything a panel form needs in order to render and parse itself. */
export interface PanelFormSpec {
	panelType: PanelType;
	/** Heading shown above the controls. */
	title: string;
	fields: readonly PanelFormFieldSpec[];
}

/** `true` when control text carries no value. */
export function isBlankControlText(text: string): boolean {
	return text.trim() === "";
}

/**
 * Turns one control's text into the value its kind expects.
 *
 * Text that does not parse is returned unchanged so the zod schema reports
 * that field as wrong, instead of an invented number quietly reaching the
 * design. A blank control yields the empty string, which callers drop from
 * the record: an optional field then stays omitted, and a required field is
 * reported as missing. The list kind splits on spaces, commas and semicolons.
 * @param kind - The kind of value the control feeds.
 * @param text - The raw control text.
 */
export function parseControlValue(
	kind: PanelFormFieldKind,
	text: string,
): PanelFormValue {
	if (isBlankControlText(text)) {
		return "";
	}
	const trimmed = text.trim();
	if (kind === "select") {
		return trimmed;
	}
	if (kind !== "frequencyList") {
		// `Number("")` is 0, which the blank check above has already ruled out.
		// Non-finite text (letters, `NaN`, `Infinity`) is left for zod to reject.
		const number = Number(trimmed);
		return Number.isFinite(number) ? number : trimmed;
	}
	const entries = trimmed.split(/[ ,;]+/).filter((entry) => entry !== "");
	if (entries.length === 0) {
		return "";
	}
	const values = entries.map((entry) => Number(entry));
	const allFinite = values.every((value) => Number.isFinite(value));
	return allFinite ? values : trimmed;
}

/** Renders a value as the text its control opens with. */
export function formatFormValue(value: PanelFormValue): string {
	if (typeof value === "number") {
		return `${value}`;
	}
	if (typeof value === "string") {
		return value;
	}
	return value.join(", ");
}

/** Controls carrying every field's default: how a panel form opens. */
export function defaultControls(spec: PanelFormSpec): PanelFormControls {
	const controls: PanelFormControls = {};
	for (const field of spec.fields) {
		controls[field.key] =
			field.default === undefined ? "" : formatFormValue(field.default);
	}
	return controls;
}

/**
 * Narrows an untrusted value to a plain object view so a nested field can
 * be read out of it. The cast re-types only the *view*: every property stays
 * `unknown`, so nothing read here is trusted — each value is validated before
 * it is used.
 * @param value - The untrusted value.
 */
function asRecordView(value: unknown): Record<string, unknown> | undefined {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return undefined;
	}
	return value as Record<string, unknown>;
}

/** Reads a dotted-path value out of a (possibly nested) untrusted record. */
export function readFormValue(
	source: unknown,
	path: readonly string[],
): unknown {
	let current = source;
	for (const key of path) {
		const record = asRecordView(current);
		if (record === undefined) {
			return undefined;
		}
		current = record[key];
	}
	return current;
}

/** Writes a value into a (possibly nested) record at its dotted path. */
function writeFormValue(
	target: Record<string, unknown>,
	path: readonly string[],
	value: unknown,
): void {
	if (path.length === 0) {
		return;
	}
	const key = path[0];
	if (key === undefined) {
		return;
	}
	const rest = path.slice(1);
	if (rest.length === 0) {
		target[key] = value;
		return;
	}
	const existing = asRecordView(target[key]);
	let nested: Record<string, unknown>;
	if (existing === undefined) {
		nested = {};
		target[key] = nested;
	} else {
		nested = existing;
	}
	writeFormValue(nested, rest, value);
}

/**
 * Narrows an untrusted stored value to something a control can display.
 * Anything else becomes the empty string, i.e. a blank control, so a draft
 * that omits (or has corrupted) an optional field simply opens empty.
 * @param value - The untrusted value.
 */
function asFormValue(value: unknown): PanelFormValue {
	if (typeof value === "number" || typeof value === "string") {
		return value;
	}
	if (Array.isArray(value)) {
		const numbers: number[] = [];
		for (const entry of value) {
			if (typeof entry === "number") {
				numbers.push(entry);
			}
		}
		return numbers;
	}
	return "";
}

/**
 * Renders a previously submitted panel's field values back as control text.
 * This is the edit path: hand a stored draft in and every control opens with
 * the value that panel was built from, so the user changes only what they want
 * to change.
 * @param spec - The panel form's fields.
 * @param fields - The stored draft's field values (untrusted).
 */
export function draftFieldsToControls(
	spec: PanelFormSpec,
	fields: unknown,
): PanelFormControls {
	const controls: PanelFormControls = {};
	for (const field of spec.fields) {
		const stored = readFormValue(fields, field.key.split("."));
		controls[field.key] = formatFormValue(asFormValue(stored));
	}
	return controls;
}

/**
 * Builds the untrusted record a panel form's zod schema validates out of the
 * flat, dotted control text. Blank controls are left out of the record, so an
 * optional field simply is not present and a required one reports as missing
 * rather than as a made-up default.
 * @param spec - The panel form's fields.
 * @param controls - The raw control text.
 */
export function buildRawFormFields(
	spec: PanelFormSpec,
	controls: PanelFormControls,
): Record<string, unknown> {
	const raw: Record<string, unknown> = {};
	for (const field of spec.fields) {
		const value = parseControlValue(field.kind, controls[field.key] ?? "");
		if (value === "") {
			continue;
		}
		writeFormValue(raw, field.key.split("."), value);
	}
	return raw;
}

/** Looks a spec field up by its dotted key. */
export function findSpecField(
	spec: PanelFormSpec,
	key: string,
): PanelFormFieldSpec | undefined {
	for (const field of spec.fields) {
		if (field.key === key) {
			return field;
		}
	}
	return undefined;
}

/**
 * Maps a zod issue path onto the control the user has to fix. Array entries
 * add extra path segments (e.g. `frequencyAxis.2`), so the longest known spec
 * key that prefixes the path wins; an unrendered key is returned unchanged so
 * the message still names what was received.
 * @param spec - The panel form's fields.
 * @param path - The zod issue path segments.
 */
export function resolveFormKey(
	spec: PanelFormSpec,
	path: readonly string[],
): string {
	if (path.length === 0) {
		return "form";
	}
	const joined = path.join(".");
	let candidate = joined;
	while (candidate !== "") {
		for (const field of spec.fields) {
			if (field.key === candidate) {
				return candidate;
			}
		}
		const shorter = candidate.split(".").slice(0, -1).join(".");
		if (shorter === candidate) {
			break;
		}
		candidate = shorter;
	}
	return joined;
}

/**
 * How a control's value has to look, in the words a user can act on.
 * @param spec - The panel form's fields.
 * @param key - The dotted control key.
 */
export function formFieldRequirement(spec: PanelFormSpec, key: string): string {
	const field = findSpecField(spec, key);
	if (field === undefined) {
		return `${key} is not a field this panel form renders`;
	}
	const unit = field.unit === undefined ? "" : ` (${field.unit})`;
	if (field.kind === "select" && field.options !== undefined) {
		return `${field.label}${unit} must be one of: ${field.options.join(", ")}`;
	}
	return `${field.label}${unit} must be ${FIELD_REQUIREMENT[field.kind]}`;
}

/**
 * Turns zod's problems into the same user-facing errors the hand-written
 * validators in `shared/validators/` produce, keyed by the control the user
 * has to fix, so one screen can show every problem at once and point at the
 * exact control for each.
 * @param spec - The panel form's fields.
 * @param rawFields - The untrusted record zod checked.
 * @param issues - zod's problems for the failed parse.
 */
export function toFormValidationErrors(
	spec: PanelFormSpec,
	rawFields: Record<string, unknown>,
	issues: readonly { path: PropertyKey[]; message: string }[],
): ValidationError[] {
	const errors: ValidationError[] = [];
	for (const issue of issues) {
		const path = issue.path.map((segment) => String(segment));
		const key = resolveFormKey(spec, path);
		const offending = readFormValue(rawFields, path);
		const requirement = formFieldRequirement(spec, key);
		const message =
			offending === undefined
				? `${requirement}; nothing was supplied`
				: `${requirement} (got ${describeValue(offending)})`;
		errors.push({ field: key, message: `${message}.` });
	}
	return errors;
}

/**
 * Presentation helpers for the app layer. These format results the shared
 * design layer already computed — no panel maths lives in the UI — and keep
 * units next to the numbers so a screenshot of a panel stays readable.
 */
export function formatDecimal(value: number, digits: number): string {
	return `${Number(value.toFixed(digits))}`;
}

/** A length in metres. */
export function formatMetres(value: Length): string {
	return `${formatDecimal(value, 4)} m`;
}

/** A volume in cubic metres. */
export function formatCubicMetres(value: Volume): string {
	return `${formatDecimal(value, 6)} m³`;
}

/** A surface area in square metres. */
export function formatSquareMetres(value: Area): string {
	return `${formatDecimal(value, 6)} m²`;
}

/** A bare number, e.g. a normalised resistance or a residue value. */
export function formatPlainNumber(value: number): string {
	return formatDecimal(value, 3);
}

/** A frequency in hertz. */
export function formatHertz(value: Frequency): string {
	return `${formatDecimal(value, 1)} Hz`;
}

/** A count of wells or a residue value. */
export function formatCount(value: number): string {
	return `${value}`;
}

/** A share of the panel, as a percentage. */
export function formatPercent(value: number): string {
	return `${formatDecimal(value * 100, 1)} %`;
}

/** A flow resistivity in rayls/m³. */
export function formatFlowResistivity(value: FlowResistivity): string {
	return `${formatDecimal(value, 0)} rayls/m³`;
}

/** A surface resistance in rayls/m². */
export function formatSurfaceResistance(value: SurfaceResistance): string {
	return `${formatDecimal(value, 0)} rayls/m²`;
}

/** An acoustic (neck) resistance in Pa·s/m⁴. */
export function formatAcousticResistance(value: AcousticResistance): string {
	return `${formatDecimal(value, 6)} Pa·s/m⁴`;
}

/** A residue sequence, as a readable single line. */
export function formatSequenceList(values: readonly number[]): string {
	return values.join(", ");
}

/** One value a submitted panel shows the user. */
export interface PanelFormSummaryRow {
	label: string;
	value: string;
}

/** A submitted panel rendered as label/value rows: the UI holds no formatting. */
export interface PanelFormSummary {
	title: string;
	rows: readonly PanelFormSummaryRow[];
}
