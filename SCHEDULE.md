# Schedule: the three-phase protocol, day by day

> **New here?** Terms like *principle*, *trigger*, *invariant*, *template* and *card* are defined, with an example, in `README.md` under "The words used everywhere in this folder".

*Total: about five weeks at 60–90 minutes a day, then a 20–30 minute daily maintenance routine. Every session follows the same ritual; the schedule only changes what you point it at.*

Files used: `PRINCIPLES.md` (reference), `DRILLS.md` (36 idiom cards), `CONTRASTS.md` (pairs, families, compositions). Problem numbers are LeetCode ids; the coverage index at the end of `PRINCIPLES.md` maps every one to its principle. Each is shown as `id Name (difficulty)`. Six are LeetCode Premium (252, 253, 261, 269, 286, 323); without a subscription, use the free versions on neetcode.io or LintCode.

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
2026-09-26  #435  P9   wrong→P7  "sorted by start and merged; this is selection, keep earliest end"
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
| 1 | Intro + six questions; P1 Hash; P2 Running aggregates | Cards 1, 2, 3 | 1 Two Sum (E); 49 Group Anagrams (M); 128 Longest Consecutive Sequence (M); 238 Product of Array Except Self (M); 121 Best Time to Buy And Sell Stock (E) |
| 2 | P3 Dynamic programming | Cards 4, 5, 6, 7 | 322 Coin Change (M); 198 House Robber (M); 518 Coin Change II (M); 1143 Longest Common Subsequence (M); 91 Decode Ways (M) |
| 3 | P4 Binary search; P5 Two pointers | Cards 8, 9, 10 | 875 Koko Eating Bananas (M); 153 Find Minimum In Rotated Sorted Array (M); 704 Binary Search (E); 167 Two Sum II Input Array Is Sorted (M); 11 Container With Most Water (M); 15 3Sum (M) |
| 4 | P6 Stack; P7 Greedy | Cards 11, 12 | 739 Daily Temperatures (M); 84 Largest Rectangle In Histogram (H); 20 Valid Parentheses (E); 55 Jump Game (M); 435 Non Overlapping Intervals (M); 134 Gas Station (M); 53 Maximum Subarray (M) |
| 5 | P8 Sliding window; P9 Sort then scan; P10 Heap | Cards 13, 14, 15 | 3 Longest Substring Without Repeating Characters (M); 76 Minimum Window Substring (H); 56 Merge Intervals (M); 253 Meeting Rooms II (M, Premium); 215 Kth Largest Element In An Array (M); 295 Find Median From Data Stream (H) |
| 6 | P11 Tree recursion; P12 Backtracking | Cards 16, 17, 18, 19 | 543 Diameter of Binary Tree (E); 98 Validate Binary Search Tree (M); 102 Binary Tree Level Order Traversal (M); 78 Subsets (M); 39 Combination Sum (M); 51 N Queens (H) |
| 7 | P13, P14, P15 Graphs; P16, P17 Mechanics; P18 Reformulate; the memorize table | Cards 20–27 | 200 Number of Islands (M); 994 Rotting Oranges (M); 210 Course Schedule II (M); 684 Redundant Connection (M); 743 Network Delay Time (M); 206 Reverse Linked List (E); 136 Single Number (E) |

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
| 8 | A1 Two Sum vs Two Sum II; A11 longest vs shortest window | 1 Two Sum (E); 167 Two Sum II Input Array Is Sorted (M); 3 Longest Substring Without Repeating Characters (M); 76 Minimum Window Substring (H) | ✓ |
| 9 | A2 Coin Change I vs II; B8 sum-axis knapsack | 322 Coin Change (M); 518 Coin Change II (M); 416 Partition Equal Subset Sum (M); 494 Target Sum (M) | ✓ |
| 10 | A3 directed vs undirected cycles | 207 Course Schedule (M); 684 Redundant Connection (M); 261 Graph Valid Tree (M, Premium); 323 Number of Connected Components In An Undirected Graph (M, Premium) | ✓ |
| 11 | A5 Subsets vs Target Sum; A13 Permutations vs Combination Sum | 78 Subsets (M); 494 Target Sum (M); 46 Permutations (M); 39 Combination Sum (M) | ✓ |
| 12 | A6 Islands vs Word Search; B7 reverse the direction | 200 Number of Islands (M); 79 Word Search (M); 417 Pacific Atlantic Water Flow (M); 130 Surrounded Regions (M) | ✓ |
| 13 | B1 two pointers by dominance | 167 Two Sum II Input Array Is Sorted (M); 15 3Sum (M); 11 Container With Most Water (M); 42 Trapping Rain Water (H); 125 Valid Palindrome (E) | ✓ |
| 14 | **Review day:** re-do every wrong-principle and read-solution entry from days 8–13 | from LOG.md | — |
| 15 | A7 Jump Game I vs II; B11 frontier greedy | 55 Jump Game (M); 45 Jump Game II (M); 763 Partition Labels (M); 134 Gas Station (M) | ✓ |
| 16 | A9 Dijkstra vs hop-limited; add 778 and 1584 | 743 Network Delay Time (M); 787 Cheapest Flights Within K Stops (M); 778 Swim In Rising Water (H); 1584 Min Cost to Connect All Points (M) | ✓ |
| 17 | B2 BFS layers as distance | 994 Rotting Oranges (M); 286 Walls And Gates (M, Premium); 127 Word Ladder (H); 102 Binary Tree Level Order Traversal (M) | ✓ |
| 18 | B3 the two-sequence grid | 1143 Longest Common Subsequence (M); 72 Edit Distance (M); 115 Distinct Subsequences (H); 97 Interleaving String (M); 10 Regular Expression Matching (H) | ✓ |
| 19 | A12 nesting vs dominance stacks; B5 monotonic stack | 20 Valid Parentheses (E); 739 Daily Temperatures (M); 84 Largest Rectangle In Histogram (H); 239 Sliding Window Maximum (H); 853 Car Fleet (M) | ✓ |
| 20 | B4 return one thing, update another; A15 two hash-map roles | 543 Diameter of Binary Tree (E); 110 Balanced Binary Tree (E); 124 Binary Tree Maximum Path Sum (H); 1448 Count Good Nodes In Binary Tree (M); 138 Copy List With Random Pointer (M); 146 LRU Cache (M) | ✓ |
| 21 | **Review day:** re-do every wrong-principle and read-solution entry from days 15–20 | from LOG.md | — |
| 22 | A10 merge vs select intervals; B10 sort to make it local | 56 Merge Intervals (M); 435 Non Overlapping Intervals (M); 252 Meeting Rooms (E, Premium); 253 Meeting Rooms II (M, Premium); 846 Hand of Straights (M); 90 Subsets II (M) | ✓ |
| 23 | A4 Kth Largest three ways; B9 heap as current extreme | 215 Kth Largest Element In An Array (M); 703 Kth Largest Element In a Stream (E); 1046 Last Stone Weight (E); 621 Task Scheduler (M); 23 Merge K Sorted Lists (H); 355 Design Twitter (M) | ✓ |
| 24 | A8 sum vs product; A14 what is being searched; B6 implicit lists | 53 Maximum Subarray (M); 152 Maximum Product Subarray (M); 153 Find Minimum In Rotated Sorted Array (M); 875 Koko Eating Bananas (M); 141 Linked List Cycle (E); 287 Find The Duplicate Number (M); 202 Happy Number (E) | ✓ |

Not scheduled above but in the interleave pool and should surface:

- 217 Contains Duplicate (E)
- 242 Valid Anagram (E)
- 347 Top K Frequent Elements (M)
- 36 Valid Sudoku (M)
- 271 Encode and Decode Strings (M)
- 424 Longest Repeating Character Replacement (M)
- 567 Permutation In String (M)
- 155 Min Stack (M)
- 150 Evaluate Reverse Polish Notation (M)
- 22 Generate Parentheses (M)
- 74 Search a 2D Matrix (M)
- 33 Search In Rotated Sorted Array (M)
- 981 Time Based Key Value Store (M)
- 4 Median of Two Sorted Arrays (H)
- 21 Merge Two Sorted Lists (E)
- 143 Reorder List (M)
- 19 Remove Nth Node From End of List (M)
- 2 Add Two Numbers (M)
- 25 Reverse Nodes In K Group (H)
- 226 Invert Binary Tree (E)
- 104 Maximum Depth of Binary Tree (E)
- 100 Same Tree (E)
- 572 Subtree of Another Tree (E)
- 235 Lowest Common Ancestor of a Binary Search Tree (M)
- 199 Binary Tree Right Side View (M)
- 230 Kth Smallest Element In a Bst (M)
- 105 Construct Binary Tree From Preorder And Inorder Traversal (M)
- 297 Serialize And Deserialize Binary Tree (H)
- 208 Implement Trie Prefix Tree (M)
- 211 Design Add And Search Words Data Structure (M)
- 212 Word Search II (H)
- 973 K Closest Points to Origin (M)
- 40 Combination Sum II (M)
- 131 Palindrome Partitioning (M)
- 17 Letter Combinations of a Phone Number (M)
- 695 Max Area of Island (M)
- 269 Alien Dictionary (H, Premium)
- 332 Reconstruct Itinerary (H)
- 70 Climbing Stairs (E)
- 746 Min Cost Climbing Stairs (E)
- 213 House Robber II (M)
- 5 Longest Palindromic Substring (M)
- 647 Palindromic Substrings (M)
- 139 Word Break (M)
- 300 Longest Increasing Subsequence (M)
- 62 Unique Paths (M)
- 309 Best Time to Buy And Sell Stock With Cooldown (M)
- 329 Longest Increasing Path In a Matrix (H)
- 312 Burst Balloons (H)
- 1899 Merge Triplets to Form Target Triplet (M)
- 678 Valid Parenthesis String (M)
- 57 Insert Interval (M)
- 1851 Minimum Interval to Include Each Query (H)
- 48 Rotate Image (M)
- 54 Spiral Matrix (M)
- 73 Set Matrix Zeroes (M)
- 66 Plus One (E)
- 50 Pow(x, n) (M)
- 43 Multiply Strings (M)
- 2013 Detect Squares (M)
- 191 Number of 1 Bits (E)
- 338 Counting Bits (E)
- 190 Reverse Bits (E)
- 268 Missing Number (E)
- 371 Sum of Two Integers (M)
- 7 Reverse Integer (M)

If the random draw has not hit one by Day 24, take it in Phase 3.

**Exit check for Phase 2:** on the two review days combined, wrong-principle entries should be under 15%. If not, extend Phase 2 by a week repeating the pairs that produced them.

---

## Phase 3 — Interleaved retrieval (Days 25–35, then maintenance)

Goal: recognition under uncertainty at interview pace, and coverage of every problem in the 150 at least once cold.

**Days 25–31 (45–60 min):** two random problems a day from the whole 150, timed, full ritual. Then Part C compositions from `CONTRASTS.md`, one a day, naming every layer before coding, in this order: 76 Minimum Window Substring (H); 42 Trapping Rain Water (H); 239 Sliding Window Maximum (H); 212 Word Search II (H); 1851 Minimum Interval to Include Each Query (H); 853 Car Fleet (M); 127 Word Ladder (H). Drill cards: only those still in the cycle.

**Days 32–35 (45–60 min):** the remaining Part C compositions (329 Longest Increasing Path In a Matrix (H); 124 Binary Tree Maximum Path Sum (H); 297 Serialize And Deserialize Binary Tree (H); 146 LRU Cache (M); 355 Design Twitter (M); 4 Median of Two Sorted Arrays (H); 269 Alien Dictionary (H, Premium); 312 Burst Balloons (H); 778 Swim In Rising Water (H)), one a day, plus one random problem. Re-read the memorize table in `PRINCIPLES.md` and write each fact from memory.

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
