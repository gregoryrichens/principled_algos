# Drill deck: the 36 idioms to write from memory

> **New here?** Terms like *principle*, *trigger*, *invariant*, *template* and *card* are defined, with an example, in `README.md` under "The words used everywhere in this folder".

*These are the "times tables". Each card has a front (trigger and invariant to say aloud) and a back (the template and the three checks). Work a card by covering the back, saying the trigger and invariant, writing the code on paper or in a blank file, then comparing. A card is done when it comes out clean in under two minutes three sessions in a row.*

Cards 1–27 are grouped by the principle they belong to in `PRINCIPLES.md`. Cards 28–36 were added after review; they fill gaps and sit in their own group at the end, each tagged with its principle. Each card also lists two to four problems to run it on immediately (LeetCode ids; problems outside the 150 are marked "outside").

Scoring per attempt: **clean** (no bug, under 2 min), **slow** (correct, over 2 min), **bug** (any error). Log it in `SCHEDULE.md`'s format.

---

## MOVE 1 — Remember

### Card 1 · Hash lookup with a transformed key (P1)
**Trigger:** an inner loop that only answers "have I seen X / where is X / how many X".
**Invariant:** `seen` holds exactly the information about every element before `i` that a later element could need.
**Write:** Two Sum with a complement key. Then change the key to a 26-count tuple for Group Anagrams.
<details><summary>Answer</summary>

```python
seen = {}
for i, n in enumerate(nums):
    if target - n in seen:
        return [seen[target - n], i]
    seen[n] = i

groups = collections.defaultdict(list)
for s in strs:
    key = [0] * 26
    for c in s: key[ord(c) - 97] += 1
    groups[tuple(key)].append(s)
return list(groups.values())
```
**Check:** insert after the lookup so `i != j` · key must be hashable (tuple, not list) · if the key is a small bounded int, a list indexed by it beats the dict · `ord(c) - 97` assumes lowercase a–z (guaranteed for 49); otherwise key on `tuple(sorted(s))`.
</details>
Run on: Two Sum 1 · Group Anagrams 49 · Valid Sudoku 36 (composite tuple keys).

### Card 2 · Prefix and suffix aggregates (P2)
**Trigger:** "for every index, something over all the other elements", or a value at `i` that depends on the max/min to its left **and** right.
**Invariant:** after the first pass `res[i]` summarizes `[0..i-1]`; during the second pass `suf` summarizes `[i+1..n-1]`.
**Write:** Product of Array Except Self, O(1) extra space.
<details><summary>Answer</summary>

```python
res = [1] * len(nums)
for i in range(1, len(nums)):
    res[i] = res[i - 1] * nums[i - 1]
suf = 1
for i in range(len(nums) - 1, -1, -1):
    res[i] *= suf
    suf *= nums[i]
return res
```
**Check:** `res[i]` excludes `nums[i]` itself · second pass updates `suf` *after* using it · the output array doubles as the prefix array.
</details>
Run on: Product Except Self 238 · Trapping Rain Water 42 (build `leftMax[]`, `rightMax[]`, then the O(1)-space pointer version). For "count subarrays with sum k", see Card 28.

### Card 3 · Best-so-far single pass (P2 / P7)
**Trigger:** "best pair where one comes before the other", "max subarray sum".
**Invariant:** `best_so_far` summarizes the prefix; `run` is the best value *ending here*.
**Write:** Best Time to Buy and Sell, then Kadane.
<details><summary>Answer</summary>

```python
lowest, res = prices[0], 0
for p in prices:
    lowest = min(lowest, p)
    res = max(res, p - lowest)
return res

best, run = nums[0], 0
for x in nums:
    run = max(run + x, x)        # extend or restart
    best = max(best, run)
return best
```
**Check:** initialize `best` to the first element, not 0, when all values may be negative · `prices[0]` / `nums[0]` crash on empty input; both problems guarantee n ≥ 1, so say that aloud · for products track running max **and** min · this is DP with a two-variable state.
</details>
Run on: Best Time 121 · Maximum Subarray 53.

### Card 4 · Top-down memoized recurrence (P3)
**Trigger:** "number of ways / is it possible / min-max cost" with a small branching choice per step.
**Invariant:** `f(state)` is the exact answer to the sub-question the state names.
**Write:** the generic skeleton, then Coin Change as top-down. Then the same recurrence bottom-up.
<details><summary>Answer</summary>

```python
from functools import lru_cache
@lru_cache(None)
def f(a):                                  # a = remaining amount
    if a == 0: return 0
    if a < 0:  return float('inf')
    return min(1 + f(a - c) for c in coins)
ans = f(amount)
return -1 if ans == float('inf') else ans

dp = [0] + [float('inf')] * amount         # bottom-up: dp[a] = fewest coins for a
for a in range(1, amount + 1):
    for c in coins:
        if c <= a: dp[a] = min(dp[a], dp[a - c] + 1)
return -1 if dp[amount] == float('inf') else dp[amount]
```
**Check:** state must be sufficient (would two calls with the same state ever differ?) · the success base returns the value of the empty solution (0 coins, 1 way, True); a dead end returns the combinator's identity (`inf` for min, 0 for +, False for or) · recursion depth is the longest chain of states: 322 at its own maximum (`coins=[1], amount=10^4`) raises `RecursionError` under Python's default limit of 1000, so there use the bottom-up version (or `sys.setrecursionlimit`).
</details>
Run on: Coin Change 322 · Decode Ways 91.

### Card 5 · Bottom-up 1-D DP collapsed to rolling variables (P3)
**Trigger:** the recurrence looks back a fixed distance (`i-1`, `i-2`).
**Invariant:** `a, b` are `dp[i-2], dp[i-1]` entering iteration `i`.
**Write:** House Robber, then Climbing Stairs by changing one line, then Min Cost Climbing Stairs.
<details><summary>Answer</summary>

```python
rob1, rob2 = 0, 0
for x in nums:
    rob1, rob2 = rob2, max(rob1 + x, rob2)
return rob2

a, b = 1, 1                                # ways(0), ways(1)
for _ in range(2, n + 1):
    a, b = b, a + b
return b

a = b = 0                                  # min cost to stand on step i-2, i-1
for c in cost:
    a, b = b, min(a, b) + c                # b = cost to stand on this step
return min(a, b)                           # top is one past the last step
```
**Check:** the simultaneous assignment order (`rob1, rob2 = rob2, ...`) · circular variant (House Robber II) = max of two linear runs on `nums[1:]` and `nums[:-1]` · the combinator flips between `max`, `+`, and `min` with the question.
</details>
Run on: House Robber 198 · Climbing Stairs 70 · Min Cost Climbing Stairs 746.

### Card 6 · Knapsack over a sum axis (P3)
**Trigger:** "reach an exact amount / target" using items, once each or unlimited.
**Invariant:** `dp[s]` is the answer for sum `s` using the items processed so far.
**Write:** Coin Change II (unbounded, count combinations) and Partition Equal Subset Sum (0/1, feasibility).
<details><summary>Answer</summary>

```python
dp = [0] * (amount + 1); dp[0] = 1
for c in coins:                          # item outer -> combinations counted once
    for s in range(c, amount + 1):       # ascending -> reuse allowed
        dp[s] += dp[s - c]
return dp[amount]

total = sum(nums)
if total % 2: return False               # odd total: no equal partition
target = total // 2
dp = [False] * (target + 1); dp[0] = True
for x in nums:
    for s in range(target, x - 1, -1):   # descending -> each item used once
        dp[s] = dp[s] or dp[s - x]
return dp[target]
```
**Check:** the parity guard is code, not commentary: without it `sum // 2` rounds down and `[1, 2]` returns True · ascending vs descending inner loop (unbounded vs 0/1) only matters for a 1-D rolling array; with a 2-D table you read row `i-1` explicitly · loop order only matters for *counting*: item-outer counts combinations, amount-outer counts permutations (Combination Sum IV 377); for min (Coin Change) or feasibility either order is correct.
</details>
Run on: Coin Change II 518 · Partition Equal Subset Sum 416 · Target Sum 494 (reduce to subset count; guard `(total + target) % 2 == 0` and `abs(target) <= total`).

### Card 7 · Two-sequence `(i, j)` grid (P3)
**Trigger:** two strings and a relationship between them.
**Invariant:** `dp[i][j]` is the answer for `s[i:]` versus `t[j:]`. For Interleaving, `dp[i][j]` is whether `s1[i:]` and `s2[j:]` interleave to `s3[i+j:]`.
**Write:** LCS. Then Edit Distance, Distinct Subsequences, Interleaving String, Regex Matching, noting the base row/column and the branch bodies for each.
<details><summary>Answer</summary>

```python
dp = [[0] * (len(t) + 1) for _ in range(len(s) + 1)]
for i in range(len(s) - 1, -1, -1):
    for j in range(len(t) - 1, -1, -1):
        if s[i] == t[j]:
            dp[i][j] = 1 + dp[i + 1][j + 1]
        else:
            dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])
return dp[0][0]

m, n = len(s), len(t)                      # Edit Distance 72
dp = [[0] * (n + 1) for _ in range(m + 1)]
for i in range(m + 1): dp[i][n] = m - i    # delete the rest of s
for j in range(n + 1): dp[m][j] = n - j    # insert the rest of t
for i in range(m - 1, -1, -1):
    for j in range(n - 1, -1, -1):
        if s[i] == t[j]: dp[i][j] = dp[i + 1][j + 1]
        else: dp[i][j] = 1 + min(dp[i + 1][j], dp[i][j + 1], dp[i + 1][j + 1])
return dp[0][0]

m, n = len(s), len(t)                      # Distinct Subsequences 115: count t in s
dp = [[0] * (n + 1) for _ in range(m + 1)]
for i in range(m + 1): dp[i][n] = 1        # empty t occurs once in any suffix
for i in range(m - 1, -1, -1):
    for j in range(n - 1, -1, -1):
        dp[i][j] = dp[i + 1][j]            # skip s[i]
        if s[i] == t[j]: dp[i][j] += dp[i + 1][j + 1]
return dp[0][0]

m, n = len(s1), len(s2)                    # Interleaving String 97
if m + n != len(s3): return False
dp = [[False] * (n + 1) for _ in range(m + 1)]
dp[m][n] = True
for i in range(m, -1, -1):                 # last row and column are NOT constant here
    for j in range(n, -1, -1):
        if i < m and s1[i] == s3[i + j] and dp[i + 1][j]: dp[i][j] = True
        if j < n and s2[j] == s3[i + j] and dp[i][j + 1]: dp[i][j] = True
return dp[0][0]

m, n = len(s), len(p)                      # Regex Matching 10 (p = pattern)
dp = [[False] * (n + 1) for _ in range(m + 1)]
dp[m][n] = True                             # empty text matches empty pattern
for i in range(m, -1, -1):                  # row m is NOT constant: "a*" can match empty
    for j in range(n - 1, -1, -1):
        first = i < m and p[j] in (s[i], '.')
        if j + 1 < n and p[j + 1] == '*':
            dp[i][j] = dp[i][j + 2] or (first and dp[i + 1][j])
        else:
            dp[i][j] = first and dp[i + 1][j + 1]
return dp[0][0]
```
**Check:** one extra row and column for the empty-suffix base case · iterate so `i+1, j+1` are already filled · across the family the **base row/column and the branch bodies** both change: LCS base is 0; Edit Distance base is the remaining length; Distinct Subsequences base column is 1; Interleaving's and Regex's last row/column are *not* constant, so their loops start at `m`/`n` themselves (with `i < m` / `j < n` guards) instead of `m-1`/`n-1` · Regex's `*` branch looks two columns ahead (`dp[i][j+2]`) to try "zero occurrences" before falling back to the plain match.
</details>
Run on: LCS 1143 · Edit Distance 72 · Distinct Subsequences 115 · Interleaving String 97 · Regular Expression Matching 10.

---

## MOVE 2 — Eliminate

### Card 8 · Binary search, first-true form (P4)
**Trigger:** a predicate over a range that is False...False True...True; you want the boundary.
**Invariant:** the answer is in `[lo, hi]`; `lo` moves past proven-false values, `hi` stays on possibly-true values.
**Write:** the generic form, then Koko Eating Bananas.
<details><summary>Answer</summary>

```python
lo, hi = 1, max(piles)
while lo < hi:
    mid = (lo + hi) // 2
    if sum(-(-p // mid) for p in piles) <= h:   # ok(mid): feasible
        hi = mid
    else:
        lo = mid + 1
return lo
```
**Check:** `while lo < hi` pairs with `hi = mid`; `while lo <= hi` pairs with `hi = mid - 1` and an explicit `res` · state why the predicate is monotone · range is `[smallest possible answer, largest possible answer]`, and `hi` must be feasible: `max(piles)` is, because it eats one pile per hour and `h ≥ len(piles)`.
</details>
Run on: Koko 875 · Search Insert Position 35 (outside) as a warm-up.

### Card 9 · Binary search, exact match and rotated variant (P4)
**Trigger:** sorted array, find a value; or sorted-then-rotated, find the min or a target.
**Invariant:** the target, if present, is in `[l, r]`.
**Write:** classic binary search, then Find Minimum in Rotated Sorted Array.
<details><summary>Answer</summary>

```python
l, r = 0, len(nums) - 1
while l <= r:
    m = (l + r) // 2
    if nums[m] == target: return m
    if nums[m] < target: l = m + 1
    else:                r = m - 1
return -1

l, r = 0, len(nums) - 1
while l < r:
    m = (l + r) // 2
    if nums[m] > nums[r]: l = m + 1     # min is to the right of m
    else:                 r = m         # m could be the min
return nums[l]
```
**Check:** compare `mid` to the **right** end for the rotated min · for a rotated *target* search, first decide which half is sorted, then check whether the target lies in that half's range · duplicates break the rotated test.
</details>
Run on: Binary Search 704 · Find Min in Rotated 153 · Search in Rotated 33.

### Card 10 · Two pointers converging (P5)
**Trigger:** sorted array plus pair/triplet target; or a mirror check; or "maximize something between two ends".
**Invariant:** every pair with an index outside `[l, r]` has been ruled out.
**Write:** Two Sum II, then the 3Sum wrapper with duplicate skipping.
<details><summary>Answer</summary>

```python
l, r = 0, len(a) - 1
while l < r:
    s = a[l] + a[r]
    if s == target: return [l + 1, r + 1]
    if s < target: l += 1
    else:          r -= 1

nums.sort(); res = []
for i in range(len(nums)):
    if nums[i] > 0: break                   # sorted: no triple can sum to 0 now
    if i and nums[i] == nums[i - 1]: continue
    l, r = i + 1, len(nums) - 1
    while l < r:
        s = nums[i] + nums[l] + nums[r]
        if s < 0: l += 1
        elif s > 0: r -= 1
        else:
            res.append([nums[i], nums[l], nums[r]])
            l += 1; r -= 1
            while l < r and nums[l] == nums[l - 1]: l += 1
return res
```
**Check:** say the elimination argument out loud (why can the dropped end never be part of an answer?) · skip duplicates at the outer level *and* on `l` after recording a triple (deduping `r` as well is harmless but unnecessary: once `l` is fresh, the matching `r` is forced) · for Container With Most Water move the shorter wall.
</details>
Run on: Two Sum II 167 · 3Sum 15 · Container 11.

### Card 11 · Monotonic stack, next greater (P6)
**Trigger:** "next greater/smaller for every index", "largest rectangle", "max of every window".
**Invariant:** the stack holds indices whose answer is unknown, in non-increasing value order bottom to top (equal values stay, because the pop test is strict `<`).
**Write:** Daily Temperatures. Then say what changes for Largest Rectangle.
<details><summary>Answer</summary>

```python
res = [0] * len(T)
stack = []                                  # indices, non-increasing temps
for i, t in enumerate(T):
    while stack and T[stack[-1]] < t:
        j = stack.pop()
        res[j] = i - j
    stack.append(i)
return res
```
Histogram: stack of `(start, height)` increasing; a shorter bar pops taller ones and finalizes `height * (i - start)`; the popped `start` becomes the new bar's start; drain at the end with right edge `n`.
**Check:** store indices, not values · `<` vs `<=` decides equal-element behavior: popping on `<` leaves equal values on the stack (non-increasing, "strictly greater" answers), popping on `<=` makes the stack strictly decreasing · drain the stack at the end.
</details>
Run on: Daily Temperatures 739 · Largest Rectangle 84 · Sliding Window Maximum 239 (the deque holds **indices**, because the front-eviction test `q[0] <= r - k` only works on indices; full template on Card 34).

### Card 12 · Greedy frontier and reset-on-negative (P7)
**Trigger:** "can you reach the end / min jumps", "circular route with a running balance".
**Invariant:** frontier = farthest index reachable (or leftmost that reaches the end); `run` = balance since the last reset.
**Write:** Jump Game backward, Jump Game II layered, Gas Station.
<details><summary>Answer</summary>

```python
goal = len(nums) - 1
for i in range(len(nums) - 2, -1, -1):
    if i + nums[i] >= goal: goal = i
return goal == 0

l = r = jumps = 0
while r < len(nums) - 1:
    far = max(i + nums[i] for i in range(l, r + 1))
    l, r = r + 1, far
    jumps += 1
return jumps

if sum(gas) < sum(cost): return -1
tank = start = 0
for i in range(len(gas)):
    tank += gas[i] - cost[i]
    if tank < 0: tank, start = 0, i + 1
return start
```
**Check:** state the exchange argument in one sentence · Jump Game II's window `[l, r]` is one BFS layer, and the loop relies on 45's guarantee that the end is reachable (if it were not, `range(l, r + 1)` goes empty and `max()` raises) · Gas Station needs the global feasibility check first.
</details>
Run on: Jump Game 55 · Jump Game II 45 · Gas Station 134.

---

## MOVE 3 — Sweep

### Card 13 · Sliding window, maximize and minimize (P8)
**Trigger:** contiguous + condition + longest/shortest/count.
**Invariant (max):** `[l, r]` is valid after the shrink loop. **(min):** after the shrink loop, `[l-1, r]` is the shortest valid window ending at `r` (if any window ending at `r` is valid); `[l, r]` itself is invalid.
**Write:** Longest Substring Without Repeating, then Minimum Window Substring.
<details><summary>Answer</summary>

```python
seen, l, best = set(), 0, 0
for r, c in enumerate(s):
    while c in seen:
        seen.remove(s[l]); l += 1
    seen.add(c)
    best = max(best, r - l + 1)
return best

need = collections.Counter(t); have, req = 0, len(need)
win = {}; l = 0; best = (0, float('inf'))
for r, c in enumerate(s):
    win[c] = win.get(c, 0) + 1
    if c in need and win[c] == need[c]: have += 1
    while have == req:                          # valid: record, then shrink
        if r - l + 1 < best[1] - best[0]: best = (l, r + 1)
        win[s[l]] -= 1
        if s[l] in need and win[s[l]] < need[s[l]]: have -= 1
        l += 1
return s[best[0]:best[1]] if best[1] != float('inf') else ""
```
**Check:** maximize shrinks *while invalid*; minimize shrinks *while valid* · `have/need` makes validity O(1) · guard the no-window case: slicing with `inf` raises `TypeError` · decrement counts on shrink, and the condition must be monotone in the window (negatives break it; use Card 28).
</details>
Run on: Longest Substring 3 · Longest Repeating Replacement 424 · Minimum Window 76.

### Card 14 · Sort then scan: merge intervals, select intervals, sweep line (P9)
**Trigger:** `[start, end]` pairs; "merge", "rooms", "overlap", "remove the fewest".
**Invariant:** `out[-1]` is the merged block for everything processed; in the select scan, `prev_end` is the end of the last kept interval; in the sweep, `cur` is the number active at the current time.
**Write:** Merge Intervals, Non-overlapping Intervals, then Meeting Rooms II as events.
<details><summary>Answer</summary>

```python
iv.sort()
out = []
for s, e in iv:
    if out and s <= out[-1][1]: out[-1][1] = max(out[-1][1], e)
    else:                       out.append([s, e])
return out

iv.sort()                                   # 435, canonical: sort by start
removed, prev_end = 0, float('-inf')
for s, e in iv:
    if s >= prev_end: prev_end = e          # no overlap: keep it
    else:                                   # overlap: drop the one ending later
        removed += 1; prev_end = min(prev_end, e)
return removed

ev = [(s, 1) for s, e in iv] + [(e, -1) for s, e in iv]
ev.sort()                                   # (t, -1) before (t, +1): end frees a room first
cur = best = 0
for _, d in ev:
    cur += d; best = max(best, cur)
return best
```
**Check:** to pick a max non-overlapping set, both orders work: sort by start and on conflict keep the smaller end (above, canonical), or sort by end and greedily keep every interval that starts at or after the last kept end · tie order in the sweep decides whether touching intervals overlap · `out[-1][1] = ...` mutates in place, so it needs list elements: appending a fresh `[s, e]` (not the input pair) makes tuple input safe, and starting from `out = []` with the `if out` guard handles empty input (`out = [iv[0]]` would raise `IndexError`) · Insert Interval is this with the input already sorted.
</details>
Run on: Merge Intervals 56 · Non-overlapping Intervals 435 · Meeting Rooms II 253 · Insert Interval 57.

### Card 15 · Heap: bounded top-k, k-way merge, two heaps (P10)
**Trigger:** "k largest / closest", "merge k sorted", "running median".
**Invariant:** the heap holds exactly the eligible candidates; its root is the best.
**Write:** all three skeletons.
<details><summary>Answer</summary>

```python
h = []
for x in nums:
    heapq.heappush(h, x)
    if len(h) > k: heapq.heappop(h)         # min-heap keeps the k largest
return h[0]

h = [(node.val, i, node) for i, node in enumerate(lists) if node]
heapq.heapify(h); dummy = cur = ListNode()
while h:
    _, i, node = heapq.heappop(h)
    cur.next = node; cur = node
    if node.next: heapq.heappush(h, (node.next.val, i, node.next))
return dummy.next

small, large = [], []                        # max-heap (negated), min-heap
def add(x):
    heapq.heappush(small, -x)
    heapq.heappush(large, -heapq.heappop(small))
    if len(large) > len(small): heapq.heappush(small, -heapq.heappop(large))
def median():
    return -small[0] if len(small) > len(large) else (-small[0] + large[0]) / 2
```
**Check:** "k largest" uses a **min**-heap · put a tiebreaker index in tuples so payloads are never compared: in the k-way merge, list `i` has at most one entry in the heap at a time, so `(val, i)` is unique and `node` is never reached · negate for a max-heap. Quickselect alternative for 215: Card 31.
</details>
Run on: Kth Largest 215 · Merge K Lists 23 · Find Median 295.

---

## MOVE 4 — Decompose

### Card 16 · Tree post-order with a global best (P11)
**Trigger:** a per-node property defined by its children, plus a global optimum that differs from what the parent needs.
**Invariant:** the return value is the summary the parent needs; `best` is updated with the node-centered answer.
**Write:** Diameter. Then Max Path Sum, and say what changes for Balanced.
<details><summary>Answer</summary>

```python
best = 0
def dfs(node):
    nonlocal best
    if not node: return 0
    L, R = dfs(node.left), dfs(node.right)
    best = max(best, L + R)              # through this node
    return 1 + max(L, R)                 # height, for the parent
dfs(root); return best

best = root.val                          # NOT 0: an all-negative tree must return its max node
def gain(node):
    nonlocal best
    if not node: return 0
    L, R = max(gain(node.left), 0), max(gain(node.right), 0)
    best = max(best, node.val + L + R)
    return node.val + max(L, R)
gain(root); return best
```
Balanced: return `(ok, height)` tuples.
**Check:** `nonlocal` or a one-element list · clip negative contributions when summing values, and init `best` to `root.val` (or `-inf`) for Max Path Sum, since `best = 0` returns 0 on `[-3]` · Diameter counts **edges**: `dfs` returns height in nodes, so `L + R` is the edge count of the path through this node · decide the return type before coding.
</details>
Run on: Diameter 543 · Max Path Sum 124 · Balanced 110.

### Card 17 · Tree top-down with inherited bounds (P11)
**Trigger:** a per-node property defined by its ancestors (valid range, max on path).
**Invariant:** the parameters describe exactly the constraint inherited from all ancestors.
**Write:** Validate BST, then Count Good Nodes.
<details><summary>Answer</summary>

```python
def valid(node, lo, hi):
    if not node: return True
    if not (lo < node.val < hi): return False
    return valid(node.left, lo, node.val) and valid(node.right, node.val, hi)
return valid(root, float('-inf'), float('inf'))

def good(node, mx):
    if not node: return 0
    cnt = 1 if node.val >= mx else 0
    mx = max(mx, node.val)
    return cnt + good(node.left, mx) + good(node.right, mx)
return good(root, root.val)
```
**Check:** strict inequalities for the BST · the bound tightens on one side only per child · in-order traversal of a BST is sorted (alternate solution, and Kth Smallest; iterative in-order on Card 30).
</details>
Run on: Validate BST 98 · Count Good Nodes 1448 · Kth Smallest 230.

### Card 18 · BFS level order with a queue snapshot (P11 / P13)
**Trigger:** "by level", "right side view", "minimum depth".
**Invariant:** at the top of the outer loop the queue holds exactly one level.
**Write:** Level Order Traversal.
<details><summary>Answer</summary>

```python
res, q = [], collections.deque([root] if root else [])
while q:
    level = []
    for _ in range(len(q)):
        node = q.popleft()
        level.append(node.val)
        if node.left:  q.append(node.left)
        if node.right: q.append(node.right)
    res.append(level)
return res
```
**Check:** snapshot `len(q)` before the inner loop · guard the empty root · Right Side View keeps `level[-1]`.
</details>
Run on: Level Order 102 · Right Side View 199.

### Card 19 · Backtracking: choose, explore, undo, prune, dedupe (P12)
**Trigger:** "return all subsets / combinations / permutations / partitions".
**Invariant:** `path` is exactly the choices from the root to the current node.
**Write:** Subsets (include/exclude), Combination Sum II (start index, sorted dedupe, prune), Permutations (used set).
<details><summary>Answer</summary>

```python
def subsets(i):
    if i == len(nums): res.append(path[:]); return
    path.append(nums[i]); subsets(i + 1); path.pop()
    subsets(i + 1)

cands.sort()
def comb(start, remain):
    if remain == 0: res.append(path[:]); return
    for i in range(start, len(cands)):
        if cands[i] > remain: break                      # prune (sorted)
        if i > start and cands[i] == cands[i - 1]: continue   # dedupe same level
        path.append(cands[i]); comb(i + 1, remain - cands[i]); path.pop()

def perm():
    if len(path) == len(nums): res.append(path[:]); return
    for i in range(len(nums)):
        if used[i]: continue
        used[i] = True; path.append(nums[i])
        perm()
        path.pop(); used[i] = False
```
**Check:** copy at the leaf only · `comb(i, ...)` allows reuse, `comb(i + 1, ...)` forbids it · dedupe compares to the previous value at the *same level* (`i > start`).
</details>
Run on: Subsets 78 · Combination Sum II 40 · Permutations 46 · N-Queens 51.

---

## MOVE 5 — Model as a graph

### Card 20 · Grid DFS flood fill (P13)
**Trigger:** grid, "connected", "islands", "regions".
**Invariant:** visited cells are exactly those already attributed to a component.
**Write:** Number of Islands, marking in place.
<details><summary>Answer</summary>

```python
R, C = len(g), len(g[0])
def fill(r, c):
    if not (0 <= r < R and 0 <= c < C) or g[r][c] != '1': return 0
    g[r][c] = '0'
    fill(r+1, c); fill(r-1, c); fill(r, c+1); fill(r, c-1)
    return 1
return sum(fill(r, c) for r in range(R) for c in range(C))
```
**Check:** bounds check before indexing · mark before recursing · return the size instead of 1 for Max Area; use a `seen` set if the input must not be mutated · recursion depth = component size: an all-land 300×300 grid (legal for 200) needs depth 90,000 and raises `RecursionError` under the default limit of 1000, so for big grids use the explicit-stack version on Card 30 (or BFS).
</details>
Run on: Number of Islands 200 · Max Area 695 · Surrounded Regions 130 (fill from the border).

### Card 21 · Multi-source BFS, layers as time (P13)
**Trigger:** "spreads from several sources", "distance to the nearest X", "minimum steps".
**Invariant:** everything in the queue at the start of round `d` is at distance `d`.
**Write:** Rotting Oranges.
<details><summary>Answer</summary>

```python
q = collections.deque(); fresh = 0
for r in range(R):
    for c in range(C):
        if g[r][c] == 1: fresh += 1
        elif g[r][c] == 2: q.append((r, c))
t = 0
while q and fresh:
    for _ in range(len(q)):
        r, c = q.popleft()
        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and g[nr][nc] == 1:
                g[nr][nc] = 2; fresh -= 1; q.append((nr, nc))
    t += 1
return t if fresh == 0 else -1
```
**Check:** mark visited when enqueuing · seed with **all** sources before the loop · stop when nothing fresh remains so the count isn't off by one.
</details>
Run on: Rotting Oranges 994 · Walls and Gates 286 · Word Ladder 127.

### Card 22 · Topological sort with an on-path cycle set (P14)
**Trigger:** "prerequisites", "order", "can all be finished".
**Invariant:** every node in `order` has all its dependencies already in `order`; `on_path` is the current recursion stack.
**Write:** Course Schedule II.
<details><summary>Answer</summary>

```python
adj = {c: [] for c in range(n)}
for crs, pre in prereqs: adj[crs].append(pre)
order, done, on_path = [], set(), set()
def dfs(u):
    if u in on_path: return False
    if u in done:    return True
    on_path.add(u)
    for v in adj[u]:
        if not dfs(v): return False
    on_path.remove(u); done.add(u); order.append(u)
    return True
for c in range(n):
    if not dfs(c): return []
return order
```
**Check:** two sets, not one: `on_path` detects cycles, `done` memoizes · post-order gives dependencies first; reverse if the edges point the other way · recursion depth = longest prerequisite chain: a 2000-course chain (legal for 207/210) raises `RecursionError` under the default limit, so in Python prefer Kahn's in-degree queue (Card 29), which is iterative and what most interviewers expect.
</details>
Run on: Course Schedule 207 · Course Schedule II 210 · Alien Dictionary 269.

### Card 23 · Union-Find (P14)
**Trigger:** undirected edge list; "components", "is it a tree", "which edge closes a cycle".
**Invariant:** `find(x) == find(y)` iff `x` and `y` are connected by the edges processed so far.
**Write:** find with path compression, union by size, then Redundant Connection.
<details><summary>Answer</summary>

```python
parent = list(range(n + 1)); size = [1] * (n + 1)
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x
def union(a, b):
    ra, rb = find(a), find(b)
    if ra == rb: return False
    if size[ra] < size[rb]: ra, rb = rb, ra
    parent[rb] = ra; size[ra] += size[rb]
    return True
for a, b in edges:
    if not union(a, b): return [a, b]
```
**Check:** always compress paths · components = `n - successful unions` · tree ⇔ `n - 1` edges and every union succeeds.
</details>
Run on: Redundant Connection 684 · Connected Components 323 · Graph Valid Tree 261.

### Card 24 · Dijkstra and k-round Bellman-Ford (P15)
**Trigger:** weighted "minimum time/cost to reach"; add a hop limit for the second.
**Invariant:** Dijkstra: popped nodes have final costs. Bellman-Ford: after round `i`, `dist[v]` uses at most `i` edges.
**Write:** Network Delay Time, then Cheapest Flights Within K Stops.
<details><summary>Answer</summary>

```python
adj = collections.defaultdict(list)
for u, v, w in times: adj[u].append((v, w))
h, done, t = [(0, k)], set(), 0
while h:
    d, u = heapq.heappop(h)
    if u in done: continue
    done.add(u); t = d
    for v, w in adj[u]:
        if v not in done: heapq.heappush(h, (d + w, v))
return t if len(done) == n else -1

dist = [float('inf')] * n; dist[src] = 0
for _ in range(k + 1):
    nxt = dist[:]
    for u, v, w in flights:
        if dist[u] + w < nxt[v]: nxt[v] = dist[u] + w
    dist = nxt
return -1 if dist[dst] == float('inf') else dist[dst]
```
**Check:** skip stale heap entries with `if u in done` · swap `d + w` for `max(d, w)` for bottleneck paths, or push `w` alone for Prim's MST, where you add `w` to the total on each successful (non-stale) pop and stop once `len(done) == n` · Bellman-Ford must relax off a **snapshot** of the previous round · Dijkstra with a stop count in the state: Card 36.
</details>
Run on: Network Delay 743 · Swim in Rising Water 778 · Cheapest Flights 787 · Min Cost to Connect 1584.

---

## MOVE 6 — Manipulate in place

### Card 25 · Linked list: reverse, fast/slow, gap with dummy (P16)
**Trigger:** any singly linked list problem.
**Invariant:** reverse: `prev` heads the reversed prefix. fast/slow: `fast` is twice as far. gap: `right` is `n+1` ahead of `left` (which starts on the dummy), so `left` stops on the node *before* the one to delete.
**Write:** all three.
<details><summary>Answer</summary>

```python
prev, cur = None, head
while cur:
    nxt = cur.next; cur.next = prev; prev, cur = cur, nxt
return prev

slow = fast = head
while fast and fast.next:
    slow, fast = slow.next, fast.next.next
    if slow is fast: return True        # cycle
return False                            # slow is the middle when fast falls off

dummy = ListNode(0, head); left, right = dummy, head
for _ in range(n): right = right.next
while right: left, right = left.next, right.next
left.next = left.next.next
return dummy.next
```
**Check:** save `next` before overwriting · check `fast.next` before `fast.next.next` · return `dummy.next`. To find where the cycle *starts* (142, 287), add Floyd's phase 2: Card 36.
</details>
Run on: Reverse 206 · Linked List Cycle 141 · Remove Nth 19 · Reorder List 143 (all three in one problem).

### Card 26 · XOR survivor, popcount, counting bits (P17)
**Trigger:** "appears twice except one", "missing from 0..n", "count set bits".
**Invariant:** `res` is the XOR of everything so far; paired values have cancelled.
**Write:** Single Number, Missing Number, Number of 1 Bits, Counting Bits.
<details><summary>Answer</summary>

```python
res = 0
for x in nums: res ^= x                  # single number
return res

res = len(nums)
for i, x in enumerate(nums): res ^= i ^ x   # missing number
return res

x, cnt = n, 0
while x: x &= x - 1; cnt += 1            # popcount (x is a copy; n survives)
return cnt

dp = [0] * (n + 1)
for i in range(1, n + 1): dp[i] = dp[i >> 1] + (i & 1)
return dp
```
**Check:** XOR is order-independent · `n & (n-1)` clears the lowest set bit (a memorized fact) · `i >> 1` drops the lowest bit, `i & 1` is that bit · do not reuse a variable a previous snippet consumed.
</details>
Run on: Single Number 136 · Missing Number 268 · Number of 1 Bits 191 · Counting Bits 338.

### Card 27 · Digit-by-digit arithmetic with carry (P17 / P16)
**Trigger:** numbers as strings, digit arrays, or linked lists; "plus one", "add", "multiply", "reverse integer with overflow".
**Invariant:** every position to the right of the current one is final; `carry` holds the overflow.
**Write:** Add Two Numbers (lists), the overflow guard for Reverse Integer, and the Multiply Strings accumulator.
<details><summary>Answer</summary>

```python
dummy = cur = ListNode(); carry = 0
while l1 or l2 or carry:
    v = (l1.val if l1 else 0) + (l2.val if l2 else 0) + carry
    carry, d = divmod(v, 10)
    cur.next = ListNode(d); cur = cur.next
    l1 = l1.next if l1 else None
    l2 = l2.next if l2 else None
return dummy.next

INT_MAX = 2**31 - 1
res, sign, x = 0, (1 if x >= 0 else -1), abs(x)
while x:
    x, d = divmod(x, 10)
    if res > (INT_MAX - d) // 10: return 0      # check BEFORE the multiply
    res = res * 10 + d
return sign * res

if num1 == "0" or num2 == "0": return "0"
res = [0] * (len(num1) + len(num2))
for i in range(len(num1) - 1, -1, -1):
    for j in range(len(num2) - 1, -1, -1):
        res[i + j + 1] += int(num1[i]) * int(num2[j])
        res[i + j] += res[i + j + 1] // 10     # push the carry left
        res[i + j + 1] %= 10
return "".join(map(str, res)).lstrip("0")
```
**Check:** loop `while ... or carry` so the final carry is emitted · check overflow before the operation · the magnitude check against `INT_MAX` is also correct for negatives: the asymmetric bound −2^31 is unreachable from a 32-bit input (it would need x = −8463847412), so do not "fix" it · Python ints never overflow, so the pre-multiply check is interview ritual; checking the final `res` against the range is equivalent in Python · Multiply Strings: digits `i` and `j` land in `res[i + j + 1]`, carry into `res[i + j]`.
</details>
Run on: Add Two Numbers 2 · Plus One 66 · Reverse Integer 7 · Multiply Strings 43.

---

## ADDED AFTER REVIEW — Cards 28–36

*Gaps the review found: idioms the principles and contrasts rely on that no card taught, plus iterative versions of the recursive cards that overflow Python's stack. Each card is tagged with its principle.*

### Card 28 · Prefix sum + hashmap of earlier prefixes (P1 + P2)
**Trigger:** "count / longest subarray with sum (or balance) exactly k", especially with negatives, where a sliding window's monotonicity fails.
**Invariant:** before processing index `i`, `cnt[p]` is the number of prefixes `nums[:j]` (`j ≤ i`) with sum `p`; a subarray ending at `i` sums to `k` iff an earlier prefix equals `pre - k`.
**Write:** Subarray Sum Equals K, then Contiguous Array (longest, so store the first index instead of a count).
<details><summary>Answer</summary>

```python
cnt, pre, res = {0: 1}, 0, 0
for x in nums:
    pre += x
    res += cnt.get(pre - k, 0)           # look up BEFORE inserting
    cnt[pre] = cnt.get(pre, 0) + 1
return res

first, pre, best = {0: -1}, 0, 0         # prefix balance -> earliest index
for i, x in enumerate(nums):
    pre += 1 if x == 1 else -1
    if pre in first: best = max(best, i - first[pre])
    else: first[pre] = i                 # keep the earliest only
return best
```
**Check:** the `{0: 1}` seed (or `{0: -1}` for longest) stands for the empty prefix, so subarrays starting at index 0 are counted · look up before inserting, or `k = 0` counts the empty subarray · for "longest" never overwrite the first index; for "count" always increment.
</details>
Run on: Subarray Sum Equals K 560 (outside) · Contiguous Array 525 (outside) · Continuous Subarray Sum 523 (outside; key on `pre % k`).

### Card 29 · Kahn's BFS topological sort (P14)
**Trigger:** same as Card 22 ("prerequisites", "order", "can all be finished"), in Python by default, since it has no recursion depth limit.
**Invariant:** the queue holds exactly the unprocessed nodes whose in-degree has dropped to 0; every node in `order` appears after all its prerequisites.
**Write:** Course Schedule II, then Course Schedule by changing the return.
<details><summary>Answer</summary>

```python
adj = [[] for _ in range(n)]; indeg = [0] * n
for crs, pre in prereqs:
    adj[pre].append(crs); indeg[crs] += 1      # edge pre -> crs
q = collections.deque(i for i in range(n) if indeg[i] == 0)
order = []
while q:
    u = q.popleft(); order.append(u)
    for v in adj[u]:
        indeg[v] -= 1
        if indeg[v] == 0: q.append(v)
return order if len(order) == n else []      # 207: return len(order) == n
```
**Check:** point edges from prerequisite to dependent so `order` needs no reversal · seed the queue with **every** in-degree-0 node · a cycle shows up as `len(order) < n`, because nodes on a cycle never reach in-degree 0.
</details>
Run on: Course Schedule 207 · Course Schedule II 210 · Alien Dictionary 269 (build edges from adjacent words first).

### Card 30 · Iterative DFS: explicit stack on a grid, iterative in-order (P13 / P11)
**Trigger:** any recursive DFS whose depth can reach the input size (grids up to 300×300, skewed trees, long chains); "kth smallest in a BST".
**Invariant:** grid: every cell on the stack is land already marked visited and still has neighbors to push. In-order: the stack holds the ancestors whose left subtree is being visited, and they are not yet visited themselves; nodes pop in sorted order.
**Write:** Number of Islands with a stack, then Kth Smallest with the iterative in-order loop.
<details><summary>Answer</summary>

```python
R, C = len(g), len(g[0]); count = 0
for sr in range(R):
    for sc in range(C):
        if g[sr][sc] != '1': continue
        count += 1; g[sr][sc] = '0'; stack = [(sr, sc)]
        while stack:
            r, c = stack.pop()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < R and 0 <= nc < C and g[nr][nc] == '1':
                    g[nr][nc] = '0'; stack.append((nr, nc))   # mark on push
return count

stack, cur = [], root
while stack or cur:
    while cur:                      # go left as far as possible
        stack.append(cur); cur = cur.left
    cur = stack.pop()               # visit
    k -= 1
    if k == 0: return cur.val
    cur = cur.right                 # then the right subtree
```
**Check:** mark when pushing, not when popping, or a cell is pushed once per neighbor · swapping `stack.pop()` for `deque.popleft()` turns it into BFS with no other change · in-order is "left all the way, pop, visit, go right", and the loop condition is `stack or cur`.
</details>
Run on: Number of Islands 200 (iterative) · Kth Smallest in BST 230 · Binary Tree Inorder Traversal 94 (outside) · Max Area of Island 695.

### Card 31 · Quickselect with random pivot and three-way partition (P10 / P4)
**Trigger:** "kth largest / smallest" on a static array when you want O(n) expected, not O(n log k).
**Invariant:** the answer's sorted index `target` is always in `[lo, hi]`; after partitioning, `[lo, lt)` < pivot, `[lt, gt]` == pivot, `(gt, hi]` > pivot.
**Write:** Kth Largest Element in an Array.
<details><summary>Answer</summary>

```python
target = len(nums) - k                  # kth largest = this index in ascending order
lo, hi = 0, len(nums) - 1
while True:
    p = nums[random.randint(lo, hi)]    # random pivot
    lt, i, gt = lo, lo, hi
    while i <= gt:                      # Dutch national flag partition
        if nums[i] < p:
            nums[lt], nums[i] = nums[i], nums[lt]; lt += 1; i += 1
        elif nums[i] > p:
            nums[gt], nums[i] = nums[i], nums[gt]; gt -= 1
        else:
            i += 1
    if target < lt:   hi = lt - 1
    elif target > gt: lo = gt + 1
    else:             return p
```
**Check:** O(n) expected, **O(n²) worst case**. A random pivot defeats sorted input, and the three-way partition defeats all-equal input: 215 has both adversarial tests, and they time out a fixed-pivot Lomuto version · do not advance `i` after swapping with `gt`, because the swapped-in element is unexamined · need the k best *in order* → sort; a stream → heap (Card 15).
</details>
Run on: Kth Largest 215 · K Closest Points 973 (quickselect on distance) · Top K Frequent 347 (on counts).

### Card 32 · Longest Increasing Subsequence: O(n²) DP and O(n log n) patience (P3 + P4)
**Trigger:** one sequence, "longest increasing / chain / nested", subsequence (not contiguous).
**Invariant:** DP: `dp[i]` is the LIS length ending exactly at `i`. Patience: `tails[L]` is the smallest possible tail of an increasing subsequence of length `L + 1`, so `tails` is strictly increasing.
**Write:** the O(n²) DP, then the `bisect_left` version.
<details><summary>Answer</summary>

```python
dp = [1] * len(nums)
for i in range(len(nums)):
    for j in range(i):
        if nums[j] < nums[i]: dp[i] = max(dp[i], dp[j] + 1)
return max(dp, default=0)

tails = []
for x in nums:
    i = bisect.bisect_left(tails, x)
    if i == len(tails): tails.append(x)       # extends the longest
    else:               tails[i] = x          # a better (smaller) tail for length i+1
return len(tails)
```
**Check:** `bisect_left` for strictly increasing, `bisect_right` for non-decreasing · `tails` is not itself an LIS, only its length is meaningful · the DP is dp-over-predecessors; two sequences would mean the `(i, j)` grid instead (Card 7).
</details>
Run on: Longest Increasing Subsequence 300 · Russian Doll Envelopes 354 (outside; sort width asc, height desc, then LIS on heights) · Number of LIS 673 (outside; O(n²) DP with counts).

### Card 33 · Trie: insert, search, startsWith, wildcard branch (P1)
**Trigger:** many words sharing prefixes; "starts with", "autocomplete", "word with wildcards", "find all words on a board".
**Invariant:** the node reached by walking `s` from the root exists iff some inserted word has prefix `s`; the end marker `'$'` is in it iff `s` itself was inserted.
**Write:** Implement Trie, then the `'.'` wildcard search.
<details><summary>Answer</summary>

```python
class Trie:
    def __init__(self):
        self.root = {}
    def insert(self, word):
        node = self.root
        for c in word: node = node.setdefault(c, {})
        node['$'] = True                      # end-of-word marker
    def _walk(self, s):
        node = self.root
        for c in s:
            if c not in node: return None
            node = node[c]
        return node
    def search(self, word):
        node = self._walk(word)
        return node is not None and '$' in node
    def startsWith(self, prefix):
        return self._walk(prefix) is not None

def search(node, word, i=0):                  # 211: '.' matches any one letter
    if i == len(word): return '$' in node
    if word[i] == '.':
        return any(search(child, word, i + 1) for c, child in node.items() if c != '$')
    return word[i] in node and search(node[word[i]], word, i + 1)
```
**Check:** `search` requires the end marker, `startsWith` does not · the wildcard branch must skip the `'$'` key, whose value is not a child dict · Word Search II 212: after finding a word, delete its end marker (and prune empty leaves) so the board DFS never revisits it.
</details>
Run on: Implement Trie 208 · Design Add and Search Words 211 · Word Search II 212.

### Card 34 · Monotonic deque: sliding window maximum (P6 + P8)
**Trigger:** "max (or min) of every window of size k".
**Invariant:** `q` holds **indices** inside the window `[r-k+1, r]` whose values are strictly decreasing front to back; `nums[q[0]]` is the window max.
**Write:** Sliding Window Maximum.
<details><summary>Answer</summary>

```python
q, res = collections.deque(), []
for r, x in enumerate(nums):
    while q and nums[q[-1]] <= x: q.pop()     # dominated: older and not larger
    q.append(r)
    if q[0] <= r - k: q.popleft()             # front slid out of the window
    if r >= k - 1: res.append(nums[q[0]])
return res
```
**Check:** store indices, because the eviction test `q[0] <= r - k` needs positions · pop from the back before pushing (P6 dominance), evict from the front by index (P8 window) · record only once the first full window exists (`r >= k - 1`).
</details>
Run on: Sliding Window Maximum 239 · Shortest Subarray with Sum at Least K 862 (outside; deque over prefix sums).

### Card 35 · LRU Cache: `OrderedDict`, then a manual doubly linked list (P1 + P16)
**Trigger:** "design ... O(1) get and put", "evict the least recently used".
**Invariant:** the map holds exactly the cached keys; list order is recency, least recent next to `head`, most recent next to `tail`.
**Write:** the `OrderedDict` version, then the version with a hash map and a doubly linked list with sentinel head and tail (the one interviewers usually require).
<details><summary>Answer</summary>

```python
class LRUCache:
    def __init__(self, capacity):
        self.cap, self.d = capacity, collections.OrderedDict()
    def get(self, key):
        if key not in self.d: return -1
        self.d.move_to_end(key); return self.d[key]
    def put(self, key, value):
        self.d[key] = value; self.d.move_to_end(key)
        if len(self.d) > self.cap: self.d.popitem(last=False)

class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val, self.prev, self.next = key, val, None, None
class LRUCache:
    def __init__(self, capacity):
        self.cap, self.map = capacity, {}
        self.head, self.tail = Node(), Node()        # sentinels: never removed
        self.head.next, self.tail.prev = self.tail, self.head
    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev
    def _add(self, node):                            # insert just before tail (most recent)
        node.prev, node.next = self.tail.prev, self.tail
        self.tail.prev.next = node; self.tail.prev = node
    def get(self, key):
        if key not in self.map: return -1
        node = self.map[key]; self._remove(node); self._add(node)
        return node.val
    def put(self, key, value):
        if key in self.map: self._remove(self.map[key])
        node = Node(key, value); self.map[key] = node; self._add(node)
        if len(self.map) > self.cap:
            lru = self.head.next; self._remove(lru); del self.map[lru.key]
```
**Check:** sentinels mean `_remove` and `_add` never test for `None` · the node stores its `key` so eviction can delete it from the map · `put` on an existing key must unlink the old node first (and counts as a use).
</details>
Run on: LRU Cache 146 · LFU Cache 460 (outside; one such list per frequency).

### Card 36 · State-augmented Dijkstra and Floyd's cycle entry (P15 / P16)
**Trigger:** Dijkstra with an extra constraint such as "at most k stops"; "find the duplicate in `[1..n]` without modifying the array", "where does the cycle begin".
**Invariant:** Dijkstra: heap entries are `(cost, node, stops)`, so a state is `(node, stops)`, and a popped state with cost `d` has the cheapest cost among paths reaching it with that many edges. Floyd phase 2: the distance from the start to the cycle entry equals the distance from the meeting point to the entry (mod cycle length).
**Write:** Cheapest Flights Within K Stops with a heap, then Find the Duplicate Number.
<details><summary>Answer</summary>

```python
adj = collections.defaultdict(list)
for u, v, w in flights: adj[u].append((v, w))
h = [(0, src, 0)]                          # (cost, node, edges used)
fewest = {}                                # node -> fewest edges among earlier (cheaper) pops
while h:
    d, u, e = heapq.heappop(h)
    if u == dst: return d
    if e > k or fewest.get(u, float('inf')) <= e: continue
    fewest[u] = e
    for v, w in adj[u]:
        heapq.heappush(h, (d + w, v, e + 1))
return -1

slow = fast = 0                            # phase 1: meet inside the cycle of i -> nums[i]
while True:
    slow, fast = nums[slow], nums[nums[fast]]
    if slow == fast: break
slow2 = 0                                  # phase 2: both step once until they meet
while slow != slow2:
    slow, slow2 = nums[slow], nums[slow2]
return slow                                # the cycle entry = the duplicate
```
**Check:** do **not** keep Card 24's `done` set keyed on node alone: a cheaper path that used too many stops would lock the node and discard a costlier path that is the only one within `k`; skip a pop only if an earlier (so no more expensive) pop reached the node with **no more** edges · `k` stops = at most `k + 1` edges, so a state with `e > k` cannot expand · Floyd needs a `do-while` first step (both start at 0, so test *after* moving); index 0 is never a cycle node because values are in `[1, n]`.
</details>
Run on: Cheapest Flights 787 · Find the Duplicate Number 287 · Linked List Cycle II 142 (outside; same phase 2 on nodes) · Happy Number 202.
