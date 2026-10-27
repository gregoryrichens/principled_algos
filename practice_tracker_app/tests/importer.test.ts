import { describe, it, expect } from "vitest";
import {
  parseLogCsv,
  parseDate,
  parseProblem,
  parsePrinciple,
  parseOutcome,
} from "@/lib/importer";
import type { ParsedRow } from "@/lib/importer";

const today = "2026-10-26";

const HEADER = "Date,Problem,Chosen Principle,Correct Principle,Outcome,Invariant / Reason";
const LINE_1 =
  "2026-09-21,33. Search in Rotated Sorted Array,P2,P2,clean,One half is always sorted; boundary check preserved";
const LINE_2 =
  "2026-09-22,76. Minimum Window Substring,P3,P3,bug,Missed edge case when required char count dropped below 0";
const LINE_3 =
  "2026-09-23,300. Longest Increasing Subsequence,P1,P2,wrong-principle,Attempted O(N^2) DP instead of O(N log N) binary search patience sort";

// Sample export from the Google Sheet template, verbatim.
const FIXTURE = [HEADER, LINE_1, LINE_2, LINE_3].join("\n");

const ROW_1: ParsedRow = {
  attemptedOn: "2026-09-21",
  problem: 33,
  title: "Search in Rotated Sorted Array",
  chosenPrinciple: 2,
  correctPrinciple: 2,
  outcome: "clean",
  note: "One half is always sorted; boundary check preserved",
};
const ROW_2: ParsedRow = {
  attemptedOn: "2026-09-22",
  problem: 76,
  title: "Minimum Window Substring",
  chosenPrinciple: 3,
  correctPrinciple: 3,
  outcome: "bug",
  note: "Missed edge case when required char count dropped below 0",
};
const ROW_3: ParsedRow = {
  attemptedOn: "2026-09-23",
  problem: 300,
  title: "Longest Increasing Subsequence",
  chosenPrinciple: 1,
  correctPrinciple: 2,
  outcome: "wrong-principle",
  note: "Attempted O(N^2) DP instead of O(N log N) binary search patience sort",
};
const EXPECTED_ROWS: ParsedRow[] = [ROW_1, ROW_2, ROW_3];

describe("parseLogCsv", () => {
  it("parses the section 3.4 fixture into the three expected rows", () => {
    const { rows, errors } = parseLogCsv(FIXTURE, today);
    expect(errors).toEqual([]);
    expect(rows).toEqual(EXPECTED_ROWS);
  });

  it("gives the same result for a tab-separated version of the fixture", () => {
    // No fixture cell contains a comma, so turning every comma into a tab is safe.
    const tsv = [HEADER, LINE_1, LINE_2, LINE_3].map((line) => line.replace(/,/g, "\t")).join("\n");
    const { rows, errors } = parseLogCsv(tsv, today);
    expect(errors).toEqual([]);
    expect(rows).toEqual(EXPECTED_ROWS);
  });

  it("reports a missing Outcome column as exactly one error, 'Missing column: Outcome'", () => {
    const text = [
      "Date,Problem,Chosen Principle,Correct Principle,Invariant / Reason",
      "2026-09-21,33. Search in Rotated Sorted Array,P2,P2,One half is always sorted",
      "2026-09-22,76. Minimum Window Substring,P3,P3,Missed edge case",
    ].join("\n");
    const { errors } = parseLogCsv(text, today);
    expect(errors).toEqual(["Missing column: Outcome"]);
  });

  it("keeps a quoted note that contains a comma and an escaped double quote", () => {
    const text = [
      HEADER,
      '2026-09-21,33. Search in Rotated Sorted Array,P2,P2,clean,"Boundary check, then ""two halves"" sorted"',
    ].join("\n");
    const { rows, errors } = parseLogCsv(text, today);
    expect(errors).toEqual([]);
    expect(rows).toEqual([{ ...ROW_1, note: 'Boundary check, then "two halves" sorted' }]);
  });

  it("strips a leading BOM before reading the header", () => {
    const { rows, errors } = parseLogCsv("﻿" + FIXTURE, today);
    expect(errors).toEqual([]);
    expect(rows).toEqual(EXPECTED_ROWS);
  });

  it("accepts \\r\\n line endings", () => {
    const crlf = FIXTURE.replace(/\n/g, "\r\n");
    const { rows, errors } = parseLogCsv(crlf, today);
    expect(errors).toEqual([]);
    expect(rows).toEqual(EXPECTED_ROWS);
  });

  it("skips a blank row between data rows", () => {
    const text = [HEADER, LINE_1, ",,,,,", LINE_2, LINE_3].join("\n");
    const { rows, errors } = parseLogCsv(text, today);
    expect(errors).toEqual([]);
    expect(rows).toEqual(EXPECTED_ROWS);
  });

  it("returns one error on Row 2 and one on Row 4 when two rows are bad", () => {
    const text = [
      HEADER,
      "2026-12-01,33. Search in Rotated Sorted Array,P2,P2,clean,date is in the future", // row 2
      LINE_2, // row 3, valid
      "2026-09-23,300. Longest Increasing Subsequence,P1,P2,meh,outcome is not valid", // row 4
    ].join("\n");
    const { errors } = parseLogCsv(text, today);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toMatch(/^Row 2:/);
    expect(errors[1]).toMatch(/^Row 4:/);
  });
});

describe("parseProblem", () => {
  it("parses #167 and 167 as problem 167 with an empty title", () => {
    expect(parseProblem("#167")).toEqual({ ok: true, value: { problem: 167, title: "" } });
    expect(parseProblem("167")).toEqual({ ok: true, value: { problem: 167, title: "" } });
  });
});

describe("parsePrinciple", () => {
  it("reads P5, p5 and 5 as 5, and a blank cell as null", () => {
    expect(parsePrinciple("P5")).toEqual({ ok: true, value: 5 });
    expect(parsePrinciple("p5")).toEqual({ ok: true, value: 5 });
    expect(parsePrinciple("5")).toEqual({ ok: true, value: 5 });
    expect(parsePrinciple("")).toEqual({ ok: true, value: null });
  });

  it("reports P19 and x as errors", () => {
    expect(parsePrinciple("P19").ok).toBe(false);
    expect(parsePrinciple("x").ok).toBe(false);
  });
});

describe("parseOutcome", () => {
  it("normalises Clean, wrong principle and READ_SOLUTION", () => {
    expect(parseOutcome("Clean")).toEqual({ ok: true, value: "clean" });
    expect(parseOutcome("wrong principle")).toEqual({ ok: true, value: "wrong-principle" });
    expect(parseOutcome("READ_SOLUTION")).toEqual({ ok: true, value: "read-solution" });
  });

  it("reports meh as an error", () => {
    expect(parseOutcome("meh").ok).toBe(false);
  });
});

describe("parseDate", () => {
  it("reports a date after today as an error", () => {
    expect(parseDate("2026-10-27", today).ok).toBe(false);
  });

  it("reports 21/09/2026 and 2026-02-30 as errors", () => {
    expect(parseDate("21/09/2026", today).ok).toBe(false);
    expect(parseDate("2026-02-30", today).ok).toBe(false);
  });
});
