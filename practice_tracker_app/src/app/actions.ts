"use server";

import { redirect } from "next/navigation";
import { importCsv, logAttempt, removeAttempt, type LogInput } from "@/lib/core";
import { todayIn } from "@/lib/dates";

export type LogFormState = {
  errors: Record<keyof LogInput, string | undefined>;
  values: LogInput;
} | null;

export type ImportFormState = { errors: string[] } | null;

const today = () => todayIn(process.env.TZ ?? "UTC");

function withNotices(path: string, notices: string[]): string {
  const params = new URLSearchParams();
  for (const notice of notices) params.append("n", notice);
  return `${path}?${params}`;
}

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function logAction(_prev: LogFormState, formData: FormData): Promise<LogFormState> {
  const values: LogInput = {
    attemptedOn: field(formData, "attemptedOn"),
    problem: field(formData, "problem"),
    title: field(formData, "title"),
    chosenPrinciple: field(formData, "chosenPrinciple"),
    correctPrinciple: field(formData, "correctPrinciple"),
    outcome: field(formData, "outcome"),
    note: field(formData, "note"),
  };
  const result = await logAttempt(values, today());
  if (!result.ok) return { errors: result.errors, values };
  redirect(withNotices("/", result.notices));
}

export async function importAction(
  _prev: ImportFormState,
  formData: FormData,
): Promise<ImportFormState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { errors: ["Choose a .csv or .tsv file first."] };
  }
  const result = await importCsv(await file.text(), today());
  if (!result.ok) return { errors: result.errors };
  redirect(withNotices("/", result.notices));
}

export async function deleteAction(formData: FormData): Promise<void> {
  const notices = await removeAttempt(Number(field(formData, "id")));
  redirect(withNotices("/history", notices));
}
