# The Principles Behind the NeetCode 150

> **New here?** Terms like *principle*, *trigger*, *invariant*, *template* and *card* are defined, with an example, in `README.md` under "The words used everywhere in this folder".

*Eighteen transferable ideas, organized as six questions, that generate the optimal solution to every one of the 150 problems (plus a short list of tricks that genuinely have to be memorized).*

Source material: every Python solution in [neetcode-gh/leetcode](https://github.com/neetcode-gh/leetcode) and [mdmzfzl/NeetCode-Solutions](https://github.com/mdmzfzl/NeetCode-Solutions), plus NeetCode's hints and multi-approach articles for all 150 problems. Raw per-problem notes (trigger, brute-force-to-optimal leap, invariant, idiom) are in `_analysis/notes_A.md` through `notes_F.md`.

---

## How to use this document

Every optimal solution in the 150 is a brute force plus **one move** that removes its redundancy. The move is almost always one of six. When you meet a new problem, do not scan a list of 18 principles. Ask the six questions in order:

| # | Question to ask yourself | If yes, the move is... | Principles |
|---|---|---|---|
| 0 | Is there a different way to *see* this problem that turns it into a known one? | **Reformulate** | P18 |
| 1 | Does my brute force recompute something it already computed? | **Remember** | P1 Hash · P2 Running aggregates · P3 Dynamic programming |
| 2 | Can I *prove* some candidates can never win, and skip them in bulk? | **Eliminate** | P4 Binary search · P5 Two pointers · P6 Stack · P7 Greedy |
| 3 | Can I process the input in one pass, carrying a small summary? | **Sweep** | P8 Sliding window · P9 Sort then scan · P10 Heap |
| 4 | Is the answer for the whole defined by answers for its parts? | **Decompose** | P11 Tree recursion · P12 Backtracking |
| 5 | Are there "things" and "connections between things"? | **Model as a graph** | P13 BFS/DFS · P14 Dependencies & connectivity · P15 Weighted paths |
| 6 | Is the constraint really about memory or mechanics? | **Manipulate in place** | P16 Pointer surgery · P17 Bits, digits, O(1) space |

Then, before you write code, write **one sentence stating the invariant**: the thing that is true after every step. Every solution below is presented with its invariant because, once you can state it, the loop body writes itself and the off-by-one errors mostly disappear.

Each principle section has the same shape:

- **One line** – the principle in a sentence you could say in an interview.
- **Recognize it when** – observable features of the problem statement.
- **The idea** – brute force, the leap, and the invariant.
- **Template** – the 5–15 lines of Python that are the same every time.
- **Worked examples** – one or two of the 150, with the canonical solution and why it works.
- **Where it applies** – every NeetCode 150 problem that uses it, plus problem types beyond the list.
- **Pitfalls** – the two or three places people actually get it wrong.

---

# MOVE 1 — REMEMBER
*"My brute force recomputes something it already computed."*

The single largest family. Nested loops usually mean the inner loop is re-deriving a fact about elements you've already touched. Store the fact instead. The three principles differ in **what** you store: a lookup table of things seen (P1), a running summary of a prefix (P2), or the answer to a smaller version of the same problem (P3).

---

## P1. Hash it: turn "search for X" into O(1) `X in seen`

**One line.** Any time an inner loop exists only to answer "have I seen X?" or "where is X?" or "how many X?", replace it with a set or dictionary and the loop disappears.

**Recognize it when**
- The statement says "find a pair / duplicate / complement / matching element".
- You need frequency counts ("most common", "anagram", "same characters").
- The brute force compares every element against every other element (O(n²)) with no ordering requirement.
- You need to map an object to another object (old node to its copy, value to its index, prefix to its subtree).
- The check is "no duplicates in each row / column / group" (composite keys).

**The idea.** The brute force is a nested loop: for each element, scan for its partner. The scan is the redundancy. If you record every element as you pass it, the scan becomes a dictionary probe. You pay O(n) memory to buy O(n) time.

The only real decision is the **shape of the key**:

| Key shape | When | Example |
|---|---|---|
| The raw value | "seen before?" | Contains Duplicate |
| The *complement* (`target - x`) | pair with a target | Two Sum |
| A *canonical signature* (sorted string or 26-count tuple) | equality that ignores order | Group Anagrams |
| A *composite tuple* `(row, val)` | several constraints in one structure | Valid Sudoku |
| Object identity (node → new node) | deep copy, "old to new" | Copy List with Random Pointer, Clone Graph |
| A *bounded integer as array index* | key is in `[0, n]`; skip the hash, use a list | Top K Frequent (bucket sort) |
| A *prefix* (trie) | many strings share prefixes; need prefix queries | Implement Trie, Word Search II |

**Invariant.** *The structure contains exactly the information about every element processed so far that a future element could need.*

**Template**
```python
seen = {}                       # or set()
for i, x in enumerate(items):
    key = f(x)                  # raw value, complement, signature, tuple...
    if key in seen:             # O(1) instead of an inner loop
        ...                     # found partner / duplicate / group
    seen[key] = i               # record for the future
```

**Worked example 1 — Two Sum (LC 1).** Find indices `i, j` with `nums[i] + nums[j] == target`.

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        prevMap = {}  # val -> index
        for i, n in enumerate(nums):
            diff = target - n
            if diff in prevMap:
                return [prevMap[diff], i]
            prevMap[n] = i
```
The brute force asks "for this `n`, is there a `j` with `nums[j] == target - n`?" and scans to find out. Rearranging the equation turns a *pair* search into a *single-element* lookup. Recording elements *after* checking guarantees `i != j`. One pass, O(n).

**Worked example 2 — Group Anagrams (LC 49).** Bucket strings that are permutations of each other.

```python
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        ans = collections.defaultdict(list)
        for s in strs:
            count = [0] * 26
            for c in s:
                count[ord(c) - ord("a")] += 1
            ans[tuple(count)].append(s)
        return list(ans.values())
```
Two strings are anagrams if and only if their letter counts match, so the count tuple is a **canonical form**: all anagrams map to one key. Comparing each string to every other (O(n²k)) becomes one hash insert per string (O(nk)). Sorting each string also works as a key, at O(k log k) per string.

**Worked example 3 (the subtle one) — Longest Consecutive Sequence (LC 128).**
```python
numSet = set(nums)
longest = 0
for n in numSet:
    if (n - 1) not in numSet:          # only start from the beginning of a run
        length = 1
        while (n + length) in numSet:
            length += 1
        longest = max(longest, length)
```
The set gives O(1) membership, but the real trick is *anchoring*: only walk forward from numbers that are provably the start of a run. Each run is walked exactly once, so the nested-looking loop is O(n) total.

**Where it applies**
- NeetCode 150: Contains Duplicate 217 · Valid Anagram 242 · Two Sum 1 · Group Anagrams 49 · Top K Frequent 347 (count, then bucket-sort by frequency) · Valid Sudoku 36 (composite keys) · Longest Consecutive Sequence 128 · Longest Substring Without Repeating 3 and Minimum Window Substring 76 (the window's contents live in a set or count map) · Permutation in String 567 (count signature inside a window) · Copy List with Random Pointer 138 · Clone Graph 133 · LRU Cache 146 (map + linked list) · Time Based Key-Value Store 981 (map to sorted list) · Design Twitter 355 · Construct Tree from Preorder/Inorder 105 (value → inorder index) · Word Search 79 / N-Queens 51 (visited / used sets) · Word Ladder 127 (wildcard-pattern buckets) · Detect Squares 2013 (point counts) · Implement Trie 208 · Add and Search Words 211 · Word Search II 212.
- Beyond: any "count / group / dedupe / find complement" problem; subarray-sum-equals-k (prefix sum + hash, the fusion of P1 and P2); "first unique", "intersection of arrays", "isomorphic strings", LFU cache, any "design" question that needs O(1) `get`.

**Two structures that are P1 in disguise (write them cold)**

*Trie* (Implement Trie 208, Add and Search Words 211, Word Search II 212): a hash map keyed by prefix, factored so shared prefixes share nodes. Each operation costs O(word length) regardless of dictionary size.
```python
class TrieNode:
    def __init__(self):
        self.children = {}          # char -> TrieNode
        self.end = False

class Trie:
    def __init__(self): self.root = TrieNode()
    def insert(self, word):
        cur = self.root
        for c in word:
            cur = cur.children.setdefault(c, TrieNode())
        cur.end = True
    def _walk(self, prefix):
        cur = self.root
        for c in prefix:
            if c not in cur.children: return None
            cur = cur.children[c]
        return cur
    def search(self, word):      node = self._walk(word);   return node is not None and node.end
    def startsWith(self, prefix): return self._walk(prefix) is not None

# wildcard search (211): '.' branches over every child
def search_dot(node, word, i=0):
    if i == len(word): return node.end
    if word[i] == '.':
        return any(search_dot(ch, word, i + 1) for ch in node.children.values())
    ch = node.children.get(word[i])
    return ch is not None and search_dot(ch, word, i + 1)
```

*LRU Cache* (146): a hash map for O(1) lookup plus an ordered structure for O(1) move-to-front and evict. `OrderedDict` does both; the interview version is a doubly linked list with sentinel head and tail.
```python
from collections import OrderedDict
class LRUCache:
    def __init__(self, capacity):
        self.cap, self.d = capacity, OrderedDict()
    def get(self, key):
        if key not in self.d: return -1
        self.d.move_to_end(key)
        return self.d[key]
    def put(self, key, value):
        if key in self.d: self.d.move_to_end(key)
        self.d[key] = value
        if len(self.d) > self.cap: self.d.popitem(last=False)
```
The manual version keeps `Node(key, val, prev, next)`, a `left`/`right` sentinel pair, `remove(node)` and `insert_at_right(node)`; `get` removes and re-inserts, `put` evicts `left.next` when over capacity. See `DRILLS.md` Card 35.

*Design problems generally* (146, 155, 355, 981, 295, 2013): the question is always "which composite of a hash map plus one ordered structure (list, stack, heap, sorted list, linked list) gives every operation its required cost?" List the operations, write the target cost next to each, then pick the structure that pays for the most expensive one.

**Pitfalls**
- Lists are unhashable; use `tuple(count)` or `"".join(sorted(s))`.
- Insert *after* the check when the pair must be two distinct indices.
- If the key is a small bounded integer, an array beats a dict (Top K Frequent's bucket sort is O(n) rather than O(n log n)).
- A trie is P1 when the key is a prefix: it costs O(word length) per operation regardless of dictionary size, and it lets a grid DFS prune the instant a prefix is dead (Word Search II).

---

## P2. Running aggregates: precompute what every position needs from its left and right

**One line.** When each position's answer depends on "everything to the left" or "everything to the right", compute those summaries in one pass each, then answer every position in O(1).

**Recognize it when**
- "For every index i, compute something over all other elements" (product, sum, max, min).
- "Best pair where the buy is before the sell" (min so far, then current).
- A quantity at position i depends on the max/min to its left **and** right (water trapped between walls).
- You need a running min/max that survives push/pop (Min Stack).
- "Last occurrence of each character" (Partition Labels).

**The idea.** The brute force rescans the prefix or suffix for every index: O(n²). But the prefix summary of `[0..i]` is the prefix summary of `[0..i-1]` plus one element. So one left-to-right pass fills a `pre[]` array; one right-to-left pass fills `suf[]`; then `answer[i] = combine(pre[i], suf[i])` where, by convention below, `pre[i]` covers `[0..i-1]` and `suf[i]` covers `[i+1..n-1]` (exclusive of `i`). If only one direction matters, the array collapses to a single running variable and the whole thing is O(1) space.

**Invariant.** *Exclusive form: `pre[i]` summarizes exactly `[0..i-1]`. Running form: after processing index `i`, `run` summarizes exactly `[0..i]`.*

**Template**
```python
# two-sided
pre = [identity] * n
for i in range(1, n):
    pre[i] = op(pre[i-1], a[i-1])
suf = identity
for i in range(n - 1, -1, -1):
    ans[i] = op(pre[i], suf)
    suf = op(suf, a[i])

# one-sided, O(1) space ("best so far")
ans, best_so_far = 0, a[0]
for x in a[1:]:
    ans = max(ans, f(x, best_so_far))
    best_so_far = update(best_so_far, x)

# prefix sum + hash map: count subarrays with sum == k (works with negatives, unlike a window)
# invariant: seen[p] = number of prefixes so far with sum p; seed {0: 1} for the empty prefix
seen, run, count = {0: 1}, 0, 0
for x in a:
    run += x
    count += seen.get(run - k, 0)     # earlier prefix p with run - p == k
    seen[run] = seen.get(run, 0) + 1
```

**Worked example 1 — Product of Array Except Self (LC 238).** `res[i]` = product of all elements except `nums[i]`, no division.
```python
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        res = [1] * len(nums)
        for i in range(1, len(nums)):
            res[i] = res[i-1] * nums[i-1]      # res[i] = product of everything left of i
        postfix = 1
        for i in range(len(nums) - 1, -1, -1):
            res[i] *= postfix                  # times product of everything right of i
            postfix *= nums[i]
        return res
```
The output array doubles as the prefix array, and the suffix product is a single rolling variable, so extra space is O(1).

**Worked example 2 — Trapping Rain Water (LC 42).** Water at `i` is `min(maxLeft, maxRight) - height[i]`.
```python
class Solution:
    def trap(self, height: List[int]) -> int:
        if not height: return 0
        l, r = 0, len(height) - 1
        leftMax, rightMax = height[l], height[r]
        res = 0
        while l < r:
            if leftMax < rightMax:
                l += 1
                leftMax = max(leftMax, height[l])
                res += leftMax - height[l]
            else:
                r -= 1
                rightMax = max(rightMax, height[r])
                res += rightMax - height[r]
        return res
```
The O(n)-space version builds `leftMax[]` and `rightMax[]` arrays and combines them. This version fuses P2 with P5 (two pointers): the side with the smaller running max already knows its water level, because the other side is guaranteed to have a wall at least that tall. So the smaller side can be resolved and advanced. Two running aggregates, O(1) space.

**Worked example 3 — Best Time to Buy and Sell Stock (LC 121).** The one-directional case.
```python
res, lowest = 0, prices[0]
for price in prices:
    lowest = min(lowest, price)
    res = max(res, price - lowest)
```
"Min so far" is the only thing a future day needs to know about the past.

**Where it applies**
- NeetCode 150: Product Except Self 238 · Trapping Rain Water 42 · Best Time to Buy/Sell 121 · Min Stack 155 (a parallel stack carrying the running min) · Maximum Subarray 53 (Kadane: best sum *ending here*) · Partition Labels 763 (last index of each char) · Maximum Product Subarray 152 (running max **and** min because a negative flips them).
- Beyond: prefix sums for "subarray sum equals k" (Subarray Sum Equals K 560, Contiguous Array 525; the template above, with P1 for the lookup) or range-sum queries; "left max < right min" split problems; 2-D prefix sums for submatrix sums; "sum of all subarray minimums"; difference arrays for range updates.

**Pitfalls**
- Kadane and its cousins are DP in disguise: `best_ending_here[i] = max(a[i], best_ending_here[i-1] + a[i])`. If the combining operator can flip sign (multiplication), you must track both the running max and the running min.
- Off-by-one on the "except self" boundary: `pre[i]` should summarize `[0..i-1]`, not `[0..i]`.

---

## P3. Dynamic programming: memoize overlapping subproblems, then pick the combinator

**One line.** If the natural recursion revisits the same state many times, cache it; define the state precisely, list the predecessor states, and combine them with SUM (count ways), OR (is it possible), or MIN/MAX (optimize).

**Recognize it when**
- "Number of ways", "how many distinct", "count".
- "Can you reach / form / partition", "is it possible".
- "Minimum cost / fewest / maximum value" over a sequence of choices.
- The choice at each step is small (take/skip, 1 or 2 steps, match/mismatch, this coin or not) but the number of full paths is exponential.
- Two strings and a relationship between them (common subsequence, edit, interleave, match).
- "No two adjacent", "with cooldown", "at most k".

**The idea.** Write the brute-force recursion first. Then ask: *what is the minimal information the recursion needs to finish from here?* That is the **state**. If two calls have the same state, they have the same answer, so cache by state. The number of distinct states is polynomial even though the number of paths is exponential.

The recurrence always has the same skeleton:

```
dp[state] = COMBINE over valid predecessor states of ( dp[pred] , cost of the transition )
```

and the combinator is dictated by the question:

| The question asks... | Combinator | Base case | Examples |
|---|---|---|---|
| how many ways | `sum` | 1 | Climbing Stairs, Decode Ways, Unique Paths, Coin Change II, Distinct Subsequences, Target Sum |
| is it possible | `or` / `any` | True | Word Break, Interleaving String, Regex Matching, Partition Equal Subset Sum |
| best value | `min` / `max` | 0 or ±inf | Coin Change, House Robber, LCS, Edit Distance, LIS, Burst Balloons |

The **state shapes** that cover all 23 DP problems in the 150:

| State | Meaning | Problems |
|---|---|---|
| `i` (one index) | answer for prefix/suffix | 70, 746, 198, 213, 91, 139, 300 |
| `amount` (sum axis, knapsack) | can/how many/min ways to reach a sum | 322, 518, 416, 494 |
| `(i, j)` (two sequences) | answer for `s[i:]` vs `t[j:]` | 1143, 72, 115, 97, 10 |
| `(r, c)` (grid) | paths/longest from a cell | 62, 329 |
| `i` with two running values | best and worst ending here (sign can flip) | 152 |
| `(i, mode)` (state machine) | position plus a flag (holding stock?) | 309 |
| `(l, r)` (interval) | answer for the sub-range | 312 (5/647 are the symmetric case: expand outward from each center in O(1) space instead of filling the table; filed under P5) |

**Two refinements that come up constantly:**
1. **Space collapse.** If `dp[i]` only depends on `dp[i-1]` and `dp[i-2]`, keep two variables instead of an array (Climbing Stairs, House Robber). If row `i` only depends on row `i-1`, keep one row (Unique Paths, LCS).
2. **Loop order encodes semantics, but only when counting.** For `min`/`max`/`or`, either loop order gives the same answer. For counting: items outer, amounts inner counts *combinations* (each multiset once, Coin Change II); amounts outer, items inner counts *permutations* (ordered sequences, Combination Sum IV 377). For 0/1 knapsack (each item once) iterate the sum axis downward, or snapshot per item, so an item cannot be reused within one pass.

**Invariant.** *`dp[state]` is the exact answer to the sub-question the state describes, for every state already filled.*

**Template**
```python
# top-down (write this first; it is the brute force plus one dict)
from functools import lru_cache
@lru_cache(None)
def f(state):
    if base(state): return base_value
    return COMBINE(f(pred) + cost for pred in predecessors(state))

# bottom-up (same recurrence, iterate states so predecessors are filled first)
dp = [identity] * (n + 1)
dp[base] = base_value
for state in order:
    for pred in predecessors(state):
        dp[state] = COMBINE(dp[state], dp[pred] + cost)
```

**Worked example 1 — Coin Change (LC 322).** Fewest coins to make `amount`; unlimited reuse.
```python
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [amount + 1] * (amount + 1)     # amount+1 acts as "infinity"
        dp[0] = 0
        for a in range(1, amount + 1):
            for c in coins:
                if a - c >= 0:
                    dp[a] = min(dp[a], 1 + dp[a - c])
        return dp[amount] if dp[amount] != amount + 1 else -1
```
State: the remaining amount (which coins you already used is irrelevant because reuse is unlimited). Predecessors of `a`: `a - c` for each coin. Combinator: `min`, because the question is "fewest". Swap `min(...)` for `+=` and the same table counts ways (Coin Change II), with the loop order flipped so each combination is counted once.

**Worked example 2 — Longest Common Subsequence (LC 1143).** The two-sequence template.
```python
class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        dp = [[0] * (len(text2) + 1) for _ in range(len(text1) + 1)]
        for i in range(len(text1) - 1, -1, -1):
            for j in range(len(text2) - 1, -1, -1):
                if text1[i] == text2[j]:
                    dp[i][j] = 1 + dp[i + 1][j + 1]
                else:
                    dp[i][j] = max(dp[i][j + 1], dp[i + 1][j])
        return dp[0][0]
```
State `(i, j)` = "LCS of `text1[i:]` and `text2[j:]`". Branch on whether the current characters match. The same `(i, j)` grid, iterated from the bottom-right, solves the whole two-sequence family; what changes is the recurrence **and the base row/column**:

| Problem | `dp[i][j]` | Base (`i == m` or `j == n`) |
|---|---|---|
| LCS 1143 | match: `1 + dp[i+1][j+1]`; else `max(dp[i+1][j], dp[i][j+1])` | 0 |
| Edit Distance 72 | match: `dp[i+1][j+1]`; else `1 + min(dp[i+1][j], dp[i][j+1], dp[i+1][j+1])` | `dp[i][n] = m - i`, `dp[m][j] = n - j` |
| Distinct Subsequences 115 | `dp[i+1][j] + (dp[i+1][j+1] if s[i] == t[j] else 0)` | `dp[i][n] = 1`, `dp[m][j<n] = 0` |
| Interleaving String 97 | `(s1[i] == s3[i+j] and dp[i+1][j]) or (s2[j] == s3[i+j] and dp[i][j+1])` | `dp[m][n] = True`; require `m + n == len(s3)` |
| Regex Matching 10 | if `p[j+1] == '*'`: `dp[i][j+2] or (match and dp[i+1][j])`; else `match and dp[i+1][j+1]` | `dp[m][n] = True`; `dp[m][j]` true only if the rest of `p` is `x*` pairs |

Learn the grid once; then each problem is one row of this table.

**Worked example 3 — House Robber (LC 198).** Take/skip with space collapse.
```python
rob1, rob2 = 0, 0          # best up to i-2, best up to i-1
for n in nums:
    rob1, rob2 = rob2, max(n + rob1, rob2)
return rob2
```
`dp[i] = max(take = nums[i] + dp[i-2], skip = dp[i-1])`. Only two previous values matter, so two variables suffice.

**Three more shapes worth having in hand**

*State machine (Buy and Sell with Cooldown 309).* The position alone is not a sufficient state; add "am I holding?".
```python
@lru_cache(None)
def f(i, holding):
    if i >= len(prices): return 0
    skip = f(i + 1, holding)
    if holding:  return max(skip, prices[i] + f(i + 2, False))   # sell, then cooldown
    else:        return max(skip, -prices[i] + f(i + 1, True))   # buy
return f(0, False)
```

*Rolling row (Unique Paths 62, LCS).* When row `i` depends only on row `i+1`, keep one row.
```python
row = [1] * n                              # bottom row of the grid: one path each
for _ in range(m - 1):
    new = [1] * n                          # rightmost column is always 1
    for j in range(n - 2, -1, -1):
        new[j] = new[j + 1] + row[j]       # right + down
    row = new
return row[0]
```

*Longest Increasing Subsequence (300), both ways.* The O(n²) DP scans all earlier compatible states; the O(n log n) version keeps `tails[k]` = smallest tail of any increasing subsequence of length `k+1`, and binary-searches where the new value goes (P4).
```python
dp = [1] * len(nums)
for i in range(len(nums)):
    for j in range(i):
        if nums[j] < nums[i]: dp[i] = max(dp[i], dp[j] + 1)
return max(dp) if nums else 0

import bisect
tails = []
for x in nums:
    k = bisect.bisect_left(tails, x)       # first tail >= x
    if k == len(tails): tails.append(x)
    else:               tails[k] = x
return len(tails)
```

*Bitmask over subsets (outside the 150, n ≤ 20).* The state is a bitmask of "which items are used"; `dp[mask]` combines over `dp[mask ^ (1 << i)]`. Partition to K Equal Sum Subsets 698 and Shortest Path Visiting All Nodes 847 are the standard examples.

**Where it applies**
- NeetCode 150: 20 of the 23 problems NeetCode files under DP as their primary principle (70, 746, 198, 213, 91, 322, 139, 300, 416, 62, 1143, 309, 518, 494, 97, 329, 115, 72, 312, 10) · Counting Bits 338 (`dp[i] = dp[i >> 1] + (i & 1)`) · as a secondary principle: Maximum Product Subarray 152 (P2 with two running values), Longest Palindromic Substring 5 and Palindromic Substrings 647 (P5 center expansion replaces the interval table), Maximum Subarray 53 (Kadane is P7/P2 and DP at once) · Word Search II / Clone Graph memo maps are P1, not P3.
- Beyond: any "count paths / ways / partitions"; knapsack and its variants; string edit/alignment family; grid path optimization; game DP ("can the first player win" = OR over moves of NOT dp[next]); bitmask DP over subsets when n ≤ 20; tree DP (P11 is DP where subproblems don't overlap).

**Pitfalls**
- **State must be sufficient.** If two calls with the same state can have different answers, your state is missing a dimension (Buy/Sell with Cooldown needs "am I holding?"; Target Sum needs the running total).
- **Redundant dimensions can be dropped.** In Interleaving String the index into `s3` is always `i + j`.
- Top-down with `lru_cache` is the fastest thing to write correctly in an interview; convert to bottom-up only if asked or if recursion depth is a risk.
- Sentinels: use `amount + 1` or `float('inf')` for "impossible" and check for it before returning.
- **Circular constraints** (House Robber II) reduce to two linear runs (exclude first, exclude last).
- **Order-dependent operations** (Burst Balloons) become tractable when you pivot on the operation done *last* in a range, not first; that makes the two sub-ranges independent.

---

# MOVE 2 — ELIMINATE
*"I can prove some candidates can never win, so I skip them without looking."*

The brute force examines every candidate. These four principles each supply an **argument** that lets you discard candidates in bulk. The argument almost always comes from **order** (sortedness, monotonicity) or **dominance** (candidate A is at least as good as B in every future, so B can be dropped).

---

## P4. Binary search on any monotonic predicate (index, rotated half, or the answer itself)

**One line.** If a yes/no question about a candidate flips exactly once as the candidate increases, one probe tells you which half to throw away, and you find the boundary in O(log n).

**Recognize it when**
- The input is sorted (or sorted-then-rotated, or a matrix whose rows and columns are sorted).
- "Find the minimum X such that condition(X) holds" and making X bigger can only make the condition easier (Koko's eating speed, ship capacity, split-array threshold).
- O(log n) is demanded, or the *value range* is 10⁹ so anything linear in the values is too slow.
- You need a floor/ceiling: "largest timestamp ≤ t" (Time-Based Key-Value Store).
- A BST: at each node the ordering tells you which subtree to skip (LCA of a BST).

**The idea.** Sortedness is the cheap case. The general case: you have a predicate `ok(x)` that is `False, False, ..., False, True, True, ..., True` over the candidate range. You want the first `True`. Probe the middle; if `ok(mid)` the answer is at or left of `mid`, else right of `mid`. Every probe halves the range. The candidates do not have to be array indices: they can be *answers*, and `ok` can be an O(n) simulation. This "guess and check" view converts an optimization problem into a feasibility problem plus a log factor, and it is one of the most underused tools in interviews.

**Invariant.** *The answer, if it exists, lies in `[l, r]`. Everything outside has been proven impossible.*

**Template**
```python
# find first x in [lo, hi] with ok(x) True (predicate is monotone False->True)
lo, hi = lo, hi
while lo < hi:
    mid = (lo + hi) // 2
    if ok(mid): hi = mid          # mid could be the answer; keep it
    else:       lo = mid + 1      # mid is impossible; discard it and everything left
return lo                          # (check ok(lo) if the answer may not exist)

# exact-match variant on a sorted array
l, r = 0, n - 1
while l <= r:
    m = (l + r) // 2
    if a[m] == target: return m
    if a[m] < target: l = m + 1
    else:             r = m - 1
return -1
```

**Worked example 1 — Koko Eating Bananas (LC 875).** Minimum speed `k` to finish all piles within `h` hours.
```python
class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        lo, hi = 1, max(piles)                       # hi is always feasible since h >= len(piles)
        while lo < hi:                               # half-open form, same as the template
            k = (lo + hi) // 2
            hours = sum(-(-p // k) for p in piles)   # ceil(p / k) without floats
            if hours <= h: hi = k                    # feasible: k could be the answer, try slower
            else:          lo = k + 1                # infeasible: must go faster
        return lo
```
(The canonical solution uses the closed form `while l <= r` with a `res` variable; both are correct, but pick one style and stay in it.) Nothing is sorted here. The search space is the *answer* (speed), the predicate is "can Koko finish in time at speed k", and it is monotone because a faster speed never hurts. O(n log m) instead of trying every speed.

**Worked example 2 — Find Minimum in Rotated Sorted Array (LC 153).**
```python
l, r = 0, len(nums) - 1
while l < r:
    mid = l + (r - l) // 2
    if nums[mid] > nums[r]: l = mid + 1    # the break (and the min) is to the right
    else:                   r = mid        # mid could be the min; left half holds it
return nums[l]
```
The predicate is "is `nums[mid]` in the second (post-rotation) segment", decided by comparing `mid` to the right end. One comparison reveals which half is properly sorted; the minimum lives in the other half. Search in Rotated Sorted Array (LC 33) adds "is the target within the sorted half's value range" to choose direction.

**Where it applies**
- NeetCode 150: Binary Search 704 · Search a 2D Matrix 74 (flatten indices: `mid // cols, mid % cols`) · Koko 875 · Find Min in Rotated 153 · Search in Rotated 33 · Time Based Key-Value Store 981 (floor search) · Median of Two Sorted Arrays 4 (binary search the partition point) · LCA of a BST 235 (one comparison discards a subtree) · Kth Smallest in BST 230 is the in-order cousin. (Quickselect for Kth Largest 215 is partition-and-discard, not binary search on a predicate; it lives in P10.)
- Beyond: "first bad version", "search insert position", "first/last occurrence"; capacity/threshold minimization (Ship Packages 1011, Split Array Largest Sum 410, Minimize Max Distance to Gas Station); "kth smallest pair distance"; peak finding; any O(n²) that becomes O(n log n) by binary-searching one side per element; LIS in O(n log n) via patience sorting.

**Pitfalls**
- Decide up front whether `hi = mid` or `hi = mid - 1`, and match it with `while lo < hi` versus `while lo <= hi`. Mixing them loops forever or skips the answer.
- For "search the answer", the range is `[smallest possible answer, largest possible answer]`, and the predicate must be genuinely monotone. Say why out loud.
- Duplicates in rotated arrays break the "which half is sorted" test (LC 81) and force a linear step.

---

## P5. Two pointers converging: sortedness or symmetry lets one comparison discard a whole side

**One line.** With one pointer at each end of a sorted (or mirror-symmetric) array, a single comparison tells you which pointer can be moved without losing any possible answer.

**Recognize it when**
- Sorted array plus "find a pair/triplet with sum = target".
- "Palindrome" or any check that compares position `i` with position `n-1-i`.
- "Maximize area/width between two indices" where moving the worse endpoint can never help.
- Two sorted sequences must be merged (both pointers advance the same direction).
- You would otherwise write `for i: for j > i:` over a sorted array.

**The idea.** In Two Sum on a sorted array: if `a[l] + a[r] > target`, then `a[r]` is too big to pair with `a[l]` *and with anything to the right of `l`* (those are all even bigger), so `r` can be discarded entirely. Symmetric for `<`. Each step eliminates one element for good, hence O(n). The general form: *"If the current pair is not the answer, one of the two endpoints cannot participate in any better pair; drop it."* For Container With Most Water, the shorter wall is that endpoint, because every other pair using it has less width and no more height.

**Invariant.** *Every pair with at least one index outside `[l, r]` has been ruled out.*

**Template**
```python
l, r = 0, n - 1
while l < r:
    cur = f(a[l], a[r])
    if cur == target: return ...
    if cur < target: l += 1        # a[l] can never work with anything; drop it
    else:            r -= 1        # a[r] can never work with anything; drop it
```

**Worked example 1 — Two Sum II, sorted input (LC 167).**
```python
l, r = 0, len(numbers) - 1
while l < r:
    curSum = numbers[l] + numbers[r]
    if curSum > target:   r -= 1
    elif curSum < target: l += 1
    else:                 return [l + 1, r + 1]
```
Contrast with Two Sum (P1): the hash map costs O(n) space and works unsorted; the pointers cost O(1) space but need order. The word "sorted" is the whole signal. 3Sum (LC 15) sorts, fixes the first element with a loop, and runs this on the remainder; sorting also makes duplicate-skipping trivial (skip equal neighbors).

**Worked example 2 — Container With Most Water (LC 11).**
```python
l, r = 0, len(height) - 1
res = 0
while l < r:
    res = max(res, min(height[l], height[r]) * (r - l))
    if height[l] < height[r]: l += 1
    else:                     r -= 1
```
Nothing is sorted. The dominance argument: the shorter wall bounds the area, and any future pair using it is narrower, so it can never beat the current area. Discard it. This is the same *shape* as P4 and P7: one comparison, a proof, a permanent elimination.

**Where it applies**
- NeetCode 150: Valid Palindrome 125 · Two Sum II 167 · 3Sum 15 · Container With Most Water 11 · Trapping Rain Water 42 (with running maxes, P2) · Merge Two Sorted Lists 21 and the merge step of Merge K Lists 23 (same-direction two pointers) · Longest Palindromic Substring 5 / Palindromic Substrings 647 (pointers *expanding outward* from a center) · Reorder List 143 (splice two halves).
- Also filed here: Spiral Matrix 54 (four boundary pointers converging inward). 
- Beyond: remove duplicates / move zeroes in place (read/write pointers), squares of a sorted array, 4Sum, "boats to save people", merge sorted arrays, "is subsequence", Dutch national flag partitioning.

**Pitfalls**
- The elimination argument must be stated, not assumed. If you can't say why the dropped endpoint can never win, you may need a hash map or a sort instead.
- Duplicate handling in 3Sum: skip equal values at the same level *after* recording a triple.
- When the two pointers move the *same* direction with a condition on the segment between them, you are in P8 (sliding window), which has a different invariant.

---

## P6. Stack: resolve each element against the most recent unresolved one (monotonic when dominance lets you pop)

**One line.** When the thing an element interacts with is always "the most recent thing still waiting", a stack answers it in O(1); when a new element makes older waiting elements permanently irrelevant, pop them, and every element is pushed and popped at most once.

**Recognize it when**
- Matching or nesting: parentheses, tags, "undo", postfix expressions.
- "Next greater / next smaller element" for every index; "days until warmer".
- "Largest rectangle", "maximum of every window", "how many cars form fleets", "stock span".
- You need the running min/max of a stack under push/pop (Min Stack).
- Items arrive in order and each new one can *absorb* or *finalize* some older ones.

**The idea.** Two modes, one structure.

*Nesting mode.* A closing bracket must match the most recently opened, still-unclosed bracket. "Most recent unresolved" is exactly the top of a stack. Postfix evaluation: an operator consumes the two most recently produced values.

*Monotonic mode.* Daily Temperatures asks, for each day, the next warmer day. Keep a stack of days still waiting for their answer. When today is warmer than the day on top, today *is* its answer; pop it and record. Repeat. Then push today. The stack stays decreasing in temperature from bottom to top, which is why one comparison at the top settles everything: a day cannot be waiting behind a colder day. Each index enters and leaves once, so the nested loop is O(n) amortized. Sliding Window Maximum uses a deque for the same reason: a smaller element behind a larger, newer one can never be the window max, so it is dropped forever.

**Invariant (monotonic).** *The stack holds exactly the indices whose answer is not yet known, in non-increasing (or non-decreasing) order of value. It is only strict if you also pop on equality; popping on `<` keeps equal values, which is what Daily Temperatures needs since an equal temperature is not "warmer".*

**Template**
```python
ans = [0] * len(a)
stack = []                              # indices waiting for their "next greater"
for i, x in enumerate(a):
    while stack and a[stack[-1]] < x:   # x resolves everything it dominates
        j = stack.pop()
        ans[j] = i - j                  # or i, or area, etc.
    stack.append(i)
# whatever remains never got resolved (answer 0 / -1 / extends to the end)

# monotonic deque for "max of every window of size k" (239): evict from the front too
from collections import deque
q, out = deque(), []                    # q holds indices, values decreasing front to back
for r, x in enumerate(a):
    while q and a[q[-1]] < x: q.pop()   # x dominates smaller, older elements
    q.append(r)
    if q[0] <= r - k: q.popleft()       # front left the window
    if r >= k - 1: out.append(a[q[0]])
```

**Worked example 1 — Daily Temperatures (LC 739).**
```python
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        res = [0] * len(temperatures)
        stack = []  # (temp, index)
        for i, t in enumerate(temperatures):
            while stack and t > stack[-1][0]:
                stackT, stackInd = stack.pop()
                res[stackInd] = i - stackInd
            stack.append((t, i))
        return res
```

**Worked example 2 — Largest Rectangle in Histogram (LC 84).** For each bar, extend left and right until a shorter bar blocks it.
```python
class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        maxArea = 0
        stack = []  # (start_index, height), increasing heights
        for i, h in enumerate(heights):
            start = i
            while stack and stack[-1][1] > h:
                index, height = stack.pop()
                maxArea = max(maxArea, height * (i - index))   # i is its right boundary
                start = index                                   # h can extend back to here
            stack.append((start, h))
        for i, h in stack:                                      # never blocked on the right
            maxArea = max(maxArea, h * (len(heights) - i))
        return maxArea
```
A shorter bar arriving *finalizes* every taller bar on the stack: their right edge is now known. The popped bar's start index becomes the new bar's start, since the new, shorter bar can extend at least as far left. Same skeleton as Daily Temperatures; the payload changes.

**Worked example 3 — Valid Parentheses (LC 20), nesting mode.**
```python
bracketMap = {")": "(", "]": "[", "}": "{"}
stack = []
for c in s:
    if c not in bracketMap: stack.append(c); continue
    if not stack or stack[-1] != bracketMap[c]: return False
    stack.pop()
return not stack
```

**Where it applies**
- NeetCode 150: Valid Parentheses 20 · Min Stack 155 (parallel stack of running mins, P2) · Evaluate RPN 150 · Daily Temperatures 739 · Largest Rectangle 84 · Sliding Window Maximum 239 (monotonic deque) · Car Fleet 853 (sort by position, then a stack of fleet arrival times that collapses slower-arriving cars). Iterative tree traversals (Kth Smallest in BST 230) use an explicit stack to replace recursion, but that is P11's business.
- Beyond: next greater element I/II/circular, stock span, trapping rain water (stack version), remove k digits, 132 pattern, asteroid collision, decode string, simplify path, basic calculator, maximal rectangle (histogram per row), sum of subarray minimums, "remove adjacent duplicates".

**Pitfalls**
- Choose the comparison (`<` vs `<=`) deliberately; it decides how equal elements are handled.
- Store indices, not values, when you need distances or widths.
- Remember to drain the stack at the end for elements that never got resolved.
- Sliding Window Maximum needs a deque because you also evict from the *front* when an index leaves the window.

---

## P7. Greedy: commit to the choice you can prove is never worse, and never revisit it

**One line.** If you can argue that a locally best (or forced) choice can be swapped into any optimal solution without making it worse, take that choice immediately and shrink the problem.

**Recognize it when**
- "Minimum number of jumps / removals / intervals", "can you reach", "maximum non-overlapping".
- One element's role is *forced* (the smallest card must start a run; the earliest-ending interval should be kept).
- A running total that, once negative, can be abandoned (subarray sum, gas tank).
- Scheduling with a cooldown (always do the most frequent task).
- The problem smells like DP but the constraints are 10⁵ (DP would be too slow) and the choice has a clear "best".

**The idea.** Greedy is elimination applied to *choices* rather than array elements. The proof pattern is the **exchange argument**: take any optimal solution that does not make the greedy choice; swap in the greedy choice; show the result is still valid and no worse. Then the greedy choice is safe, so you never need to explore alternatives. Three recurring shapes in the 150:

1. **Frontier tracking.** Carry one number, "the farthest I can reach" or "the farthest I must reach", and extend it while scanning. Jump Game, Jump Game II (each extension of the frontier is one BFS layer), Partition Labels.
2. **Reset on negative.** A running sum that has gone negative can only hurt whatever follows; drop it and restart. Maximum Subarray (Kadane), Gas Station.
3. **Forced choice after sorting.** Sort so the most constrained item comes first; its handling is determined. Hand of Straights (smallest card starts a group), Non-overlapping Intervals (keep the earliest-ending interval), Merge Triplets (discard any triplet that exceeds the target anywhere), Kruskal's MST (cheapest edge that doesn't form a cycle).

**Invariant.** *The choices committed so far are a prefix of some optimal solution.*

**Template**
```python
# frontier tracking
farthest = 0
for i, x in enumerate(a):
    if i > farthest: return False      # gap: unreachable
    farthest = max(farthest, i + x)

# reset on negative
best, run = a[0], 0
for x in a:
    run += x
    best = max(best, run)
    if run < 0: run = 0
```

**Worked example 1 — Jump Game (LC 55).**
```python
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        goal = len(nums) - 1
        for i in range(len(nums) - 2, -1, -1):
            if i + nums[i] >= goal:
                goal = i                      # from i you can reach the goal, so i is the new goal
        return goal == 0
```
Scanning backward, `goal` is the leftmost index known to reach the end. A jump from `i` can land on *any* index up to `i + nums[i]`, so if `i + nums[i] >= goal` then `i` can land exactly on `goal` and therefore reach the end; `i` becomes the new goal. One variable replaces the exponential tree of jump sequences because "can reach the end" is monotone along the scan: once some index is known-good, every earlier index only has to reach it.

**Worked example 2 — Non-overlapping Intervals (LC 435).** Minimum removals so no two overlap.
```python
class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        if not intervals: return 0
        intervals.sort()                      # by start; sorting by end with "keep if start >= prevEnd" also works
        res = 0
        prevEnd = intervals[0][1]
        for start, end in intervals[1:]:
            if start >= prevEnd:
                prevEnd = end
            else:
                res += 1
                prevEnd = min(end, prevEnd)   # keep the one that ends sooner
        return res
```
Exchange argument: among two overlapping intervals, keeping the one that ends earlier leaves at least as much room for everything after, so it can never be the wrong choice. Sort first (P9) so that "everything after" is literally what follows in the loop. Two equivalent codings: sort by start and keep `min(end, prevEnd)` on conflict (above, the canonical NeetCode version), or sort by end and keep an interval only if `start >= prevEnd` (classic activity selection).

**Worked example 3 — Gas Station (LC 134).** Reset on negative.
```python
if sum(gas) < sum(cost): return -1
total = start = 0
for i in range(len(gas)):
    total += gas[i] - cost[i]
    if total < 0:
        total, start = 0, i + 1               # nothing between start and i can be the answer
return start
```
If you run dry at `i` having started at `s`, every start between `s` and `i` also runs dry at `i` (it began with less surplus). So skip them all.

**Where it applies**
- NeetCode 150: Maximum Subarray 53 · Jump Game 55 · Jump Game II 45 · Gas Station 134 · Hand of Straights 846 · Merge Triplets 1899 · Partition Labels 763 · Valid Parenthesis String 678 (track the *range* of possible open counts instead of branching on `*`) · Non-overlapping Intervals 435 · Container With Most Water 11 (the dominance argument for dropping the shorter wall is an exchange argument) · Task Scheduler 621 (most frequent first; the closed form `max(len(tasks), (maxFreq - 1) * (n + 1) + countOfMaxFreq)` is the greedy made explicit) · Min Cost to Connect Points 1584 (Prim/Kruskal cut property). *Not* greedy despite appearances: Reconstruct Itinerary 332. "Always take the smallest lexical edge" fails on tickets JFK→KUL, JFK→NRT, NRT→JFK (it flies to KUL and strands two tickets); Hierholzer's algorithm is required.
- Beyond: activity selection, minimum arrows to burst balloons, assign cookies, candy, queue reconstruction by height, minimum platforms, Huffman coding, fractional knapsack, "boats to save people", most problems whose answer is "sort by X then one pass".

**Pitfalls**
- Greedy without a proof is a guess. If you can't state the exchange argument in one sentence, check whether it is really DP (0/1 knapsack, coin change with arbitrary denominations are *not* greedy).
- The sort key matters: by *start* for merging; for "max non-overlapping" either by *end* (keep if `start >= prevEnd`) or by *start* (keep `min(end, prevEnd)`).
- Frontier problems often have a backward scan that is simpler than the forward one (Jump Game).

---

# MOVE 3 — SWEEP
*"I can process the input in one pass, carrying a small summary of what matters."*

These three principles share a shape: one forward pass, a small amount of state that is updated incrementally, and the promise that the state is *sufficient*, meaning nothing behind the sweep line ever needs to be re-examined. The difference is what the state is: a contiguous window (P8), the previous item in sorted order (P9), or the current extreme of a changing collection (P10).

---

## P8. Sliding window: contiguous range plus a condition means two same-direction pointers and incremental state

**One line.** For "longest / shortest / count of contiguous subarrays or substrings satisfying a condition", grow the right edge, shrink the left edge only as far as the condition requires, and update the window's summary in O(1) per move.

**Recognize it when**
- The words **substring**, **subarray**, **contiguous**, or **window** appear, together with an optimization or a count.
- The condition is about the *contents* of the range: no repeats, at most k distinct, contains all of t, sum ≤ k, at most k replacements.
- The condition is monotone in the window: adding elements can only make it harder (or only easier) to satisfy.
- A fixed window size `k` is given ("every window of size k", "permutation of s1 inside s2").

**The idea.** The brute force tries every `(l, r)` pair and evaluates the condition from scratch: O(n²) or O(n³). Two observations kill that. First, the summary of window `[l, r+1]` is the summary of `[l, r]` plus one element, and the summary of `[l+1, r]` is it minus one element, so each move is O(1) with a count map or set. Second, monotonicity: if `[l, r]` violates the condition, so does every `[l, r']` with `r' > r`, so you must move `l`; and once `[l, r]` is valid you never need to move `l` back. Both pointers only move forward, so the total work is O(n).

For **maximize** problems (longest valid window): expand `r`; while invalid, shrink `l`; record `r - l + 1`.
For **minimize** problems (shortest valid window): expand `r`; while *valid*, record and shrink `l` (the roles flip).

**Invariant.** *Maximize: after the shrink loop, `[l, r]` is the longest valid window ending at `r`. Minimize: the shrink loop runs while `[l, r]` is valid, so when it exits `[l, r]` is invalid and `[l-1, r]` was the shortest valid window ending at `r` (already recorded). In both, the count structure exactly describes the contents of `[l, r]`.*

**Template**
```python
count = {}
l = 0
for r in range(n):
    add(a[r], count)                    # extend
    while not valid(count):             # contract only as far as needed
        remove(a[l], count); l += 1
    best = max(best, r - l + 1)         # window [l, r] is valid here

# fixed-size window of k: add a[r], drop a[r-k], evaluate once r >= k-1
state = init()
for r in range(n):
    add(a[r], state)
    if r >= k: remove(a[r - k], state)
    if r >= k - 1: evaluate(state)
```

**Worked example 1 — Longest Substring Without Repeating Characters (LC 3).**
```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        charSet = set()
        l = 0
        res = 0
        for r in range(len(s)):
            while s[r] in charSet:          # invalid: s[r] already inside
                charSet.remove(s[l])
                l += 1
            charSet.add(s[r])
            res = max(res, r - l + 1)
        return res
```
The set *is* the window. It is never rebuilt, only edited at the edges.

**Worked example 2 — Minimum Window Substring (LC 76).** Shortest window of `s` containing every character of `t` with multiplicity.
```python
class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if len(s) < len(t): return ""
        countT, window = {}, {}
        for c in t:
            countT[c] = 1 + countT.get(c, 0)
        have, need = 0, len(countT)
        res, resLen = [-1, -1], float("inf")
        l = 0
        for r in range(len(s)):
            c = s[r]
            window[c] = 1 + window.get(c, 0)
            if c in countT and window[c] == countT[c]:
                have += 1                                   # one more requirement satisfied
            while have == need:                             # valid: record, then try to shrink
                if (r - l + 1) < resLen:
                    res, resLen = [l, r], r - l + 1
                window[s[l]] -= 1
                if s[l] in countT and window[s[l]] < countT[s[l]]:
                    have -= 1
                l += 1
        l, r = res
        return s[l:r + 1] if resLen != float("inf") else ""
```
Two refinements worth copying: the `have / need` counters make the validity test O(1) instead of comparing two maps, and the inner `while` runs while the window is *valid* because this is a minimization.

**Where it applies**
- NeetCode 150: Longest Substring Without Repeating 3 · Longest Repeating Character Replacement 424 (valid iff `len - maxFreq <= k`) · Permutation in String 567 (fixed size, count signature) · Minimum Window Substring 76 · Sliding Window Maximum 239 (window plus a monotonic deque, P6) · Best Time to Buy/Sell 121 is often filed here but is really P2.
- Beyond: max sum subarray of size k, minimum size subarray sum ≥ s, longest substring with at most k distinct, fruit into baskets, max consecutive ones III, subarrays with k different integers (= atMost(k) − atMost(k−1)), count of nice subarrays, find all anagrams in a string, minimum swaps to group all 1s.

**Pitfalls**
- If the condition is not monotone (e.g., "sum equals k" with negative numbers), the window does not work; use prefix sums with a hash map (P1 + P2).
- In Longest Repeating Character Replacement the `maxFreq` is never decreased on shrink. That is deliberate: a stale high value only makes the window harder to grow and never accepts an invalid answer.
- Count structures must be *decremented* on shrink; forgetting to delete zero-count keys can break "distinct count" conditions.

---

## P9. Sort first; then every comparison is with a neighbor

**One line.** Sorting converts "compare this with everything" into "compare this with the one before it", turning O(n²) pairwise reasoning into a single O(n) pass after an O(n log n) sort.

**Recognize it when**
- Intervals: merge, insert, "can attend all", "how many rooms", "min removals".
- "Does any pair overlap / are any two equal / skip duplicates".
- Events with start and end times ("max concurrent", "minimum platforms").
- A greedy choice that is only safe when items are processed in a specific order (by end time, by size, by position).
- The problem is easy if the input were sorted, and nothing prevents you from sorting it.

**The idea.** After sorting intervals by start, an interval can only overlap the ones immediately around it in the order; if it does not overlap its predecessor's merged block, it cannot overlap anything earlier. So one pass with "the last merged block" as state is enough. For "how many are active at time t", split each interval into a `+1` event at its start and a `-1` event at its end, sort the events, and sweep with a running counter (**sweep line**). For offline queries, sort the queries too and move a pointer through the sorted intervals, adding those that have become relevant to a heap (P10).

**Invariant.** *Everything before the sweep pointer is fully processed, and the carried state (last block, running count, active set) summarizes it.*

**Template**
```python
intervals.sort()                         # by start; elements must be lists if mutated below
merged = [intervals[0]]                  # guard: return [] first if intervals is empty
for s, e in intervals[1:]:
    if s <= merged[-1][1]:               # overlaps the last block only
        merged[-1][1] = max(merged[-1][1], e)
    else:
        merged.append([s, e])

# sweep line
events = [(s, +1) for s, e in iv] + [(e, -1) for s, e in iv]
events.sort()                            # ends before starts at equal time because -1 < +1
cur = best = 0
for _, d in events:
    cur += d; best = max(best, cur)
```

**Worked example 1 — Merge Intervals (LC 56).**
```python
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        if not intervals: return []
        intervals.sort(key=lambda pair: pair[0])
        output = [intervals[0]]
        for start, end in intervals:
            lastEnd = output[-1][1]
            if start <= lastEnd:
                output[-1][1] = max(lastEnd, end)
            else:
                output.append([start, end])
        return output
```

**Worked example 2 — Meeting Rooms II (LC 253).** Minimum rooms = maximum number of simultaneously active meetings.
```python
def minMeetingRooms(self, intervals: List[List[int]]) -> int:
    time = []
    for start, end in intervals:
        time.append((start, 1))
        time.append((end, -1))
    time.sort(key=lambda x: (x[0], x[1]))     # at a tie, the -1 (end) comes first
    count = max_count = 0
    for t in time:
        count += t[1]
        max_count = max(max_count, count)
    return max_count
```
The equivalent formulation with two sorted arrays (starts and ends) and two pointers is the same sweep.

**Where it applies**
- NeetCode 150: Merge Intervals 56 · Insert Interval 57 (input already sorted) · Meeting Rooms 252 · Meeting Rooms II 253 · Non-overlapping Intervals 435 · Minimum Interval to Include Each Query 1851 (sort intervals and queries, sweep with a min-heap of active intervals) · 3Sum 15 (sort to enable two pointers and dedupe) · Car Fleet 853 (sort by position) · Hand of Straights 846 · Subsets II 90 and Combination Sum II 40 (sort so duplicate values are adjacent and can be skipped at the same depth) · Kruskal's MST in 1584 · Reconstruct Itinerary 332 (sort adjacency so Hierholzer's DFS emits the lexically smallest itinerary).
- Beyond: employee free time, minimum platforms, car pooling, my calendar, interval intersection of two lists, skyline (sweep + heap), "maximum population year", meeting scheduler, most problems phrased with `[start, end]` pairs.

**Pitfalls**
- Choose the sort key from the question: by **start** to merge; by **end** (or by start with `min(end, prevEnd)`) to select a maximum non-overlapping set.
- Tie-breaking in sweep lines: decide whether an interval ending at `t` and one starting at `t` overlap, and order the events accordingly.
- Sorting costs O(n log n); if the values are small bounded integers, counting/bucket sort (P1) gets O(n).

---

## P10. Heap: repeatedly need the current min or max of a changing collection

**One line.** Whenever the algorithm says "take the smallest/largest remaining, do something, maybe put something back", a heap gives each step in O(log n) instead of a re-sort or a scan.

**Recognize it when**
- "k largest / k smallest / k closest / k most frequent" (especially with k ≪ n, or a stream).
- "Repeatedly combine the two largest" (stones), "always run the most frequent task", "always expand the cheapest edge" (Dijkstra, Prim).
- Merging k already-sorted sequences.
- Running median (two heaps).
- Offline queries where a sorted sweep needs "the best currently active item".

**The idea.** A sort is O(n log n) and static. A heap gives the extreme in O(1) and insert/remove in O(log n), which is exactly right when the collection changes between queries. Four recurring configurations:

| Configuration | How | Problems |
|---|---|---|
| **Bounded heap of size k** | keep only the k best seen; the root is the k-th best | Kth Largest in Stream 703, K Closest 973, Kth Largest 215 |
| **Live oracle** | heapify everything once, pop/push as the collection mutates | Last Stone Weight 1046, Task Scheduler 621 |
| **K-way merge** | heap holds the current head of each sequence; pop the best, push its successor | Merge K Lists 23, Design Twitter 355 |
| **Two heaps** | max-heap for the lower half, min-heap for the upper half, sizes within 1 | Find Median from Data Stream 295 |

Python's `heapq` is a min-heap; negate values for a max-heap.

**Invariant.** *The heap contains exactly the candidates still eligible, and its root is the best of them.*

**Template**
```python
import heapq
# k largest via bounded min-heap
h = []
for x in nums:
    heapq.heappush(h, x)
    if len(h) > k: heapq.heappop(h)      # evict the smallest; k best remain
kth_largest = h[0]

# k-way merge
h = [(seq[0], i, 0) for i, seq in enumerate(seqs) if seq]
heapq.heapify(h)
while h:
    val, i, j = heapq.heappop(h)
    out.append(val)
    if j + 1 < len(seqs[i]): heapq.heappush(h, (seqs[i][j+1], i, j+1))
```

**Worked example 1 — Kth Largest Element in an Array (LC 215), three ways.**
```python
import heapq, random

def kth_largest_bounded_heap(nums, k):           # O(n log k), O(k) space; works on a stream
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k: heapq.heappop(h)          # evict the smallest; the k largest remain
    return h[0]

def kth_largest_quickselect(nums, k):            # expected O(n); O(n^2) worst without a random pivot
    k = len(nums) - k                            # index in ascending order
    lo, hi = 0, len(nums) - 1
    while True:
        pivot = nums[random.randint(lo, hi)]
        lt, i, gt = lo, lo, hi                   # three-way partition: [lo,lt) < p, [lt,i) == p, (gt,hi] > p
        while i <= gt:
            if nums[i] < pivot:   nums[lt], nums[i] = nums[i], nums[lt]; lt += 1; i += 1
            elif nums[i] > pivot: nums[gt], nums[i] = nums[i], nums[gt]; gt -= 1
            else:                 i += 1
        if k < lt:    hi = lt - 1
        elif k > gt:  lo = gt + 1
        else:         return pivot

def kth_largest_sort(nums, k):                   # O(n log n); simplest, and right if you need the k best in order
    return sorted(nums)[-k]
```
(The canonical NeetCode file heapifies the whole array and pops `n - k` times, which is O(n + (n − k) log n), not a bounded heap; it is correct but do not describe it as O(n log k).) Quickselect discards the side of the partition that cannot contain the k-th element, which is elimination in the spirit of Move 2 but not binary search on a predicate. Knowing all three and their trade-offs is a standard interview exchange.

**Worked example 2 — Find Median from Data Stream (LC 295).**
```python
class MedianFinder:
    def __init__(self):
        self.small, self.large = [], []   # max-heap (negated), min-heap

    def addNum(self, num: int) -> None:
        if self.large and num > self.large[0]:
            heapq.heappush(self.large, num)
        else:
            heapq.heappush(self.small, -num)
        if len(self.small) > len(self.large) + 1:
            heapq.heappush(self.large, -heapq.heappop(self.small))
        if len(self.large) > len(self.small) + 1:
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def findMedian(self) -> float:
        if len(self.small) > len(self.large): return -self.small[0]
        if len(self.large) > len(self.small): return self.large[0]
        return (-self.small[0] + self.large[0]) / 2
```
Invariant: every element in `small` ≤ every element in `large`, and the sizes differ by at most one. The median is then at one or both roots.

**Where it applies**
- NeetCode 150: Kth Largest in a Stream 703 · Last Stone Weight 1046 · K Closest Points 973 · Kth Largest Element 215 · Task Scheduler 621 (max-heap plus a cooldown queue; the greedy closed form in P7 is the O(1)-space answer) · Design Twitter 355 (k-way merge of followees' tweets) · Find Median 295 · Merge K Sorted Lists 23 · Minimum Interval to Include Each Query 1851 (active set by size) · Meeting Rooms II 253 (alternative to the sweep: min-heap of end times) · Network Delay Time 743, Swim in Rising Water 778, Min Cost to Connect Points 1584 (Dijkstra / Prim frontier, P15) · Top K Frequent 347 (heap alternative to bucket sort).
- Beyond: top-k anything, reorganize string, ugly numbers, sliding window median, skyline, IPO, Huffman, merge k sorted arrays, "minimum cost to hire k workers", any simulation that repeatedly takes the extreme.

**Pitfalls**
- Tuple ordering: put the sort key first and a tiebreaker (index) second so the heap never compares unorderable payloads.
- Bounded heap for "k largest" is a **min**-heap (evict the smallest), which feels backwards until you say the invariant out loud.
- Sort when you need the k best *in order*; bounded heap when k ≪ n or the data streams; quickselect when you need only the k-th of a static array and can afford O(n²) worst case (or use a random pivot to make it negligible).

---

# MOVE 4 — DECOMPOSE
*"The answer for the whole is defined by the answers for its parts."*

Recursion is the natural tool when the input has recursive structure (trees), when the problem is "enumerate all configurations" (a decision tree), or when a big instance splits into independent smaller instances. DP (P3) is recursion where the parts *overlap*; the two principles here are recursion where they do not.

---

## P11. Tree recursion: decide what flows up (return value) and what flows down (parameters)

**One line.** Solve the problem for each subtree and combine at the node; anything a node needs from its ancestors is passed down as a parameter, and anything a parent needs from its children is returned upward.

**Recognize it when**
- Any binary tree problem: depth, balance, diameter, path sums, same/subtree, invert, LCA, construct, serialize.
- A per-node property depends on **descendants** (height, subtree sum, "good" nodes below) → bottom-up.
- A per-node property depends on **ancestors** (valid BST range, max on path so far) → top-down.
- "Level by level", "right side view", "zigzag" → BFS with a queue-length snapshot.
- The BST property is mentioned → in-order gives sorted order; one comparison discards a subtree (P4).
- Divide and conquer on arrays: `pow(x, n)` by halving, merge k lists pairwise.

**The idea.** A tree is defined recursively (a node plus two subtrees), so a function defined on trees is naturally recursive. The two design questions:

1. **What does the recursive call return?** Whatever the *parent* needs: height, sum, boolean validity, a tuple of several of these. If the *global* answer is different from what the parent needs (diameter needs `left + right` but the parent needs `1 + max(left, right)`), return what the parent needs and update a `nonlocal` best as a side effect. This "one traversal does two jobs" trick converts O(n²) into O(n).
2. **What do you pass down?** Whatever the node needs from above: bounds for a BST, the running max on the path, the current depth.

**Invariant.** *When `f(node)` returns, the subtree rooted at `node` is fully solved, and the returned value is exactly the summary the parent's recurrence needs.*

**Template**
```python
def dfs(node, inherited):                 # inherited: bounds, running max, depth...
    if not node: return base
    left  = dfs(node.left,  update(inherited, node))
    right = dfs(node.right, update(inherited, node))
    nonlocal best
    best = max(best, combine_for_global(left, right, node))
    return combine_for_parent(left, right, node)

# level order
q = deque([root]) if root else deque()
while q:
    for _ in range(len(q)):               # snapshot: exactly one level
        node = q.popleft(); ...
        if node.left: q.append(node.left)
        if node.right: q.append(node.right)

# iterative in-order (BST -> sorted order; Kth Smallest 230 stops at k)
stack, cur = [], root
while stack or cur:
    while cur:                            # go as far left as possible
        stack.append(cur); cur = cur.left
    cur = stack.pop()
    visit(cur)                            # k -= 1; if k == 0: return cur.val
    cur = cur.right
```

**Worked example 1 — Diameter of Binary Tree (LC 543).** Longest path between any two nodes.
```python
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        res = 0
        def dfs(root):
            nonlocal res
            if not root: return 0
            left, right = dfs(root.left), dfs(root.right)
            res = max(res, left + right)          # path through this node (global answer)
            return 1 + max(left, right)           # height (what the parent needs)
        dfs(root)
        return res
```
The naive solution computes heights at every node from scratch, O(n²). Returning the height while updating the diameter as a side effect makes it one pass. Balanced Binary Tree (110) and Maximum Path Sum (124) are the identical skeleton; Max Path Sum additionally clips negative child contributions to zero.

**Worked example 2 — Validate Binary Search Tree (LC 98).** Top-down bounds.
```python
class Solution:
    def isValidBST(self, root: TreeNode) -> bool:
        def valid(node, left, right):
            if not node: return True
            if not (left < node.val < right): return False
            return valid(node.left, left, node.val) and valid(node.right, node.val, right)
        return valid(root, float("-inf"), float("inf"))
```
Checking only `child < parent` is the classic wrong answer. The correct constraint comes from *all* ancestors, and it is exactly an interval that tightens on the way down. Count Good Nodes (1448) passes the running max down the same way.

**Worked example 3 — Level Order Traversal (LC 102).**
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
```
Snapshotting `len(q)` before the inner loop is what separates levels. Right Side View (199) is this with "keep the last node of each level".

**Where it applies**
- NeetCode 150: Invert 226 · Max Depth 104 · Diameter 543 · Balanced 110 · Same Tree 100 · Subtree of Another Tree 572 (outer traversal, inner `sameTree`) · LCA of BST 235 (one comparison discards a subtree; P4 flavor) · Level Order 102 · Right Side View 199 · Count Good Nodes 1448 · Validate BST 98 · Kth Smallest in BST 230 (in-order, stop at k) · Construct from Preorder/Inorder 105 (preorder head is the root; split inorder around it; hash map for the index, P1) · Max Path Sum 124 · Serialize/Deserialize 297 (preorder with explicit null markers so the shape is recoverable) · Merge K Sorted Lists 23 (pairwise divide and conquer) · Pow(x, n) 50 (halve the exponent).
- Beyond: symmetric tree, path sum I/II/III, house robber III (tree DP returning a pair), flatten to linked list, populate next right pointers, vertical order, boundary traversal, lowest common ancestor of a general tree (return which of p/q were found), N-ary trees, expression trees, segment trees.

**Pitfalls**
- Decide the return type before coding; returning a tuple `(is_valid, height)` is fine and often clearer than a sentinel like `-1`.
- Use `nonlocal` (or a one-element list) for the global best; a bare `res = ...` inside the nested function creates a new local.
- Recursion depth: Python's default limit is ~1000; for skewed trees or deep lists, use an explicit stack or `sys.setrecursionlimit`.
- BST in-order traversal yields sorted order; that fact alone solves Kth Smallest, Validate BST (alternate approach), and "two sum in a BST".

---

## P12. Backtracking: walk the decision tree, choosing, recursing, and undoing, and prune as early as possible

**One line.** To enumerate all subsets / combinations / permutations / partitions / placements, treat each position as a decision, make a choice, recurse, undo the choice, and stop descending the instant a partial solution cannot be completed.

**Recognize it when**
- "Return **all** ..." (subsets, combinations, permutations, partitions, valid strings, board placements, paths spelling a word).
- The output size is inherently exponential, so the goal is to generate each answer once and waste no time on dead branches.
- Constraints are tiny (n ≤ 10–20).
- A search where each step has a few options and some options can be ruled out immediately (N-Queens conflicts, sum exceeding target, non-palindrome prefix).

**The idea.** Picture the tree of partial solutions: the root is the empty choice, each level decides one more thing, leaves are complete candidates. Depth-first traversal of that tree *is* backtracking. The three technical points:

1. **Shared mutable state with undo.** Append before recursing, pop after. This avoids copying the partial solution at every node (copy only at leaves).
2. **Pruning.** Check feasibility *before* recursing (`total > target`, conflict sets in N-Queens, trie prefix miss in Word Search II). Pruning is what makes exponential search acceptable.
3. **Duplicate avoidance.** Sort the input, then at each level skip a value equal to the previous one *at the same level* (Subsets II, Combination Sum II). This generates each distinct answer exactly once rather than deduplicating afterward.

The three canonical shapes:

| Shape | Decision at each level | Problems |
|---|---|---|
| binary choice per element `i` | two branches: include/exclude, or +/− | Subsets 78, Subsets II 90, Target Sum 494 (± per element; memoized → P3) |
| pick the next element from `[start..]` | loop with `start` to avoid reordering | Combination Sum 39/40, Palindrome Partitioning 131 |
| pick any unused element | loop over all, track used | Permutations 46, N-Queens 51 (one column per row) |
| one option per position (cartesian product) | loop over that position's options | Letter Combinations 17, Generate Parentheses 22 |

**Invariant.** *The shared path is exactly the sequence of choices from the root to the current node, and every element of `res` is a complete, valid solution.*

**Template**
```python
def backtrack(start, path):
    if complete(path):
        res.append(path.copy()); return
    for i in range(start, n):
        if not feasible(path, a[i]): continue          # prune (use `break` when a is sorted and infeasibility is monotone)
        if i > start and a[i] == a[i-1]: continue      # skip duplicates (sorted input)
        path.append(a[i])                              # choose
        backtrack(i + 1, path)                         # explore   (i for reuse allowed)
        path.pop()                                     # undo
```

**Worked example 1 — Subsets (LC 78).**
```python
class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        res, subset = [], []
        def dfs(i):
            if i >= len(nums):
                res.append(subset.copy()); return
            subset.append(nums[i]); dfs(i + 1)      # include nums[i]
            subset.pop();           dfs(i + 1)      # exclude nums[i]
        dfs(0)
        return res
```

**Worked example 2 — Combination Sum (LC 39).** Reuse allowed, prune on sum.
```python
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        res = []
        def dfs(i, cur, total):
            if total == target:
                res.append(cur.copy()); return
            if i >= len(candidates) or total > target:      # prune
                return
            cur.append(candidates[i])
            dfs(i, cur, total + candidates[i])              # reuse candidate i
            cur.pop()
            dfs(i + 1, cur, total)                          # move on without it
        dfs(0, [], 0)
        return res
```

**Worked example 3 — N-Queens (LC 51).** Constraint sets make feasibility O(1).
```python
col, posDiag, negDiag = set(), set(), set()     # posDiag: r + c, negDiag: r - c
def backtrack(r):
    if r == n:
        res.append(["".join(row) for row in board]); return
    for c in range(n):
        if c in col or (r + c) in posDiag or (r - c) in negDiag:
            continue
        col.add(c); posDiag.add(r + c); negDiag.add(r - c); board[r][c] = "Q"
        backtrack(r + 1)
        col.remove(c); posDiag.remove(r + c); negDiag.remove(r - c); board[r][c] = "."
```

**Where it applies**
- NeetCode 150: Subsets 78 · Combination Sum 39 · Permutations 46 · Subsets II 90 · Combination Sum II 40 · Target Sum 494 (the un-memoized form) · Word Search 79 (grid DFS with a path set, unmark on return) · Palindrome Partitioning 131 · Letter Combinations 17 · N-Queens 51 · Generate Parentheses 22 (prune with `open < n`, `close < open`) · Word Search II 212 (backtracking guided by a trie) · Add and Search Words 211 (branch on `.`).
- Beyond: combinations, permutations II, sudoku solver, restore IP addresses, expression add operators, word break II, letter case permutation, matchsticks to square, partition to k equal subsets, beautiful arrangement, most "generate all" and "find any assignment" puzzles.

**Pitfalls**
- Copy at the leaf (`path.copy()`), not at every node.
- The reuse decision lives in the recursive index: `dfs(i)` allows reuse, `dfs(i + 1)` forbids it.
- Skip duplicates at the same *level* (`i > start and a[i] == a[i-1]`), not across levels; otherwise you lose valid answers.
- If the same state recurs and you only need a count or an optimum (not the list), you are in P3: add a memo.

---

# MOVE 5 — MODEL AS A GRAPH
*"There are things, and connections between things."*

Half the difficulty of graph problems is noticing that there is a graph: a grid where neighbors are adjacent cells, words that differ by one letter, courses with prerequisites, an array where `i → nums[i]`. Once modeled, the traversal is chosen by the question: *reachability or components* (DFS/BFS), *fewest steps* (BFS), *ordering or cycles in dependencies* (topological sort), *dynamic connectivity* (Union-Find), *cheapest path with weights* (Dijkstra or Bellman-Ford), *cheapest way to connect everything* (MST).

---

## P13. See the graph, then BFS or DFS with a visited set

**One line.** Identify nodes and edges (often implicit), then DFS for reachability, components, and flood fill, or BFS when layers mean distance or time; mark visited so each node is processed once.

**Recognize it when**
- A 2-D grid with "connected", "islands", "regions", "spread", "flow", "surrounded".
- "Minimum number of steps/transformations" between states (words, lock combinations, board positions) → BFS, layer = step count.
- Something spreads from **several** sources at once ("rotten oranges", "distance to nearest gate") → multi-source BFS: seed the queue with every source.
- "Reachable from the border" or "can flow to both oceans" → run the search **from the targets** instead of from every cell.
- Deep copy of a structure with cycles → DFS with an old→new map (P1) as the visited set.

**The idea.** Model: nodes = cells / words / states; edges = the allowed moves. DFS explores one path fully before backing up, which is natural for "mark everything in this component" (flood fill) and for recursion-friendly problems. BFS explores in concentric layers, so the layer at which a node is first reached is its shortest distance in edges; for "minimum steps" in an unweighted graph it is the standard tool (DFS cannot give shortest paths; bidirectional BFS and 0-1 BFS are refinements). **Multi-source BFS** puts all sources in the queue at time 0 and gets every node's distance to its *nearest* source in one pass. **Reverse search** replaces "for each cell, can it reach the border?" (O((mn)²)) with "from every border cell, what can reach me?" (O(mn)) by running the search backward along reversed edges.

**Invariant.** *`visited` is exactly the set of nodes already discovered; in BFS, everything in the queue at the start of round `d` is at distance exactly `d`.*

**Template**
```python
# DFS flood fill on a grid
def dfs(r, c):
    if not (0 <= r < R and 0 <= c < C) or grid[r][c] != target or (r, c) in seen:
        return 0
    seen.add((r, c))
    return 1 + sum(dfs(r+dr, c+dc) for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)))

# (multi-source) BFS with layers = distance
q = deque(sources); seen = set(sources); dist = 0
while q:
    for _ in range(len(q)):
        node = q.popleft()
        for nb in neighbors(node):
            if nb not in seen:
                seen.add(nb); q.append(nb)
    dist += 1

# iterative DFS with an explicit stack (no recursion limit; same visited discipline as BFS)
stack, seen = [start], {start}
while stack:
    node = stack.pop()
    for nb in neighbors(node):
        if nb not in seen:
            seen.add(nb); stack.append(nb)
```

**Worked example 1 — Number of Islands (LC 200).**
```python
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        rows, cols = len(grid), len(grid[0])
        def dfs(r, c):
            if not 0 <= r < rows or not 0 <= c < cols or grid[r][c] == '0':
                return 0
            grid[r][c] = '0'                     # mark visited in place
            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)
            return 1
        return sum(dfs(r, c) for r in range(rows) for c in range(cols))
```
Each unvisited land cell starts a new island; the flood fill consumes the whole island so it is never counted again. Max Area of Island (695) returns the fill size instead of 1.

**Worked example 2 — Rotting Oranges (LC 994).** Multi-source BFS; layers are minutes.
```python
class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        q = collections.deque(); fresh = 0; time = 0
        for r in range(len(grid)):
            for c in range(len(grid[0])):
                if grid[r][c] == 1: fresh += 1
                if grid[r][c] == 2: q.append((r, c))          # every rotten orange is a source
        directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
        while fresh > 0 and q:
            for _ in range(len(q)):                            # one minute
                r, c = q.popleft()
                for dr, dc in directions:
                    row, col = r + dr, c + dc
                    if 0 <= row < len(grid) and 0 <= col < len(grid[0]) and grid[row][col] == 1:
                        grid[row][col] = 2; q.append((row, col)); fresh -= 1
            time += 1
        return time if fresh == 0 else -1
```

**Worked example 3 — Pacific Atlantic Water Flow (LC 417).** Search from the targets.
```python
def dfs(r, c, visit, prevHeight):
    if (r, c) in visit or not (0 <= r < ROWS and 0 <= c < COLS) or heights[r][c] < prevHeight:
        return
    visit.add((r, c))
    for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
        dfs(r + dr, c + dc, visit, heights[r][c])
for c in range(COLS):
    dfs(0, c, pac, heights[0][c]); dfs(ROWS - 1, c, atl, heights[ROWS - 1][c])
for r in range(ROWS):
    dfs(r, 0, pac, heights[r][0]); dfs(r, COLS - 1, atl, heights[r][COLS - 1])
return [[r, c] for r in range(ROWS) for c in range(COLS) if (r, c) in pac and (r, c) in atl]
```
Water flows downhill to the ocean, so walking *uphill from the ocean* visits exactly the cells that can drain to it. Two searches from the two coastlines, then intersect. Surrounded Regions (130) and Walls and Gates (286) use the same inversion.

**Where it applies**
- NeetCode 150: Number of Islands 200 · Max Area of Island 695 · Clone Graph 133 · Pacific Atlantic 417 · Surrounded Regions 130 · Rotting Oranges 994 · Walls and Gates 286 · Word Ladder 127 (nodes = words, edges via wildcard buckets, BFS layers = ladder length) · Word Search 79 / Word Search II 212 (grid DFS with backtracking, P12) · Longest Increasing Path 329 (DFS on the DAG of increasing moves with memo, P3; no cycle check needed because strict increase forbids cycles) · Level Order 102 and Right Side View 199 (BFS on a tree) · Jump Game II 45 (BFS layers done greedily) · Graph Valid Tree 261 (DFS from node 0, skip the parent edge, check all visited) · Reconstruct Itinerary 332 (Eulerian path: DFS that consumes edges and records post-order, then reverse).
- Beyond: flood fill, 01 matrix, shortest path in binary matrix, open the lock, sliding puzzle, knight moves, number of enclaves, closed islands, keys and rooms, all paths from source to target, bipartite check, minimum genetic mutation, snakes and ladders, "shortest bridge" (DFS to find one island, BFS to reach the other).

**Pitfalls**
- Mark visited **when enqueuing**, not when dequeuing, or BFS blows up with duplicates.
- Use BFS, not DFS, whenever the answer is a *minimum number of steps*.
- Grid DFS recursion depth can reach `R*C`; a 300×300 all-land grid overflows Python's default limit. Use the iterative stack template above or BFS for large grids.
- Building the adjacency list can be the bottleneck: Word Ladder compares words by shared wildcard pattern (`h*t`) rather than all pairs, an instance of "index by signature" (P1).

---

## P14. Dependencies and connectivity: topological sort for "before/after", Union-Find for "same group"

**One line.** Directed prerequisites are a DAG question: detect cycles with an "on the current path" set and emit post-order for a valid order. Undirected "are these connected / how many groups / does this edge close a cycle" questions are answered incrementally by Union-Find.

**Recognize it when**
- "Prerequisites", "must come before", "build order", "derive an alphabet from sorted words" → topological sort / cycle detection.
- "Can all courses be finished?" → is the dependency graph acyclic.
- Undirected edges given as a list plus "number of connected components", "is it a tree", "which edge is redundant", "merge accounts" → Union-Find.
- Edges arrive one at a time and you need connectivity after each.

**The idea.**

*Topological sort.* In a DFS over a directed graph, three colors matter: unvisited, **on the current recursion path**, and finished. Reaching a node that is on the current path means a back edge, hence a cycle. Appending each node *after* all its dependencies are finished (post-order) produces an order where every dependency precedes its dependents; reverse if the edges point the other way. Kahn's alternative (iterative, so no recursion limit): repeatedly remove nodes with in-degree zero; if some node never reaches zero, there is a cycle. Code is in the template.

*Union-Find (disjoint set union).* Each node points to a parent; the root identifies the component. `find(x)` follows parents to the root, compressing the path as it goes; `union(a, b)` links the roots (by rank/size). If `find(a) == find(b)` before a union, the edge `(a, b)` closes a cycle. Near-O(1) amortized per operation, no adjacency list needed.

*Tree test.* An undirected graph on `n` nodes is a tree iff it has exactly `n - 1` edges and is connected (equivalently: `n - 1` edges and no cycle).

**Invariant.** *Topo: every node in `output` has all of its dependencies already in `output`. DSU: `find(x) == find(y)` iff `x` and `y` are in the same component under the edges processed so far.*

**Template**
```python
# DFS topological sort with cycle detection
def dfs(u):
    if u in on_path: return False           # cycle
    if u in done:    return True
    on_path.add(u)
    for v in adj[u]:
        if not dfs(v): return False
    on_path.remove(u); done.add(u)
    order.append(u)                         # post-order
    return True

# Kahn's topological sort (BFS on in-degree)
indeg = [0] * n
for u in range(n):
    for v in adj[u]: indeg[v] += 1
q = deque(u for u in range(n) if indeg[u] == 0)
order = []
while q:
    u = q.popleft(); order.append(u)
    for v in adj[u]:
        indeg[v] -= 1
        if indeg[v] == 0: q.append(v)
has_cycle = len(order) < n

# Union-Find (union by size, path compression)
parent = list(range(n)); size = [1] * n
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]       # path compression
        x = parent[x]
    return x
def union(a, b):
    ra, rb = find(a), find(b)
    if ra == rb: return False               # already connected: this edge makes a cycle
    if size[ra] < size[rb]: ra, rb = rb, ra
    parent[rb] = ra; size[ra] += size[rb]
    return True
```

**Worked example 1 — Course Schedule II (LC 210).** Return a valid order or `[]`.
```python
class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        prereq = {c: [] for c in range(numCourses)}
        for crs, pre in prerequisites:
            prereq[crs].append(pre)
        output, visit, cycle = [], set(), set()
        def dfs(crs):
            if crs in cycle: return False
            if crs in visit: return True
            cycle.add(crs)
            for pre in prereq[crs]:
                if not dfs(pre): return False
            cycle.remove(crs); visit.add(crs)
            output.append(crs)                  # all prereqs already appended
            return True
        for c in range(numCourses):
            if not dfs(c): return []
        return output
```
Course Schedule (207) is the same function returning only the boolean. Alien Dictionary (269) first extracts one edge per adjacent word pair (the first differing character), then runs exactly this.

**Worked example 2 — Redundant Connection (LC 684).** The one edge whose removal leaves a tree.
```python
class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        par = [i for i in range(len(edges) + 1)]
        rank = [1] * (len(edges) + 1)
        def find(n):
            p = par[n]
            while p != par[p]:
                par[p] = par[par[p]]; p = par[p]
            return p
        def union(n1, n2):
            p1, p2 = find(n1), find(n2)
            if p1 == p2: return False
            if rank[p1] > rank[p2]: par[p2] = p1; rank[p1] += rank[p2]
            else:                   par[p1] = p2; rank[p2] += rank[p1]
            return True
        for n1, n2 in edges:
            if not union(n1, n2):
                return [n1, n2]
```
Processing edges in order, the first one whose endpoints are already connected is the redundant edge. Number of Connected Components (323) counts the unions that succeed and subtracts from `n`.

**Where it applies**
- NeetCode 150: Course Schedule 207 · Course Schedule II 210 · Alien Dictionary 269 · Redundant Connection 684 · Number of Connected Components 323 · Graph Valid Tree 261 · Min Cost to Connect Points 1584 (Kruskal's variant uses DSU).
- Beyond: parallel courses, minimum height trees, find eventual safe states, sequence reconstruction, accounts merge, number of provinces, satisfiability of equality equations, most stones removed, making a large island, "evaluate division" (weighted DSU), detecting deadlocks, build systems, spreadsheet formulas.

**Pitfalls**
- The cycle set is *only* the current recursion path; a separate `done` set memoizes finished nodes or the DFS becomes exponential.
- Direction of edges: decide whether `output` is dependencies-first or dependents-first, and reverse if needed.
- For undirected DFS cycle detection, skip the edge back to the immediate parent, or every edge looks like a cycle.
- DSU with neither path compression nor union by rank/size degrades to O(n) per find; union by size alone gives O(log n); both together give near-constant amortized. Always write both.
- Longest Increasing Path 329 looks like it needs cycle detection but does not: strict increase along every edge makes the implicit graph a DAG, so plain memoized DFS (P3) is safe.

---

## P15. Weighted paths: Dijkstra when weights are non-negative, Bellman-Ford rounds when hops are limited, Prim/Kruskal to connect everything

**One line.** Pop the cheapest frontier node from a heap and finalize it; that greedy step is correct whenever the path cost never decreases as the path grows, and it adapts to "minimize the maximum edge" or "cheapest spanning tree" by changing one line.

**Recognize it when**
- Edges have weights/times/costs and the question is "minimum time/cost to reach X" or "time for the signal to reach everyone".
- "Path that minimizes the maximum step" (swim in rising water, minimum effort path).
- "Connect all points with minimum total cost" → minimum spanning tree.
- "Cheapest path with **at most k stops**" → the hop cap breaks Dijkstra's finalize-on-pop guarantee; use k+1 rounds of edge relaxation (Bellman-Ford) or put the remaining budget in the state.

**The idea.** Dijkstra is BFS with a priority queue: instead of popping in arrival order, pop the node with the smallest known cost. With non-negative weights, the first time a node is popped its cost is final, because every other path to it passes through something already at least as expensive. The relaxation `new = cost + w` can be replaced by `new = max(cost, w)` for bottleneck paths; the argument still holds because the path cost never decreases as the path grows (`max(cost, w) >= cost`), which is the actual requirement. Monotone alone is not enough: widest path with `min` is monotone but a min-heap finalizes the wrong nodes, and maximum-probability paths (multiply by `p <= 1`) only work because they switch to a max-heap. Prim's MST is the same loop with `new = w` (the cost of the connecting edge only) and the answer is the *sum of popped costs*, not the last one. Kruskal's MST sorts all edges and adds each with Union-Find unless it would form a cycle. Bellman-Ford relaxes every edge once per round; after `k + 1` rounds you have the cheapest path using at most `k + 1` edges, which is exactly what a stop limit asks for. Snapshot the distances each round so a single round can't chain two hops.

**Invariant.** *Dijkstra/Prim: every node in `visited` has its final cost; the heap holds the best known cost to every frontier node. Bellman-Ford: after round `i`, `dist[v]` is the cheapest path to `v` using at most `i` edges.*

**Template**
```python
# Dijkstra (sum) / bottleneck (max) / Prim (edge weight only)
heap = [(0, src)]; done = set(); dist = {}
while heap:
    cost, u = heapq.heappop(heap)
    if u in done: continue
    done.add(u); dist[u] = cost
    for v, w in adj[u]:
        if v not in done:
            heapq.heappush(heap, (cost + w, v))     # max(cost, w) for bottleneck; w for Prim (then total += cost on pop)
    # early exit: if u == target: return cost

# Dijkstra with a resource in the state (787: at most k stops). Key `done`/best on (node, stops), never on node alone.
best = {}                                           # (node, stops_used) -> cost
heap = [(0, src, 0)]
while heap:
    cost, u, stops = heapq.heappop(heap)
    if u == dst: return cost
    if stops > k or best.get((u, stops), float('inf')) < cost: continue
    for v, w in adj[u]:
        if cost + w < best.get((v, stops + 1), float('inf')):
            best[(v, stops + 1)] = cost + w
            heapq.heappush(heap, (cost + w, v, stops + 1))

# Bellman-Ford limited to k+1 edges
dist = [inf] * n; dist[src] = 0
for _ in range(k + 1):
    nxt = dist[:]
    for u, v, w in edges:
        if dist[u] + w < nxt[v]: nxt[v] = dist[u] + w
    dist = nxt
```

**Worked example 1 — Network Delay Time (LC 743).**
```python
class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        edges = collections.defaultdict(list)
        for u, v, w in times:
            edges[u].append((v, w))
        minHeap = [(0, k)]; visit = set(); t = 0
        while minHeap:
            w1, n1 = heapq.heappop(minHeap)
            if n1 in visit: continue
            visit.add(n1); t = w1                      # finalized: t is the latest arrival so far
            for n2, w2 in edges[n1]:
                if n2 not in visit:
                    heapq.heappush(minHeap, (w1 + w2, n2))
        return t if len(visit) == n else -1
```
Swim in Rising Water (778) is this exact code with `max(w1, grid[r][c])` in place of `w1 + w2` (or: binary-search the answer and check reachability, P4 + P13). Min Cost to Connect Points (1584) is this loop pushing the edge weight alone and accumulating `total += cost` at each pop (Prim). Kruskal's alternative: sort all edges, add each with Union-Find unless it closes a cycle (P9 + P14).

**Worked example 2 — Cheapest Flights Within K Stops (LC 787).**
```python
class Solution:
    def findCheapestPrice(self, n, flights, src, dst, k) -> int:
        prices = [float("inf")] * n
        prices[src] = 0
        for i in range(k + 1):                          # at most k stops = k+1 edges
            tmpPrices = prices.copy()                   # relax off last round's values only
            for s, d, p in flights:
                if prices[s] == float("inf"): continue
                if prices[s] + p < tmpPrices[d]:
                    tmpPrices[d] = prices[s] + p
            prices = tmpPrices
        return -1 if prices[dst] == float("inf") else prices[dst]
```
Plain Dijkstra could finalize a cheap route that uses too many stops and then never revisit the destination. Bounded rounds respect the hop budget by construction.

**Where it applies**
- NeetCode 150: Network Delay Time 743 · Swim in Rising Water 778 · Min Cost to Connect All Points 1584 (Prim or Kruskal) · Cheapest Flights Within K Stops 787.
- Beyond: path with minimum effort, path with maximum probability (max-heap, multiply), minimum cost to make at least one valid path, number of ways to arrive at destination, connecting cities with minimum cost, optimize water distribution, "reachable nodes with time budget", negative-weight detection (full Bellman-Ford), all-pairs (Floyd-Warshall) when n ≤ 400.

**Pitfalls**
- Lazy deletion: the heap may hold stale entries for a node; skip them with `if u in done: continue` rather than trying to update in place.
- Dijkstra is wrong with negative edges and wrong when an extra constraint (hops, fuel) means a costlier-so-far path can win later; then add the resource to the state or use Bellman-Ford.
- For dense point sets (1584) the implicit complete graph has O(n²) edges; Prim with a heap is O(n² log n), acceptable for n ≤ 1000. Array-based Prim (scan for the cheapest unvisited node each round) is O(n²) with no heap.

---

# MOVE 6 — MANIPULATE IN PLACE
*"The constraint is really about memory or mechanics."*

These two principles are less "insight" and more "fluency". They cover problems where the algorithmic idea is simple but the constraint (O(1) space, no extra data structure, no `+` operator, 32-bit overflow) forces you to operate on the structure you were given. Drill the idioms until they are automatic; they are the times tables of this subject.

---

## P16. Linked-list pointer surgery: fast/slow pointers, reverse with a saved `next`, dummy head, old→new map

**One line.** Linked-list problems are solved by a handful of pointer idioms: two pointers at different speeds or a fixed gap to find positions without knowing the length, reversal by saving `next` before overwriting it, a dummy head to remove edge cases, and a hash map when nodes reference nodes.

**Recognize it when**
- Any singly linked list problem.
- "Middle of the list", "detect a cycle", "k-th from the end", "start of the cycle" → fast/slow or gap pointers.
- "Reverse" (whole list, a segment, every k nodes) → three-pointer reversal.
- Building or splicing a list where the head might change → dummy head.
- A sequence defined by repeatedly applying a function (`i → nums[i]`, `n → sum of squared digits`) is an implicit linked list → cycle detection applies (Find the Duplicate Number, Happy Number).

**The idea.**
- **Fast/slow.** If `fast` moves two steps for every one of `slow`, then when `fast` reaches the end `slow` is at the middle; and if there is a cycle they must meet inside it, because the gap between them shrinks by one each step modulo the cycle length. A second phase (reset one pointer to the head, move both at speed one) finds the cycle's entry.
- **Fixed gap.** Advance `right` by `n` first; then move both until `right` falls off; `left` is `n` from the end.
- **Reversal.** `nxt = cur.next; cur.next = prev; prev = cur; cur = nxt`. The whole trick is saving `nxt` before you overwrite the link.
- **Dummy head.** `dummy = ListNode(0, head)` lets "delete the head" and "insert before the head" fall out of the general case.
- **Old→new map.** When a node points to an arbitrary other node (random pointer, graph neighbor), create all copies first and record `old → new`, then wire pointers through the map.

**Invariant.** *Reversal: `prev` is the head of the fully reversed prefix; `cur` is the first unprocessed node. Fast/slow: `fast` has moved exactly twice as far as `slow`.*

**Template**
```python
# reverse
prev, cur = None, head
while cur:
    nxt = cur.next; cur.next = prev; prev = cur; cur = nxt
return prev

# middle / cycle
slow = fast = head
while fast and fast.next:
    slow, fast = slow.next, fast.next.next
    if slow is fast: ...   # cycle

# k-th from end: right starts k+1 ahead of left (left starts on the dummy)
dummy = ListNode(0, head); left, right = dummy, head
for _ in range(k): right = right.next
while right: left, right = left.next, right.next
left.next = left.next.next

# Floyd phase 2: locate the cycle entry (Linked List Cycle II 142, Find the Duplicate 287)
slow = fast = head
while fast and fast.next:
    slow, fast = slow.next, fast.next.next
    if slow is fast: break
else:
    return None                       # no cycle
p = head
while p is not slow:                  # distance head->entry == distance meeting->entry
    p, slow = p.next, slow.next
return p
```

**Worked example 1 — Reverse Linked List (LC 206).**
```python
class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        prev, curr = None, head
        while curr:
            temp = curr.next
            curr.next = prev
            prev = curr
            curr = temp
        return prev
```
Reorder List (143) is: find the middle (fast/slow), reverse the second half (this), then interleave. Reverse Nodes in K-Group (25) runs this on each block and re-links the block boundaries.

**Worked example 2 — Remove Nth Node From End (LC 19), with dummy head and gap pointers.**
```python
class Solution:
    def removeNthFromEnd(self, head: ListNode, n: int) -> ListNode:
        dummy = ListNode(0, head)
        left, right = dummy, head
        for _ in range(n):
            right = right.next
        while right:
            left, right = left.next, right.next
        left.next = left.next.next
        return dummy.next
```

**Worked example 3 — Linked List Cycle (LC 141).**
```python
slow, fast = head, head
while fast and fast.next:
    slow, fast = slow.next, fast.next.next
    if slow == fast: return True
return False
```
Find the Duplicate Number (287) runs this on `i → nums[i]` with a second phase to locate the entry, which is the duplicate.

**Where it applies**
- NeetCode 150: Reverse Linked List 206 · Merge Two Sorted Lists 21 (dummy head, two-pointer merge) · Reorder List 143 (fast/slow, reverse, splice; P5 for the merge) · Remove Nth From End 19 · Copy List with Random Pointer 138 (old→new map) · Add Two Numbers 2 (dummy head, carry) · Linked List Cycle 141 · Find the Duplicate Number 287 (phase 2 finds the entry) · LRU Cache 146 (hash map + doubly linked list, dummy head and tail) · Merge K Sorted Lists 23 (the pairwise merge is pointer splicing) · Reverse Nodes in K-Group 25 · Happy Number 202 (phase 1 only: does the sequence cycle without hitting 1).
- Beyond: palindrome linked list, middle of the linked list, linked list cycle II, swap nodes in pairs, rotate list, partition list, odd-even list, remove duplicates from sorted list, flatten a multilevel list, intersection of two linked lists (align lengths with the gap trick), sort list (merge sort on lists).

**Pitfalls**
- Always save `next` before overwriting it. Always.
- Check `fast and fast.next` before `fast.next.next`.
- Return `dummy.next`, not `head`, when the head might have changed.
- Draw the pointers for the boundary case of one or two nodes before coding; most bugs are there.

---

## P17. Bits, digits, and O(1) space: XOR cancellation, `n & (n-1)`, digit-by-digit carry, reuse the input as scratch space

**One line.** When the constraint forbids extra memory or the native operator, work at the level of the representation: cancel pairs with XOR, peel bits with `n & (n-1)` or `n >> 1`, simulate arithmetic one digit at a time with a carry, and store flags inside the input itself.

**Recognize it when**
- "Every element appears twice except one", "one number is missing from 0..n" → XOR.
- "Count set bits", "reverse bits", "for every i in 0..n count bits" → bit identities and `dp[i] = dp[i >> 1] + (i & 1)`.
- "Add / multiply numbers given as strings or digit arrays", "plus one", "reverse an integer with overflow rules" → digit simulation with carry.
- "Do it in place", "O(1) extra space" on a matrix → boundary pointers or reuse the first row/column as markers.
- "Implement `+` without `+`" → XOR is the sum without carry, AND shifted left is the carry.
- "Compute xⁿ fast" → square and halve.

**The idea.** These are identities, not insights, but each removes an entire data structure or loop:

| Identity / idiom | What it buys | Problems |
|---|---|---|
| `a ^ a = 0`, `a ^ 0 = a`, XOR is commutative | pairs cancel; the unpaired survivor remains; XOR indices against values to find the missing one | Single Number 136, Missing Number 268 |
| `n & (n - 1)` clears the lowest set bit | popcount in O(bits set) | Number of 1 Bits 191 |
| `bits(i) = bits(i >> 1) + (i & 1)` | O(n) counting bits for all i (P3 in one line) | Counting Bits 338 |
| `res = (res << 1) | (n & 1); n >>= 1` | reverse bits in 32 steps | Reverse Bits 190 |
| `sum = a ^ b; carry = (a & b) << 1`, loop until carry is 0, mask to 32 bits | addition from primitives | Sum of Two Integers 371 |
| digit loop with `carry, d = divmod(x + y + carry, 10)` | arbitrary-precision add/multiply on strings or lists | Plus One 66, Multiply Strings 43, Add Two Numbers 2 |
| check `res > (MAX - d) // 10` **before** `res = res * 10 + d` (on the magnitude; the negative bound never binds for a reversal) | overflow detection without a wider type | Reverse Integer 7 |
| `x^n = (x^(n//2))^2 * (x if n odd)` | O(log n) power | Pow(x, n) 50 |
| transpose then reverse each row | 90° rotation in place | Rotate Image 48 |
| four shrinking boundaries (`top, bottom, left, right`) | spiral traversal without a visited set (filed under P5 in the index: converging pointers) | Spiral Matrix 54 |
| first row and first column as marker storage plus one flag | O(1)-space "which rows/cols to zero" | Set Matrix Zeroes 73 |

**Template**
```python
# XOR survivor
res = 0
for x in nums: res ^= x

# popcount
while n: n &= n - 1; cnt += 1

# digit simulation
i, j, carry, out = len(a) - 1, len(b) - 1, 0, []
while i >= 0 or j >= 0 or carry:
    carry, d = divmod((int(a[i]) if i >= 0 else 0) + (int(b[j]) if j >= 0 else 0) + carry, 10)
    out.append(str(d)); i -= 1; j -= 1
return "".join(reversed(out))
```

**Worked example 1 — Single Number (LC 136).**
```python
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        res = 0
        for n in nums:
            res = n ^ res
        return res
```
The hash-set solution toggles membership; XOR toggles bits. Same idea, zero memory. Missing Number (268) XORs every index `0..n` and every value; everything present cancels.

**Worked example 2 — Set Matrix Zeroes (LC 73).** Reuse the input as marker space.
```python
class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        ROWS, COLS = len(matrix), len(matrix[0])
        rowZero = False
        for r in range(ROWS):
            for c in range(COLS):
                if matrix[r][c] == 0:
                    matrix[0][c] = 0                 # column marker lives in row 0
                    if r > 0: matrix[r][0] = 0       # row marker lives in column 0
                    else:     rowZero = True         # row 0's own marker needs a flag
        for r in range(1, ROWS):
            for c in range(1, COLS):
                if matrix[0][c] == 0 or matrix[r][0] == 0:
                    matrix[r][c] = 0
        if matrix[0][0] == 0:
            for r in range(ROWS): matrix[r][0] = 0
        if rowZero:
            for c in range(COLS): matrix[0][c] = 0
```
The O(m + n) solution keeps two boolean arrays. Those arrays are moved into the matrix's first row and column, with a single scalar to disambiguate the shared corner.

**Worked example 3 — Pow(x, n) (LC 50).**
```python
def helper(x, n):
    if n == 0: return 1              # check n first so pow(0, 0) == 1
    if x == 0: return 0
    res = helper(x * x, n // 2)
    return x * res if n % 2 else res
res = helper(x, abs(n))
return res if n >= 0 else 1 / res
```

**Where it applies**
- NeetCode 150: Single Number 136 · Number of 1 Bits 191 · Counting Bits 338 · Reverse Bits 190 · Missing Number 268 · Sum of Two Integers 371 · Reverse Integer 7 · Plus One 66 · Multiply Strings 43 · Add Two Numbers 2 · Pow(x, n) 50 · Rotate Image 48 · Set Matrix Zeroes 73. (Spiral Matrix 54 is filed under P5; Encode and Decode Strings 271 is framing, not bits, and is filed under P18 with the memorize table.)
- Beyond: single number II/III, power of two/four, hamming distance, bitwise AND of a range, subsets via bitmask, gray code, add binary, add strings, string to integer (atoi), integer to Roman, find all duplicates in an array (sign-flip marking), first missing positive (index-as-hash), game of life (encode next state in spare bits), rotate array by reversal.

**Pitfalls**
- Python integers are unbounded; simulate 32-bit wraparound explicitly with `& 0xFFFFFFFF` and convert back for negatives.
- Overflow checks go **before** the operation that would overflow.
- In-place marking corrupts the input; confirm that is allowed (and restore if not).
- `n & (n - 1)` is a fact to memorize, not derive. So is `r + c` / `r - c` for diagonals (N-Queens).

---

# MOVE 0 — REFORMULATE
*"Is there a different way to see this problem that turns it into one I know?"*

This is listed last because it is the hardest to teach and the first thing experts do. Most of the "hard" problems in the 150 are a known principle behind a disguise, and the disguise is removed by one of a small number of re-descriptions.

---

## P18. Change the representation until a known principle applies

**One line.** Before searching for an algorithm, try to restate the problem: reverse the direction, fix a different variable, name the hidden structure, rewrite the equation, or turn "find the best" into "check a guess".

**Recognize it when**
- The direct approach is exponential or O(n²) and no principle from Moves 1–6 obviously fits.
- The problem statement describes a *process* (water flowing, oranges rotting, balloons bursting, a car catching up) rather than a structure.
- A constraint like "circular", "in place", "without division", "using each ticket once" seems to break a standard method.
- The input is an array but the indices behave like pointers (`nums[i]` is in `[1, n]`).

**The reformulations that recur in the 150**

| Re-description | Before → after | Problems |
|---|---|---|
| **Reverse the direction of the search** | "which cells can reach the ocean?" → "which cells can the ocean reach uphill?"; "can I reach the end?" → scan backward from the end | Pacific Atlantic 417, Surrounded Regions 130, Walls and Gates 286, Jump Game 55 |
| **Fix what happens *last*, not first** | "which balloon to burst first?" (neighbors change) → "which balloon is burst last in this range?" (neighbors are fixed: the range endpoints) | Burst Balloons 312 |
| **Rewrite the equation** | "assign ± to hit target" → "find subsets summing to (total + target) / 2"; "find a pair with a + b = t" → "for each a, look up t − a" | Target Sum 494, Two Sum 1 |
| **Split a circular constraint** | circle of houses → max of two lines (exclude first, exclude last) | House Robber II 213 |
| **Canonical form** | anagram → sorted string or 26-count tuple; "words one letter apart" → shared wildcard pattern `h*t` | Group Anagrams 49, Word Ladder 127 |
| **Name the hidden graph/list** | array of indices → linked list with a cycle; grid of heights with "strictly increasing" → a DAG; a 2-D sorted matrix → one sorted array | Find the Duplicate 287, Happy Number 202, Longest Increasing Path 329, Search a 2D Matrix 74 |
| **Guess and check (search the answer)** | "minimum speed" → "is speed k enough?" + binary search; "minimum time to swim" → "is the grid reachable at time t?" | Koko 875, Swim in Rising Water 778 (alternative) |
| **Search a structural parameter** | "median of two sorted arrays" → "how many elements of A belong to the left half?" + binary search on that count | Median of Two Sorted Arrays 4 |
| **Make the encoding self-describing** | "join strings with a separator" (ambiguous) → length-prefix each string; "serialize a tree" → emit explicit null markers | Encode and Decode Strings 271, Serialize and Deserialize 297 |
| **Geometry pins the unknowns** | "count squares" → pick the diagonal partner; the other two corners are forced | Detect Squares 2013 |
| **Convert a process to a static quantity** | cars catching up → arrival times, sorted by position; overlapping meetings → +1/−1 events | Car Fleet 853, Meeting Rooms II 253 |
| **Track a range instead of a value** | ambiguous `*` → `[min_open, max_open]` | Valid Parenthesis String 678 |
| **Minimal signal extraction** | compare adjacent sorted words, keep only the first differing letter as an edge | Alien Dictionary 269 |

**Worked example 1 — Target Sum (LC 494).**
```python
class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        dp = {}  # (index, total) -> ways
        def backtrack(i, total):
            if i == len(nums):
                return 1 if total == target else 0
            if (i, total) in dp: return dp[(i, total)]
            dp[(i, total)] = backtrack(i + 1, total + nums[i]) + backtrack(i + 1, total - nums[i])
            return dp[(i, total)]
        return backtrack(0, 0)
```
As written, it is P12 (two branches per element) turned into P3 by a memo on `(i, total)`. The sharper reformulation: if the positives sum to `P` and the negatives to `N`, then `P − N = target` and `P + N = total`, so `P = (total + target) / 2` and the problem is "count subsets with sum P", a 1-D knapsack. Two guards first: if `total + target` is odd or `abs(target) > total`, the answer is 0.

**Worked example 2 — Burst Balloons (LC 312).**
```python
class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        cache = {}
        nums = [1] + nums + [1]
        for offset in range(2, len(nums)):
            for left in range(len(nums) - offset):
                right = left + offset
                for pivot in range(left + 1, right):
                    coins = nums[left] * nums[pivot] * nums[right]
                    coins += cache.get((left, pivot), 0) + cache.get((pivot, right), 0)
                    cache[(left, right)] = max(coins, cache.get((left, right), 0))
        return cache.get((0, len(nums) - 1), 0)
```
Choosing the *first* balloon to burst in a range does not decompose: its neighbors depend on what else has been burst. Choosing the *last* balloon does: when it is burst, its neighbors are exactly `nums[left]` and `nums[right]`, and the two sub-ranges are independent. That single re-description turns an O(n!) process into O(n³) interval DP (P3).

**Where it applies**
- The problems in the 150 where the main difficulty is seeing the right model rather than executing a template: 4, 42, 127, 130, 213, 269, 286, 287, 312, 329, 417, 494, 678, 853, 2013, 271, 297, and the Hards 212, 25, 51, 1851, 332, 778 where two or three principles must be composed (see `CONTRASTS.md` Part C).
- Beyond: anything where the naive model is a simulation. Ask: what quantity does the simulation compute, and can it be computed directly?

**How to practice this move.** After solving any problem, write one sentence of the form *"This was really [P-number] once I saw the input as ___."* The sentence is the transferable part; the code is not.

---

# Tricks that genuinely must be memorized

Fourteen problems in the 150 depend on a detail that no principle above will generate for you under time pressure. Learn them as facts. Code for the two algorithmic ones follows the table.

| Problem | The fact |
|---|---|
| Median of Two Sorted Arrays 4 | Binary-search the partition of the shorter array; use ±∞ sentinels for the four boundary values; valid when `Aleft ≤ Bright` and `Bleft ≤ Aright`. |
| Encode and Decode Strings 271 | Length-prefix framing: `f"{len(s)}#{s}"`. Decoding never depends on payload content. |
| Reconstruct Itinerary 332 | Eulerian path = Hierholzer's algorithm: DFS that pops edges as it uses them, records nodes in post-order, then reverses. Sort adjacency for lexical order. |
| Burst Balloons 312 | Pivot on the balloon burst *last* in the range; pad with 1s. |
| Sum of Two Integers 371 | `a ^ b` is the carry-less sum, `(a & b) << 1` is the carry; loop until carry is 0; mask with `0xFFFFFFFF` and restore the sign. |
| Detect Squares 2013 | For query `(px, py)` and each stored `(x, y)` with `|x−px| == |y−py|` **and `x != px`** (exclude zero-area squares, including a stored copy of the query point), add `count[(x, py)] * count[(px, y)]`. |
| Task Scheduler 621 | Closed form: `max(len(tasks), (maxFreq − 1) * (n + 1) + numberOfTasksWithMaxFreq)`. |
| Maximum Product Subarray 152 | Track running max **and** min because a negative swaps them. |
| Regular Expression Matching 10 | For `p[j+1] == '*'`: `dp[i][j] = dp[i][j+2] or (match and dp[i+1][j])`. |
| Longest Repeating Character Replacement 424 | Never decrement `maxFreq` when shrinking; a stale value can only make the window harder to grow, never wrongly accept. |
| N-Queens 51 | Diagonals are `r + c` and `r − c`. |
| Number of 1 Bits 191 | `n & (n − 1)` clears the lowest set bit. |
| Find the Duplicate 287 / Happy Number 202 | `i → nums[i]` (or `n → f(n)`) is a linked list. 287 needs Floyd's second phase to find the cycle entry (the duplicate); 202 needs only phase one (does it cycle without reaching 1). |
| Set Matrix Zeroes 73 | First row/column as markers, plus one flag for the corner. |

**Hierholzer's algorithm (Reconstruct Itinerary 332).** Every ticket is an edge; use each exactly once, lexically smallest itinerary. Sort each adjacency list in reverse so `pop()` yields the smallest; a node is appended only when it has no unused edges left (post-order); reverse at the end.
```python
def findItinerary(tickets):
    adj = collections.defaultdict(list)
    for a, b in sorted(tickets, reverse=True):
        adj[a].append(b)                    # reverse-sorted so pop() gives the smallest
    route = []
    def dfs(u):
        while adj[u]:
            dfs(adj[u].pop())               # consume the edge before recursing
        route.append(u)                     # post-order
    dfs("JFK")
    return route[::-1]
```

**Median of Two Sorted Arrays (4).** Binary-search how many elements `i` of the shorter array `A` go in the left half; `j = half - i` come from `B`. The partition is valid when `A[i-1] <= B[j]` and `B[j-1] <= A[i]`, with ±∞ standing in for out-of-range indices.
```python
def findMedianSortedArrays(A, B):
    if len(A) > len(B): A, B = B, A
    m, n = len(A), len(B)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    while lo <= hi:
        i = (lo + hi) // 2; j = half - i
        Aleft  = A[i - 1] if i > 0 else float('-inf')
        Aright = A[i]     if i < m else float('inf')
        Bleft  = B[j - 1] if j > 0 else float('-inf')
        Bright = B[j]     if j < n else float('inf')
        if Aleft <= Bright and Bleft <= Aright:
            if (m + n) % 2: return max(Aleft, Bleft)
            return (max(Aleft, Bleft) + min(Aright, Bright)) / 2
        if Aleft > Bright: hi = i - 1
        else:              lo = i + 1
```

---

# How to study with this document

1. **Learn the six questions first.** Before touching a problem, be able to recite the table at the top and give one example per row.
2. **For each principle, do the worked examples cold.** Read the trigger and the idea, close the file, write the code from the invariant. Compare. The template should feel inevitable, not memorized.
3. **Then do the "Where it applies" list for that principle in one sitting.** You are training recognition: same idea, six surface stories. Say the invariant before each.
4. **Then interleave.** Pull problems at random from the whole 150 and run the six questions before coding. Recognition under uncertainty is the actual interview skill; studying by category never trains it.
5. **Keep a one-line log per problem:** `#id — P-number — "the invariant".` Review the log, not the solutions.
6. **Memorize the table above** like vocabulary.

---

# Coverage index: every NeetCode 150 problem mapped to its principle

Primary principle is the move that produces the optimal solution; secondary principles are used inside it. Where a problem sits on a boundary (Kadane is greedy, DP, and a running aggregate at once), the primary is a judgment call and the secondaries record the rest. Counts of primary assignments:

| Principle | # problems as primary |
|---|---|
| P3 Dynamic programming | 21 |
| P11 Tree recursion | 15 |
| P12 Backtracking | 11 |
| P16 Pointer surgery | 11 |
| P17 Bits, digits, O(1) space | 11 |
| P1 Hash | 10 |
| P7 Greedy | 10 |
| P13 BFS/DFS | 9 |
| P4 Binary search | 7 |
| P5 Two pointers | 7 |
| P6 Stack | 7 |
| P10 Heap | 7 |
| P14 Dependencies & connectivity | 6 |
| P9 Sort then scan | 5 |
| P2 Running aggregates | 4 |
| P8 Sliding window | 4 |
| P15 Weighted paths | 4 |
| P18 Reformulate | 1 |

### Arrays & Hashing

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 217 | Contains Duplicate | E | P1 Hash |  | set of seen values |
| 242 | Valid Anagram | E | P1 Hash |  | count signature |
| 1 | Two Sum | E | P1 Hash | P18 | look up the complement |
| 49 | Group Anagrams | M | P1 Hash |  | canonical count tuple as key |
| 347 | Top K Frequent Elements | M | P1 Hash | P10 | count, then bucket-sort by frequency |
| 238 | Product of Array Except Self | M | P2 Running aggregates |  | prefix and suffix products |
| 36 | Valid Sudoku | M | P1 Hash |  | composite keys (row,val),(col,val),(box,val) |
| 271 | Encode and Decode Strings | M | P18 Reformulate |  | memorize: self-describing length-prefix encoding |
| 128 | Longest Consecutive Sequence | M | P1 Hash |  | set + start only at run beginnings |

### Two Pointers

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 125 | Valid Palindrome | E | P5 Two pointers |  | mirror pointers |
| 167 | Two Sum II Input Array Is Sorted | M | P5 Two pointers |  | sorted: discard one end per step |
| 15 | 3Sum | M | P5 Two pointers | P9 | sort, fix one, two-pointer the rest, skip dups |
| 11 | Container With Most Water | M | P5 Two pointers | P7 | drop the shorter wall (exchange argument) |
| 42 | Trapping Rain Water | H | P2 Running aggregates | P5 | running left/right max, advance smaller side |

### Sliding Window

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 121 | Best Time to Buy And Sell Stock | E | P2 Running aggregates |  | min so far |
| 3 | Longest Substring Without Repeating Characters | M | P8 Sliding window | P1 | set is the window |
| 424 | Longest Repeating Character Replacement | M | P8 Sliding window |  | valid iff len - maxFreq <= k |
| 567 | Permutation In String | M | P8 Sliding window | P1 | fixed window, count signature |
| 76 | Minimum Window Substring | H | P8 Sliding window | P1 | have/need counters, shrink while valid |
| 239 | Sliding Window Maximum | H | P6 Stack | P8 | monotonic deque |

### Stack

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 20 | Valid Parentheses | E | P6 Stack |  | nesting: match most recent open |
| 155 | Min Stack | M | P6 Stack | P2 | parallel stack of running mins |
| 150 | Evaluate Reverse Polish Notation | M | P6 Stack |  | operator consumes top two |
| 22 | Generate Parentheses | M | P12 Backtracking |  | prune with open<n, close<open |
| 739 | Daily Temperatures | M | P6 Stack |  | monotonic: next greater |
| 853 | Car Fleet | M | P6 Stack | P9, P18 | convert to arrival times, sort by position, collapsing stack |
| 84 | Largest Rectangle In Histogram | H | P6 Stack |  | monotonic: nearest smaller on both sides |

### Binary Search

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 704 | Binary Search | E | P4 Binary search |  | classic |
| 74 | Search a 2D Matrix | M | P4 Binary search | P18 | flatten 2-D index |
| 875 | Koko Eating Bananas | M | P4 Binary search | P18 | binary search the answer |
| 153 | Find Minimum In Rotated Sorted Array | M | P4 Binary search |  | which half is sorted |
| 33 | Search In Rotated Sorted Array | M | P4 Binary search |  | which half is sorted + range check |
| 981 | Time Based Key Value Store | M | P4 Binary search | P1 | map to sorted list, floor search |
| 4 | Median of Two Sorted Arrays | H | P4 Binary search | P18 | memorize: partition search |

### Linked List

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 206 | Reverse Linked List | E | P16 Pointer surgery |  | reverse: save next |
| 21 | Merge Two Sorted Lists | E | P16 Pointer surgery | P5 | dummy head, two-pointer merge |
| 143 | Reorder List | M | P16 Pointer surgery | P5 | middle (fast/slow), reverse second half, interleave |
| 19 | Remove Nth Node From End of List | M | P16 Pointer surgery |  | gap pointers + dummy |
| 138 | Copy List With Random Pointer | M | P16 Pointer surgery | P1 | old->new map, two passes |
| 2 | Add Two Numbers | M | P16 Pointer surgery | P17 | digit simulation with carry |
| 141 | Linked List Cycle | E | P16 Pointer surgery |  | fast/slow |
| 287 | Find The Duplicate Number | M | P16 Pointer surgery | P18 | array as linked list, Floyd |
| 146 | LRU Cache | M | P16 Pointer surgery | P1 | doubly linked list with sentinels + hash map to nodes |
| 23 | Merge K Sorted Lists | H | P10 Heap | P11, P16 | k-way merge heap or pairwise divide & conquer over pointer merges |
| 25 | Reverse Nodes In K Group | H | P16 Pointer surgery |  | reverse each block, relink |

### Trees

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 226 | Invert Binary Tree | E | P11 Tree recursion |  | swap, recurse |
| 104 | Maximum Depth of Binary Tree | E | P11 Tree recursion |  | 1 + max(children) |
| 543 | Diameter of Binary Tree | E | P11 Tree recursion |  | return height, update global |
| 110 | Balanced Binary Tree | E | P11 Tree recursion |  | return (balanced, height) |
| 100 | Same Tree | E | P11 Tree recursion |  | lockstep recursion |
| 572 | Subtree of Another Tree | E | P11 Tree recursion |  | outer traversal, inner sameTree |
| 235 | Lowest Common Ancestor of a Binary Search Tree | M | P11 Tree recursion | P4 | BST order: one comparison discards a subtree |
| 102 | Binary Tree Level Order Traversal | M | P11 Tree recursion | P13 | BFS, snapshot queue length |
| 199 | Binary Tree Right Side View | M | P11 Tree recursion | P13 | BFS, last node per level |
| 1448 | Count Good Nodes In Binary Tree | M | P11 Tree recursion |  | pass running max down |
| 98 | Validate Binary Search Tree | M | P11 Tree recursion |  | pass (low, high) down |
| 230 | Kth Smallest Element In a Bst | M | P11 Tree recursion | P4 | in-order is sorted; stop at k |
| 105 | Construct Binary Tree From Preorder And Inorder Traversal | M | P11 Tree recursion | P1 | preorder head is root; map for inorder index |
| 124 | Binary Tree Maximum Path Sum | H | P11 Tree recursion |  | return one-branch sum, update global with both |
| 297 | Serialize And Deserialize Binary Tree | H | P11 Tree recursion |  | preorder with null markers |

### Tries

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 208 | Implement Trie Prefix Tree | M | P1 Hash |  | trie = hash keyed by prefix |
| 211 | Design Add And Search Words Data Structure | M | P1 Hash | P12 | trie + branch on wildcard |
| 212 | Word Search II | H | P12 Backtracking | P1, P13 | trie-guided grid backtracking |

### Heap / Priority Queue

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 703 | Kth Largest Element In a Stream | E | P10 Heap |  | bounded min-heap of size k |
| 1046 | Last Stone Weight | E | P10 Heap |  | live max oracle |
| 973 | K Closest Points to Origin | M | P10 Heap |  | k best by derived key |
| 215 | Kth Largest Element In An Array | M | P10 Heap |  | bounded heap, quickselect, or sort |
| 621 | Task Scheduler | M | P7 Greedy | P10, P18 | most-frequent-first; closed form max(len, (maxf-1)*(n+1)+countMaxf), or heap + cooldown queue |
| 355 | Design Twitter | M | P10 Heap | P1 | k-way merge of followee lists |
| 295 | Find Median From Data Stream | H | P10 Heap |  | two heaps |

### Backtracking

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 78 | Subsets | M | P12 Backtracking |  | include/exclude |
| 39 | Combination Sum | M | P12 Backtracking |  | reuse index, prune on sum |
| 46 | Permutations | M | P12 Backtracking |  | pick any unused |
| 90 | Subsets II | M | P12 Backtracking | P9 | sort, skip dups at same level |
| 40 | Combination Sum II | M | P12 Backtracking | P9 | sort, skip dups, prune on sum |
| 79 | Word Search | M | P12 Backtracking | P13 | grid DFS with path set |
| 131 | Palindrome Partitioning | M | P12 Backtracking |  | partition points, prune non-palindromes |
| 17 | Letter Combinations of a Phone Number | M | P12 Backtracking |  | cartesian product |
| 51 | N Queens | H | P12 Backtracking | P1 | conflict sets for O(1) checks |

### Graphs

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 200 | Number of Islands | M | P13 BFS/DFS |  | flood fill |
| 133 | Clone Graph | M | P13 BFS/DFS | P1 | old->new map as visited |
| 695 | Max Area of Island | M | P13 BFS/DFS |  | flood fill returns size |
| 417 | Pacific Atlantic Water Flow | M | P13 BFS/DFS | P18 | search uphill from the oceans |
| 130 | Surrounded Regions | M | P13 BFS/DFS | P18 | search from the border |
| 994 | Rotting Oranges | M | P13 BFS/DFS |  | multi-source BFS, layer = minute |
| 286 | Walls And Gates | M | P13 BFS/DFS | P18 | multi-source BFS from gates |
| 207 | Course Schedule | M | P14 Dependencies & connectivity |  | cycle detection via on-path set |
| 210 | Course Schedule II | M | P14 Dependencies & connectivity |  | post-order = topological order |
| 684 | Redundant Connection | M | P14 Dependencies & connectivity |  | first union that fails |
| 323 | Number of Connected Components In An Undirected Graph | M | P14 Dependencies & connectivity |  | count successful unions |
| 261 | Graph Valid Tree | M | P14 Dependencies & connectivity | P13 | n-1 edges + connected |
| 127 | Word Ladder | H | P13 BFS/DFS | P1, P18 | BFS on words; wildcard buckets |

### Advanced Graphs

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 332 | Reconstruct Itinerary | H | P13 BFS/DFS | P9 | memorize: Hierholzer (sort adjacency, consume edges, post-order, reverse); pure greedy fails |
| 1584 | Min Cost to Connect All Points | M | P15 Weighted paths | P14, P7, P10, P9 | Prim (heap frontier) or Kruskal (sort edges + DSU); cut property |
| 743 | Network Delay Time | M | P15 Weighted paths | P10 | Dijkstra |
| 778 | Swim In Rising Water | H | P15 Weighted paths | P10 | Dijkstra with max combiner |
| 269 | Alien Dictionary | H | P14 Dependencies & connectivity | P18 | extract edges from adjacent words, topo sort |
| 787 | Cheapest Flights Within K Stops | M | P15 Weighted paths |  | Bellman-Ford, k+1 rounds |

### 1-D Dynamic Programming

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 70 | Climbing Stairs | E | P3 Dynamic programming |  | sum of 2 predecessors, rolling vars |
| 746 | Min Cost Climbing Stairs | E | P3 Dynamic programming |  | min of 2 predecessors |
| 198 | House Robber | M | P3 Dynamic programming |  | take/skip, rolling vars |
| 213 | House Robber II | M | P3 Dynamic programming | P18 | two linear runs |
| 5 | Longest Palindromic Substring | M | P5 Two pointers | P3 | center expansion: pointers expand outward from each center (O(1) space instead of an interval table) |
| 647 | Palindromic Substrings | M | P5 Two pointers | P3 | center expansion, count palindromes per center |
| 91 | Decode Ways | M | P3 Dynamic programming |  | gated Fibonacci |
| 322 | Coin Change | M | P3 Dynamic programming |  | unbounded knapsack, min |
| 152 | Maximum Product Subarray | M | P2 Running aggregates | P3 | memorize: track running max and min |
| 139 | Word Break | M | P3 Dynamic programming |  | OR over dictionary words |
| 300 | Longest Increasing Subsequence | M | P3 Dynamic programming |  | max over all smaller predecessors |
| 416 | Partition Equal Subset Sum | M | P3 Dynamic programming |  | 0/1 knapsack, reachable sums |

### 2-D Dynamic Programming

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 62 | Unique Paths | M | P3 Dynamic programming |  | sum of up and left, rolling row |
| 1143 | Longest Common Subsequence | M | P3 Dynamic programming |  | two-sequence grid, max |
| 309 | Best Time to Buy And Sell Stock With Cooldown | M | P3 Dynamic programming |  | state machine: holding flag |
| 518 | Coin Change II | M | P3 Dynamic programming |  | unbounded knapsack, count, coin-outer loop |
| 494 | Target Sum | M | P3 Dynamic programming | P18, P12 | memo on (i,total), or subset-sum reduction with parity/bound guards |
| 97 | Interleaving String | M | P3 Dynamic programming |  | two-sequence grid, OR; k = i+j |
| 329 | Longest Increasing Path In a Matrix | H | P3 Dynamic programming | P13 | memoized DFS on implicit DAG |
| 115 | Distinct Subsequences | H | P3 Dynamic programming |  | two-sequence grid, sum |
| 72 | Edit Distance | M | P3 Dynamic programming |  | two-sequence grid, 1+min |
| 312 | Burst Balloons | H | P3 Dynamic programming | P18 | interval DP, pivot on last |
| 10 | Regular Expression Matching | H | P3 Dynamic programming |  | two-sequence grid, OR, star transition |

### Greedy

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 53 | Maximum Subarray | M | P7 Greedy | P2, P3 | reset on negative (Kadane) |
| 55 | Jump Game | M | P7 Greedy | P18 | frontier from the end |
| 45 | Jump Game II | M | P7 Greedy | P13 | frontier per layer = BFS |
| 134 | Gas Station | M | P7 Greedy |  | reset on negative + total check |
| 846 | Hand of Straights | M | P7 Greedy | P9 | smallest card starts a run |
| 1899 | Merge Triplets to Form Target Triplet | M | P7 Greedy |  | discard triplets exceeding target |
| 763 | Partition Labels | M | P7 Greedy | P2 | extend to farthest last index |
| 678 | Valid Parenthesis String | M | P7 Greedy | P18 | range of open counts |

### Intervals

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 57 | Insert Interval | M | P9 Sort then scan |  | already sorted; one pass |
| 56 | Merge Intervals | M | P9 Sort then scan |  | sort by start, merge with last |
| 435 | Non Overlapping Intervals | M | P7 Greedy | P9 | sort, keep earliest end |
| 252 | Meeting Rooms | E | P9 Sort then scan |  | sort, compare neighbors |
| 253 | Meeting Rooms II | M | P9 Sort then scan | P10 | sweep line +1/-1, or min-heap of end times |
| 1851 | Minimum Interval to Include Each Query | H | P9 Sort then scan | P10 | sort both, heap of active intervals |

### Math & Geometry

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 48 | Rotate Image | M | P17 Bits, digits, O(1) space |  | transpose + reverse rows |
| 54 | Spiral Matrix | M | P5 Two pointers | P17 | four boundary pointers converging inward |
| 73 | Set Matrix Zeroes | M | P17 Bits, digits, O(1) space |  | first row/col as markers |
| 202 | Happy Number | E | P16 Pointer surgery | P18 | implicit list, Floyd |
| 66 | Plus One | E | P17 Bits, digits, O(1) space |  | carry from the right |
| 50 | Pow(x, n) | M | P17 Bits, digits, O(1) space | P11 | square and halve |
| 43 | Multiply Strings | M | P17 Bits, digits, O(1) space |  | positional accumulator |
| 2013 | Detect Squares | M | P1 Hash | P18 | diagonal partner forces the corners; exclude x == px |

### Bit Manipulation

| # | Problem | Diff | Primary | Also | Key move |
|---|---|---|---|---|---|
| 136 | Single Number | E | P17 Bits, digits, O(1) space |  | XOR cancels pairs |
| 191 | Number of 1 Bits | E | P17 Bits, digits, O(1) space |  | n & (n-1) |
| 338 | Counting Bits | E | P3 Dynamic programming | P17 | dp[i] = dp[i>>1] + (i&1) |
| 190 | Reverse Bits | E | P17 Bits, digits, O(1) space |  | shift bits across |
| 268 | Missing Number | E | P17 Bits, digits, O(1) space |  | XOR indices vs values |
| 371 | Sum of Two Integers | M | P17 Bits, digits, O(1) space |  | XOR sum, AND carry |
| 7 | Reverse Integer | M | P17 Bits, digits, O(1) space |  | check overflow before multiply |
