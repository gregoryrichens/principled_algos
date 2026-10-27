# Practice Tracker: Build Plan

This plan is for an orchestrating agent. It builds the practice tracker in `practice_tracker_app/`: a small local Next.js web app that logs LeetCode attempts and lists the problems due for review each day. `practice_tracker_app/README.md` already exists and is the user-facing spec. Wherever this plan and the README describe the same behavior, they must agree. If you find a conflict, stop and ask the user.

---

## 0. Rules for the orchestrator (read first)

**You coordinate. You do not write code.**

1. **Never create or edit a code, config, template or test file yourself.** That covers everything under `practice_tracker_app/` except this plan. Every such change goes to a subagent, and so does every fix.
2. **You may:** read files, run shell commands (builds, tests, curl, docker), write task briefs, review diffs, and ask the user questions.
3. **Delegate with the model named for each task.** In Claude Code, use the Agent tool with `subagent_type: "general-purpose"` and `model: "haiku"` or `model: "sonnet"`. In another harness, use that vendor's equivalent tiers: *small/cheap* for haiku tasks and *mid-tier* for sonnet tasks. Never use your own (top-tier) model for a coding task.
4. **Fix loop.** If a task fails its acceptance check, send the failure output back to the same subagent (SendMessage, so it keeps its context) and ask for a fix. After **two** failed fix rounds on a haiku task, re-run it with sonnet. After two failed rounds on a sonnet task, stop and report to the user. Don't fix it yourself.
5. **Run independent tasks in parallel.** Section 4 marks which tasks can run together.
6. **Subagents start cold.** Each brief must include:
   - "Read `practice_tracker_app/BUILD_PLAN.md` sections X and Y, and `CLAUDE.md` at the repo root, and follow them."
   - The exact files the subagent may create or edit. Tell it to touch nothing else.
   - The interface it must implement or rely on (copy from section 3).
   - The acceptance check from section 4, so it can run that check itself before reporting.
   - "Report: the files changed, the check output, and any decision you made that this plan did not specify."
7. **Review every task before moving on.** Read the diff. Check it against the spec. Run the acceptance check yourself; don't trust the subagent's report. Any decision a subagent made that this plan didn't cover goes on a list for your final report.
8. **Git.** Work on a new branch called `practice-tracker`. Don't commit or push unless the user asks. Change nothing outside `practice_tracker_app/`.
9. **Docker safety.** Every command uses the separate compose project `-p tracker-test` with `TRACKER_PORT=8001`, so you can never touch the user's real `practice-tracker` volume. Don't run `docker compose down -v` on any project except `tracker-test`.
10. **No Node.js on the host is assumed.** Run every `npm` command inside a container, e.g. `docker run --rm -v "$PWD":/w -w /w node:22-alpine npm install`.

---

## 1. Fixed decisions (do not revisit)

| Topic | Decision |
|---|---|
| Location | `practice_tracker_app/` inside this repo. The source goes in `practice_tracker_app/src/`, so the Next.js router folder is `practice_tracker_app/src/app/`. |
| Framework | Next.js 15, App Router, TypeScript (strict), React 19. Forms use Server Actions. Pages are Server Components. The only Client Components are the ones named in section 3.7. No CSS framework: plain CSS in `src/app/globals.css`. |
| Rendering | Every page exports `export const dynamic = "force-dynamic"`, because "today" must never be cached at build time. |
| Runtime | `node:22-alpine`. `next.config.ts` sets `output: "standalone"`. The container listens on port 3000. |
| Database | **Local PostgreSQL 16** (`postgres:16-alpine`) as a compose service. Its data lives in the named volume `pgdata`. Its port is **not** published to the host. Access it with `docker compose exec db psql`. |
| DB driver | `pg` (node-postgres) with one module-level `Pool`. Raw parameterized SQL, no ORM. **Set `types.setTypeParser(1082, v => v)`** so that DATE columns come back as `"YYYY-MM-DD"` strings rather than JS `Date` objects, which would shift by time zone. |
| Dates | All dates in the code are `"YYYY-MM-DD"` strings. Do date arithmetic only through `src/lib/dates.ts` (section 3.5), which works in UTC so that daylight-saving changes can't shift a day. |
| Schema | A TypeScript string constant `SCHEMA_SQL` in `src/lib/schema.ts`, using `CREATE ... IF NOT EXISTS`. It runs once at server start from `src/instrumentation.ts` `register()`, guarded by `process.env.NEXT_RUNTIME === "nodejs"`. No migration tool. |
| Containers | `compose.yaml` with `name: practice-tracker` and services `db`, `web`, and `test` (`test` only runs under `profiles: ["test"]`). |
| Host port | `127.0.0.1:${TRACKER_PORT:-8000}:3000` (localhost only) |
| Time zone | `TZ` env var (IANA name, default `UTC`). "Today" = `new Intl.DateTimeFormat("en-CA", { timeZone: process.env.TZ ?? "UTC" }).format(new Date())`, which gives `YYYY-MM-DD`. |
| Principle map | Bind-mount `../_analysis/principle_map.json` read-only to `/app/data/principle_map.json` in both `web` and `test`. The path is given by the env var `PRINCIPLE_MAP_PATH`. Read it at runtime with `fs`, never `import` it. |
| Tests | Vitest. Run with `docker compose -p tracker-test --profile test run --rm test`. Unit tests are pure. Integration tests use a **separate database named `tracker_test`** on the same server and must never touch the `tracker` database (section 3.8). |
| Dependencies | `next@15`, `react@19`, `react-dom@19`, `pg@8`. Dev: `typescript@5`, `vitest@3`, `@types/node@22`, `@types/react@19`, `@types/react-dom@19`, `@types/pg@8`. **Pin exact versions** (no `^` or `~`): use the newest release within each major at build time, and commit `package-lock.json`. The subagent reports the versions it pinned. No other dependencies without the orchestrator's approval. |
| Delete guard | A per-row Delete button on History. A browser `confirm()` popup must be accepted before the delete runs. |

---

## 2. File layout (final state)

```
practice_tracker_app/
  BUILD_PLAN.md            (this file; do not edit)
  README.md                (user-facing; exists already; edit only via task T10)
  compose.yaml  Dockerfile  .dockerignore  .env.example
  package.json  package-lock.json  tsconfig.json  next.config.ts  vitest.config.ts
  src/
    instrumentation.ts     runs SCHEMA_SQL at start
    app/
      layout.tsx           nav + notices
      globals.css
      page.tsx             Today
      log/page.tsx
      history/page.tsx
      import/page.tsx
      actions.ts           "use server": thin wrappers around src/lib/core.ts
    components/
      LogForm.tsx          client (useActionState)
      ImportForm.tsx       client (useActionState)
      DeleteButton.tsx     client (confirm popup)
      Notices.tsx          server
    lib/
      dates.ts             pure date helpers
      schedule.ts          pure review-schedule logic
      importer.ts          pure CSV + field parsing
      principles.ts        names + map loader
      schema.ts            SCHEMA_SQL
      db.ts                pool + queries
      core.ts              logAttempt / importCsv / removeAttempt / todayView
  tests/
    dates.test.ts  schedule.test.ts  importer.test.ts  principles.test.ts
    core.test.ts           integration (needs the tracker_test database)
```

---

## 3. Specification

### 3.1 Outcomes

| Outcome | Counts as |
|---|---|
| `clean` | pass |
| `slow` | pass |
| `bug` | fail |
| `wrong-principle` | fail |
| `read-solution` | fail |

Define these once in `schedule.ts`: `OUTCOMES` (a readonly tuple of all five, in the order above), `type Outcome`, and `FAILS: ReadonlySet<Outcome> = new Set(["bug", "wrong-principle", "read-solution"])`. Everything else imports them from there.

### 3.2 Data model (`src/lib/schema.ts`)

```sql
CREATE TABLE IF NOT EXISTS attempts (
  id                BIGSERIAL PRIMARY KEY,
  attempted_on      DATE        NOT NULL,
  problem           INTEGER     NOT NULL CHECK (problem > 0),
  title             TEXT        NOT NULL DEFAULT '',
  chosen_principle  SMALLINT    CHECK (chosen_principle BETWEEN 1 AND 18),
  correct_principle SMALLINT    CHECK (correct_principle BETWEEN 1 AND 18),
  outcome           TEXT        NOT NULL CHECK (outcome IN
                      ('clean','slow','bug','wrong-principle','read-solution')),
  note              TEXT        NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS attempts_problem_idx ON attempts (problem, attempted_on, id);
```

`id` is BIGSERIAL, so `pg` returns it as a string. Convert it with `Number(...)` in `db.ts`; ids never come close to 2^53. The table is append-only. The only way a row is removed is the History page's Delete button, which exists to fix logging mistakes. The review queue is **never stored**. It is recomputed from `attempts` on every request.

### 3.3 Review schedule (`src/lib/schedule.ts`), the core

**Rule in words.** A failed attempt on day F schedules reviews on F+1, F+3 and F+7. A passing attempt made on or after a review's due date completes that review. If one late pass covers several overdue reviews, it completes all of them. The next review stays fixed to F; it does not move with the late attempt. A pass made *before* the next review is due does nothing. Any failed attempt, at any time, starts a new cycle from its own date. Passing the F+7 review **retires** the problem, and a pass on a retired problem does nothing. A pass on a problem with no failures does nothing. Every attempt is handled the same way; the app has no separate notion of a "review attempt".

**Interface.**

```ts
export const OFFSETS = [1, 3, 7] as const;
export const STEP_LABELS = ["Day 1", "Day 3", "Day 7"] as const;

export interface Attempt { id: number; attemptedOn: string; problem: number; outcome: Outcome; }

export interface ProblemState {
  problem: number;
  status: "none" | "in_cycle" | "retired";
  anchorDate: string | null;        // F: date of the failure that started the current cycle
  anchorAttemptId: number | null;   // id of that failing attempt
  nextStep: 0 | 1 | 2 | null;       // index into OFFSETS while in_cycle, else null
  nextDue: string | null;           // addDays(anchorDate, OFFSETS[nextStep]) while in_cycle, else null
}

export interface DueReview {
  problem: number;
  stepLabel: string;                // STEP_LABELS[nextStep]
  dueOn: string;
  daysOverdue: number;              // daysBetween(dueOn, today), >= 0
  anchorAttemptId: number;
}

export function problemStates(attempts: Iterable<Attempt>): Map<number, ProblemState>;
export function dueReviews(attempts: Iterable<Attempt>, today: string): DueReview[];
```

**Algorithm.** Group attempts by problem and sort each group by `(attemptedOn, id)`; the input may arrive in any order. Start each problem at `status = "none"`. Then, for each attempt in order:

- **Fail:** `status = "in_cycle"`, `anchor = this attempt`, `nextStep = 0`.
- **Pass, while `in_cycle`:** let `k` = the number of offsets `o` in `OFFSETS` with `addDays(anchorDate, o) <= attemptedOn`.
  - If `k <= nextStep`: nothing happens (the pass was early).
  - Otherwise, if `k === 3`: `status = "retired"` and the anchor/step fields go to `null`.
  - Otherwise: `nextStep = k`.
- **Pass, while `none` or `retired`:** nothing happens.

`dueReviews` returns one entry for every `in_cycle` problem with `nextDue <= today`. It sorts them by `dueOn` ascending, then `problem` ascending. Plain string comparison is correct for `YYYY-MM-DD`.

**Required test cases** (`tests/schedule.test.ts`; F = 2026-10-01 unless stated; P = pass outcome `clean` unless stated, X = fail outcome `bug` unless stated):

| # | Attempts for one problem (date, outcome) | Expected |
|---|---|---|
| 1 | X 10-01 | in_cycle, nextDue 10-02, "Day 1". Not due on 10-01. Due on 10-02 (0 overdue). Due on 10-05 (3 overdue). |
| 2 | P 10-01 only | status none; never due |
| 3 | `slow` 10-01 only | status none |
| 4 | X 10-01, P 10-02, P 10-04, P 10-08 | after 10-02: due 10-04 "Day 3". After 10-04: due 10-08 "Day 7". After 10-08: retired, not due on any date. |
| 5 | X 10-01, P 10-02, X 10-04 | in_cycle, anchor 10-04, nextDue 10-05 "Day 1" |
| 6 | X 10-01, P 10-02, P 10-04, X 10-08 | anchor 10-08, nextDue 10-09 |
| 7 | X 10-01, P 10-05 | nextDue 10-08 "Day 7" (late pass completes Day 1 and Day 3) |
| 8 | X 10-01, P 10-09 | retired |
| 9 | X 10-01 (id 1), P 10-01 (id 2) | early pass ignored; nextDue 10-02 |
| 10 | X 10-01, P 10-02, P 10-03 | 10-03 pass is early; nextDue 10-04 |
| 11 | case 4, then X 10-20 | in_cycle, nextDue 10-21 |
| 12 | case 4, then P 10-20 | still retired |
| 13 | X 10-01, X 10-02 | anchor 10-02, nextDue 10-03 |
| 14 | X 10-01, `slow` 10-02 | slow counts as a pass; nextDue 10-04 |
| 15 | X 10-01, P 10-02; today 10-06 | due, "Day 3", dueOn 10-04, daysOverdue 2 |
| 16 | each of `bug`, `wrong-principle`, `read-solution` alone on 10-01 | each starts a cycle |
| 17 | case 4's attempts passed in shuffled order | same result as case 4 |
| 18 | Two problems: #20 X 10-03, #10 X 10-03, #5 X 10-01; today 10-10 | `dueReviews` order: #5, #10, #20 |
| 19 | X 10-01 (id 1), X 10-01 (id 2) | anchorAttemptId 2 |
| 20 | X 2026-10-24, today 2026-10-25 (the UK clocks change that night) | due, daysOverdue 0 |
| 21 | X 2026-12-31 | nextDue 2027-01-01 |

### 3.4 CSV import and field parsing (`src/lib/importer.ts`)

The user's Google Sheet exports with this header, and the importer must accept exactly these column names:

```
Date,Problem,Chosen Principle,Correct Principle,Outcome,Invariant / Reason
```

Use this as a test fixture, verbatim:

```
Date,Problem,Chosen Principle,Correct Principle,Outcome,Invariant / Reason
2026-09-21,33. Search in Rotated Sorted Array,P2,P2,clean,One half is always sorted; boundary check preserved
2026-09-22,76. Minimum Window Substring,P3,P3,bug,Missed edge case when required char count dropped below 0
2026-09-23,300. Longest Increasing Subsequence,P1,P2,wrong-principle,Attempted O(N^2) DP instead of O(N log N) binary search patience sort
```

**Interface.** The field parsers are exported because the Log form reuses them. Each returns `{ ok: true, value } | { ok: false, error: string }`.

```ts
export interface ParsedRow {
  attemptedOn: string; problem: number; title: string;
  chosenPrinciple: number | null; correctPrinciple: number | null;
  outcome: Outcome; note: string;
}
export function parseDate(s: string, today: string): Result<string>;
export function parseProblem(s: string): Result<{ problem: number; title: string }>;
export function parsePrinciple(s: string): Result<number | null>;
export function parseOutcome(s: string): Result<Outcome>;
export function parseLogCsv(text: string, today: string): { rows: ParsedRow[]; errors: string[] };
// If errors is non-empty, the caller imports nothing.
```

**Rules.**
- Strip a leading BOM (`﻿`). Detect the delimiter by checking whether the header line contains a tab; accept comma or tab. Write a small RFC-4180 parser (quoted fields, `""` escapes, commas and newlines inside quotes, `\r\n` or `\n`) rather than adding a dependency.
- Header names match case-insensitively after trimming. Extra columns are ignored. A missing required column produces exactly one error: `Missing column: <name>`. After that error, stop.
- Skip rows whose cells are all blank.
- **Date:** must match `YYYY-MM-DD`, be a real calendar date, and not be after `today`. Otherwise: `date must be YYYY-MM-DD and not in the future`.
- **Problem:** the cell starts with an integer > 0, optionally prefixed by `#`. If `. ` follows the number, the text after it is the title. So `33. Search in Rotated Sorted Array` → (33, "Search in Rotated Sorted Array"), `#167` → (167, ""), and `167` → (167, ""). Anything else is an error.
- **Principles:** `P5`, `p5` and `5` → 5. Blank → null. Anything outside 1–18, or unparseable, is an error.
- **Outcome:** lowercase it, trim it, and replace spaces and underscores with `-`. The result must be in `OUTCOMES`, otherwise it's an error.
- **Note:** the `Invariant / Reason` cell, trimmed. It may be blank.
- CSV errors are written `Row N: <message>`, where N is the spreadsheet row number: the header is row 1, so the first data row is row 2. Collect every error from every row; don't stop at the first.

**Required test cases** (`tests/importer.test.ts`; `today = "2026-10-26"`): the fixture above parses into the three expected rows; a tab-separated version of it gives the same result; `#167` and `167`; principle forms `P5`/`p5`/`5`/blank; principles `P19` and `x` give errors; outcomes `Clean`, `wrong principle` and `READ_SOLUTION` are normalized; outcome `meh` gives an error; a future date gives an error; `21/09/2026` and `2026-02-30` give errors; a missing `Outcome` column gives exactly one error; a quoted note containing a comma and an escaped quote `""`; a leading BOM; `\r\n` line endings; a blank row is skipped; two bad rows produce two errors with the correct row numbers (one on row 2, one on row 4).

### 3.5 Dates and principles

**`src/lib/dates.ts`** (pure):

```ts
export function addDays(iso: string, n: number): string;     // via Date.UTC, returns YYYY-MM-DD
export function daysBetween(from: string, to: string): number; // to − from, in whole days
export function todayIn(tz: string): string;                  // Intl en-CA formatter, see section 1
export function formatLong(iso: string): string;              // "Monday 26 October 2026"
```

`tests/dates.test.ts`: month and year rollover; across the 2026-10-25 UK clock change; `daysBetween` negative and zero; `formatLong("2026-10-26")`; `todayIn("UTC")` matches `/^\d{4}-\d{2}-\d{2}$/`.

**`src/lib/principles.ts`**:

```ts
export const PRINCIPLE_NAMES: Record<number, string> = {
  1: "Hash it", 2: "Running aggregates", 3: "Dynamic programming", 4: "Binary search",
  5: "Two pointers", 6: "Stack", 7: "Greedy", 8: "Sliding window", 9: "Sort first",
  10: "Heap", 11: "Tree recursion", 12: "Backtracking", 13: "Graph search",
  14: "Dependencies and groups", 15: "Weighted paths", 16: "Linked-list surgery",
  17: "Bits, digits, and no extra memory", 18: "Reformulate",
};
export interface MapEntry { primary: number; secondary: number[]; note: string; }
export function loadPrincipleMap(path: string): Map<number, MapEntry>;
export function principleMap(): Map<number, MapEntry>;  // cached; reads PRINCIPLE_MAP_PATH; throws a clear error if missing
```

The JSON file is keyed by problem number as a string, with the shape `{"435": {"primary": 7, "secondary": [9], "note": "sort, keep earliest end"}, ...}`. It holds 150 entries.

`tests/principles.test.ts`: load the file at `process.env.PRINCIPLE_MAP_PATH` (mounted in the `test` service). Assert that `435` → primary 7, secondary [9]; that it has 150 entries; and that `PRINCIPLE_NAMES` has 18 entries.

### 3.6 Database and core logic

**`src/lib/db.ts`**. `DATABASE_URL` comes from the environment. It exports `pool` plus:

- `insertAttempt(row: ParsedRow): Promise<number>`
- `listAttempts(): Promise<AttemptRow[]>`: all rows ordered by `attempted_on DESC, id DESC`. `AttemptRow` is `ParsedRow` plus `id: number`.
- `getAttemptsByIds(ids: number[]): Promise<Map<number, AttemptRow>>`
- `deleteAttempt(id: number): Promise<AttemptRow | null>`: uses `DELETE ... RETURNING`.
- `importRows(rows: ParsedRow[]): Promise<{ inserted: number; skipped: number }>`: one transaction. Insert the rows in order. **Skip** any row that exactly matches an existing row on (attempted_on, problem, title, chosen_principle, correct_principle, outcome, note), comparing with `IS NOT DISTINCT FROM`. This makes re-importing the same file safe.
- `latestTitles(): Promise<Map<number, string>>`: for each problem, the most recent non-empty title.

**`src/lib/core.ts`**. All the app's behavior lives here, so that it can be tested without a browser. Server Actions only call these functions and redirect.

```ts
export type LogInput = { attemptedOn: string; problem: string; title: string; chosenPrinciple: string;
                         correctPrinciple: string; outcome: string; note: string };  // raw form strings
export async function logAttempt(input: LogInput, today: string):
  Promise<{ ok: true; notices: string[] } | { ok: false; errors: Record<keyof LogInput, string | undefined> }>;
export async function importCsv(text: string, today: string):
  Promise<{ ok: true; notices: string[] } | { ok: false; errors: string[] }>;
export async function removeAttempt(id: number): Promise<string[]>;   // notices
export async function todayView(today: string): Promise<{
  due: Array<DueReview & { title: string; anchor: AttemptRow }>;
  counts: { due: number; inCycle: number; retired: number };
}>;
```

- **Correct-principle auto-fill**, in `logAttempt` and `importCsv`: if `correctPrinciple` is null and the problem is in the map, store `map.get(problem).primary`. A value the user gives explicitly is never overwritten.
- **`logAttempt`** validates with the section 3.4 field parsers; the problem and outcome are required. Success notices: `Logged #<n> (<outcome>).` Then, if the problem is in the map, a chosen principle was given, and it differs from the map's primary, add `Principle map says P<primary> for #<n>: <note>.` If the chosen principle is one of the map's secondaries, append ` (P<chosen> is listed as a secondary principle.)` to that second notice.
- **`importCsv`** with parse errors returns them and inserts nothing. On success: `Imported <i> attempts. Skipped <s> already in the database.`
- **`removeAttempt`** returns the notice `Deleted attempt from <date> for #<n>.`

### 3.7 Pages and components

**Layout.** There's a nav bar on every page: **Today · Log · History · Import**. Notices are passed through the URL. After a successful action, the Server Action calls `redirect(path + "?" + params)` with one `n=<notice>` param per notice, and `<Notices>` in the layout (or on each page, whichever the App Router allows cleanly) renders them as a list under the nav.

| Route | Behavior |
|---|---|
| `/` (Today) | Heading: `Today, <formatLong(today)>`. A summary line: `<n> due · <m> in a review cycle · <r> retired`. A table from `todayView` with columns: Problem (`#435 Title`), Review (step label), Due (date, plus `(<k> days overdue)` when k > 0), and Last failure (the anchor attempt's outcome, `chose P9 → correct P7` when the two differ, and its note). Each row ends with a **Log attempt** link to `/log?problem=<n>`. If nothing is due, show exactly `Nothing to review today.` |
| `/log` | `<LogForm>` (client, `useActionState` with a Server Action). Fields: Date (`type=date`, defaults to today); Problem number (required, prefilled from `?problem=`); Title (optional, prefilled with the latest known title for that problem); Chosen principle (a `<select>` with a blank `—` option, then `P1 · Hash it` … `P18 · Reformulate`); Correct principle (the same select, but the blank option reads `— (auto from map)`); Outcome (a select of the five outcomes, with a blank placeholder that isn't a valid choice); and Invariant / reason (a textarea). The button is labelled **Save**. On a validation error, the form keeps the entered values and shows each error next to its field. On success, redirect to `/` with the notices. |
| `/history` | All attempts, newest first. Columns: Date, Problem, Chosen, Correct, Outcome, Note, and a **Delete** button on **every row**. |
| `/import` | `<ImportForm>` (client, `useActionState`): a file input (`.csv,.tsv`), a button labelled **Import**, and one paragraph showing the expected header. On parse errors, show every error in a list, followed by `Nothing was imported.` On success, redirect to `/` with the notice. |

**`<DeleteButton id date problem>`** (client). Render a `<form action={deleteAction}>` with a hidden `id` and a submit button labelled **Delete**. Its `onSubmit` handler calls `window.confirm("Delete the attempt from <date> for #<problem>? This cannot be undone.")`. If the user presses Cancel, it calls `event.preventDefault()`. On confirm, the Server Action calls `removeAttempt` and redirects to `/history` with the notice.

### 3.8 Container and test files

- **`Dockerfile`** (multi-stage, all `FROM node:22-alpine`):
  - `deps`: copy `package.json` and `package-lock.json`, then `npm ci`.
  - `test`: `FROM deps`, `COPY . .`, `CMD ["npm", "test"]`.
  - `builder`: `FROM deps`, `COPY . .`, `RUN npm run build`.
  - `runner`: `ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0`. Copy `.next/standalone` to `./`, and `.next/static` to `./.next/static`. `USER node`. `CMD ["node", "server.js"]`.
- **`.dockerignore`**: `node_modules`, `.next`, `.env`, `BUILD_PLAN.md`, `README.md`.
- **`compose.yaml`**:
  - `name: practice-tracker`.
  - `db`: `postgres:16-alpine`. Env `POSTGRES_USER=tracker`, `POSTGRES_PASSWORD=tracker`, `POSTGRES_DB=tracker`. Volume `pgdata:/var/lib/postgresql/data`. Healthcheck `pg_isready -U tracker -d tracker` (interval 2s, retries 15). `restart: unless-stopped`. No `ports`.
  - `web`: `build: { context: ., target: runner }`. Ports `127.0.0.1:${TRACKER_PORT:-8000}:3000`. Env `DATABASE_URL=postgresql://tracker:tracker@db:5432/tracker`, `TZ=${TZ:-UTC}` and `PRINCIPLE_MAP_PATH=/app/data/principle_map.json`. Volume `../_analysis/principle_map.json:/app/data/principle_map.json:ro`. `depends_on: db: condition: service_healthy`. `restart: unless-stopped`.
  - `test`: `profiles: ["test"]`. `build: { context: ., target: test }`. Env `DATABASE_URL=postgresql://tracker:tracker@db:5432/tracker_test`, `TZ=UTC` and `PRINCIPLE_MAP_PATH`. The same map volume. Depends on `db` being healthy.
  - Top-level `volumes: pgdata:`.
- **`package.json` scripts**: `dev`, `build` (`next build`), `start`, and `test` (`vitest run`).
- **`vitest.config.ts`**: `environment: "node"`, `include: ["tests/**/*.test.ts"]`, `fileParallelism: false` (the integration tests share one database), and the `@/` → `src/` alias to match `tsconfig.json`.
- **`tests/core.test.ts`** (integration). In `beforeAll`: connect to the `tracker` database's server using the admin DB `postgres`, run `CREATE DATABASE tracker_test` if it doesn't exist, then run `SCHEMA_SQL` against `tracker_test`. In `beforeEach`: `TRUNCATE attempts RESTART IDENTITY` **on `tracker_test` only**. Assert that the URL's database name is `tracker_test` before truncating, and throw if it isn't. Cases:
  1. `logAttempt` for #435, chosen 9, blank correct, `wrong-principle` → correct is stored as 7. The notices equal `["Logged #435 (wrong-principle).", "Principle map says P7 for #435: sort, keep earliest end. (P9 is listed as a secondary principle.)"]`.
  2. `logAttempt` with outcome `meh` and problem `abc` → errors on `outcome` and `problem`, and no row is inserted.
  3. `logAttempt` with an explicit correct principle 3 for #435 → 3 is stored.
  4. `importCsv(fixture)` twice → the second time the notice is `Imported 0 attempts. Skipped 3 already in the database.`
  5. `importCsv` where one row has a bad date → `ok: false`, and the row count is unchanged.
  6. `todayView("2026-10-26")` after importing the fixture → #76 and #300 are due, #33 is not, and #76's `daysOverdue` is 33.
  7. `removeAttempt` → the row is gone and the notice text is correct.
- **`.env.example`**:
  ```
  # Your time zone, so "today" matches your clock. List: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  TZ=Europe/London
  # Change if port 8000 is already used on your machine.
  TRACKER_PORT=8000
  ```

---

## 4. Tasks

**Stage 1. Run T1–T4 in parallel.**

| ID | Model | Files | Brief / acceptance |
|---|---|---|---|
| T1 | sonnet | `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `Dockerfile`, `.dockerignore`, `compose.yaml`, `.env.example`, `src/instrumentation.ts`, `src/lib/schema.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx` (placeholder "Today" heading only) | Sections 1, 2, 3.2 and 3.8. Create `package-lock.json` inside a container (rule 10). `instrumentation.ts` imports `pool` from `@/lib/db` lazily. Until T7 exists, have it import `pg` directly and run `SCHEMA_SQL`; T7 will switch it to `@/lib/db`. **Accept:** `docker compose -p tracker-test config` exits 0. `docker compose -p tracker-test build web test` succeeds. `docker compose -p tracker-test up -d`, then `curl -s localhost:8001/` returns 200, and `docker compose -p tracker-test exec db psql -U tracker tracker -c '\d attempts'` shows the table. |
| T2 | haiku | `tests/schedule.test.ts` | Write all 21 cases from section 3.3 against the interface there. Don't implement `schedule.ts`. **Accept:** you check by reading it; every case is present. The tests are expected to fail for now. |
| T3 | haiku | `tests/importer.test.ts` | Write the cases from section 3.4. Don't implement. **Accept:** you check by reading it; every listed case is present. |
| T4 | haiku | `src/lib/dates.ts`, `src/lib/principles.ts`, `tests/dates.test.ts`, `tests/principles.test.ts` | Section 3.5. **Accept:** after T1, `docker compose -p tracker-test --profile test run --rm test npx vitest run tests/dates.test.ts tests/principles.test.ts` passes. |

**Stage 2. Run T5–T7 in parallel, after stage 1 is reviewed.**

| ID | Model | Files | Brief / acceptance |
|---|---|---|---|
| T5 | sonnet | `src/lib/schedule.ts` | Implement section 3.3 so that T2's tests pass. **Don't edit the tests.** If a test seems to contradict the spec, report it instead of changing it, and you resolve it against section 3.3. **Accept:** `... run --rm test npx vitest run tests/schedule.test.ts` passes. |
| T6 | sonnet | `src/lib/importer.ts` | Implement section 3.4 so that T3's tests pass, under the same don't-edit-tests rule. **Accept:** `... npx vitest run tests/importer.test.ts` passes. |
| T7 | sonnet | `src/lib/db.ts`, `src/instrumentation.ts` | Section 3.6 `db.ts`, including the DATE type parser. Switch `instrumentation.ts` to use `pool` from `db.ts`. **Accept:** `npx tsc --noEmit` passes inside the `test` container, and the stack from T1 still starts with the table created. |

**Stage 3. After stage 2 is reviewed.**

| ID | Model | Files | Brief / acceptance |
|---|---|---|---|
| T8 | sonnet | `src/lib/core.ts`, `tests/core.test.ts` | Section 3.6 `core.ts` and the section 3.8 integration test, with all 7 cases. **Accept:** the full suite, `docker compose -p tracker-test --profile test run --rm test`, passes. You confirm the `tracker_test` safety assertion is present. |

**Stage 4. After T8 is reviewed.**

| ID | Model | Files | Brief / acceptance |
|---|---|---|---|
| T9 | sonnet | `src/app/**`, `src/components/**` | Section 3.7. Give it the full text of `practice_tracker_app/README.md` as well, because its walkthroughs are the behavior to match. Server Actions in `actions.ts` must only parse `FormData`, call `core.ts` and redirect; they contain no other logic. **Accept:** section 5 passes. |

**Stage 5. Verification (orchestrator; no subagent).** Run section 5. Send any failure back to the subagent that owns the file.

**Stage 6. README check.**

| ID | Model | Files | Brief / acceptance |
|---|---|---|---|
| T10 | haiku | `README.md` | Only if section 5 found places where the README and the app differ, and the app is right per this plan. Give the exact list of differences. **Accept:** you re-read the changed passages. |

---

## 5. Acceptance (orchestrator runs this exactly)

Run from `practice_tracker_app/`, with `export TRACKER_PORT=8001` and `-p tracker-test` on every compose command.

1. `docker compose -p tracker-test build` succeeds.
2. `docker compose -p tracker-test --profile test run --rm test` passes with 0 failures.
3. `docker compose -p tracker-test up -d`, then within 30 s `curl -s localhost:8001/` returns 200 and contains `Nothing to review today.`
4. `curl -s localhost:8001/log`, `/history` and `/import` each return 200. `/log?problem=435` contains `value="435"`.
5. **Persistence.** Insert a row with `docker compose -p tracker-test exec db psql -U tracker tracker -c "INSERT INTO attempts (attempted_on, problem, outcome) VALUES (CURRENT_DATE - 1, 435, 'bug')"`. `GET /` now contains `#435` and `Day 1`. Then run `docker compose -p tracker-test down` (no `-v`) and `up -d`. `GET /` still contains `#435`.
6. **Time zone.** `docker compose -p tracker-test exec web node -e "console.log(process.env.TZ)"` prints the value from the shell or `.env`.
7. **Clicking through in a browser.** If you have a browser automation tool, follow the README's *First-use walkthrough* steps 1–3 and *Bring in your existing log* at <http://localhost:8001>. **Do not click Delete in an automated browser:** the confirm popup blocks browser automation. If you have no browser tool, skip this step and list it for the user.
8. **The user checks the Delete confirm.** Ask the user to open <http://localhost:8001/history>, press Delete on a row, press **Cancel** (the row must stay), then press Delete again and **OK** (the row must go, with the notice shown). Wait for their answer.
9. **README walkthrough.** Check every shell command in `practice_tracker_app/README.md` against the real files and service names. Run the ones that are safe in the `tracker-test` project; never run `down -v` on the default project. Note any differences for T10.
10. **Clean up:** `docker compose -p tracker-test down -v`, after the user has finished step 8.

---

## 6. Final report to the user

Report in under 25 lines: what was built; the section 5 results (pass/fail per step); every decision a subagent made that this plan didn't specify; the exact dependency versions pinned; and which tasks needed escalation from haiku to sonnet.
