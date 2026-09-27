# Review: DRILLS.md and CONTRASTS.md

Method: I wrapped every snippet on all 27 cards in a minimal harness and ran it on Python 3.9.6 (default recursion limit 1000). Each got hand-picked edge cases. 3Sum, Combination Sum II, the histogram prose, and two-heaps median also got randomized tests against brute force: 2000–3000 cases each, 500 sequences for the median. Checked by running and found correct: Cards 1, 2, 3, 5, 8, 9, 10, 11 (including the histogram prose), 12, 14 sweep, 15 (all three), 17, 18, 19, 21, 23, 24, 25, 26, 27. All problem numbers cited in both files match `manifest.json`. Every card reference in CONTRASTS points to the right card.

## Bugs (verified by running)

1. **Card 6, Partition Equal Subset Sum: code gives wrong answers on odd totals.** The parity check appears only in the Check line, not in the code. `[1,2,3,5]` (sum 11) returns True (should be False). `[1,2]` returns True (should be False). `[1]` returns True (should be False). The cause: `sum//2` rounds down and `dp[0]` is True. Fix: add `total = sum(nums); if total % 2: return False; target = total // 2` before building `dp`.
2. **Card 16, Max Path Sum: `best = 0` gives wrong answers on all-negative trees.** The prose gives the change but keeps the Diameter init. `[-3]` returns 0 (should be -3). `[-2, left -1]` returns 0 (should be -1). Fix: in the Max Path Sum line, say "init `best = root.val` (or `-inf`)". The canonical `0124` uses `res = [root.val]`.
3. **Card 7, Edit Distance: "only the branch bodies change" is false.** The base cases change too. If you use the LCS template's zero base with the stated branches, `("horse","ros")` gives 2 (should be 3) and `("ab","")` gives 0 (should be 2). Fix: add "base `dp[i][len(t)] = len(s)-i`, `dp[len(s)][j] = len(t)-j`". Also fix the Card 7 Check line and CONTRASTS B3 ("only the branch bodies").
4. **Card 7, Interleaving String: the LCS loop ranges give wrong answers.** The LCS loops start at `len-1`, so the last row and column are never filled. For Interleaving they are not constant. With the LCS ranges, `("aabcc","dbbca","aadbbcbcac")` returns False (should be True) and `("a","","a")` returns False (should be True). Fix: add "loops run `i` from `len(s1)` down and `j` from `len(s2)` down, with guards `i < m` / `j < n`. Set `dp[m][n] = True`. First reject if `len(s1)+len(s2) != len(s3)`." With that change, 4 of 4 cases pass.
5. **Card 13, Minimum Window: the answer is never extracted, and the obvious extraction crashes when no window exists.** For `s="a", t="b"`, `best` stays `(0, inf)`. Then `s[best[0]:best[1]]` raises `TypeError: slice indices must be integers`. Fix: append `return s[best[0]:best[1]] if best[1] != float('inf') else ""`. Or init `best = (0, 0)` and track the length separately: `bl = inf`.
6. **Card 20, Number of Islands: RecursionError on a legal input.** An all-land 300×300 grid (m, n ≤ 300 is allowed) needs recursion depth up to 90,000. Fix: add to Check: "recursion depth = component size; for big grids use an explicit stack or BFS, or raise `sys.setrecursionlimit`". Better, add an iterative variant (see Gaps).
7. **Card 22, Course Schedule II: RecursionError on a legal input.** A prerequisite chain of 2000 courses (`[[i, i+1] for i in range(1999)]`, numCourses ≤ 2000) overflows the default limit. Fix: same Check note as item 6, and point explicitly to Kahn's algorithm (see Gaps).
8. **Card 4, Coin Change top-down: RecursionError at `coins=[1], amount=10000`, which is a legal input.** The card does warn about depth over ~1000. But the card's own "Run on" problem hits this at its maximum constraint. Fix: say so explicitly: "322 at amount 10^4 needs bottom-up or `setrecursionlimit`". Or give the bottom-up version too: `dp[a] = min(dp[a-c]+1)`.

Missing return statements. These are not wrong outputs, but they matter if the snippet is compared line by line against a memorized version:
- Card 12, Jump Game II: no `return jumps`. The loop itself is correct: single-element `[0]` gives 0, and `[1,2]` gives 1.
- Card 15, k-way merge: no `return dummy.next`.
- Card 17, Count Good Nodes: the entry call is missing. Add `return good(root, root.val)`.
- Card 14, merge: `out[-1][1] = ...` needs list elements. Tuple input raises `TypeError`, and empty input raises `IndexError`. It is fine for LeetCode's input format; say "intervals are lists" in Check.

## Incorrect claims

1. **Card 4 Check says "base cases return the identity of the combinator (0 for min-count, 1 for sum-of-ways …)".** This conflates two things. The identity of `min` is `inf`, and the identity of `+` is 0. Fix: "the success base returns the value of the empty solution (0 coins, 1 way, True). A dead end returns the combinator's identity (`inf` for min, 0 for +, False for or)." The code already does this.
2. **Card 6 Check / CONTRASTS A2 say "amount-outer for min … the loop order flips".** For `min` (and for feasibility) the loop order does not matter; both orders give the right answer. Only counting depends on it: item-outer counts combinations, amount-outer counts permutations (Combination Sum IV 377). Fix A2: "for min either order works; 'combinations' forces coin-outer". Fix Card 6: "amount-outer counts permutations; for min/feasibility order is irrelevant". Also add that ascending vs descending is only meaningful for a 1-D rolling array.
3. **Card 11 invariant says "strictly decreasing value order".** The pop condition is `T[stack[-1]] < t`, so equal values stay on the stack. It is non-increasing (checked: `[5,5,6]` keeps both 5s). Fix: "non-increasing", or pop on `<=` to make it strictly decreasing. The Check line on `<` vs `<=` then becomes concrete.
4. **Card 13 invariant (min) says "`[l, r]` is the shortest valid window ending at `r`".** After the shrink loop, `[l, r]` is *invalid*. The last recorded window `[l-1, r]` is the shortest valid window ending at `r`. Fix: "after the shrink loop, `[l-1, r]` is the shortest valid window ending at `r` (if any)".
5. **Card 14 Check / CONTRASTS A10 say "sort by **end** to pick a max non-overlapping set".** The canonical `0435` sorts by *start* and keeps `min(end, prevEnd)` on conflict. A10's own explanation ("keeps the earliest-ending interval on conflict") describes that start-sorted variant, not the end-sorted one. Both approaches are correct. Fix: "sort by end and keep the first, or sort by start and on conflict keep the smaller end (canonical)". Change A10's "Say" line to match.
6. **Card 25 invariant says "gap: `right` is `n` ahead of `left`".** With `left = dummy, right = head` and then `n` steps, `right` is `n+1` ahead of `left`. That extra step is what leaves `left` on the node *before* the target. Fix: "`right` is `n+1` ahead of `left` (dummy start), so `left` stops before the node to delete."
7. **Card 27 Reverse Integer, negative bound.** Checking the magnitude against `INT_MAX` also for negatives cannot give a wrong answer. A reversal equal to exactly -2^31 would need x = -8463847412, which is outside the 32-bit input range. Twelve boundary cases pass, including -2^31, 2^31-1, and 1534236469. Add one sentence so learners do not "fix" it: "the asymmetric bound -2^31 is unreachable from a 32-bit input, so a magnitude check against INT_MAX is sufficient". Also note that Python ints do not overflow, so the pre-multiply check is interview ritual. Checking the final `res` against the range is equivalent in Python.
8. **Card 5 is inconsistent.** "Write: … Climbing Stairs" but "Run on: … Min Cost Climbing Stairs 746". 746 is not a one-line change from House Robber in the way 70 is. Fix: run on 70, or add a 746 line.
9. **Card 7 invariant is incomplete.** It says `dp[i][j]` is for `s[i:]` vs `t[j:]`. For Interleaving, the third string's index is `i+j`; the prose says so, but add it to the invariant line for that variant.
10. **CONTRASTS B11 "shared invariant: one scalar … only moves forward".** This is false for Kadane and Gas Station: the running balance goes up and down. Only the *start/frontier index* moves forward. Fix: "one scalar summarizes everything behind the scan; the committed boundary (frontier or start) never moves back."
11. **CONTRASTS header of Part A says "same surface, different principle".** A2 (P3/P3), A7 (P7/P7), A11 (P8/P8), A12 (P6/P6), A13 (P12/P12), and A14 (P4/P4) are same-principle, different-variant contrasts. Fix: retitle to "different principle *or variant*". Or split into A (principle) and A' (variant).
12. **DRILLS intro says "Each card also lists two problems".** Most cards list 3–4. Fix: "two to four".

## CONTRASTS issues

- **A4 (Kth Largest).** Add that quickselect's worst case is O(n²). It needs a random pivot plus a 3-way partition: LeetCode 215 has all-equal and sorted adversarial tests that time out a fixed-pivot Lomuto implementation. "k ≈ n → just sort" is weak, because a heap of size n−k+1 on the other side also works. The real third option is "need the k best *in order* → sort".
- **A9.** This is correct, and the "Say" line generalizes it well. Add that Dijkstra with `(cost, node, stops)` state (the Part C alternative for 787) must *not* use a global `done` set keyed on node alone. That is the exact bug learners make when adapting Card 24.
- **A10.** See Incorrect claims #5.
- **A15.** The principle attribution "P1 as identity map" for Copy List conflicts with PRINCIPLES' index, which lists 138 as primary P16 with P1 as secondary. Fix: "(P16, with P1 as the old→new map)".
- **B1.** Trapping Rain Water's primary is P2 in PRINCIPLES' index. Listing it in the P5 family is fine, but label it "(P2 + P5)" to match Part C.
- **B3.** "only the branch bodies" is wrong; see Bug #3/#4. Change to "branch bodies and base row/column".
- **B7.** Jump Game 55 in a "P18 → P13 reverse the search direction" family is a stretch. Its backward scan is a P7 greedy, not a graph search. Either drop it or label it "(P7, same reversal idea)".
- **B8.** Target Sum's reduction needs the guards `(total + target) % 2 == 0` and `abs(target) <= total`. Otherwise `P` is fractional or negative and indexing breaks. State them.
- **Part C, missing Hards.** The Hards in the 150 are 4, 10, 23, 25, 42, 51, 76, 84, 115, 124, 127, 212, 239, 269, 295, 297, 312, 329, 332, 778, 1851. Part C omits **10, 115, 295, 332**. Add:
  - 295 Find Median: P10 two heaps + a balance invariant (`len(small) - len(large) ∈ {0,1}`, `max(small) ≤ min(large)`).
  - 332 Reconstruct Itinerary: P9 sort adjacency (or a heap) + P13 Hierholzer post-order DFS that consumes edges + reverse. It is the one memorized Hard graph algorithm.
  - 10 Regex: P3 two-sequence grid + star transition `dp[i][j+2] or (first_match and dp[i+1][j])`.
  - 115 Distinct Subsequences: P3 two-sequence grid, sum combinator, base `dp[i][n] = 1`.
- **Part C Alien Dictionary 269.** The layer list misses the invalid-prefix check: `w1` longer than `w2` with `w2` a prefix of `w1` → return `""`. It is the most-failed test on this problem. Also say "BFS Kahn or DFS on-path", because the canonical solution uses DFS with post-order reversed.
- **Part C Task Scheduler 621.** Mention the O(1) formula `max(len(tasks), (maxf-1)*(n+1) + count_of_maxf)` as the P18 alternative. It is the answer interviewers ask for next.
- **Part C Car Fleet 853.** "P6 collapsing stack" is fine. PRINCIPLES' index does not list P18, but the arrival-time conversion is a genuine reformulation, so this is acceptable.
- **Part D "subarray" row.** It points to "prefix sums + hash (P1 + P2)", but no DRILLS card teaches that idiom, and Subarray Sum Equals K (560) is not in the 150. Either add a card (see Gaps) or cite 560 as "outside".
- **Part D "circular" row.** "the linear solution run twice" is imprecise for House Robber II. That solution is two linear runs on *different slices* (`nums[1:]`, `nums[:-1]`), not the same run done twice. Reword: "two linear runs over slices, doubling the array, or indices mod n".
- **Part D, missing traps worth adding:**
  - "subsequence" vs "substring/subarray": non-contiguous means DP or greedy with bisect, not a window.
  - "palindrome": center expansion (P5 outward) beats a 2-D DP table (5, 647).
  - "shortest path" with 0/1 weights: 0-1 BFS with a deque.
  - "design … O(1)": map plus an ordering structure (146).
  - "count the number of ways": never backtrack; memoize.

## Gaps

Ranked by interview value.

1. **Prefix sum + hashmap (count of earlier prefixes).** `cnt = {0:1}; for x in nums: pre += x; res += cnt.get(pre-k, 0); cnt[pre] = cnt.get(pre, 0) + 1`. Part D and PRINCIPLES both point to it and no card has it. It is the single most common interview idiom missing from the deck. Add as Card 2b (P1+P2), with the `{0:1}` seed as its Check.
2. **Kahn's BFS topological sort.** Card 22's recursive DFS fails on a legal 207/210 input (Bug #7). Kahn's is iterative, gives cycle detection by `len(order) < n`, and is what most interviewers expect. Add it to Card 22 as a second template.
3. **Iterative DFS with an explicit stack, and iterative in-order traversal.** Bugs #6/#7 show that recursion depth is a real failure mode in Python. The iterative in-order loop (`while stack or cur: while cur: push, go left; pop; visit; cur = right`) is the canonical 230 solution and a common follow-up question. Add to Card 17 or as Card 17b.
4. **LIS in O(n log n) with `bisect_left` on a tails array.** 300 is in the 150. The O(n²) DP is the listed solution, but the patience version is the expected follow-up, and it is the only "binary search inside DP" idiom. Add it as a Check or variant on Card 8/9 or a DP card.
5. **Quickselect.** A4 and Part D cite it, but no template exists. Add a 10-line random-pivot, 3-way partition version to Card 15 as the fourth skeleton, with its worst case noted.
6. **Trie insert/search.** Three problems (208/211/212) and family B12 depend on it, and there is no card. The template is `node = node.setdefault(c, {})` plus an end marker. Add it as a P1 card, and note the Word Search II pruning (delete the end marker or the leaf after a find).
7. **LRU: `OrderedDict` vs a manual doubly linked list.** A15 and Part C cite 146. Give both: `move_to_end` / `popitem(last=False)` as the 5-line version, then the DLL with sentinel head and tail that interviewers usually require.
8. **Interval intersection (two sorted lists, advance the one that ends first).** This is lower priority because it is outside the 150 (986). It is the natural pair to Merge Intervals.
9. **Floyd phase 2 (cycle entry).** B6 mentions it for 287, but Card 25 only detects the cycle. Add `slow2 = head; while slow != slow2: advance both` to Card 25.

**Contrast pairs worth adding:**
- **Longest Substring Without Repeating 3 vs Subarray Sum Equals K 560.** Monotone condition → window. Non-monotone with negatives → prefix hash. This drills the Part D trap directly.
- **Course Schedule 207 vs Alien Dictionary 269.** Edges are given vs edges must be extracted (P18). Same P14 core.
- **LCS 1143 vs Longest Increasing Subsequence 300.** Two sequences mean a 2-D grid. One sequence means dp-over-predecessors or bisect.
- **Kth Largest 215 vs Find Median 295.** One static order statistic (heap/quickselect) vs a streaming middle (two heaps).
- **Number of Islands 200 vs Redundant Connection 684 / Connected Components 323.** Static grid → flood fill. Edges streamed one at a time → Union-Find.
- **House Robber 198 vs House Robber II 213.** Linear vs circular. This is the exact reformulation Part D's "circular" row describes.
- **Longest Palindromic Substring 5 vs LCS.** Center expansion vs 2-D DP. It is the classic "you reached for DP but pointers are simpler" pair.

## Consistency

- All CONTRASTS references to cards (1, 3, 4, 6, 8, 9, 10, 11, 12, 13, 14, 15, 19, 20, 22, 23, 24) point to the correct cards.
- P-numbers P1–P18 match PRINCIPLES' numbering and names everywhere. Principle tags on cards match PRINCIPLES' index. Card 3 (P2/P7) is consistent with 121 → P2 and 53 → P7. Card 27 (P17/P16) is consistent with 2 → P16+P17.
- Disagreements with PRINCIPLES' index:
  - A15: Copy List is primary P16, not P1.
  - B1: Trapping Rain Water is primary P2.
  - Part C 853: adds P18.
  - A8: Max Product is P2 primary in the index; A8 cites no P-number.
  None of these are wrong in substance. A15 is the only one worth fixing.
- DRILLS header references `SCHEDULE.md`, and the file exists.
- CONTRASTS B3 says "only the branch bodies", which conflicts with the fixed Card 7 (Bug #3/#4). Update both together.
- Card 14 Check / A10 ("sort by end") conflict with PRINCIPLES' index for 435 ("sort, keep earliest end") and with canonical `0435` (sort by start).

## Minor/style

- Card 1: `ord(c) - 97` assumes lowercase a–z (true for 49). Say so in Check.
- Card 3: `lowest = prices[0]` and `best = nums[0]` crash on empty input. The constraints give n ≥ 1, but say so.
- Card 8: Check could add "`hi = max(piles)` is feasible because `h ≥ len(piles)`". That is why the range is non-empty.
- Card 10: add the early break `if nums[i] > 0: break` to 3Sum. Also note that inner dedupe on `r` is unnecessary once `l` is deduped (verified on 3000 random cases).
- Card 11: Sliding Window Maximum note: say "indices in the deque" explicitly. The `q[0] <= r - k` test only works on indices.
- Card 12: Jump Game II assumes the end is reachable. If it is not, `range(l, r+1)` becomes empty and `max()` raises. Note "guaranteed reachable".
- Card 15: say that the `i` tiebreaker is unique among heap entries because each list has at most one entry in the heap at a time. That is why `node` is never compared.
- Card 16: also note that Diameter counts edges. `L + R` works because `dfs` returns height in nodes.
- Card 24: Check says "`w` alone for Prim's MST". Also say Prim sums `w` on each successful pop and stops at `len(done) == n`.
- Card 26: the Counting Bits snippet reuses `n`, which the popcount snippet above it destroyed. Rename one of them.
- Card 27: Plus One and Multiply Strings are listed under Run on, but only Add Two Numbers is templated. Add the one-line `res[i+j+1] += a*b` accumulator for 43.
- CONTRASTS B2: listing Level Order 102 under "BFS layers as distance" is fine. Card 18 is the matching card; cite it.
- CONTRASTS, header step 1: "write down the discriminating feature before solving" is good. Consider adding an answer key hidden in `<details>` as DRILLS does, since the answer lines are currently visible.
