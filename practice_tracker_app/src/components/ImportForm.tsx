"use client";

import { useActionState } from "react";
import { importAction } from "@/app/actions";

export function ImportForm() {
  const [state, action, pending] = useActionState(importAction, null);
  return (
    <form action={action} className="stack">
      <p>
        The first row must be: <code>Date, Problem, Chosen Principle, Correct Principle, Outcome, Invariant / Reason</code>
      </p>
      <label>
        File
        <input type="file" name="file" accept=".csv,.tsv" required />
      </label>
      <button type="submit" disabled={pending}>
        Import
      </button>
      {state && (
        <div className="error">
          <ul>
            {state.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
          <p>Nothing was imported.</p>
        </div>
      )}
    </form>
  );
}
