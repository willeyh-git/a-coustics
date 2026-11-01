import type { PanelFormControls, PanelFormSpec } from "@forms/common";
import {
	buildRawFormFields,
	defaultControls,
	draftFieldsToControls,
	findControlError,
	formatFormValue,
	formatMetres,
	formatPercent,
	parseControlValue,
	resolveFormKey,
	toFormValidationErrors,
} from "@forms/common";
import { toLength } from "@geometry/scaling";
import { m } from "@units/units";
import type { ValidationError } from "@validators/common";
import { describe, expect, it } from "vitest";

const sampleSpec: PanelFormSpec = {
	panelType: "QRD",
	title: "Sample",
	fields: [
		{
			key: "prime",
			label: "Prime order",
			kind: "primeOrder",
			optional: false,
			default: 7,
		},
		{
			key: "designFrequency",
			label: "Design frequency",
			kind: "frequency",
			optional: false,
			unit: "Hz",
			default: 1000,
		},
		{
			key: "primitiveRoot",
			label: "Primitive root",
			kind: "count",
			optional: true,
		},
		{
			key: "material.flowResistivity",
			label: "Flow resistivity",
			kind: "flowResistivity",
			optional: true,
			unit: "rayls/m³",
			default: 5000,
		},
		{
			key: "frequencyAxis",
			label: "Frequency axis",
			kind: "frequencyList",
			optional: true,
			unit: "Hz",
		},
	],
};

describe("parseControlValue", () => {
	it("parses a plain number, ignoring surrounding spaces", () => {
		expect(parseControlValue("primeOrder", " 13 ")).toBe(13);
	});
	it("keeps exponent notation", () => {
		expect(parseControlValue("frequency", " 1e3 ")).toBe(1000);
	});
	it("treats a blank control as carrying no value", () => {
		expect(parseControlValue("frequency", "   ")).toBe("");
	});
	it("leaves unparseable text for zod to reject", () => {
		expect(parseControlValue("frequency", "ten")).toBe("ten");
		expect(parseControlValue("frequency", "NaN")).toBe("NaN");
		expect(parseControlValue("frequency", "Infinity")).toBe("Infinity");
	});
	it("splits a frequency axis on spaces, commas and semicolons", () => {
		expect(parseControlValue("frequencyList", "40, 80; 160 ")).toEqual([
			40, 80, 160,
		]);
	});
	it("keeps a list with a bad entry as text", () => {
		expect(parseControlValue("frequencyList", "40 x")).toBe("40 x");
	});
	it("keeps select options verbatim", () => {
		expect(parseControlValue("select", " PRD ")).toBe("PRD");
	});
});

describe("formatFormValue", () => {
	it("renders numbers, strings and lists as control text", () => {
		expect(formatFormValue(7)).toBe("7");
		expect(formatFormValue("PRD")).toBe("PRD");
		expect(formatFormValue([40, 80])).toBe("40, 80");
	});
});

describe("defaultControls", () => {
	it("opens every field at its default and leaves blank fields empty", () => {
		expect(defaultControls(sampleSpec)).toEqual({
			prime: "7",
			designFrequency: "1000",
			primitiveRoot: "",
			"material.flowResistivity": "5000",
			frequencyAxis: "",
		});
	});
});

describe("buildRawFormFields", () => {
	it("nests a dotted key and drops blank controls", () => {
		const controls: PanelFormControls = {
			prime: "7",
			designFrequency: "1000",
			primitiveRoot: "  ",
			"material.flowResistivity": "5000",
			frequencyAxis: "40 80",
		};

		expect(buildRawFormFields(sampleSpec, controls)).toEqual({
			prime: 7,
			designFrequency: 1000,
			material: { flowResistivity: 5000 },
			frequencyAxis: [40, 80],
		});
	});
	it("keeps a value that does not parse so the field is reported, not guessed", () => {
		expect(buildRawFormFields(sampleSpec, { prime: "six" })).toEqual({
			prime: "six",
		});
	});
});

describe("draftFieldsToControls", () => {
	it("renders a stored draft back into control text", () => {
		const draft = {
			prime: 13,
			designFrequency: 500,
			material: { flowResistivity: 1200 },
		};

		expect(draftFieldsToControls(sampleSpec, draft)).toEqual({
			prime: "13",
			designFrequency: "500",
			primitiveRoot: "",
			"material.flowResistivity": "1200",
			frequencyAxis: "",
		});
	});
	it("reads a draft that is not an object as all-blank controls", () => {
		expect(draftFieldsToControls(sampleSpec, null)).toEqual({
			prime: "",
			designFrequency: "",
			primitiveRoot: "",
			"material.flowResistivity": "",
			frequencyAxis: "",
		});
	});
});

describe("resolveFormKey", () => {
	it("folds an array index back onto its control", () => {
		expect(resolveFormKey(sampleSpec, ["frequencyAxis", "2"])).toBe(
			"frequencyAxis",
		);
	});
	it("keeps a nested key that is a control", () => {
		expect(resolveFormKey(sampleSpec, ["material", "flowResistivity"])).toBe(
			"material.flowResistivity",
		);
	});
	it("names a field the form never renders", () => {
		expect(resolveFormKey(sampleSpec, ["nope", "deep"])).toBe("nope.deep");
	});
	it("labels a problem with the record itself", () => {
		expect(resolveFormKey(sampleSpec, [])).toBe("form");
	});
});

describe("toFormValidationErrors", () => {
	it("names the control, its unit and what it should look like", () => {
		const errors = toFormValidationErrors(sampleSpec, { designFrequency: 0 }, [
			{ path: ["designFrequency"], message: "Too small" },
		]);

		expect(errors).toEqual([
			{
				field: "designFrequency",
				message:
					"Design frequency (Hz) must be a number of hertz greater than zero (got 0).",
			},
		]);
	});

	it("says when a required control was left blank", () => {
		const errors = toFormValidationErrors(sampleSpec, {}, [
			{ path: ["prime"], message: "Invalid input" },
		]);

		expect(errors).toEqual([
			{
				field: "prime",
				message:
					"Prime order must be a prime whole-number panel order between 3 and 100; nothing was supplied.",
			},
		]);
	});
});

describe("findControlError", () => {
	it("returns the message of the error that names the control", () => {
		const errors: ValidationError[] = [
			{ field: "prime", message: "Prime order is too small." },
			{
				field: "material.flowResistivity",
				message: "Flow resistivity must be positive.",
			},
		];

		expect(findControlError(errors, "designFrequency")).toBeUndefined();
		expect(findControlError(errors, "prime")).toBe("Prime order is too small.");
		expect(findControlError(errors, "material.flowResistivity")).toBe(
			"Flow resistivity must be positive.",
		);
	});

	it("says a control is clean while the form still has problems", () => {
		expect(findControlError([], "prime")).toBeUndefined();
	});
});

describe("result formatting", () => {
	it("keeps units next to the numbers", () => {
		expect(formatMetres(toLength(0.123456, m))).toBe("0.1235 m");
		expect(formatPercent(0.25)).toBe("25 %");
	});
});
