# Brief for problem-analysis agents

Goal of the overall project: distill the NeetCode 150 into a SMALL set of reusable problem-solving
principles ("the pattern behind the patterns"), so a learner masters principles instead of memorizing problems.
Your job is the raw-material stage: analyze every problem in your batch and record, per problem, the
transferable insight(s) that make the optimal solution work.

## Inputs
- Your batch manifest: `_analysis/batch_<X>.json` (list of problems, each with paths).
  - `python`: the canonical neetcode Python solution (may contain several classes / approaches; the LAST one is usually optimal).
  - `alt_python`: a second, commented Python solution from another repo (often has a short explanation at top).
  - `hint`: 3-4 progressive hints + target complexity. SHORT and high-signal. Always read this.
  - `article`: long multi-approach writeup (brute force -> optimal) in many languages. Read ONLY the
    `### Intuition` sections and the `python` code blocks; skip java/cpp/js/etc blocks. Use it when the
    hint + solution don't make the "why" obvious.

## For EACH problem, write an entry in this exact shape

### <LeetCode number> <Problem name>  [<Category>, <Difficulty>]
- **Trigger** (what in the problem statement should make you reach for this technique; 1-2 lines, phrased as
  observable features: "sorted input", "asks for k-th", "contiguous subarray + optimize", "count ways", ...)
- **Brute force -> optimal leap**: the single change of viewpoint that takes it from naive to optimal (1-2 lines).
- **Core principle(s)**: 1-3 short principle statements, phrased GENERALLY so they'd apply to other problems.
  Example of the desired style: "Trade space for time: store what you've seen in a hash structure so
  'have I seen X' becomes O(1) instead of a loop." Prefer reusing wording you already used for earlier
  problems in your batch when the principle is the same — consistency matters more than variety.
- **Invariant / state**: what quantity is maintained as the algorithm runs (e.g., "window contains no dup",
  "stack is monotonically decreasing", "dp[i] = min coins for amount i"). One line.
- **Key code idiom** (3-8 lines of Python, the heart of the optimal solution, not the whole thing).
- **Complexity**: optimal time/space.
- **Sibling problems** in the 150 (and well-known LeetCode problems outside it) that use the same principle.

## After all entries: a batch-level synthesis (this is the most valuable part)
1. **Principle tally**: list each distinct principle you used, with the problem numbers it covered. Merge
   near-duplicates aggressively.
2. **Candidate MERGES**: principles that you suspect are the same idea wearing different clothes
   (e.g., "two pointers on sorted array" and "binary search" both = "exploit monotonicity to discard half/one side").
3. **Genuinely one-off tricks** in your batch that don't generalize (be honest; these are the ones a learner
   should just memorize).
4. **Decision cues**: a short "if you see X in the problem, think Y" table for your batch.

## Rules
- Be concrete and correct; read the actual code, don't guess from the title.
- No fluff. Dense, high-signal markdown.
- Write your output to `_analysis/notes_<X>.md` (X = your batch letter). Overwrite if exists.
- When done, reply with ONLY: the principle tally (item 1 of the synthesis) and the merge candidates (item 2).
