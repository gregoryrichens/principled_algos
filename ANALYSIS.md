# Is "learn the principles, not the problems" the right way to study algorithms?

> **New here?** Terms like *principle*, *trigger*, *invariant*, *template* and *card* are defined, with an example, in `README.md` under "The words used everywhere in this folder".

*Assessment written after mapping all 150 NeetCode problems (both solution repos, plus NeetCode's hints and articles) to the smallest set of ideas that generates them. The mapping itself is in `PRINCIPLES.md`; the raw per-problem notes are in `_analysis/`.*

## Short answer

**Right in kind.** The 150 problems compress to 18 principles organized under 6 questions, with 14 facts that have to be memorized outright. That is an 8:1 compression, and the compression is real, not cosmetic: every optimal solution in the set is a brute force plus exactly one of six moves (remember, eliminate, sweep, decompose, model as a graph, manipulate in place), with a seventh meta-move (reformulate) that unlocks the hard ones. Someone who owns those 18 ideas can regenerate the solution to any of the 150, and to most of what companies actually ask.

**With One Refinement** The unit of learning is not "the principle". A principle sitting in your head is inert. The unit that transfers is a **triple**: *trigger → principle → invariant*. "Use a set for O(1) lookup" does nothing for you until it is bound to "when the inner loop exists only to answer *have I seen X*" on one side and to "the set equals exactly the elements seen so far" on the other. The trigger is what fires in the interview; the invariant is what makes the code come out correct. `PRINCIPLES.md` is written as triples for this reason.

**The real bottleneck is recognition, not knowledge.** Everyone who fails a Two Sum II interview knows what two pointers are. They failed to notice that "sorted" was the trigger, or noticed it 20 minutes in. Knowing 18 principles and *selecting the right one in three minutes under stress* are different skills, and the second one is not trained by studying principles one at a time. It is trained by **discrimination**: seeing problems that look alike and need different tools, and problems that look different and need the same tool, until the surface features stop fooling you.

Think of a standardized test like the GRE. The quant section comprises simple math problems you could complete with no mistakes given enough time. However, given time constraints, you must instead recognize common patterns and implement shortcuts to complete problems quickly. How do you train to perform that way? You do not need to do every GRE math problem ever created. But you do need to have seen enough of them that "consecutive integers" or a phrase like "at least one" trips the right wire without thought (and you do need your times tables cold). Algorithm prep has the same two irreducible needs: enough exposure to train recognition, and enough repetition of about 30 code idioms (binary search bounds, backtracking undo, BFS layering, DSU find) that they are automatic. The good news is that both are far smaller than 150 problems. The exposure is maybe 60 problems chosen for contrast; the idioms are the 36 templates in `DRILLS.md`, each written until clean.

## What the data says

Primary-principle distribution across the 150:

| Principle | Problems | Principle | Problems |
|---|---|---|---|
| P3 Dynamic programming | 21 | P4 Binary search | 7 |
| P11 Tree recursion | 15 | P5 Two pointers | 7 |
| P12 Backtracking | 11 | P6 Stack | 7 |
| P16 Pointer surgery | 11 | P10 Heap | 7 |
| P17 Bits, digits, O(1) space | 11 | P14 Dependencies & connectivity | 6 |
| P1 Hash | 10 | P9 Sort then scan | 5 |
| P7 Greedy | 10 | P2 Running aggregates | 4 |
| P13 BFS/DFS | 9 | P8 Sliding window | 4 |
| | | P15 Weighted paths | 4 |
| | | P18 Reformulate | 1 |

(Counts after the post-review reclassification; the full per-problem mapping is the index at the end of `PRINCIPLES.md`.)

Three observations that should change how you study:

1. **Five principles cover nearly half the list** (DP, tree recursion, backtracking, pointer surgery, bit/digit mechanics). They are also the ones where the *shape* of the solution is most stereotyped. Owning the DP recurrence skeleton (state, predecessors, combinator) and the tree recursion skeleton (what flows up, what flows down) pays off far out of proportion to their share of the reading.
2. **About half the problems use two principles.** Trapping Rain Water is running aggregates plus two pointers. Minimum Window Substring is sliding window plus hash. Word Search II is backtracking plus trie plus grid DFS. This is a feature: the composition is where the difficulty lives, and it is why studying by NeetCode category (which files each problem under one label) under-trains you.
3. **Roughly 10% is irreducible memorization.** Hierholzer's algorithm, the partition arithmetic in Median of Two Sorted Arrays, `n & (n-1)`, the `*` transition in regex matching, "pivot on the balloon burst last". No principle will produce these under time pressure. Accept it and learn them as facts; the list is in `PRINCIPLES.md`.

## Where the principle-first approach genuinely beats problem-first

- **Transfer to unseen problems.** A problem-memorizer who meets "minimum effort path" freezes; a principle-holder recognizes Dijkstra with a `max` combiner (Swim in Rising Water, seen once). This is the whole case for your approach and it is decisive for real interviews, which are rarely verbatim.
- **Debugging under pressure.** If you know the invariant, you know what to print and what to check when the test fails. Memorized code has no invariant; when it breaks you are lost.
- **Communicating with the interviewer.** "This is monotone in k, so I can binary search the answer" is exactly the sentence that earns hire signals. You can't construct that sentence if you don't undderstand principles.
- **Retention.** Eighteen ideas with connections between them are held in memory much longer than 150 unconnected solutions. You will still know how to do this in five years.

## Where it falls short, and what to do about it

- **Recognition is not taught by exposition.** Fix: contrast pairs (below).
- **Fluency is not taught by understanding.** Fix: idiom drills. Write the 36 templates in `DRILLS.md` from memory until each takes under two minutes without a bug. This is the "times tables" part and there is no way around it.
- **Principles are learned in isolation but tested in composition.** Fix: after the basics, study by *hard problem* and name every principle inside it.
- **Category-blocked study inflates confidence.** When you do ten sliding-window problems in a row, you are not choosing the tool; the chapter heading chose it for you. Fix: interleave from the start of phase 2.

## The better protocol

This is the more efficient version of your idea. It uses the same 18 principles but changes what you do with them.

**Phase 1: install the vocabulary (about a week, ~36 problems).**
Read `PRINCIPLES.md` one principle at a time. For each: read the trigger and the idea, close the file, and write the two worked examples from the invariant alone. Compare. Then write the template from memory. Do not proceed to the next principle until the template comes out clean. Learn the six questions at the top of the document until you can recite them.

**Phase 2: train discrimination (two to three weeks, ~60 problems).**
Study in *pairs and families*, not categories.

*Contrast pairs* (look alike, differ in principle): Two Sum vs Two Sum II · Coin Change vs Coin Change II (loop order) · Course Schedule vs Redundant Connection (directed topo vs undirected DSU) · Kth Largest via heap vs quickselect · Subsets vs Target Sum (enumerate vs count, so backtrack vs memo) · Number of Islands vs Word Search (flood fill vs backtracking with undo) · Jump Game vs Jump Game II (feasibility frontier vs layered frontier) · Maximum Subarray vs Maximum Product Subarray · Network Delay vs Cheapest Flights (Dijkstra vs hop-limited Bellman-Ford) · Merge Intervals vs Non-overlapping Intervals (sort by start vs by end) · Longest Substring Without Repeating vs Minimum Window (maximize vs minimize window).

*Families* (look different, same principle): Trapping Rain Water / Container With Most Water / Two Sum II · Rotting Oranges / Walls and Gates / Word Ladder / Jump Game II (all BFS layers) · LCS / Edit Distance / Distinct Subsequences / Interleaving String / Regex (one grid, five combinators) · Diameter / Balanced / Max Path Sum (return one thing, update another) · Daily Temperatures / Histogram / Sliding Window Max / Car Fleet (monotonic stack) · Find the Duplicate / Happy Number / Linked List Cycle (implicit list).

For every problem in this phase: write the brute force first, in words. Then ask the six questions. Then write the invariant in one sentence. Only then code. The leap from brute force to optimal is where the learning is; skipping to the optimal solution skips the learning.

**Phase 3: interleaved retrieval (ongoing, 20–30 minutes a day).**
Pull problems at random from the whole 150 (and then from outside it). Timed. Before coding, run the six questions aloud and state the invariant. Keep a one-line log: `#id — P-number — invariant`. Once a week, read the log and re-drill whichever principle has the most wrong or slow entries. Review the log, not the solutions.

**Throughout:** memorize the fact table as vocabulary, and drill the idiom templates until they are reflexes.

## Caveats on the mapping

- Assigning each problem one primary principle involved judgment. Several sit on a boundary (Kadane is greedy, DP, and a running aggregate at once). The index in `PRINCIPLES.md` records a primary and secondaries; disagreeing with a specific assignment is a good sign you have understood both principles.
- The 150 is a curated set. Real interviews add a slice of design problems (LRU, Twitter, time-based store, trie) where the skill is knowing what each data structure costs, and a slice of "implement this carefully" problems (spiral matrix, string arithmetic) where the skill is fluency. Both are covered here under P1, P16, and P17, but they reward drilling more than insight.
- Evidence from learning research supports the protocol's shape: interleaved practice beats blocked practice for discrimination, retrieval beats re-reading for retention, and generating the solution before seeing it beats studying worked examples alone. None of it says understanding removes the need for practice; it says practice should be structured around understanding.
