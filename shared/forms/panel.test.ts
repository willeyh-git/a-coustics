import { designQRD } from "@design/qrd";
import type { PanelFormControls } from "@forms/common";
import { defaultControls, draftFieldsToControls } from "@forms/common";
import {
	ABFUSOR_FORM_MODULE,
	createDefaultPanelDraft,
	HELMHOLTZ_FORM_MODULE,
	PANEL_FORM_SPECS,
	PANEL_TYPES,
	POLY_FORM_MODULE,
	PRD_FORM_MODULE,
	parseStoredPanelDraft,
	QRD_FORM_MODULE,
	SKYLINE_FORM_MODULE,
	submitPanelForm,
} from "@forms/panel";
import {
	decodeQRDFormFields,
	QRD_FORM_SPEC,
	summarizeQRDFormResult,
} from "@forms/qrd";
import { describe, expect, it } from "vitest";

describe("PANEL_FORM_SPECS", () => {
	it("has a form for every panel type", () => {
		const types = PANEL_TYPES.map(
			(panelType) => PANEL_FORM_SPECS[panelType].panelType,
		);
		expect(types).toEqual([...PANEL_TYPES]);
	});
});

describe("submitPanelForm", () => {
	it("turns control text into a typed draft", () => {
		const submission = submitPanelForm(QRD_FORM_MODULE, {
			prime: "13",
			designFrequency: "500",
		});
		expect(submission.valid).toBe(true);
		if (submission.valid) {
			expect(submission.draft).toEqual({
				panelType: "QRD",
				version: 1,
				fields: { prime: 13, designFrequency: 500 },
			});
		}
	});
});

describe("panel form errors", () => {
	it("names the control whose value is out of range", () => {
		const submission = submitPanelForm(QRD_FORM_MODULE, {
			prime: "101",
			designFrequency: "1000",
		});
		expect(submission.valid).toBe(false);
		if (!submission.valid) {
			expect(submission.errors.map((error) => error.field)).toEqual(["prime"]);
			expect(
				submission.errors.map((error) => error.message).join(" "),
			).toContain("between 3 and 100");
		}
	});

	it("reports a blank required control instead of inventing a value", () => {
		const submission = submitPanelForm(QRD_FORM_MODULE, {
			designFrequency: "1000",
		});
		expect(submission.valid).toBe(false);
		if (!submission.valid) {
			expect(submission.errors.map((error) => error.field)).toEqual(["prime"]);
			expect(
				submission.errors.map((error) => error.message).join(" "),
			).toContain("nothing was supplied");
		}
	});

	it("rejects text that is not a number", () => {
		const submission = submitPanelForm(QRD_FORM_MODULE, {
			prime: "seven",
			designFrequency: "1000",
		});
		expect(submission.valid).toBe(false);
		if (!submission.valid) {
			expect(submission.errors.map((error) => error.field)).toEqual(["prime"]);
			expect(
				submission.errors.map((error) => error.message).join(" "),
			).toContain('got "seven"');
		}
	});

	it("runs the panel validator once zod has checked the shape", () => {
		const submission = submitPanelForm(QRD_FORM_MODULE, {
			prime: "6",
			designFrequency: "1000",
		});
		expect(submission.valid).toBe(false);
		if (!submission.valid) {
			expect(submission.errors).toEqual([
				{ field: "prime", message: "Value 6 must be a prime number." },
			]);
		}
	});

	it("reports an unusable primitive root", () => {
		const submission = submitPanelForm(PRD_FORM_MODULE, {
			prime: "7",
			primitiveRoot: "2",
			designFrequency: "1000",
		});
		expect(submission.valid).toBe(false);
		if (!submission.valid) {
			expect(submission.errors).toEqual([
				{
					field: "primitiveRoot",
					message: "Value 2 must be a primitive root modulo 7.",
				},
			]);
		}
	});

	it("rejects a sequence source the skyline design does not have", () => {
		const submission = submitPanelForm(SKYLINE_FORM_MODULE, {
			prime: "7",
			sequenceType: "QBD",
			designFrequency: "1000",
		});
		expect(submission.valid).toBe(false);
		if (!submission.valid) {
			expect(submission.errors.map((error) => error.field)).toEqual([
				"sequenceType",
			]);
			expect(
				submission.errors.map((error) => error.message).join(" "),
			).toContain("one of: QRD, PRD");
		}
	});

	it("reports a poly coefficient that is not a residue class", () => {
		const submission = submitPanelForm(POLY_FORM_MODULE, {
			prime: "7",
			designFrequency: "1000",
			q1: "3",
			q2: "1",
		});
		expect(submission.valid).toBe(false);
		if (!submission.valid) {
			expect(submission.errors.map((error) => error.field)).toEqual(["q1"]);
			expect(
				submission.errors.map((error) => error.message).join(" "),
			).toContain("quadratic residue modulo 7");
		}
	});

	it("folds a bad list entry back onto its control", () => {
		const submission = submitPanelForm(HELMHOLTZ_FORM_MODULE, {
			neckRadius: "0.15",
			neckLength: "0.1",
			cavityVolume: "0.02",
			frequencyAxis: "40 x",
		});
		expect(submission.valid).toBe(false);
	});

	it("requires a flow resistivity once a material control is filled in", () => {
		const submission = submitPanelForm(ABFUSOR_FORM_MODULE, {
			prime: "7",
			designFrequency: "1000",
			absorptiveRatio: "0.25",
			"material.surfaceResistance": "1000",
		});
		expect(submission.valid).toBe(false);
		if (!submission.valid) {
			expect(submission.errors.map((error) => error.field)).toEqual([
				"material.flowResistivity",
			]);
			expect(
				submission.errors.map((error) => error.message).join(" "),
			).toContain("nothing was supplied");
		}
	});

	it("keeps every problem of one submission in one pass", () => {
		const submission = submitPanelForm(POLY_FORM_MODULE, {
			prime: "7",
			designFrequency: "1000",
			q1: "3",
			q2: "5",
		});
		expect(submission.valid).toBe(false);
		if (!submission.valid) {
			expect(submission.errors.map((error) => error.field)).toEqual([
				"q1",
				"q2",
			]);
		}
	});
});

describe("panel form defaults", () => {
	it("every form opens on a panel that can be built", () => {
		const qrd = submitPanelForm(
			QRD_FORM_MODULE,
			defaultControls(QRD_FORM_MODULE.spec),
		);
		const prd = submitPanelForm(
			PRD_FORM_MODULE,
			defaultControls(PRD_FORM_MODULE.spec),
		);
		const skyline = submitPanelForm(
			SKYLINE_FORM_MODULE,
			defaultControls(SKYLINE_FORM_MODULE.spec),
		);
		const poly = submitPanelForm(
			POLY_FORM_MODULE,
			defaultControls(POLY_FORM_MODULE.spec),
		);
		const helmholtz = submitPanelForm(
			HELMHOLTZ_FORM_MODULE,
			defaultControls(HELMHOLTZ_FORM_MODULE.spec),
		);
		const abfusor = submitPanelForm(
			ABFUSOR_FORM_MODULE,
			defaultControls(ABFUSOR_FORM_MODULE.spec),
		);

		expect(qrd.valid).toBe(true);
		expect(prd.valid).toBe(true);
		expect(skyline.valid).toBe(true);
		expect(poly.valid).toBe(true);
		expect(helmholtz.valid).toBe(true);
		expect(abfusor.valid).toBe(true);
	});
});

describe("editing a previously submitted panel", () => {
	it("reopens a form from a submitted draft and keeps unedited values", () => {
		const submitted = submitPanelForm(QRD_FORM_MODULE, {
			prime: "7",
			designFrequency: "1000",
		});

		expect(submitted.valid).toBe(true);
		if (!submitted.valid) {
			expect(submitted.errors.map((error) => error.field)).toEqual([]);
		}

		if (submitted.valid) {
			const controls = draftFieldsToControls(
				QRD_FORM_SPEC,
				submitted.draft.fields,
			);

			expect(controls).toEqual({ prime: "7", designFrequency: "1000" });

			// Re-submitting those values with one order changed keeps the others.
			const edited: PanelFormControls = { ...controls, prime: "13" };
			const next = submitPanelForm(QRD_FORM_MODULE, edited);

			expect(next.valid).toBe(true);
			if (next.valid) {
				expect(next.draft.fields).toEqual({ prime: 13, designFrequency: 1000 });
			}
		}
	});
});

describe("panel draft storage", () => {
	it("keeps a draft identical through a JSON round trip", () => {
		const draft = createDefaultPanelDraft(ABFUSOR_FORM_MODULE);
		const parsed = parseStoredPanelDraft(JSON.parse(JSON.stringify(draft)));

		expect(parsed.valid).toBe(true);
		if (parsed.valid) {
			expect(parsed.draft).toEqual(draft);
		}
	});
	it("refuses a draft whose values no longer fit the form", () => {
		const parsed = parseStoredPanelDraft({
			panelType: "QRD",
			version: 1,
			fields: { prime: 1000, designFrequency: 1000 },
		});

		expect(parsed.valid).toBe(false);
		if (!parsed.valid) {
			expect(parsed.errors.map((error) => error.field)).toEqual([
				"fields.prime",
			]);
		}
	});
});

describe("panel results", () => {
	it("summarizes a submitted QRD design", () => {
		const submission = submitPanelForm(QRD_FORM_MODULE, {
			prime: "7",
			designFrequency: "1000",
		});

		expect(submission.valid).toBe(true);
		if (!submission.valid) {
			expect(submission.errors.map((error) => error.field)).toEqual([]);
		}

		if (submission.valid) {
			const rows = summarizeQRDFormResult(
				designQRD(decodeQRDFormFields(submission.draft.fields)),
			).rows;

			expect(rows).toEqual([
				{ label: "Wells", value: "7" },
				{ label: "Unit depth", value: "0.0245 m" },
				{ label: "Deepest well", value: "0.098 m" },
				{ label: "Well residues", value: "0, 1, 4, 2, 2, 4, 1" },
			]);
		}
	});
});
