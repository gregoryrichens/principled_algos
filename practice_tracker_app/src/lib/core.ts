// All of the app's behavior lives here, so it can be
// tested without a browser. Server Actions only call these functions and redirect.
import {
  deleteAttempt,
  getAttemptsByIds,
  importRows,
  insertAttempt,
  latestTitles,
  listAttempts,
  updateAttempt,
  type AttemptRow,
} from "@/lib/db";
import {
  parseDate,
  parseLogCsv,
  parseOutcome,
  parsePrinciple,
  parseProblem,
  type ParsedRow,
} from "@/lib/importer";
import { principleMap } from "@/lib/principles";
import { dueReviews, problemStates, type DueReview } from "@/lib/schedule";

export type LogInput = {
  attemptedOn: string;
  problem: string;
  title: string;
  chosenPrinciple: string;
  correctPrinciple: string;
  outcome: string;
  note: string;
};

function withMapPrinciple(row: ParsedRow): ParsedRow {
  if (row.correctPrinciple !== null) return row;
  const entry = principleMap().get(row.problem);
  return entry ? { ...row, correctPrinciple: entry.primary } : row;
}

type FieldErrors = Record<keyof LogInput, string | undefined>;

function validate(
  input: LogInput,
  today: string,
): { ok: true; row: ParsedRow } | { ok: false; errors: FieldErrors } {
  const date = parseDate(input.attemptedOn, today);
  const problem = parseProblem(input.problem);
  const chosen = parsePrinciple(input.chosenPrinciple);
  const correct = parsePrinciple(input.correctPrinciple);
  const outcome = parseOutcome(input.outcome);

  if (!date.ok || !problem.ok || !chosen.ok || !correct.ok || !outcome.ok) {
    return {
      ok: false,
      errors: {
        attemptedOn: date.ok ? undefined : date.error,
        problem: problem.ok ? undefined : problem.error,
        title: undefined,
        chosenPrinciple: chosen.ok ? undefined : chosen.error,
        correctPrinciple: correct.ok ? undefined : correct.error,
        outcome: outcome.ok ? undefined : outcome.error,
        note: undefined,
      },
    };
  }

  return {
    ok: true,
    row: withMapPrinciple({
      attemptedOn: date.value,
      problem: problem.value.problem,
      title: input.title.trim(),
      chosenPrinciple: chosen.value,
      correctPrinciple: correct.value,
      outcome: outcome.value,
      note: input.note.trim(),
    }),
  };
}

export async function logAttempt(
  input: LogInput,
  today: string,
): Promise<{ ok: true; notices: string[] } | { ok: false; errors: FieldErrors }> {
  const v = validate(input, today);
  if (!v.ok) return v;

  const { problem: n, outcome, chosenPrinciple: chosen } = v.row;
  await insertAttempt(v.row);

  const notices = [`Logged #${n} (${outcome}).`];
  const entry = principleMap().get(n);
  if (entry && chosen !== null && chosen !== entry.primary) {
    let notice = `Principle map says P${entry.primary} for #${n}: ${entry.note}.`;
    if (entry.secondary.includes(chosen)) {
      notice += ` (P${chosen} is listed as a secondary principle.)`;
    }
    notices.push(notice);
  }
  return { ok: true, notices };
}

export async function editAttempt(
  id: number,
  input: LogInput,
  today: string,
): Promise<{ ok: true; notices: string[] } | { ok: false; errors: FieldErrors }> {
  const v = validate(input, today);
  if (!v.ok) return v;
  const updated = await updateAttempt(id, v.row);
  return {
    ok: true,
    notices: [updated ? `Updated attempt from ${v.row.attemptedOn} for #${v.row.problem}.` : "That attempt no longer exists."],
  };
}

export async function importCsv(
  text: string,
  today: string,
): Promise<{ ok: true; notices: string[] } | { ok: false; errors: string[] }> {
  const { rows, errors } = parseLogCsv(text, today);
  if (errors.length > 0) return { ok: false, errors };
  const { inserted, skipped } = await importRows(rows.map(withMapPrinciple));
  return {
    ok: true,
    notices: [`Imported ${inserted} attempts. Skipped ${skipped} already in the database.`],
  };
}

export async function removeAttempt(id: number): Promise<string[]> {
  const row = await deleteAttempt(id);
  return row ? [`Deleted attempt from ${row.attemptedOn} for #${row.problem}.`] : [];
}

export async function todayView(today: string): Promise<{
  due: Array<DueReview & { title: string; anchor: AttemptRow }>;
  counts: { due: number; inCycle: number; retired: number };
}> {
  const attempts = await listAttempts();
  const reviews = dueReviews(attempts, today);
  const [titles, anchors] = await Promise.all([
    latestTitles(),
    getAttemptsByIds(reviews.map((r) => r.anchorAttemptId)),
  ]);

  const states = [...problemStates(attempts).values()];
  return {
    due: reviews.map((r) => ({
      ...r,
      title: titles.get(r.problem) ?? "",
      anchor: anchors.get(r.anchorAttemptId)!,
    })),
    counts: {
      due: reviews.length,
      inCycle: states.filter((s) => s.status === "in_cycle").length,
      retired: states.filter((s) => s.status === "retired").length,
    },
  };
}
