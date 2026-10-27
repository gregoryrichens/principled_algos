"use client";

import { useActionState } from "react";
import { logAction } from "@/app/actions";
import type { LogInput } from "@/lib/core";
import { OUTCOMES } from "@/lib/schedule";

// Names come from the server page: principles.ts uses node:fs, so it cannot be imported here.
function PrincipleOptions({ blank, names }: { blank: string; names: Record<number, string> }) {
  return (
    <>
      <option value="">{blank}</option>
      {Object.entries(names).map(([n, name]) => (
        <option key={n} value={`P${n}`}>
          {`P${n} · ${name}`}
        </option>
      ))}
    </>
  );
}

export function LogForm({
  defaults,
  principleNames,
}: {
  defaults: LogInput;
  principleNames: Record<number, string>;
}) {
  const [state, action, pending] = useActionState(logAction, null);
  const v = state?.values ?? defaults;
  const e = state?.errors;
  const err = (key: keyof LogInput) => (e?.[key] ? <span className="error">{e[key]}</span> : null);

  return (
    <form action={action} className="stack">
      <label>
        Date
        <input type="date" name="attemptedOn" defaultValue={v.attemptedOn} />
        {err("attemptedOn")}
      </label>
      <label>
        Problem number
        <input type="text" name="problem" inputMode="numeric" required defaultValue={v.problem} />
        {err("problem")}
      </label>
      <label>
        Title
        <input type="text" name="title" defaultValue={v.title} />
      </label>
      <label>
        Chosen principle
        <select name="chosenPrinciple" defaultValue={v.chosenPrinciple}>
          <PrincipleOptions blank="—" names={principleNames} />
        </select>
        {err("chosenPrinciple")}
      </label>
      <label>
        Correct principle
        <select name="correctPrinciple" defaultValue={v.correctPrinciple}>
          <PrincipleOptions blank="— (auto from map)" names={principleNames} />
        </select>
        {err("correctPrinciple")}
      </label>
      <label>
        Outcome
        <select name="outcome" required defaultValue={v.outcome}>
          <option value="">Choose an outcome</option>
          {OUTCOMES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {err("outcome")}
      </label>
      <label>
        Invariant / reason
        <textarea name="note" rows={3} defaultValue={v.note} />
      </label>
      <button type="submit" disabled={pending}>
        Save
      </button>
    </form>
  );
}
