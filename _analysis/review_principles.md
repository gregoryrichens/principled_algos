# Review of PRINCIPLES.md

Method: I ran every complete solution and every template (instantiated for one concrete problem) in Python 3. Each was checked against 3–7 hand-picked cases covering empty, single, all-equal, negative, and duplicate inputs, and where practical against 300–2000 random cases compared with a brute-force oracle (42, 11, 84, 73, 295, 312, 494, 621 closed form). The consistency checks were scripted against `_analysis/manifest.json` and `_analysis/principle_map.json`.

**Headline:** all 40+ code blocks produce correct output. The one real correctness bug is in the memorize table (Detect Squares). Most remaining issues are complexity or overstatement errors and index/list drift.

---

## Bugs (verified by running)

1. **L1677, Detect Squares memorize-table formula.** "For stored `(x, y)` with `|x−px| == |y−py|`, add `count[(x,py)] * count[(px,y)]`" leaves out the zero-area exclusion. If the query point is already stored, `(x,y) = (px,py)` passes the test (0 == 0) and adds `count[(px,py)]²`.
   - Failing input: add (3,10), (11,2), (3,2), (11,10); query (11,10). The formula returns 2; correct is 1.
   - Fix: require `x != px` (and so `y != py`). The reference `_sources/leetcode/python/2013-detect-squares.py` has `or x == px or y == py: continue`.
2. **L858–867, Kth Largest (215): the complexity claim is wrong for the code shown.** The code heapifies all n elements and pops n−k times. That costs O(n + (n−k) log n) time and O(1) extra space (it mutates the input). It is not "O(n log k) with a bounded heap"; for small k it is close to O(n log n). The same wrong claim appears in the source file's header comment, and L830 lists 215 under "Bounded heap of size k".
   - Fix: either show the bounded version (the P10 template at L843–847, which really is O(n log k), O(k) space), or state the true cost of heapify-and-pop.
3. **L1570–1578, Pow helper.** `if x == 0: return 0` runs before `if n == 0: return 1`, so `pow(0, 0)` returns 0; Python and C return 1. LeetCode's constraints rule this input out, so this is minor. Fix: swap the two base cases.
4. **Skeletons with uninitialized variables** (not wrong, but they fail if pasted):
   - L162–165: `ans` is never initialized.
   - L205–208: `res` is never initialized.
   - L497–503: `ans` is never initialized.
   - L42 (`trap`): `height[0]` raises IndexError on `[]` (LeetCode guarantees n ≥ 1).
   - L615 (`eraseOverlapIntervals`) and L778 (`merge`): `intervals[0]` raises on `[]`.
   - Fix: add one-line initializations or "(assumes n ≥ 1)" comments.

## Factual errors

1. **L1321, "the argument still holds because the combiner is monotone."** Monotone alone is not enough. Dijkstra's finalize-on-pop needs the combiner to be monotone and also non-decreasing along a path (`cost ⊕ w ≥ cost`), matched to a min-heap.
   - Counterexample: widest path with `min(cost, w)` is monotone but decreasing, and fails with a min-heap.
   - Probability products (L1384) are decreasing and only work because you switch to a max-heap.
   - L1313 states the correct condition; make L1321 match: "…because `max(cost, w) ≥ cost`, so costs never decrease along a path."
2. **L639, Reconstruct Itinerary "smallest lexical edge first" listed as Greedy.** Greedy smallest-first is wrong (verified).
   - Counterexample: tickets JFK→KUL, JFK→NRT, NRT→JFK. Greedy goes JFK→KUL and gets stuck after 1 of 3 tickets.
   - What works is Hierholzer's post-order (the sort only picks the order among valid Euler paths).
   - Fix: remove 332 from the P7 list, or annotate "lexical tiebreak inside Hierholzer, not greedy". Also drop the P7 secondary at L1875.
3. **L493, monotonic-stack invariant says "strictly increasing (or decreasing)."** The Daily Temperatures code (L513, pop on `t > top`) and the template (L499, pop on `a[top] < x`) keep equal values, so the stack is non-increasing, not strictly decreasing.
   - Counterexample: `[30,30,40]` leaves the stack `[(30,0),(30,1)]` after i=1.
   - Largest Rectangle (pop on `>`) keeps a non-decreasing stack.
   - Fix: "monotone (non-strict unless you pop on equality)". This also connects to the `<` vs `<=` pitfall at L555.
4. **L671, P8 invariant for minimize problems.** "The window `[l, r]` … is the shortest valid window ending at `r`" is false for the code at L717–723. After the inner `while` exits, `[l, r]` is invalid (it was shrunk one step past validity).
   - Example: `minWindow("ADOBECODEBANC","ABC")` at r=5 ends with window "DOBEC", which is invalid.
   - Fix: "for minimize: after the inner loop, `[l−1, r]` was the shortest valid window ending at `r`, and it has been recorded."
5. **L311, "Distinct Subsequences (`+` instead of `max`)."** The recurrence is not the LCS grid with `max` swapped for `+`. It is `dp[i][j] = dp[i+1][j] + (s[i]==t[j] ? dp[i+1][j+1] : 0)`: the skip branch only advances `s`, never `t`. Interleaving String's transitions are also not "LCS branches with `or`". Fix: state each recurrence in one line instead of claiming they are the same grid.
6. **L263, "amounts outer / items inner counts permutations or finds a minimum (Coin Change)."** This implies loop order matters for `min`. It doesn't: for `min`/`or` (322, 139) both orders are correct, and order only matters for counting. Fix: "…counts permutations; for min/or either order works."
7. **L1022–1024, backtracking shape table puts Letter Combinations 17 under "pick any unused element".** 17 is one fixed choice set per position (a cartesian product, which is what the index at L1850 says); there is no "unused" tracking. Fix: move 17 to its own row "one choice per position (product)" or to include/exclude-style fixed depth. Also, Target Sum 494 is ± per element, not include/exclude.
8. **L867 / L408, "Quickselect (P4-style partition…)".** Quickselect is not binary search on a monotone predicate. It is partition plus recursing into one side (divide and conquer / elimination by partition), and it is expected O(n) but worst-case O(n²). Fix: call it "partition-and-discard" and add the worst case (random pivot).
9. **L1659, P18 "Every 'Hard' in the 150 …" list.**
   - It includes 72 Edit Distance and 787 Cheapest Flights, which the manifest and index mark Medium.
   - Otherwise it contains exactly the 21 Hards, but the qualifier "that does not fall directly to a template" is false for several of them: 23, 239, 295, 124, 84 and 76 are straight templates.
   - Fix: drop 72 and 787, and either drop the qualifier or prune the list to the true disguises (4, 312, 269, 287-style, 332, 778, 10).
10. **L1307, "DSU without path compression is O(n) per find."** That is only true without union by rank/size; with union by rank alone, find is O(log n). Fix: "without both, O(n); either alone, O(log n); both, α(n)."
11. **L1668, "Roughly ten problems…".** The table has 14 rows. Fix the count.
12. **L1616 / L1639, Target Sum reformulation.** `P = (total + target) / 2` also needs the guards: return 0 if `(total + target)` is odd or `|target| > total`. Without them you get a non-integer or negative knapsack target. (Verified: with the guards, the knapsack matches the memo version on 300 random cases, including zeros.)
13. **L1363, "Min Cost to Connect Points (1584) is this exact code pushing the edge weight alone."** The Network Delay loop keeps `t = w1` (last pop). For Prim you must sum the popped weights (`total += w`) and seed/stop by vertex count. Fix: say so. The P15 template (L1328–1335) has the same omission for its "w for Prim" variant.
14. **L1389.** Heap Prim on a complete graph is O(n² log n). Array-based Prim is O(n²) with no heap, and is the standard answer for dense 1584. Worth one sentence.
15. **L607, Jump Game justification.** "if you can reach `goal`, you can reach everything before it that `goal` can reach" is garbled. The real argument: an index can reach the end iff it can jump to some index that can; the leftmost such index `goal` suffices, because any index that can jump past `goal` can also land on `goal` (a jump of length ≤ `nums[i]` can stop anywhere up to `i + nums[i]`). Fix: replace with that.

## Inconsistencies

The "Where it applies" lists disagree with the index's Primary/Also columns (checked by script).

**1. A principle's list names a problem, but the index does not tag that principle for it:**

| Principle list | Problem(s) | Index tags |
|---|---|---|
| P5 (L466) | 143 Reorder List, 23 Merge K | 143 has no P5; 23 has only P11 |
| P6 (L551) | 230 | no P6 |
| P7 (L639) | 1584, 853, 332 | no P7 on 1584 or 853 (332 already flagged above) |
| P9 (L805) | 332, 973, 1584 | none has P9 |
| P10 (L893) | 1584 | also P14 only |
| P13 (L1194) | 212 Word Search II | P12, P1 |
| P14 (L1300) | 329 | P13 |
| P16 (L1480) | 23 | not P16 |

**2. The index tags a secondary principle, but that principle's list omits the problem:**
- P1 list lacks 3 and 76.
- P7 list lacks 11.
- P12 list lacks 494.
- P10 list lacks 253. It is listed under P10 **"Beyond"** at L894 ("meeting rooms II (heap of end times)"), but 253 is in the 150. Move it to the NeetCode 150 line.

**3. P18 has no "Where it applies" list for its secondaries.** The index tags P18 on 17 problems, and all of them appear in the P18 reformulation table, so that is acceptable. But the table also contains 853, 253, 49 and 329, which the index does not tag P18.

**4. L323, P3 list:**
- Includes 152 among "all 23 DP problems", yet the index makes 152 primary P2. The P3 count of 23 in the index works out only because 338 replaces 152.
- 329 is listed twice.
- The clause "Word Search II / Clone Graph memo maps are P1, not P3" sits inside the applies list.
- Fix: reconcile 152 (primary P3 with a P2 note, or change the text).

**5. L250–259, state-shape table.**
- Claims to "cover all 23 DP problems" but omits 152.
- Files 5/647 under interval `(l, r)` while saying they are solved by center expansion, which is not a DP state.

**6. L644 / L809 vs L612.** The pitfall says "sort by end for max non-overlapping", but the worked example sorts by start (and uses `min(end, prevEnd)`). Both are correct. Say so explicitly, or the reader will think the example violates the pitfall.

**7. P2 index conventions.**
- L146 writes `combine(prefix[i-1], suffix[i+1])`, which uses inclusive prefixes.
- The template (L153–159) and pitfall L218 use exclusive `pre[i]` = `[0..i-1]`.
- The invariant L148 says `run` covers `[0..i]`.
- Fix: pick one convention.

**8. P4 template (L361–366, half-open `lo < hi`, `hi = mid`) vs Koko example (L382–392, closed `l <= r` with a `res` variable).** The pitfall at L412 warns against mixing styles, then the first worked example uses the other style without comment. Fix: rewrite Koko in the template form, or explicitly present both styles.

**9. L1674 vs L1684.** "Floyd's second phase finds the cycle entry" applies to 287 only. Happy Number needs only phase 1 (does the cycle contain 1?).

**Correct as-is (checked):**
- All 150 index rows match the manifest names and difficulties.
- Index primaries match `principle_map.json`.
- The counts table matches the index (sum 150).
- Every problem appears in at least one principle list.
- All problem numbers cited in the prose lists match their names.

## Gaps

1. **Prefix sum + hashmap** (subarray sum = k, count of subarrays with property) is mentioned three times (L125, L214, L734) but has no template or code. It is the most-asked pattern outside the 150 in this family. Add a 6-line template (`count[0]=1; for x: pre+=x; res+=count[pre-k]; count[pre]+=1`) with the reason it beats the sliding window when values are negative.
2. **Kahn's algorithm**: one sentence (L1217), no code. Many interviewers expect BFS topo for 207/210/269, and Kahn's is the natural choice for "is there a unique order" and for iterative (no recursion-depth) solutions. Add the in-degree/queue template and the check `len(order) == n`.
3. **Quickselect code** is absent, even though L867 says "knowing all three is a standard interview exchange". Add a Lomuto/Hoare in-place version with a random pivot, and note the O(n²) worst case.
4. **LIS in O(n log n)** is named twice (L409) but never shown, while the O(n²) DP is not shown either. Add `bisect_left` on `tails`, with the invariant "tails[k] = smallest tail of an increasing subsequence of length k+1".
5. **Monotonic deque (239)** has no code, only prose (L491, L558). The two-sided eviction (front by index, back by value) is exactly where people slip; add it.
6. **Trie** has no code anywhere, yet 208, 211 and 212 are three problems. Add a ~10-line TrieNode/insert/search template and the Word Search II pruning (remove the word from the trie after it is found, and prune empty nodes).
7. **Iterative DFS / iterative in-order** is mentioned in pitfalls (L551, L997, L1200) with no template. Add the stack-based in-order (230) and the explicit-stack grid DFS.
8. **Bitmask DP** and **bitmask subset enumeration**: each gets one clause only. Not in the 150, but common follow-ups; a 3-line `for mask in range(1<<n)` example would do.
9. **Hierholzer (332)** and **Median of Two Sorted Arrays (4)** are "memorize" items with no code. Both are hard to write correctly from a one-line description; add ~12-line code for each.
10. **2-D / state-machine DP** has no worked example. 309 (hold/sold/rest) is the only state-machine problem and is only named. Unique Paths' rolling row is named, not shown. Add at least the 309 transitions.
11. **Fixed-size sliding window** (567) has no template, though L664 lists it as a trigger. The shape differs from variable windows (add right, evict `r-k`).
12. **P15.** Dijkstra has no early exit at the target (needed for 778 and "path to one node" variants), and there is no "state-augmented Dijkstra" (node, stops) alternative for 787, though L1319 mentions it.
13. **`bisect` module.** 981 and floor/ceiling searches are one call to `bisect_right(...) - 1`. Worth a line, since interviewers accept it and it avoids off-by-ones.
14. **Missing "design / composite data structure" guidance.** LRU 146, Min Stack 155, Twitter 355, Time Map 981, MedianFinder 295 and Detect Squares 2013 are scattered across P1/P2/P6/P10. A short note on "pick one structure per required operation and state each op's complexity" would help; LRU code (the hardest of these to write) is not shown.

## Questionable classifications

- **5 Longest Palindromic Substring / 647 Palindromic Substrings, primary P3.** The canonical solution and the key-move column are both center expansion (P5, pointers moving outward); no DP table is used. Primary should be P5, with P3 as the O(n²)-space alternative.
- **271 Encode and Decode Strings, primary P17.** No bits, digits or O(1) space are involved. It is framing/serialization, the same idea as 297's null markers. P18 (reformulate) or P11-adjacent would fit better; or admit it is a memorize-only item with no principle.
- **54 Spiral Matrix, primary P17.** This is boundary simulation, not a space trick (the natural solution already uses O(1) extra space). The "bits, digits, O(1) space" label does not describe it.
- **215 Kth Largest, P4 secondary.** Quickselect is not binary search (see Factual errors item 8).
- **621 Task Scheduler, primary P10.** The optimal O(n) solution is the closed-form greedy count (the memorize table even gives it); the heap is a simulation. Arguably P7 primary, P10 secondary.
- **235 LCA of a BST, primary P4.** Defensible, but its section lives under Trees, and the solution is a root-to-leaf walk (P11 with a BST comparison). A reader running "the six questions" would land on P11 first. Low priority.
- **332 Reconstruct Itinerary, secondary P7.** Wrong; see Factual errors item 2.
- **146 LRU Cache, primary P1.** The hard part is the O(1) linked-list splice (P16); the hash is trivial. Swapping primary and secondary is arguable.

## Minor/style

- L1022, Target Sum is "± per element", not "include/exclude".
- L350: "the input size is 10⁹" should be "the value range is up to 10⁹" (input *size* 10⁹ is not realistic).
- L1117: "BFS … is the only correct choice for minimum steps" is overstated (bidirectional BFS and IDDFS are also correct). Say "the standard choice".
- L1239–1249: the array is named `rank` but updated as a size (`rank[ra] += rank[rb]`). Call it `size`, or use true rank (increment only on a tie).
- L1034, P12 template: with sorted input and a sum-based prune, `break` beats `continue`; worth noting since 39/40 rely on it.
- L1513: the overflow check shown only handles positive results. Mention the sign handling, or process `abs(x)` and reapply the sign.
- Counts table (L1704–1722) omits P18 (0 primaries); add a row with 0 so readers don't think it was forgotten.
- L1620: grouping Median of Two Sorted Arrays under "Guess and check (search the answer)" is loose. It searches a partition index, not an answer value.
- `_sources/leetcode/python/0215-kth-largest-element-in-an-array.py` has the same wrong O(n log k) header; the doc inherited it.
