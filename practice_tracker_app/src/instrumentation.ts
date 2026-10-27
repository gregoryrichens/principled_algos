export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { pool } = await import("@/lib/db");
  const { SCHEMA_SQL } = await import("@/lib/schema");
  await pool.query(SCHEMA_SQL);
}
