import pg from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { editAttempt, importCsv, logAttempt, removeAttempt, todayView, type LogInput } from "@/lib/core";
import { listAttempts, pool } from "@/lib/db";
import { SCHEMA_SQL } from "@/lib/schema";

const TEST_DB = "tracker_test";

// Refuse to run against anything but the throwaway test database.
function assertTestDatabase(): URL {
  const url = new URL(process.env.DATABASE_URL ?? "");
  const name = decodeURIComponent(url.pathname.replace(/^\//, ""));
  if (name !== TEST_DB) {
    throw new Error(`Refusing to run: database is "${name}", expected "${TEST_DB}".`);
  }
  return url;
}

const FIXTURE = `Date,Problem,Chosen Principle,Correct Principle,Outcome,Invariant / Reason
2026-09-21,33. Search in Rotated Sorted Array,P2,P2,clean,One half is always sorted; boundary check preserved
2026-09-22,76. Minimum Window Substring,P3,P3,bug,Missed edge case when required char count dropped below 0
2026-09-23,300. Longest Increasing Subsequence,P1,P2,wrong-principle,Attempted O(N^2) DP instead of O(N log N) binary search patience sort
`;

const TODAY = "2026-10-26";

function input(overrides: Partial<LogInput>): LogInput {
  return {
    attemptedOn: "2026-10-25",
    problem: "435",
    title: "",
    chosenPrinciple: "",
    correctPrinciple: "",
    outcome: "clean",
    note: "",
    ...overrides,
  };
}

beforeAll(async () => {
  const url = assertTestDatabase();
  url.pathname = "/postgres";
  const admin = new pg.Client({ connectionString: url.toString() });
  await admin.connect();
  try {
    const found = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [TEST_DB]);
    if (found.rowCount === 0) await admin.query(`CREATE DATABASE ${TEST_DB}`);
  } finally {
    await admin.end();
  }
  await pool.query(SCHEMA_SQL);
});

beforeEach(async () => {
  assertTestDatabase();
  await pool.query("TRUNCATE attempts RESTART IDENTITY");
});

afterAll(async () => {
  await pool.end();
});

describe("core", () => {
  it("1: logAttempt auto-fills the correct principle and adds the map notice", async () => {
    const res = await logAttempt(
      input({ chosenPrinciple: "9", outcome: "wrong-principle" }),
      TODAY,
    );
    expect(res).toEqual({
      ok: true,
      notices: [
        "Logged #435 (wrong-principle).",
        "Principle map says P7 for #435: sort, keep earliest end. (P9 is listed as a secondary principle.)",
      ],
    });
    const rows = await listAttempts();
    expect(rows).toHaveLength(1);
    expect(rows[0].correctPrinciple).toBe(7);
    expect(rows[0].chosenPrinciple).toBe(9);
  });

  it("2: invalid outcome and problem give field errors and insert nothing", async () => {
    const res = await logAttempt(input({ outcome: "meh", problem: "abc" }), TODAY);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.errors.outcome).toBeTruthy();
    expect(res.errors.problem).toBeTruthy();
    expect(res.errors.attemptedOn).toBeUndefined();
    expect(await listAttempts()).toHaveLength(0);
  });

  it("3: an explicit correct principle is never overwritten", async () => {
    const res = await logAttempt(
      input({ correctPrinciple: "3", outcome: "bug" }),
      TODAY,
    );
    expect(res.ok).toBe(true);
    const rows = await listAttempts();
    expect(rows[0].correctPrinciple).toBe(3);
  });

  it("4: importing the fixture twice skips the duplicates", async () => {
    const first = await importCsv(FIXTURE, TODAY);
    expect(first).toEqual({
      ok: true,
      notices: ["Imported 3 attempts. Skipped 0 already in the database."],
    });
    const second = await importCsv(FIXTURE, TODAY);
    expect(second).toEqual({
      ok: true,
      notices: ["Imported 0 attempts. Skipped 3 already in the database."],
    });
    expect(await listAttempts()).toHaveLength(3);
  });

  it("5: a bad row imports nothing", async () => {
    const bad = FIXTURE.replace("2026-09-22", "22/09/2026");
    const res = await importCsv(bad, TODAY);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.errors).toHaveLength(1);
    expect(res.errors[0]).toMatch(/^Row 3:/);
    expect(await listAttempts()).toHaveLength(0);
  });

  it("6: todayView lists the due reviews after importing the fixture", async () => {
    await importCsv(FIXTURE, TODAY);
    const view = await todayView(TODAY);
    expect(view.due.map((d) => d.problem)).toEqual([76, 300, 33]);
    expect(view.due.find((d) => d.problem === 33)!.stepLabel).toBe("Day 14");
    const r76 = view.due.find((d) => d.problem === 76)!;
    expect(r76.daysOverdue).toBe(33);
    expect(r76.title).toBe("Minimum Window Substring");
    expect(r76.anchor.outcome).toBe("bug");
    expect(view.counts).toEqual({ due: 3, inCycle: 3, retired: 0 });
  });

  it("7: removeAttempt deletes the row and returns the notice", async () => {
    await importCsv(FIXTURE, TODAY);
    const target = (await listAttempts()).find((a) => a.problem === 76)!;
    expect(await removeAttempt(target.id)).toEqual(["Deleted attempt from 2026-09-22 for #76."]);
    expect((await listAttempts()).some((a) => a.id === target.id)).toBe(false);
    expect(await removeAttempt(target.id)).toEqual([]);
  });

  it("8: editAttempt changes the row in place, keeping its id", async () => {
    await importCsv(FIXTURE, TODAY);
    const target = (await listAttempts()).find((a) => a.problem === 76)!;
    const result = await editAttempt(
      target.id,
      input({ attemptedOn: "2026-09-22", problem: "76", outcome: "clean", note: "fixed" }),
      TODAY,
    );
    expect(result).toEqual({ ok: true, notices: ["Updated attempt from 2026-09-22 for #76."] });
    const after = (await listAttempts()).find((a) => a.id === target.id)!;
    expect(after.outcome).toBe("clean");
    expect(after.note).toBe("fixed");
    expect(await listAttempts()).toHaveLength(3);
  });

  it("9: editAttempt rejects bad input and a missing id changes nothing", async () => {
    await importCsv(FIXTURE, TODAY);
    const target = (await listAttempts())[0];
    const bad = await editAttempt(target.id, input({ outcome: "nope" }), TODAY);
    expect(bad.ok).toBe(false);
    expect((await listAttempts()).find((a) => a.id === target.id)).toEqual(target);
    const missing = await editAttempt(999999, input({}), TODAY);
    expect(missing).toEqual({ ok: true, notices: ["That attempt no longer exists."] });
  });
});
