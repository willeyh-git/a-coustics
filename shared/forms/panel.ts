import type { ABFUSORFormFields } from "@forms/abfusor";
import { ABFUSOR_FORM_FIELDS_SCHEMA, ABFUSOR_FORM_SPEC } from "@forms/abfusor";
import type {
	PanelFormControls,
	PanelFormSpec,
	PanelFormSummary,
} from "@forms/common";
import {
	buildRawFormFields,
	defaultControls,
	toFormValidationErrors,
} from "@forms/common";
import type { HELMHOLTZFormFields } from "@forms/helmholtz";
import {
	HELMHOLTZ_FORM_FIELDS_SCHEMA,
	HELMHOLTZ_FORM_SPEC,
} from "@forms/helmholtz";
import type { POLYFormFields } from "@forms/poly";
import { POLY_FORM_FIELDS_SCHEMA, POLY_FORM_SPEC } from "@forms/poly";
import type { PRDFormFields } from "@forms/prd";
import { PRD_FORM_FIELDS_SCHEMA, PRD_FORM_SPEC } from "@forms/prd";
import type { QRDFormFields } from "@forms/qrd";
import { QRD_FORM_FIELDS_SCHEMA, QRD_FORM_SPEC } from "@forms/qrd";
import type { SkylineFormFields } from "@forms/skyline";
import { SKYLINE_FORM_FIELDS_SCHEMA, SKYLINE_FORM_SPEC } from "@forms/skyline";
import type { PanelType } from "@units/core";
import { validateABFUSORDesign } from "@validators/abfusor";
import type { ValidationError, ValidationResult } from "@validators/common";
import { validateHelmholtzDesign } from "@validators/helmholtz";
import { validatePolyDesign } from "@validators/poly";
import { validatePRDDesign } from "@validators/prd";
import { validateQRDDesign } from "@validators/qrd";
import { validateSkylineDesign } from "@validators/skyline";
import { z } from "zod";

/**
 * Which panel types have a form. Kept as a list so the index page, the form
 * lookup below, and the draft union cannot disagree about the set of panels.
 */
export const PANEL_TYPES: readonly PanelType[] = [
	"QRD",
	"PRD",
	"SKYLINE",
	"POLY",
	"HELMHOLTZ",
	"ABFUSOR",
];

/**
 * Version of the stored draft shape (drafts carry it from the start so the
 * future IndexedDB layer can migrate old panels instead of guessing). Bump it
 * whenever a form's shape changes in a way old drafts cannot satisfy.
 */
export const DRAFT_SCHEMA_VERSION = 1;

/** The field record of a panel draft, before it is branded for the math system. */
export type PanelFormDraft<TFormFields, TPanelType extends PanelType> = {
	readonly panelType: TPanelType;
	readonly version: number;
	readonly fields: TFormFields;
};

/** Every draft the app can hold, discriminated by `panelType`. */
export type StoredPanelDraft =
	| PanelFormDraft<QRDFormFields, "QRD">
	| PanelFormDraft<PRDFormFields, "PRD">
	| PanelFormDraft<SkylineFormFields, "SKYLINE">
	| PanelFormDraft<POLYFormFields, "POLY">
	| PanelFormDraft<HELMHOLTZFormFields, "HELMHOLTZ">
	| PanelFormDraft<ABFUSORFormFields, "ABFUSOR">;

/**
 * A form and everything the app needs to check its values: the zod shape (
 * ranges and unit brands), and the hand-written validator that adds the rules
 * zod cannot express (primality, primitive roots modulo p, residue
 * coefficients). `decode` stays with each panel's page because the design
 * input types differ, so keeping it out of this record is what prevents a
 * panel from being decoded through the wrong module.
 */
export interface PanelFormModule<TFormFields, TPanelType extends PanelType> {
	readonly panelType: TPanelType;
	readonly spec: PanelFormSpec;
	readonly fieldsSchema: z.ZodType<TFormFields>;
	readonly validate: (fields: TFormFields) => ValidationResult;
}

/**
 * The form a submitted panel was built from, plus the problems that stopped
 * it. Errors are keyed by control key, so the UI can mark the exact control
 * the user has to fix before resubmitting.
 */
export type PanelFormSubmission<TFormFields, TPanelType extends PanelType> =
	| {
			readonly valid: true;
			readonly draft: PanelFormDraft<TFormFields, TPanelType>;
	  }
	| { readonly valid: false; readonly errors: ValidationError[] };

/**
 * The module for each panel type, spelled out per type because the field
 * record, the zod schema and the validator differ per panel. That generic
 * record shape is what lets one submission path below serve all six panels
 * without a single cast.
 */
export const QRD_FORM_MODULE: PanelFormModule<QRDFormFields, "QRD"> = {
	panelType: "QRD",
	spec: QRD_FORM_SPEC,
	fieldsSchema: QRD_FORM_FIELDS_SCHEMA,
	validate: validateQRDDesign,
};

export const PRD_FORM_MODULE: PanelFormModule<PRDFormFields, "PRD"> = {
	panelType: "PRD",
	spec: PRD_FORM_SPEC,
	fieldsSchema: PRD_FORM_FIELDS_SCHEMA,
	validate: validatePRDDesign,
};

export const SKYLINE_FORM_MODULE: PanelFormModule<
	SkylineFormFields,
	"SKYLINE"
> = {
	panelType: "SKYLINE",
	spec: SKYLINE_FORM_SPEC,
	fieldsSchema: SKYLINE_FORM_FIELDS_SCHEMA,
	validate: validateSkylineDesign,
};

export const POLY_FORM_MODULE: PanelFormModule<POLYFormFields, "POLY"> = {
	panelType: "POLY",
	spec: POLY_FORM_SPEC,
	fieldsSchema: POLY_FORM_FIELDS_SCHEMA,
	validate: validatePolyDesign,
};

export const HELMHOLTZ_FORM_MODULE: PanelFormModule<
	HELMHOLTZFormFields,
	"HELMHOLTZ"
> = {
	panelType: "HELMHOLTZ",
	spec: HELMHOLTZ_FORM_SPEC,
	fieldsSchema: HELMHOLTZ_FORM_FIELDS_SCHEMA,
	validate: validateHelmholtzDesign,
};

export const ABFUSOR_FORM_MODULE: PanelFormModule<
	ABFUSORFormFields,
	"ABFUSOR"
> = {
	panelType: "ABFUSOR",
	spec: ABFUSOR_FORM_SPEC,
	fieldsSchema: ABFUSOR_FORM_FIELDS_SCHEMA,
	validate: validateABFUSORDesign,
};

/**
 * The form to render for a panel type, looked up by the route's path segment.
 * The mapped type demands an entry for every {@link PanelType}, so a panel
 * type cannot be added to the union without giving it a form.
 */
export const PANEL_FORM_SPECS: {
	readonly [panelType in PanelType]: PanelFormSpec;
} = {
	QRD: QRD_FORM_SPEC,
	PRD: PRD_FORM_SPEC,
	SKYLINE: SKYLINE_FORM_SPEC,
	POLY: POLY_FORM_SPEC,
	HELMHOLTZ: HELMHOLTZ_FORM_SPEC,
	ABFUSOR: ABFUSOR_FORM_SPEC,
};

/**
 * Submits a form: control text in, panel draft out (or every problem found).
 *
 * Two gates, in the order that keeps each one cheap and honest:
 *
 * 1. zod checks the *shape* of the record — which controls were filled in,
 *    that a quantity is a finite number in range, and that its unit brand
 *    matches the field. It reports every offending control in one pass, which
 *    is why the UI can show the whole list of things to correct at once.
 * 2. the panel's hand-written validator adds the rules zod cannot express:
 *    primality of an order, a primitive root modulo that order, a poly
 *    coefficient being a residue class, a flow resistivity being required
 *    once a material spec is present.
 *
 * Only a record that passes both gates becomes a draft, and a draft is plain
 * JSON: that is the value a later IndexedDB store would keep, and handing that
 * draft back as the form's initial state reopens the form with the same
 * values, which is how a previously submitted panel is edited.
 * @param module - The panel type's form module.
 * @param controls - The raw control text.
 */
export function submitPanelForm<TFormFields, TPanelType extends PanelType>(
	module: PanelFormModule<TFormFields, TPanelType>,
	controls: PanelFormControls,
): PanelFormSubmission<TFormFields, TPanelType> {
	const rawFields = buildRawFormFields(module.spec, controls);
	const parsed = module.fieldsSchema.safeParse(rawFields);
	if (!parsed.success) {
		return {
			valid: false,
			errors: toFormValidationErrors(
				module.spec,
				rawFields,
				parsed.error.issues,
			),
		};
	}
	const semantic = module.validate(parsed.data);
	if (!semantic.valid) {
		// The validator's own wording is kept: it already names the offending
		// control by its dotted key, so the UI can point at it directly.
		return { valid: false, errors: semantic.errors };
	}
	return {
		valid: true,
		draft: {
			panelType: module.panelType,
			version: DRAFT_SCHEMA_VERSION,
			fields: parsed.data,
		},
	};
}

/**
 * A panel form's opening state: every control at its default, validated through
 * the same submission path as any real submission. A spec whose defaults do
 * not build a panel is a developer error, so it throws rather than showing an
 * unusable form.
 * @param module - The panel type's form module.
 */
export function createDefaultPanelDraft<
	TFormFields,
	TPanelType extends PanelType,
>(
	module: PanelFormModule<TFormFields, TPanelType>,
): PanelFormDraft<TFormFields, TPanelType> {
	const submission = submitPanelForm(module, defaultControls(module.spec));
	if (!submission.valid) {
		const problems = submission.errors.map(
			(error) => `${error.field}: ${error.message}`,
		);
		throw new RangeError(
			`Invalid default values for the ${module.panelType} form: ${problems.join(" ")}`,
		);
	}
	return submission.draft;
}

/** A draft's schema version: a whole number, at least 1. */
const draftVersionField = z.int().gte(1);

/**
 * The zod schema for a stored draft: one per panel type, discriminated by the
 * literal `panelType`, reusing each form's field schema so a stored panel can
 * only ever be read back as the shape that form accepts. This is the door a
 * persisted panel (IndexedDB later) enters the app through.
 */
export const PANEL_DRAFT_SCHEMA: z.ZodType<StoredPanelDraft> = z.union([
	z.object({
		panelType: z.literal("QRD"),
		version: draftVersionField,
		fields: QRD_FORM_FIELDS_SCHEMA,
	}),
	z.object({
		panelType: z.literal("PRD"),
		version: draftVersionField,
		fields: PRD_FORM_FIELDS_SCHEMA,
	}),
	z.object({
		panelType: z.literal("SKYLINE"),
		version: draftVersionField,
		fields: SKYLINE_FORM_FIELDS_SCHEMA,
	}),
	z.object({
		panelType: z.literal("POLY"),
		version: draftVersionField,
		fields: POLY_FORM_FIELDS_SCHEMA,
	}),
	z.object({
		panelType: z.literal("HELMHOLTZ"),
		version: draftVersionField,
		fields: HELMHOLTZ_FORM_FIELDS_SCHEMA,
	}),
	z.object({
		panelType: z.literal("ABFUSOR"),
		version: draftVersionField,
		fields: ABFUSOR_FORM_FIELDS_SCHEMA,
	}),
]);

/** Reading a stored draft back: shape problems come straight from zod. */
export type PanelDraftParseResult =
	| { readonly valid: true; readonly draft: StoredPanelDraft }
	| { readonly valid: false; readonly errors: ValidationError[] };

/**
 * Validates a panel draft read back from storage (or from a form component's
 * event, which is untyped data crossing a boundary).
 * @param data - The untrusted stored draft.
 */
export function parseStoredPanelDraft(data: unknown): PanelDraftParseResult {
	const parsed = PANEL_DRAFT_SCHEMA.safeParse(data);
	if (!parsed.success) {
		return {
			valid: false,
			errors: parsed.error.issues.map((issue) => ({
				field: issue.path.map(String).join(".") || "draft",
				message: `${issue.message}.`,
			})),
		};
	}
	return { valid: true, draft: parsed.data };
}

/** A summary for a form that has not produced a panel yet: the rows stay empty. */
export const NO_PANEL_FORM_SUMMARY: PanelFormSummary = {
	title: "Nothing to show yet",
	rows: [],
};

/**
 * The panel type a route asks for, or `undefined` when it names no panel form. Data
 * arriving from a path segment is a plain string, so the panel type has to be
 * looked up rather than asserted.
 * @param name - The name to look up, in any letter case.
 */
export function findPanelType(name: string): PanelType | undefined {
	return PANEL_TYPES.find(
		(panelType) => panelType.toLowerCase() === name.toLowerCase(),
	);
}
