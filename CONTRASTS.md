# Contrast sets: training recognition

> **New here?** Terms like *principle*, *trigger*, *invariant*, *template* and *card* are defined, with an example, in `README.md` under "The words used everywhere in this folder".

*Recognition is trained by discrimination, not exposition. This file has four kinds of sets. **Contrast pairs** (Part A, plus more in Part E) look alike on the surface but need a different principle, or a different variant of the same principle. The job is to name the one feature that decides. **Families** (Part B) look different but use the same principle. The job is to say the shared invariant. **Compositions** (Part C) are the Hards, where two or three principles are stacked. The job is to name every layer. **Traps** (Part D) are surface words that point to the wrong tool. In Parts A, B and E the answer lines are hidden behind a collapsed "Answer" toggle, so you can commit to an answer before you look.*

How to work a set:
1. Read only the problem statements (not the solutions). For a pair, write down the deciding feature *before* solving either one and before opening the answer.
2. Solve both cold. Run the six questions from `PRINCIPLES.md` before coding.
3. Open the answer and compare. If you picked the wrong principle, that is the most valuable event of the day: log which surface feature fooled you.

P-numbers refer to `PRINCIPLES.md`. Cards refer to `DRILLS.md`.

---

## Part A: Contrast pairs (same surface, different principle or variant)

Some pairs below need different principles. Others use the same principle and differ by variant: which loop order, which inner-loop condition, which pop rule. Telling variants apart is the same skill as telling principles apart. In both cases you name the one feature that decides before you write code.

### A1. Two Sum (1) vs Two Sum II (167)
- **Shared surface:** find two numbers that add to a target.

<details><summary>Answer</summary>

- **Deciding feature:** the word **sorted**. Unsorted → hash the complement (P1, Card 1). Sorted → converging pointers, O(1) space (P5, Card 10).
- **Say:** "Sorted lets one comparison discard an end; unsorted has nothing to discard, so I remember."

</details>

### A2. Coin Change (322) vs Coin Change II (518)
- **Shared surface:** coins, unlimited reuse, reach an amount.

<details><summary>Answer</summary>

- **Deciding feature:** **fewest** vs **how many combinations**. Both are sum-axis knapsack (P3, Card 6). The combinator flips (`min` → `+`). Loop order matters only when counting. For `min` (and for feasibility) either order gives the right answer. For counting, coin-outer counts combinations (each multiset once) and amount-outer counts permutations (every ordering separately), which is Combination Sum IV (377, outside the 150).
- **Say:** "Same table; the question picks the combinator. For min, loop order is irrelevant; 'combinations' forces coin-outer, and amount-outer would count orderings."

</details>

### A3. Course Schedule (207) vs Redundant Connection (684)
- **Shared surface:** edge list, detect a cycle.

<details><summary>Answer</summary>

- **Deciding feature:** **directed** vs **undirected**. Directed dependencies → DFS with an on-path set (P14, Card 22) or Kahn's in-degree BFS (Card 29). Undirected edges arriving one by one → Union-Find, first failed union (P14, Card 23).
- **Say:** "Direction decides the tool: on-path set or in-degrees for directed, DSU for undirected."

</details>

### A4. Kth Largest Element (215): heap vs quickselect vs sort
- **Shared surface:** one problem, three correct answers.

<details><summary>Answer</summary>

- **Deciding feature:** what you are asked to justify.
  - k ≪ n, or a stream → bounded min-heap of size k, O(n log k) (P10, Card 15).
  - Static array, average case matters → quickselect (Card 31), expected O(n). It is partition-and-discard: partition around a pivot, then recurse into the one side that holds the answer. It is not binary search on a monotone predicate. Its worst case is O(n²). Use a random pivot and a three-way partition (`<`, `==`, `>`), because LeetCode 215 has sorted and all-equal tests that time out a fixed-pivot two-way partition.
  - Need the k best *in order* → sort, O(n log n).
- **Say:** "Heap when k is small or data streams; partition when I only need one order statistic, with a random pivot because the worst case is quadratic; sort when I need the top k in order."

</details>

### A5. Subsets (78) vs Target Sum (494)
- **Shared surface:** every element gets a binary decision.

<details><summary>Answer</summary>

- **Deciding feature:** **list all** vs **count**. Enumerating needs every leaf, so backtracking with undo (P12, Card 19). Counting has overlapping states `(i, total)`, so memoize (P3, Card 4). Same recursion, one dictionary apart.
- **Say:** "If I need the answers themselves, backtrack; if I need how many, memoize."

</details>

### A6. Number of Islands (200) vs Word Search (79)
- **Shared surface:** grid DFS in four directions.

<details><summary>Answer</summary>

- **Deciding feature:** **mark permanently** vs **mark and unmark**. Islands: a visited cell is done forever, flood fill (P13, Card 20). Word Search: a cell is only off-limits on the *current path*, so remove it from the set when returning, backtracking (P12).
- **Say:** "Does visiting a cell finish it for everyone, or only for this path?"

</details>

### A7. Jump Game (55) vs Jump Game II (45)
- **Shared surface:** array of jump lengths.

<details><summary>Answer</summary>

- **Deciding feature:** **can you** vs **minimum how many**. Feasibility → single frontier scanned backward (P7, Card 12). Count → the frontier advances in layers; each layer is a jump, which is BFS levels done greedily (P7 with P13 reasoning).
- **Say:** "Yes/no is one frontier; a count is a frontier per layer."

</details>

### A8. Maximum Subarray (53) vs Maximum Product Subarray (152)
- **Shared surface:** contiguous subarray, optimize an aggregate.

<details><summary>Answer</summary>

- **Deciding feature:** **sum** vs **product**. Sum: a negative running total can be dropped (Kadane, Card 3). Product: a negative running value can become the maximum after another negative, so track running max **and** min.
- **Say:** "Multiplication can flip sign, so one running extreme is not enough."

</details>

### A9. Network Delay Time (743) vs Cheapest Flights Within K Stops (787)
- **Shared surface:** weighted directed graph, cheapest way to reach nodes.

<details><summary>Answer</summary>

- **Deciding feature:** the **hop limit**. Unconstrained → Dijkstra, finalize on pop (P15, Card 24). "At most k stops" breaks finalize-on-pop, because the cheapest path to a node may use too many edges. Two fixes: k+1 rounds of Bellman-Ford off a snapshot (Card 24), or Dijkstra over the state `(cost, node, stops)` (Card 36).
- **Warning:** state-augmented Dijkstra must *not* keep a `done` set keyed on the node alone. A node first reached cheaply but with too many stops would block a later, costlier path with fewer stops that is the only one that fits the limit. Key visited on `(node, stops)`, or keep the best stop count seen per node and skip a pop only if it is not better on stops.
- **Say:** "Any extra resource constraint kills Dijkstra's invariant; either add the resource to the state (and to the visited key) or use bounded relaxation."

</details>

### A10. Merge Intervals (56) vs Non-overlapping Intervals (435)
- **Shared surface:** list of `[start, end]`, sort first.

<details><summary>Answer</summary>

- **Deciding feature:** **merge** vs **select a maximum non-overlapping set**. Merging compares with the previous block, sort by start (P9, Card 14). Selecting is an exchange argument (P7): on a conflict, keep the interval that ends earliest. Two sort orders both work for 435:
  - Sort by start, and on a conflict keep `min(end, prevEnd)` and count a removal. This is the canonical solution.
  - Sort by end, and keep each interval that starts at or after the last kept end.
- **Say:** "Sort by start to combine. To choose, keep the earliest end: either sort by start and keep the smaller end on conflict, or sort by end and take greedily."

</details>

### A11. Longest Substring Without Repeating (3) vs Minimum Window Substring (76)
- **Shared surface:** sliding window over a string with a character condition.

<details><summary>Answer</summary>

- **Deciding feature:** **longest** vs **shortest**. Longest: shrink *while invalid*, then record. Shortest: record and shrink *while valid*. Same two pointers, inverted inner loop (P8, Card 13).
- **Say:** "Maximize shrinks on violation; minimize shrinks on satisfaction."

</details>

### A12. Valid Parentheses (20) vs Daily Temperatures (739)
- **Shared surface:** both are "stack" problems.

<details><summary>Answer</summary>

- **Deciding feature:** **nesting** vs **dominance**. Parentheses resolve against the most recent open item and pop exactly one. Temperatures pop *every* dominated element, so the stack stays monotonic and each index is pushed and popped once (P6, Card 11).
- **Say:** "A stack for LIFO matching pops one; a monotonic stack pops until order is restored."

</details>

### A13. Permutations (46) vs Combination Sum (39)
- **Shared surface:** backtracking with a loop over candidates.

<details><summary>Answer</summary>

- **Deciding feature:** **order matters** vs **order does not**. Permutations loop over all unused elements at every level. Combinations pass a `start` index so each set is generated in one canonical order, and passing `i` instead of `i + 1` allows reuse (P12, Card 19).
- **Say:** "A start index kills reorderings; a used-set kills repeats."

</details>

### A14. Find Minimum in Rotated Sorted Array (153) vs Koko Eating Bananas (875)
- **Shared surface:** both binary search, neither a plain sorted lookup.

<details><summary>Answer</summary>

- **Deciding feature:** **what is being searched**. Rotated: indices, with the predicate "is mid in the second segment" (Card 9). Koko: the *answer space*, with the predicate "is speed k enough" (Card 8). Both are monotone predicates; the search domain differs.
- **Say:** "Binary search needs a monotone yes/no, not a sorted array; ask what the yes/no is over."

</details>

### A15. Copy List with Random Pointer (138) vs LRU Cache (146)
- **Shared surface:** a hash map plus linked-list nodes.

<details><summary>Answer</summary>

- **Deciding feature:** the map's **role**. Copy List is pointer surgery (P16), with P1 as the old → new translation map: the first pass creates every copy, and the second pass wires `next` and `random` through the map, which resolves forward references. LRU: the map gives O(1) lookup while a *doubly* linked list gives O(1) move-to-front and evict. These are two structures kept in sync (P1 + P16, Card 35).
- **Say:** "Is the map a translation table, or is it an index into an order I also maintain?"

</details>

---

## Part B: Families (different surface, same principle)

### B1. Two pointers by dominance (P5)
Two Sum II 167 · 3Sum 15 · Container With Most Water 11 · Trapping Rain Water 42 (P2 + P5) · Valid Palindrome 125.

<details><summary>Answer</summary>

- **Shared invariant:** every pair with an index outside `[l, r]` has been ruled out.
- **What differs:** the *reason* the dropped end is safe. Sorted sum too big → drop the right. Shorter wall bounds the area → drop the shorter. Smaller running max determines the water → advance that side. Say the reason for each before coding.

</details>

### B2. BFS layers as distance (P13)
Rotting Oranges 994 · Walls and Gates 286 · Word Ladder 127 · Jump Game II 45 · Level Order Traversal 102 · Open the Lock (outside).

<details><summary>Answer</summary>

- **Shared invariant:** everything in the queue at the start of round d is at distance d (Card 18 for the queue snapshot, Card 21 for multi-source).
- **What differs:** the graph is a grid, a dictionary of words, a tree, or the array itself. Word Ladder builds neighbors via wildcard buckets; Jump Game II never materializes a queue because the layer is a contiguous index range.

</details>

### B3. The two-sequence grid (P3)
LCS 1143 · Edit Distance 72 · Distinct Subsequences 115 · Interleaving String 97 · Regular Expression Matching 10.

<details><summary>Answer</summary>

- **Shared invariant:** `dp[i][j]` is the answer for `s[i:]` vs `t[j:]` (Card 7). For Interleaving, the third string's index is `i + j`.
- **What differs:** the branch bodies *and* the base row/column. Write all five on one page; that page is the family. With `m = len(s)`, `n = len(t)`:
  - **LCS 1143:** `dp[i][j] = 1 + dp[i+1][j+1]` if `s[i] == t[j]`, else `max(dp[i+1][j], dp[i][j+1])`. Base: row `m` and column `n` are 0.
  - **Edit Distance 72:** `dp[i+1][j+1]` if `s[i] == t[j]`, else `1 + min(dp[i+1][j], dp[i][j+1], dp[i+1][j+1])`. Base: `dp[i][n] = m - i` and `dp[m][j] = n - j`. These are not zero.
  - **Distinct Subsequences 115** (count copies of `t` in `s`): `dp[i][j] = dp[i+1][j] + (dp[i+1][j+1] if s[i] == t[j] else 0)`. The skip branch advances only `s`. Base: `dp[i][n] = 1` for every `i` (including `dp[m][n]`); `dp[m][j] = 0` for `j < n`.
  - **Interleaving String 97** (`s1`, `s2`, `s3`): `dp[i][j] = (i < m and s1[i] == s3[i+j] and dp[i+1][j]) or (j < n and s2[j] == s3[i+j] and dp[i][j+1])`. Base: `dp[m][n] = True`. Row `m` and column `n` are *not* constant, so the loops start at `m` and `n` (not `m-1`, `n-1`). Reject first if `m + n != len(s3)`.
  - **Regex 10** (text `s`, pattern `p`): `first = i < m and p[j] in (s[i], '.')`. If `j + 1 < n and p[j+1] == '*'`: `dp[i][j] = dp[i][j+2] or (first and dp[i+1][j])`. Otherwise `dp[i][j] = first and dp[i+1][j+1]`. Base: `dp[m][n] = True`, and `dp[i][n] = False` for `i < m`. Row `m` is not constant (`a*` matches the empty string), so `i` runs from `m` down.

</details>

### B4. Return one thing, update another (P11)
Diameter 543 · Balanced Binary Tree 110 · Maximum Path Sum 124 · Count Good Nodes 1448 (inverse: pass down, count up).

<details><summary>Answer</summary>

- **Shared invariant:** the return value is what the parent's recurrence needs; the global best is a side effect.
- **What differs:** what is returned (height, `(ok, height)`, one-branch sum) and what is clipped (negative sums to zero).

</details>

### B5. Monotonic stack (P6)
Daily Temperatures 739 · Largest Rectangle 84 · Sliding Window Maximum 239 · Car Fleet 853.

<details><summary>Answer</summary>

- **Shared invariant:** the stack holds unresolved candidates in monotonic order; a new element pops everything it dominates.
- **What differs:** the payload computed at pop time (distance, area, nothing), whether the front is also evicted (deque for windows, Card 34), and whether a sort is needed first to establish the processing order (Car Fleet).

</details>

### B6. Implicit linked list (P16 + P18)
Linked List Cycle 141 · Find the Duplicate Number 287 · Happy Number 202.

<details><summary>Answer</summary>

- **Shared invariant:** fast has moved twice as far as slow; they meet iff there is a cycle.
- **What differs:** the "next" function: `node.next`, `nums[i]`, `sum of squared digits`. Find the Duplicate adds Floyd's second phase to locate the entry (Card 36).

</details>

### B7. Reverse the search direction
Pacific Atlantic 417 · Surrounded Regions 130 · Walls and Gates 286 · Jump Game 55 (P7, same reversal idea).

<details><summary>Answer</summary>

- **Shared move:** reversing direction. The question asks "which positions can reach the target set". The answer starts *from* the target set and works backward, in one pass instead of one search per position.
- **What differs:** the principle, and the edge condition once reversed. The first three are graph searches (P18 → P13): search uphill instead of downhill, search from the border, search from every gate at once. Jump Game 55 is not a graph search. It is P7 greedy that happens to scan backward: a single `goal` index moves left whenever `i + nums[i] >= goal`.

</details>

### B8. Sum-axis knapsack (P3)
Coin Change 322 · Coin Change II 518 · Partition Equal Subset Sum 416 · Target Sum 494.

<details><summary>Answer</summary>

- **Shared invariant:** `dp[s]` is the answer for sum s over the items processed so far.
- **What differs:** combinator (`min`, `+`, `or`), reuse (unbounded → ascending inner loop; 0/1 → descending), and whether an algebraic reduction is needed first. Target Sum reduces to `P = (total + target) / 2`, with two guards: return 0 unless `(total + target)` is even and `|target| <= total`. Without the guards, `P` is fractional or negative and the indexing breaks.

</details>

### B9. Heap as the current extreme (P10)
Kth Largest in Stream 703 · Last Stone Weight 1046 · Task Scheduler 621 · Merge K Lists 23 · Design Twitter 355 · Find Median 295 · Minimum Interval to Include Each Query 1851.

<details><summary>Answer</summary>

- **Shared invariant:** the heap holds exactly the eligible candidates; the root is the best.
- **What differs:** bounded at k, unbounded, one entry per stream (k-way merge), two heaps at a balance point, or an active set fed by a sorted sweep.

</details>

### B10. Sort to make it local (P9)
Merge Intervals 56 · Meeting Rooms 252 · Meeting Rooms II 253 · 3Sum 15 · Subsets II 90 · Hand of Straights 846 · Car Fleet 853.

<details><summary>Answer</summary>

- **Shared move:** after sorting, each element only needs to be compared with its neighbor or the previous block.
- **What differs:** what "neighbor" means: the last merged block, the previous sorted value (dedupe), the smallest remaining card, the car ahead.

</details>

### B11. Frontier greedy (P7)
Jump Game 55 · Jump Game II 45 · Partition Labels 763 · Gas Station 134 · Maximum Subarray 53.

<details><summary>Answer</summary>

- **Shared invariant:** one scalar summarizes everything behind the scan. The committed boundary (the frontier, or the start index) is monotone and never moves back. The running balance in Gas Station and Kadane is not monotone; it goes up and down, and resets when it goes negative.
- **What differs:** the update rule: extend to the farthest reach, extend to the farthest last-occurrence, move the start past the point where the balance went negative.

</details>

### B12. Tries as prefix hashing (P1)
Implement Trie 208 · Add and Search Words 211 · Word Search II 212.

<details><summary>Answer</summary>

- **Shared invariant:** a path from the root spelling w exists iff some inserted word has prefix w (Card 33).
- **What differs:** a wildcard branches the search over all children; a grid DFS follows trie edges and prunes on a dead prefix.

</details>

---

## Part C: Compositions (name every layer)

Work these after Parts A and B. For each, write the principles in the order they are applied, then code. This table is meant to be read after solving, so its answers are not hidden: cover the right column with your hand or a sheet of paper while you write down your layers.

| Problem | Layers |
|---|---|
| Minimum Window Substring 76 | P8 sliding window (minimize form) + P1 count map with `have/need` |
| Trapping Rain Water 42 | P2 running maxes + P5 advance the side with the smaller max |
| Sliding Window Maximum 239 | P8 fixed window + P6 monotonic deque with front eviction (Card 34) |
| Word Search II 212 | P1 trie of all words + P12 grid backtracking + prune on dead prefix / remove found words |
| Merge K Sorted Lists 23 | P10 k-way merge heap, or P11 divide and conquer over pairwise P16 merges |
| Minimum Interval to Include Each Query 1851 | P9 sort intervals and queries + P10 heap of active intervals keyed by size, evict expired |
| Car Fleet 853 | P18 convert to arrival times + P9 sort by position + P6 collapsing stack |
| Word Ladder 127 | P18 wildcard signatures + P1 buckets as adjacency + P13 BFS layers |
| Longest Increasing Path in a Matrix 329 | P13 DFS on the implicit graph + P3 memo (safe because strict increase makes it a DAG) |
| Target Sum 494 | P12 two branches → P3 memo on `(i, total)`, or P18 algebra → sum-axis knapsack (guards: `total + target` even, `\|target\| <= total`) |
| Binary Tree Maximum Path Sum 124 | P11 post-order, return one-branch sum, clip negatives, update global with both branches |
| Serialize and Deserialize 297 | P11 preorder + explicit null markers (P18: make the encoding self-describing) |
| LRU Cache 146 | P1 hash map + P16 doubly linked list with dummy head and tail (Card 35) |
| Design Twitter 355 | P1 maps for follows and tweets + P10 k-way merge over followees' lists |
| Find Median from Data Stream 295 | P10 two heaps (max-heap `small`, min-heap `large`) + a balance invariant: `len(small) - len(large)` is 0 or 1, and `max(small) <= min(large)` |
| Median of Two Sorted Arrays 4 | P18 "search the partition" + P4 binary search on the shorter array + memorized boundary arithmetic |
| Alien Dictionary 269 | P18 extract one edge per adjacent pair (first differing character) + invalid-prefix check: if `w2` is a proper prefix of `w1`, return `""` + P14 topo sort with cycle detection (BFS Kahn, Card 29, or DFS on-path with post-order reversed, Card 22) |
| Reconstruct Itinerary 332 | P9 sort each adjacency list + P13 Hierholzer post-order DFS that consumes each edge once (append the airport *after* its edges are used up) + reverse. Pure greedy "take the smallest lexical edge first" is **WRONG**: with JFK→KUL, JFK→NRT, NRT→JFK it goes JFK→KUL and gets stuck after 1 of 3 tickets. The answer is JFK→NRT→JFK→KUL. The sort only picks among valid Euler paths; post-order is what makes it valid. |
| Regular Expression Matching 10 | P3 two-sequence grid + star transition `dp[i][j] = dp[i][j+2] or (first_match and dp[i+1][j])`; base `dp[m][n] = True`, row `m` not constant |
| Distinct Subsequences 115 | P3 two-sequence grid, sum combinator, skip advances only `s`; base `dp[i][n] = 1` |
| Reorder List 143 | P16 fast/slow to find the middle + P16 reverse the second half + interleave |
| Reverse Nodes in K-Group 25 | P16 reversal on each block + careful re-linking with a dummy head |
| Kth Smallest in BST 230 | P11 in-order traversal (BST ⇒ sorted) + early exit at k (iterative in-order, Card 30) |
| Cheapest Flights Within K Stops 787 | P15 Bellman-Ford rounds, or Dijkstra with stops in the state (visited keyed on `(node, stops)`, Card 36) |
| Burst Balloons 312 | P18 pivot on the last burst + P3 interval DP over `(l, r)` |
| Swim in Rising Water 778 | P15 Dijkstra with `max` combiner, or P4 binary search the answer + P13 reachability |
| Task Scheduler 621 | P10 max-heap of counts + P7 most-frequent-first + a cooldown queue; or P18 O(1) closed form `max(len(tasks), (maxf - 1) * (n + 1) + count_of_maxf)`, where `maxf` is the top frequency and `count_of_maxf` is how many tasks have it |
| Largest Rectangle in Histogram 84 | P6 monotonic stack + P2-style "nearest smaller on each side" reasoning |
| N-Queens 51 | P12 row-by-row backtracking + P1 conflict sets with `r + c`, `r − c` |

---

## Part D: Traps (surface words that point the wrong way)

| The problem says... | You will want... | But check... |
|---|---|---|
| "sorted" | binary search | Is a pair or a merge being asked? Two pointers (P5) may be simpler. |
| "subarray" | sliding window | Is the condition monotone in the window? "Sum equals k" with negatives needs prefix sums + a hash of earlier prefix counts, seeded `{0: 1}` (P1 + P2, Card 28; Subarray Sum Equals K 560 is outside the 150). |
| "subsequence" | sliding window | A subsequence is not contiguous, so a window does not apply. A substring or subarray is contiguous. Subsequence → DP (P3) or greedy with bisect (Card 32). |
| "palindrome" | a 2-D DP table | Center expansion (P5, pointers moving outward from each of the 2n−1 centers) is O(1) space and simpler (5, 647). |
| "minimum number of ..." | greedy | Can you state the exchange argument? If not, it is DP (P3) or BFS (P13). |
| "shortest path" | Dijkstra | Are the edges unweighted? Plain BFS. Are the weights only 0 and 1? 0-1 BFS with a deque: push a 0-edge to the front, a 1-edge to the back. Is there a hop or fuel limit? Bellman-Ford or state augmentation (Card 36). |
| "all paths / all combinations" | DP | Do you need the list itself? Then it is backtracking; DP only counts or optimizes. |
| "count the ways" | backtracking | Never enumerate to count: the count grows exponentially. Memoize the recursion on its state (P3, Card 4). |
| "design ... with O(1) operations" | one clever structure | Usually a hash map for lookup plus an ordering structure (a doubly linked list, stack, or heap) kept in sync. One structure per required operation (146, Card 35). |
| "in place / O(1) space" | a clever trick | Often it is just two pointers, reusing the input as storage, or XOR (P17). |
| "k-th" | sort | Bounded heap (P10) or quickselect (partition-and-discard, Card 31, random pivot); sorting is the baseline you should name and beat. |
| "tree" | recursion | "By level" or "minimum depth" wants BFS; "BST" wants in-order or one-sided descent. |
| "string matching / dictionary of words" | hash set | Prefix queries or many words in one search → trie (P1 variant, Card 33). |
| "circular" | new algorithm | Usually two linear runs over different slices (House Robber II: `nums[1:]` and `nums[:-1]`), doubling the array, a running-balance reset (P7), or indices mod n. |

---

## Part E: Additional contrast pairs

Same format as Part A. These pairs drill the traps in Part D directly.

### E1. Longest Substring Without Repeating (3) vs Subarray Sum Equals K (560, outside the 150)
- **Shared surface:** a contiguous stretch of the input that satisfies a condition.

<details><summary>Answer</summary>

- **Deciding feature:** **is the condition monotone in the window?** "No repeats" is monotone: if a window is valid, every window inside it is valid, so a sliding window works (P8, Card 13). "Sum equals k" with negative numbers is not monotone: growing the window can bring the sum back to k, so you cannot decide when to shrink. Use a prefix sum and a hash of earlier prefix counts, seeded `{0: 1}` (P1 + P2, Card 28).
- **Say:** "A window needs a condition that only breaks when the window grows. With negatives it doesn't, so I count earlier prefixes equal to `pre - k`."

</details>

### E2. Course Schedule (207) vs Alien Dictionary (269)
- **Shared surface:** order things subject to "a before b" constraints; report failure on a cycle.

<details><summary>Answer</summary>

- **Deciding feature:** **edges given vs edges extracted.** Course Schedule hands you the edges. Alien Dictionary hides them: each adjacent pair of words yields at most one edge, from its first differing character. An invalid prefix (`w2` a proper prefix of `w1`) means no valid order (P18). After extraction both are the same P14 topological sort (Card 22 or Card 29).
- **Say:** "Same topo sort; the work is in building the graph, and an impossible input can hide in the extraction step."

</details>

### E3. Longest Common Subsequence (1143) vs Longest Increasing Subsequence (300)
- **Shared surface:** "longest subsequence", non-contiguous, P3.

<details><summary>Answer</summary>

- **Deciding feature:** **two sequences vs one.** Two sequences → the 2-D `(i, j)` grid (Card 7). One sequence → a 1-D DP over predecessors, `dp[i] = 1 + max(dp[j] for j < i if a[j] < a[i])`, which is O(n²). Or O(n log n) with `bisect_left` on a `tails` array, where `tails[k]` is the smallest tail of any increasing subsequence of length k+1 (Card 32).
- **Say:** "One index per sequence: two sequences give a grid, one gives a line, and the line has a bisect speedup."

</details>

### E4. Kth Largest Element (215) vs Find Median from Data Stream (295)
- **Shared surface:** find an order statistic with heaps.

<details><summary>Answer</summary>

- **Deciding feature:** **static order statistic vs streaming median.** 215 has one fixed array and one fixed k: a bounded heap (Card 15) or quickselect (Card 31). 295 has elements arriving forever and asks for the middle at any time. The rank you want moves as the data grows, so keep two heaps balanced around the middle (P10, Card 15).
- **Say:** "A fixed rank in fixed data is one heap or a partition; a moving middle in a stream is two heaps kept balanced."

</details>

### E5. Number of Islands (200) vs Number of Connected Components in an Undirected Graph (323)
- **Shared surface:** count connected components.

<details><summary>Answer</summary>

- **Deciding feature:** **implicit vs explicit adjacency.** On a grid, the neighbors are implicit (the four adjacent cells), so flood fill each unvisited land cell (P13, Card 20). An edge list gives the adjacency explicitly, one edge at a time, so Union-Find fits: start with n components and subtract one per successful union (P14, Card 23). Either tool works on either input; the input shape decides which one is less code.
- **Say:** "If I can compute neighbors on the fly, flood fill; if I'm handed edges, union them."

</details>

### E6. House Robber (198) vs House Robber II (213)
- **Shared surface:** take/skip along a row of houses, no two adjacent.

<details><summary>Answer</summary>

- **Deciding feature:** **linear vs circular.** In 198, the rolling take/skip DP runs once (P3, Card 5). In 213, the first and last houses are adjacent, so at most one of them can be taken. Run the same linear solution twice, on two different slices: `nums[1:]` and `nums[:-1]`. Take the max (P18). Handle `len(nums) == 1` separately.
- **Say:** "A circle is a line where the ends conflict, so I solve the two lines that drop one end each."

</details>

### E7. Longest Palindromic Substring (5) vs Longest Common Subsequence (1143)
- **Shared surface:** a longest-something over strings. Both tempt a 2-D DP table.

<details><summary>Answer</summary>

- **Deciding feature:** **one symmetric string vs two strings.** A palindrome is symmetric around a center, so expand outward from each of the 2n−1 centers (P5 pointers moving outward). That is O(n²) time and O(1) space, with no table. Two independent strings have no center, so you need the `(i, j)` grid (P3, Card 7).
- **Say:** "Symmetry gives me a center to expand from; two strings give me a grid."

</details>
