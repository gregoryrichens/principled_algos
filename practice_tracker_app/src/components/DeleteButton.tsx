"use client";

import type { FormEvent } from "react";
import { deleteAction } from "@/app/actions";

export function DeleteButton({ id, date, problem }: { id: number; date: string; problem: number }) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete the attempt from ${date} for #${problem}? This cannot be undone.`)) {
      event.preventDefault();
    }
  }
  return (
    <form action={deleteAction} onSubmit={onSubmit}>
      <input type="hidden" name="id" value={id} />
      <button type="submit">Delete</button>
    </form>
  );
}
