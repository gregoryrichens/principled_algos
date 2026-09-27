# Schedule: the three-phase protocol, day by day

> **New here?** Terms like *principle*, *trigger*, *invariant*, *template* and *card* are defined, with an example, in `README.md` under "The words used everywhere in this folder".

*Total: about five weeks at 60–90 minutes a day, then a 20–30 minute daily maintenance routine. Every session follows the same ritual; the schedule only changes what you point it at.*

Files used: `PRINCIPLES.md` (reference), `DRILLS.md` (36 idiom cards), `CONTRASTS.md` (pairs, families, compositions). Problem numbers are LeetCode ids; the coverage index at the end of `PRINCIPLES.md` maps every one to its principle.

---

## The ritual (every problem, every phase)

1. **Read the statement. Write the brute force in one or two sentences.** Not code. What would the dumb solution do, and what is its complexity?
2. **Run the six questions** from the top of `PRINCIPLES.md`. Say which move applies and why, in one sentence naming the surface feature that triggered it.
3. **Write the invariant** in one sentence before any code.
4. **Code.** Time-box: Easy 15 min, Medium 25 min, Hard 40 min.
5. **Log one line** (format below). If wrong or slow, add the reason.

**When stuck:** at the time box, read only the problem's *trigger* line from the coverage index. Five more minutes. Then the *hint* file (`_sources/leetcode/hints/`). Five more. Then the solution. Whatever you read, re-do the problem cold the next day and again three days later.

## The log

One line per attempt, append-only, in `LOG.md` (create it):

```
2026-09-26  #167  P5   clean   "every pair with an index outside [l,r] is ruled out"
2026-09-26  #435  P7   wrong→P9  "sorted by start instead of end; picked merge logic for a selection problem"
2026-09-27  #739  P6   slow   "forgot to store indices; had to restart"
```

Fields: date · problem · principle you chose (and the correct one if different) · outcome (clean / slow / bug / wrong-principle / read-solution) · the invariant in quotes, or the reason it went wrong.

Weekly, count outcomes per principle. The principle with the most non-clean entries is next week's re-drill.

---

## Phase 1 — Install the vocabulary (Days 1–7)

Goal: for each principle, be able to state the trigger and invariant from memory and write the template clean. About 36 problems, all done *after* reading the principle, so this phase is about fluency, not recognition.

Daily format (75–90 min): read the principle section(s) · do the drill cards for those principles until clean · solve the listed problems using the ritual · write the templates from memory one final time.

| Day | Read (PRINCIPLES.md) | Drill (DRILLS.md) | Solve |
|---|---|---|---|
| 1 | Intro + six questions; P1 Hash; P2 Running aggregates | Cards 1, 2, 3 | 1, 49, 128, 238, 121, 53 |
| 2 | P3 Dynamic programming | Cards 4, 5, 6, 7 | 322, 198, 518, 1143, 91 |
| 3 | P4 Binary search; P5 Two pointers | Cards 8, 9, 10 | 875, 153, 704, 167, 11, 15 |
| 4 | P6 Stack; P7 Greedy | Cards 11, 12 | 739, 84, 20, 55, 435, 134 |
| 5 | P8 Sliding window; P9 Sort then scan; P10 Heap | Cards 13, 14, 15 | 3, 76, 56, 253, 215, 295 |
| 6 | P11 Tree recursion; P12 Backtracking | Cards 16, 17, 18, 19 | 543, 98, 102, 78, 39, 51 |
| 7 | P13, P14, P15 Graphs; P16, P17 Mechanics; P18 Reformulate; the memorize table | Cards 20–27 | 200, 994, 210, 684, 743, 206, 136 |

Cards 28–36 (added after review) enter the Phase 2 drill cycle on Day 8; do 28, 29, 30 on Day 8, 31–33 on Day 9, 34–36 on Day 10 in addition to the daily cycle.

Day 7 is heavy. If it spills into Day 8, let it. Do not start Phase 2 until every card has been written clean at least once.

**Exit check for Phase 1:** recite the six questions; for each of the 18 principles give the trigger and invariant in one breath; write any three cards chosen at random, clean.

---

## Phase 2 — Train discrimination (Days 8–24)

Goal: choose the right principle from the problem statement alone. Everything here is done *without* reading the principle first. About 60 problems, plus the drill cards on a spaced cycle.

Daily format (60–90 min): 10 min of drill cards (see cycle) · one contrast pair or family from `CONTRASTS.md` · one problem from the interleave pool · log.

**Drill card cycle:** each day, re-do the three cards that were slow or buggy most recently, plus two chosen at random. A card leaves the cycle after three consecutive clean writes.

**Interleave pool:** all 150 minus whatever is scheduled that day. Pick with a random number generator, not by mood. Do not look at the category.

| Day | Contrast / family (CONTRASTS.md) | Problems inside it | Plus 1 random |
|---|---|---|---|
| 8 | A1 Two Sum vs Two Sum II; A11 longest vs shortest window | 1, 167, 3, 76 | ✓ |
| 9 | A2 Coin Change I vs II; B8 sum-axis knapsack | 322, 518, 416, 494 | ✓ |
| 10 | A3 directed vs undirected cycles | 207, 684, 261, 323 | ✓ |
| 11 | A5 Subsets vs Target Sum; A13 Permutations vs Combination Sum | 78, 494, 46, 39 | ✓ |
| 12 | A6 Islands vs Word Search; B7 reverse the direction | 200, 79, 417, 130 | ✓ |
| 13 | B1 two pointers by dominance | 167, 15, 11, 42, 125 | ✓ |
| 14 | **Review day:** re-do every wrong-principle and read-solution entry from days 8–13 | from LOG.md | — |
| 15 | A7 Jump Game I vs II; B11 frontier greedy | 55, 45, 763, 134 | ✓ |
| 16 | A9 Dijkstra vs hop-limited; add 778 and 1584 | 743, 787, 778, 1584 | ✓ |
| 17 | B2 BFS layers as distance | 994, 286, 127, 102 | ✓ |
| 18 | B3 the two-sequence grid | 1143, 72, 115, 97, 10 | ✓ |
| 19 | A12 nesting vs dominance stacks; B5 monotonic stack | 20, 739, 84, 239, 853 | ✓ |
| 20 | B4 return one thing, update another; A15 two hash-map roles | 543, 110, 124, 1448, 138, 146 | ✓ |
| 21 | **Review day:** re-do every wrong-principle and read-solution entry from days 15–20 | from LOG.md | — |
| 22 | A10 merge vs select intervals; B10 sort to make it local | 56, 435, 252, 253, 846, 90 | ✓ |
| 23 | A4 Kth Largest three ways; B9 heap as current extreme | 215, 703, 1046, 621, 23, 355 | ✓ |
| 24 | A8 sum vs product; A14 what is being searched; B6 implicit lists | 53, 152, 153, 875, 141, 287, 202 | ✓ |

Not scheduled above but in the interleave pool and should surface: 217, 242, 347, 36, 271, 424, 567, 155, 150, 22, 74, 33, 981, 4, 21, 143, 19, 2, 25, 226, 104, 100, 572, 235, 199, 230, 105, 297, 208, 211, 212, 973, 40, 131, 17, 695, 210, 269, 332, 70, 746, 213, 5, 647, 139, 300, 62, 309, 329, 312, 1899, 678, 57, 1851, 48, 54, 73, 66, 50, 43, 2013, 191, 338, 190, 268, 371, 7. If the random draw has not hit one by Day 24, take it in Phase 3.

**Exit check for Phase 2:** on the two review days combined, wrong-principle entries should be under 15%. If not, extend Phase 2 by a week repeating the pairs that produced them.

---

## Phase 3 — Interleaved retrieval (Days 25–35, then maintenance)

Goal: recognition under uncertainty at interview pace, and coverage of every problem in the 150 at least once cold.

**Days 25–31 (45–60 min):** two random problems a day from the whole 150, timed, full ritual. Then Part C compositions from `CONTRASTS.md`, one a day, naming every layer before coding: 76, 42, 239, 212, 1851, 853, 127 in that order. Drill cards: only those still in the cycle.

**Days 32–35 (45–60 min):** the remaining Part C compositions (329, 124, 297, 146, 355, 4, 269, 312, 778), one a day, plus one random problem. Re-read the memorize table in `PRINCIPLES.md` and write each fact from memory.

**Day 35: full review.** Count log outcomes per principle for the whole five weeks. For the two weakest, re-read the section, re-do the cards, re-do the family set.

**Maintenance (ongoing, 20–30 min a day, or three times a week once stable):**
- One random problem from the 150, full ritual, timed.
- One problem from *outside* the 150 (LeetCode "medium" random, or the "Beyond" lists in each principle section). This tests transfer, which is the entire point. Log which principle it turned out to be.
- Every two weeks, re-do the memorize table and any drill card you have not written in 14 days.

---

## Spacing rules

- **Anything that failed** (bug, wrong principle, read the solution) is re-done cold at +1 day, +3 days, +7 days. Add it to the next day's plan explicitly.
- **Anything clean** is not revisited on purpose; the random draw will bring it back.
- **Drill cards:** clean three sessions in a row → out of the daily cycle → re-write once every two weeks.
- **Memorize table:** write it from memory on Days 7, 14, 21, 35, then every two weeks.

## What "done" looks like

You are done with the 150 when, for a random problem you have not seen in two weeks, you can within three minutes: state the brute force, name the move and the surface feature that triggered it, state the invariant, and then write it clean inside the time box. At that point stop working the 150 and spend the maintenance time entirely on problems outside it.
