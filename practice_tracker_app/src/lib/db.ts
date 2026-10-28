import pg from "pg";
import type { ParsedRow } from "@/lib/importer";

// DATE columns (OID 1082) come back as "YYYY-MM-DD" strings, not JS Dates.
pg.types.setTypeParser(1082, (v: string) => v);

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export type AttemptRow = ParsedRow & { id: number };

interface DbRow {
  id: string;
  attempted_on: string;
  problem: number;
  title: string;
  chosen_principle: number | null;
  correct_principle: number | null;
  outcome: string;
  note: string;
}

const COLUMNS =
  "id, attempted_on, problem, title, chosen_principle, correct_principle, outcome, note";

function toAttempt(r: DbRow): AttemptRow {
  return {
    id: Number(r.id),
    attemptedOn: r.attempted_on,
    problem: r.problem,
    title: r.title,
    chosenPrinciple: r.chosen_principle,
    correctPrinciple: r.correct_principle,
    outcome: r.outcome as ParsedRow["outcome"],
    note: r.note,
  };
}

function toParams(row: ParsedRow) {
  return [
    row.attemptedOn,
    row.problem,
    row.title,
    row.chosenPrinciple,
    row.correctPrinciple,
    row.outcome,
    row.note,
  ];
}

export async function insertAttempt(row: ParsedRow): Promise<number> {
  const res = await pool.query<{ id: string }>(
    `INSERT INTO attempts (attempted_on, problem, title, chosen_principle, correct_principle, outcome, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    toParams(row),
  );
  return Number(res.rows[0].id);
}

export async function listAttempts(): Promise<AttemptRow[]> {
  const res = await pool.query<DbRow>(
    `SELECT ${COLUMNS} FROM attempts ORDER BY attempted_on DESC, id DESC`,
  );
  return res.rows.map(toAttempt);
}

export async function getAttemptsByIds(
  ids: number[],
): Promise<Map<number, AttemptRow>> {
  if (ids.length === 0) return new Map();
  const res = await pool.query<DbRow>(
    `SELECT ${COLUMNS} FROM attempts WHERE id = ANY($1::bigint[])`,
    [ids],
  );
  return new Map(res.rows.map((r) => [Number(r.id), toAttempt(r)]));
}

export async function deleteAttempt(id: number): Promise<AttemptRow | null> {
  const res = await pool.query<DbRow>(
    `DELETE FROM attempts WHERE id = $1 RETURNING ${COLUMNS}`,
    [id],
  );
  return res.rows.length ? toAttempt(res.rows[0]) : null;
}

export async function updateAttempt(id: number, row: ParsedRow): Promise<boolean> {
  const res = await pool.query(
    `UPDATE attempts
     SET attempted_on = $2, problem = $3, title = $4, chosen_principle = $5,
         correct_principle = $6, outcome = $7, note = $8
     WHERE id = $1`,
    [id, ...toParams(row)],
  );
  return res.rowCount === 1;
}

export async function importRows(
  rows: ParsedRow[],
): Promise<{ inserted: number; skipped: number }> {
  const client = await pool.connect();
  let inserted = 0;
  let skipped = 0;
  try {
    await client.query("BEGIN");
    for (const row of rows) {
      const res = await client.query(
        `INSERT INTO attempts (attempted_on, problem, title, chosen_principle, correct_principle, outcome, note)
         SELECT $1::date, $2::int, $3::text, $4::smallint, $5::smallint, $6::text, $7::text
         WHERE NOT EXISTS (
           SELECT 1 FROM attempts
           WHERE attempted_on IS NOT DISTINCT FROM $1::date
             AND problem IS NOT DISTINCT FROM $2::int
             AND title IS NOT DISTINCT FROM $3::text
             AND chosen_principle IS NOT DISTINCT FROM $4::smallint
             AND correct_principle IS NOT DISTINCT FROM $5::smallint
             AND outcome IS NOT DISTINCT FROM $6::text
             AND note IS NOT DISTINCT FROM $7::text
         )`,
        toParams(row),
      );
      if (res.rowCount) inserted++;
      else skipped++;
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  return { inserted, skipped };
}

export async function latestTitles(): Promise<Map<number, string>> {
  const res = await pool.query<{ problem: number; title: string }>(
    `SELECT DISTINCT ON (problem) problem, title
     FROM attempts
     WHERE title <> ''
     ORDER BY problem, attempted_on DESC, id DESC`,
  );
  return new Map(res.rows.map((r) => [r.problem, r.title]));
}
