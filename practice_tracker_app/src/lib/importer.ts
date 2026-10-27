// CSV / TSV import and field parsing. Pure functions.
import { OUTCOMES, type Outcome } from "@/lib/schedule";

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export interface ParsedRow {
  attemptedOn: string;
  problem: number;
  title: string;
  chosenPrinciple: number | null;
  correctPrinciple: number | null;
  outcome: Outcome;
  note: string;
}

export function parseDate(s: string, today: string): Result<string> {
  const error = { ok: false, error: "date must be YYYY-MM-DD and not in the future" } as const;
  const v = s.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return error;
  const [y, m, d] = v.split("-").map(Number);
  const back = new Date(Date.UTC(y, m - 1, d));
  // Round-trip through Date.UTC: 2026-02-30 would come back as 2026-03-02.
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) {
    return error;
  }
  if (v > today) return error;
  return { ok: true, value: v };
}

export function parseProblem(s: string): Result<{ problem: number; title: string }> {
  const m = /^#?(\d+)(?:\. (.*))?$/s.exec(s.trim());
  const problem = m ? Number(m[1]) : 0;
  if (!m || problem <= 0) {
    return { ok: false, error: "problem must be a number such as 33 or '33. Title'" };
  }
  return { ok: true, value: { problem, title: (m[2] ?? "").trim() } };
}

export function parsePrinciple(s: string): Result<number | null> {
  const v = s.trim();
  if (v === "") return { ok: true, value: null };
  const m = /^p?(\d+)$/i.exec(v);
  const n = m ? Number(m[1]) : 0;
  if (!m || n < 1 || n > 18) {
    return { ok: false, error: "principle must be P1 to P18 (or blank)" };
  }
  return { ok: true, value: n };
}

export function parseOutcome(s: string): Result<Outcome> {
  const v = s.trim().toLowerCase().replace(/[ _]/g, "-");
  const found = OUTCOMES.find((o) => o === v);
  if (!found) return { ok: false, error: `outcome must be one of ${OUTCOMES.join(", ")}` };
  return { ok: true, value: found };
}

// RFC 4180: quoted fields, "" escapes, delimiters and newlines inside quotes, \r\n or \n.
function parseRecords(text: string, delimiter: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      record.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || record.length > 0) {
    record.push(field);
    records.push(record);
  }
  return records;
}

const REQUIRED_COLUMNS = [
  "Date",
  "Problem",
  "Chosen Principle",
  "Correct Principle",
  "Outcome",
  "Invariant / Reason",
] as const;

export function parseLogCsv(text: string, today: string): { rows: ParsedRow[]; errors: string[] } {
  const src = text.replace(/^﻿/, "");
  const headerLine = src.split(/\r\n|\n|\r/, 1)[0];
  const records = parseRecords(src, headerLine.includes("\t") ? "\t" : ",");

  const header = (records[0] ?? []).map((h) => h.trim().toLowerCase());
  const index: Record<string, number> = {};
  for (const name of REQUIRED_COLUMNS) {
    const i = header.indexOf(name.toLowerCase());
    if (i < 0) return { rows: [], errors: [`Missing column: ${name}`] };
    index[name] = i;
  }

  const rows: ParsedRow[] = [];
  const errors: string[] = [];
  for (let r = 1; r < records.length; r++) {
    const cells = records[r];
    if (cells.every((c) => c.trim() === "")) continue;
    const cell = (name: string) => cells[index[name]] ?? "";

    const date = parseDate(cell("Date"), today);
    const problem = parseProblem(cell("Problem"));
    const chosen = parsePrinciple(cell("Chosen Principle"));
    const correct = parsePrinciple(cell("Correct Principle"));
    const outcome = parseOutcome(cell("Outcome"));

    let bad = false;
    for (const res of [date, problem, chosen, correct, outcome]) {
      if (!res.ok) {
        errors.push(`Row ${r + 1}: ${res.error}`);
        bad = true;
      }
    }
    if (bad || !date.ok || !problem.ok || !chosen.ok || !correct.ok || !outcome.ok) continue;

    rows.push({
      attemptedOn: date.value,
      problem: problem.value.problem,
      title: problem.value.title,
      chosenPrinciple: chosen.value,
      correctPrinciple: correct.value,
      outcome: outcome.value,
      note: cell("Invariant / Reason").trim(),
    });
  }
  return { rows, errors };
}
