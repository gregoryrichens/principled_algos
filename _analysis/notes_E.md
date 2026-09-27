# Batch E — 1-D and 2-D Dynamic Programming (23 problems)

---

### 0070 Climbing Stairs  [1-D DP, Easy]
- **Trigger**: "number of distinct ways" to reach a target via small fixed steps (1 or 2).
- **Brute force -> optimal leap**: naive recursion `ways(n) = ways(n-1) + ways(n-2)` recomputes the same `n` exponentially; cache by `n`, then notice only the last two values are ever needed → collapse array to two rolling variables.
- **Core principle(s)**:
  - Overlapping recursive subproblems → memoize/tabulate to go from exponential to linear.
  - Counting-ways DP: `dp[i] = sum of dp[predecessor states]` (Fibonacci shape).
  - Fixed-lookback recurrence (depends only on `i-1`, `i-2`) → collapse to O(1) space with rolling variables.
- **Invariant / state**: `dp[i]` = number of ways to reach step `i`.
- **Key code idiom**:
```python
n1, n2 = 2, 3
for i in range(4, n + 1):
    n1, n2 = n2, n1 + n2
return n2
```
- **Complexity**: O(n) time, O(1) space.
- **Siblings**: Decode Ways (0091, same Fibonacci-shaped counting recurrence with validity gates), Min Cost Climbing Stairs (0746, same shape with min instead of sum), House Robber (0198, same rolling-pair technique), Unique Paths (0062, 2-D generalization of "sum of ways from predecessors").

---

### 0746 Min Cost Climbing Stairs  [1-D DP, Easy]
- **Trigger**: "minimum cost" to reach the end, moving 1 or 2 steps at a time, paying a cost per step.
- **Brute force -> optimal leap**: exponential decision tree of step-1/step-2 choices at every index → memoize on index, then realize the recurrence only looks 2 steps ahead, so it can be computed with rolling variables (or in-place on `cost`).
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Fixed-lookback recurrence → O(1) rolling space (or in-place array mutation).
  - Optimization DP: `dp[i] = cost[i] + MIN(dp[i+1], dp[i+2])`.
- **Invariant / state**: `dp[i]` = min cost to reach the top starting from step `i`.
- **Key code idiom**:
```python
for i in range(len(cost) - 3, -1, -1):
    cost[i] += min(cost[i + 1], cost[i + 2])
return min(cost[0], cost[1])
```
- **Complexity**: O(n) time, O(1) space.
- **Siblings**: Climbing Stairs (0070, identical shape with sum/count instead of min/cost), House Robber (0198, same "look back a fixed distance, combine with an aggregator" template).

---

### 0198 House Robber  [1-D DP, Medium]
- **Trigger**: "maximize sum, no two adjacent chosen" over a line of values.
- **Brute force -> optimal leap**: decision tree branching rob/skip at each house is exponential; memoize on index, then note the recurrence only needs the last two computed values → rolling variables.
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Binary decision recurrence: `dp[i] = max(take_i, skip_i) = max(nums[i] + dp[i-2], dp[i-1])`.
  - Fixed-lookback recurrence → O(1) rolling space.
- **Invariant / state**: `dp[i]` = max money robbable using houses `0..i`.
- **Key code idiom**:
```python
rob1, rob2 = 0, 0
for n in nums:
    rob1, rob2 = rob2, max(n + rob1, rob2)
return rob2
```
- **Complexity**: O(n) time, O(1) space.
- **Siblings**: House Robber II (0213, circular version), Partition Equal Subset Sum / Target Sum (same take/skip decision, generalized to a sum-target grid).

---

### 0213 House Robber II  [1-D DP, Medium]
- **Trigger**: House Robber but houses form a circle (first and last are adjacent).
- **Brute force -> optimal leap**: circular adjacency seems to need new logic, but robbing a circle of houses is equivalent to the max of two linear House-Robber runs: exclude house 0, or exclude house n-1 (both can't be safely included together, and excluding one guarantees the other's linear result is valid).
- **Core principle(s)**:
  - Break a circular constraint by reducing to two linear subproblems (drop first, drop last) and combining with max.
  - Reuse of the exact House Robber recurrence/rolling-variable technique as a subroutine.
- **Invariant / state**: same as House Robber, run twice on `nums[1:]` and `nums[:-1]`.
- **Key code idiom**:
```python
def helper(nums):
    rob1 = rob2 = 0
    for n in nums:
        rob1, rob2 = rob2, max(rob1 + n, rob2)
    return rob2
return max(nums[0], helper(nums[1:]), helper(nums[:-1]))
```
- **Complexity**: O(n) time, O(1) space.
- **Siblings**: House Robber (0198) — direct reuse. General pattern (reduce circular to linear) recurs anywhere a circular array forbids adjacent picks.

---

### 0005 Longest Palindromic Substring  [1-D DP, Medium]
- **Trigger**: need the longest contiguous palindromic run; palindromes have symmetric structure around a center.
- **Brute force -> optimal leap**: checking every substring for palindrome-ness is O(n^3); instead of an O(n^2) interval-DP table (`dp[i][j] = s[i]==s[j] and dp[i+1][j-1]`), grow outward from each of the `2n-1` possible centers (odd + even) in O(1) space, stopping the moment characters mismatch.
- **Core principle(s)**:
  - Center-expansion: replace an interval-DP table with direct outward expansion from every center, trading O(n^2) space for O(1) space at the same O(n^2) time.
  - Exploit problem-specific structure (palindromes are symmetric) instead of generic memoized recursion.
- **Invariant / state**: while expanding from center `(l, r)`, `s[l:r+1]` is a palindrome.
- **Key code idiom**:
```python
def expand(l, r):
    while l >= 0 and r < len(s) and s[l] == s[r]:
        l -= 1; r += 1
    return s[l+1:r]
```
- **Complexity**: O(n^2) time, O(1) space.
- **Siblings**: Palindromic Substrings (0647) — identical technique, counting instead of returning the string.

---

### 0647 Palindromic Substrings  [1-D DP, Medium]
- **Trigger**: "count all palindromic substrings."
- **Brute force -> optimal leap**: same as 0005 — O(n^3) brute check of every substring → center expansion counts every palindrome centered at each of the `2n-1` centers in O(n^2).
- **Core principle(s)**: Center-expansion (identical to Longest Palindromic Substring, just accumulate a count instead of tracking the best).
- **Invariant / state**: expansion from `(i,i)` and `(i,i+1)` counts every palindrome centered there.
- **Key code idiom**:
```python
def countPali(l, r):
    res = 0
    while l >= 0 and r < len(s) and s[l] == s[r]:
        res += 1; l -= 1; r += 1
    return res
res = sum(countPali(i, i) + countPali(i, i + 1) for i in range(len(s)))
```
- **Complexity**: O(n^2) time, O(1) space.
- **Siblings**: Longest Palindromic Substring (0005) — same technique.

---

### 0091 Decode Ways  [1-D DP, Medium]
- **Trigger**: "count the number of ways" to split/interpret a string under local validity constraints (digit groups of size 1 or 2).
- **Brute force -> optimal leap**: exponential decision tree (take 1 digit or 2 digits at each position) → memoize on index `i`; note recurrence only depends on `i+1` and `i+2`, so it can also be computed as a simple backward loop.
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Counting-ways DP: `dp[i] = valid1*dp[i+1] + valid2*dp[i+2]`, i.e., sum over valid local transitions (same skeleton as Climbing Stairs, gated by validity checks).
- **Invariant / state**: `dp[i]` = number of ways to decode the suffix `s[i:]`.
- **Key code idiom**:
```python
dp = {len(s): 1}
for i in range(len(s) - 1, -1, -1):
    dp[i] = 0 if s[i] == "0" else dp[i + 1]
    if i + 1 < len(s) and (s[i] == "1" or (s[i] == "2" and s[i+1] in "0123456")):
        dp[i] += dp[i + 2]
return dp[0]
```
- **Complexity**: O(n) time, O(n) space (O(1) with rolling vars).
- **Siblings**: Climbing Stairs (0070) — identical Fibonacci-shaped counting recurrence, just with validity gating instead of unconditional +1/+2.

---

### 0322 Coin Change  [1-D DP, Medium]
- **Trigger**: "minimum number of items" to reach an exact target amount, items reusable unlimited times (unbounded knapsack), asks for count.
- **Brute force -> optimal leap**: recursion trying every coin at every remaining amount is exponential (`O(coins^amount)`); memoize on remaining amount, then tabulate bottom-up over all amounts.
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Unbounded knapsack: `dp[a] = min over coins c of (1 + dp[a-c])`; because each coin can be reused, amount is the sole state (no need to track which coins used already).
- **Invariant / state**: `dp[a]` = min coins to make amount `a` (sentinel `amount+1` = impossible).
- **Key code idiom**:
```python
dp = [amount + 1] * (amount + 1)
dp[0] = 0
for a in range(1, amount + 1):
    for c in coins:
        if a - c >= 0:
            dp[a] = min(dp[a], 1 + dp[a - c])
return dp[amount] if dp[amount] != amount + 1 else -1
```
- **Complexity**: O(amount * n_coins) time, O(amount) space.
- **Siblings**: Coin Change II (0518, same unbounded-knapsack state but counting combinations, requires different loop order), Partition Equal Subset Sum / Target Sum (0/1 knapsack cousins over a sum-indexed array).

---

### 0518 Coin Change II  [2-D DP, Medium]
- **Trigger**: "count the number of combinations" to reach a target amount with reusable, unordered items (order of picks doesn't matter → combinations not permutations).
- **Brute force -> optimal leap**: recursion over `(coin index, amount)` is exponential; memoize on `(i, amount)`. Key extra insight vs. Coin Change: looping `for coin in coins: for amount...` (coin as OUTER loop) ensures each combination is counted once (order-independent), whereas looping amount-outer/coin-inner would count ordered permutations.
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Unbounded knapsack, counting variant: `dp[a] += dp[a-coin]`, and loop-order (coin outer) enforces "combinations" instead of "permutations."
- **Invariant / state**: `dp[a]` = number of combinations of coins summing to `a`, considering coins processed so far.
- **Key code idiom**:
```python
dp = [0] * (amount + 1)
dp[0] = 1
for coin in coins:
    for i in range(coin, amount + 1):
        dp[i] += dp[i - coin]
return dp[amount]
```
- **Complexity**: O(amount * n_coins) time, O(amount) space.
- **Siblings**: Coin Change (0322, same unbounded-knapsack family, min instead of count), Target Sum (0494, subset-sum knapsack counting), Partition Equal Subset Sum (0416, 0/1 knapsack boolean version), Decode Ways (0091, same "sum over valid transitions" counting skeleton but on string index not amount).

---

### 0152 Maximum Product Subarray  [1-D DP, Medium]
- **Trigger**: "contiguous subarray" + optimize a product (not sum) — sign flips make products non-monotonic.
- **Brute force -> optimal leap**: checking every subarray's product is O(n^2); Kadane-style single pass fails naively because a very negative running product can become the best product after multiplying by another negative — so track BOTH the running max and running min ending at `i` (a negative number times the running min can become the new max).
- **Core principle(s)**:
  - Track dual running extremes (max AND min), not just max, whenever the combining operator is not monotonic (multiplication can flip sign).
  - Running "best subarray ending here" DP (Kadane-style) collapses to O(1) space.
- **Invariant / state**: `curMax`/`curMin` = max/min product of a subarray ending exactly at index `i`.
- **Key code idiom**:
```python
res = nums[0]; curMin = curMax = 1
for n in nums:
    tmp = curMax * n
    curMax = max(n * curMax, n * curMin, n)
    curMin = min(tmp, n * curMin, n)
    res = max(res, curMax)
```
- **Complexity**: O(n) time, O(1) space.
- **Siblings**: none in this batch (one-off trick); conceptually related to Best Time to Buy/Sell with Cooldown in that both track more than one running quantity per step.

---

### 0139 Word Break  [1-D DP, Medium]
- **Trigger**: "can the string be segmented into" dictionary words — a feasibility/reachability question, not an optimization.
- **Brute force -> optimal leap**: trying every split point recursively is exponential; memoize on the starting index `i` (or equivalently tabulate `dp[i]` = can `s[i:]` be segmented).
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Boolean reachability DP: `dp[i] = OR over valid word w at i of dp[i + len(w)]` — combinator is logical OR, not sum/min, because the question is "does any valid path exist," not "how many" or "what's optimal."
- **Invariant / state**: `dp[i]` = True iff suffix `s[i:]` can be fully segmented into dictionary words.
- **Key code idiom**:
```python
dp = [False] * (len(s) + 1)
dp[len(s)] = True
for i in range(len(s) - 1, -1, -1):
    for w in wordDict:
        if s[i:i+len(w)] == w and dp[i + len(w)]:
            dp[i] = True
            break
return dp[0]
```
- **Complexity**: O(n * m * t) time (n=len(s), m=#words, t=max word length), O(n) space.
- **Siblings**: Interleaving String (0097) — same "OR over valid transitions" feasibility skeleton, on a 2-D grid instead of 1-D.

---

### 0300 Longest Increasing Subsequence  [1-D DP, Medium]
- **Trigger**: "subsequence" (not contiguous) + "increasing" + optimize length — must compare current element against ALL valid earlier elements, not just a fixed-size window.
- **Brute force -> optimal leap**: recursively including/excluding each element with a "previous index" parameter is exponential; memoize on `(i, previous index)`, then realize `dp[i]` (LIS ending at `i`) can be computed by scanning all `j < i` with `nums[j] < nums[i]`, dropping to O(n^2) (patience-sorting/binary-search gets O(n log n) but isn't in this repo's solution).
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Unrestricted-lookback DP: `dp[i] = 1 + max(dp[j] for all valid j < i)` — the predecessor set isn't a fixed window, so an inner loop over all prior states is required (O(n^2) instead of O(n)).
- **Invariant / state**: `dp[i]` = length of the longest increasing subsequence ending at index `i`.
- **Key code idiom**:
```python
LIS = [1] * len(nums)
for i in range(len(nums) - 1, -1, -1):
    for j in range(i + 1, len(nums)):
        if nums[i] < nums[j]:
            LIS[i] = max(LIS[i], 1 + LIS[j])
return max(LIS)
```
- **Complexity**: O(n^2) time, O(n) space.
- **Siblings**: Longest Increasing Path in a Matrix (0329) — the grid generalization of the exact same idea (extend from any strictly-smaller/larger neighbor); Longest Common Subsequence (1143) shares the "compare against a growing set of candidates" flavor but walks two sequences instead of one.

---

### 0416 Partition Equal Subset Sum  [1-D DP, Medium]
- **Trigger**: "can the array be split into two subsets with equal sum" → reduces to "does a subset summing to total/2 exist" (subset-sum feasibility).
- **Brute force -> optimal leap**: recursively including/excluding each number while tracking running sum is exponential (`O(2^n)`); memoize/tabulate on `(index, running sum)` — since sums are bounded by `target`, use a 1-D boolean array over achievable sums, iterated per item.
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - 0/1 knapsack (each item usable at most once): boolean reachability over a sum-indexed array, `dp[s] |= dp[s-num]`; iterate item-by-item and, to avoid reusing an item twice in one pass, materialize a new set/array per item (or iterate sums in decreasing order for a mutable in-place array).
- **Invariant / state**: `dp` (set) = all subset sums achievable using the suffix of `nums` processed so far.
- **Key code idiom**:
```python
dp = {0}
target = sum(nums) // 2
for i in range(len(nums) - 1, -1, -1):
    nextDP = set()
    for t in dp:
        if t + nums[i] == target: return True
        nextDP.add(t + nums[i]); nextDP.add(t)
    dp = nextDP
return False
```
- **Complexity**: O(n * target) time, O(target) space.
- **Siblings**: Target Sum (0494) — same subset-sum knapsack reduction (assign +/- reduces to finding a subset summing to `(total+target)/2`); Coin Change / Coin Change II — unbounded-knapsack cousins of the same "combine dp over item vs sum axes" template.

---

### 0062 Unique Paths  [2-D DP, Medium]
- **Trigger**: "count paths" through a grid moving only right/down — 2-D counting.
- **Brute force -> optimal leap**: exponential recursion branching down/right at each cell → memoize on `(row, col)`, then tabulate: each cell's path count is just the sum of the cell above and the cell to the left.
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Counting-ways DP generalized to 2-D: `dp[i][j] = dp[i-1][j] + dp[i][j-1]` (sum over valid predecessor states) — same skeleton as Climbing Stairs, one dimension per move type.
  - Rolling-row optimization: since row `i` only depends on row `i-1`, collapse the 2-D grid to a single 1-D row updated in place.
- **Invariant / state**: `dp[i][j]` = number of distinct paths from the top-left to cell `(i, j)`.
- **Key code idiom**:
```python
row = [1] * n
for i in range(m - 1):
    newRow = [1] * n
    for j in range(n - 2, -1, -1):
        newRow[j] = newRow[j + 1] + row[j]
    row = newRow
return row[0]
```
- **Complexity**: O(m*n) time, O(n) space (rolling row).
- **Siblings**: Climbing Stairs (0070) — identical "sum of ways from reachable predecessors" recurrence in 1-D; Decode Ways (0091) — same idea with validity gating.

---

### 1143 Longest Common Subsequence  [2-D DP, Medium]
- **Trigger**: two sequences + "longest common subsequence" (non-contiguous, order-preserving) → must compare positions in both strings simultaneously.
- **Brute force -> optimal leap**: recursion branching on "advance pointer in s1," "advance in s2," or "advance both if chars match" is exponential in `2^(m+n)`; memoize on the index pair `(i, j)`.
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Two-sequence index-pair DP: state = `(i, j)` (position in each string); branch on whether `s1[i] == s2[j]`. This is THE canonical template for problems comparing two sequences.
- **Invariant / state**: `dp[i][j]` = LCS length of `text1[i:]` and `text2[j:]`.
- **Key code idiom**:
```python
for i in range(len(text1) - 1, -1, -1):
    for j in range(len(text2) - 1, -1, -1):
        if text1[i] == text2[j]:
            dp[i][j] = 1 + dp[i+1][j+1]
        else:
            dp[i][j] = max(dp[i][j+1], dp[i+1][j])
```
- **Complexity**: O(m*n) time and space.
- **Siblings**: Edit Distance (0072), Distinct Subsequences (0115), Interleaving String (0097), Regular Expression Matching (0010) — all share the "walk two sequences with an `(i,j)` state, branch on match/mismatch" skeleton, differing only in the combinator (max vs min+1 vs sum vs OR) and extra transition rules.

---

### 0309 Best Time to Buy And Sell Stock With Cooldown  [2-D DP, Medium]
- **Trigger**: sequential decisions (buy/sell/hold) over time with a constraint that depends on recent history (cooldown after selling) — plain index-based DP loses information about "am I currently holding."
- **Brute force -> optimal leap**: recursion over day index alone can't represent whether you're holding a share; add a second state dimension (`buying: bool`, i.e., "allowed to buy") so the recursion/DP state fully captures what matters for future decisions; memoize on `(day, holding-state)`.
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - State-machine DP: when the legal next actions depend on more than the raw index, augment the state with a mode/flag dimension (here: holding stock or not) so `dp[i][state]` fully determines the future.
  - Rolling-state optimization: since transitions only look at `i-1`/`i-2`, collapse to O(1) variables (`buy`, `sell`, `cooldown`).
- **Invariant / state**: `dp[(i, buying)]` = max profit achievable from day `i` onward given whether a buy is currently allowed.
- **Key code idiom**:
```python
def dfs(i, buying):
    if i >= len(prices): return 0
    cooldown = dfs(i + 1, buying)
    if buying:
        return max(dfs(i + 1, False) - prices[i], cooldown)
    return max(dfs(i + 2, True) + prices[i], cooldown)
```
- **Complexity**: O(n) time, O(n) space (O(1) rolling).
- **Siblings**: House Robber (0198) — cooldown-after-sell mirrors "skip the next house after robbing," both a binary take/skip decision with a lookahead penalty.

---

### 0494 Target Sum  [2-D DP, Medium]
- **Trigger**: assign `+`/`-` to each number to hit an exact target — a binary per-item decision problem that superficially looks like combinatorial search but is really a sum-indexed knapsack.
- **Brute force -> optimal leap**: exponential `+`/`-` decision tree at each index; memoize on `(index, running total)`. Optimization: algebraically, positives sum to `P` and negatives sum to `N` with `P - N = target` and `P + N = total`, so `P = (total + target)/2` — reducing the problem to "count subsets summing to `P`," i.e., Partition-Equal-Subset-Sum's counting cousin.
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Reformulate a signed-choice problem algebraically into a subset-sum knapsack, then reuse the 0/1 knapsack counting template: `dp[s] += dp[s-num]`.
- **Invariant / state**: `dp[(i, total)]` = number of ways to assign signs to `nums[i:]` reaching a given running total (or, in the optimized form, `dp[s]` = number of subsets of processed items summing to `s`).
- **Key code idiom**:
```python
def backtrack(i, total):
    if i == len(nums): return 1 if total == target else 0
    return backtrack(i+1, total+nums[i]) + backtrack(i+1, total-nums[i])
```
- **Complexity**: O(n * sum) time and space (memoized); O(n * target) for the knapsack reformulation.
- **Siblings**: Partition Equal Subset Sum (0416) — same subset-sum knapsack, boolean instead of counting; Coin Change II (0518) — same "count ways to hit a target sum" counting-knapsack skeleton.

---

### 0097 Interleaving String  [2-D DP, Medium]
- **Trigger**: two source strings + one target string, need to check if target can be formed by interleaving (preserving relative order of each source) — feasibility over two sequences advancing in lockstep with a third derived index.
- **Brute force -> optimal leap**: recursion trying "take next char from s1" or "take next char from s2" at each step is exponential; memoize on `(i, j)` — the position in `s3` is always `i+j`, so it doesn't need its own state dimension.
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Two-sequence index-pair DP (same family as LCS/Edit Distance), but the combinator is boolean OR (feasibility) instead of max/min: `dp[i][j] = (dp[i+1][j] and s1 matches) or (dp[i][j+1] and s2 matches)`.
  - Derived index elimination: a third parameter (`k` into `s3`) is redundant because it's determined by `i+j`, shrinking the state space from 3-D to 2-D.
- **Invariant / state**: `dp[i][j]` = True iff `s1[i:] ` and `s2[j:]` can interleave to form `s3[i+j:]`.
- **Key code idiom**:
```python
for i in range(len(s1), -1, -1):
    for j in range(len(s2), -1, -1):
        if i < len(s1) and s1[i] == s3[i+j] and dp[i+1][j]:
            dp[i][j] = True
        if j < len(s2) and s2[j] == s3[i+j] and dp[i][j+1]:
            dp[i][j] = True
```
- **Complexity**: O(m*n) time and space.
- **Siblings**: Word Break (0139) — same "OR over valid transitions" feasibility skeleton in 1-D; LCS/Edit Distance/Distinct Subsequences/Regex — same two-index-pair family with different combinators.

---

### 0329 Longest Increasing Path In a Matrix  [2-D DP, Hard]
- **Trigger**: grid + "longest path where each step strictly increases" — a graph problem in disguise (edges only go from smaller to larger cell values, so the "graph" has no cycles).
- **Brute force -> optimal leap**: naive DFS from every cell re-explores overlapping downstream paths exponentially; because edges are defined by strict inequality, the implicit graph is a DAG (no cycles possible), so straightforward memoization on `(r, c)` is safe without needing an explicit topological sort.
- **Core principle(s)**:
  - Overlapping subproblems → memoize (top-down DFS + cache is natural here since the grid has no fixed processing order).
  - A monotonicity/strict-inequality constraint on transitions implies acyclicity, which is what makes memoized DFS safe/correct without cycle detection — the grid analogue of LIS's "only look at strictly smaller/larger predecessors."
- **Invariant / state**: `dp[(r,c)]` = length of the longest strictly increasing path starting at `(r,c)`.
- **Key code idiom**:
```python
def dfs(r, c, prevVal):
    if r<0 or r==ROWS or c<0 or c==COLS or matrix[r][c] <= prevVal:
        return 0
    if (r, c) in dp: return dp[(r, c)]
    dp[(r,c)] = 1 + max(dfs(r+1,c,matrix[r][c]), dfs(r-1,c,matrix[r][c]),
                         dfs(r,c+1,matrix[r][c]), dfs(r,c-1,matrix[r][c]))
    return dp[(r,c)]
```
- **Complexity**: O(m*n) time and space.
- **Siblings**: Longest Increasing Subsequence (0300) — the 1-D version of the exact same "extend from strictly smaller predecessor" idea.

---

### 0115 Distinct Subsequences  [2-D DP, Hard]
- **Trigger**: two strings, "count the number of distinct subsequences" of `s` equal to `t` — counting variant of the two-sequence family.
- **Brute force -> optimal leap**: recursion at each `(i, j)` choosing "skip s[i]" or, if it matches, "also match it" is exponential; memoize on `(i, j)`.
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Two-sequence index-pair DP, counting combinator (sum instead of max/OR): `dp[i][j] = dp[i+1][j] + (s[i]==t[j] ? dp[i+1][j+1] : 0)` — skip `s[i]` always contributes, and matching contributes an extra path only when chars agree.
- **Invariant / state**: `dp[i][j]` = number of distinct subsequences of `s[i:]` equal to `t[j:]`.
- **Key code idiom**:
```python
for i in range(len(s) - 1, -1, -1):
    for j in range(len(t) - 1, -1, -1):
        if s[i] == t[j]:
            cache[(i,j)] = cache[(i+1,j+1)] + cache[(i+1,j)]
        else:
            cache[(i,j)] = cache[(i+1,j)]
```
- **Complexity**: O(m*n) time and space.
- **Siblings**: LCS (1143), Edit Distance (0072), Interleaving String (0097), Regex Matching (0010) — same two-index-pair family, different combinators (here: sum, for counting ways).

---

### 0072 Edit Distance  [2-D DP, Medium]
- **Trigger**: two strings + "minimum operations (insert/delete/replace)" to transform one into another — optimization variant of the two-sequence family.
- **Brute force -> optimal leap**: recursion branching into 3 edit operations (or a free "match") at each `(i, j)` is exponential; memoize on `(i, j)`.
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Two-sequence index-pair DP, min combinator: `dp[i][j] = dp[i+1][j+1]` if chars match, else `1 + min(delete, insert, replace)` over the three neighboring states.
- **Invariant / state**: `dp[i][j]` = min operations to convert `word1[i:]` into `word2[j:]`.
- **Key code idiom**:
```python
if word1[i] == word2[j]:
    dp[i][j] = dp[i+1][j+1]
else:
    dp[i][j] = 1 + min(dp[i+1][j], dp[i][j+1], dp[i+1][j+1])
```
- **Complexity**: O(m*n) time and space.
- **Siblings**: LCS (1143), Distinct Subsequences (0115), Interleaving String (0097), Regex Matching (0010) — same family, min combinator here vs max/sum/OR elsewhere.

---

### 0312 Burst Balloons  [2-D DP, Hard]
- **Trigger**: choose an ORDER of operations (burst balloons one at a time) to maximize a score that depends on each operation's current neighbors — order-dependent optimization over one sequence, not two.
- **Brute force -> optimal leap**: bursting balloons changes neighbors, so trying every order directly is `O(n!)`, and choosing "which balloon to burst FIRST" in a range doesn't decouple the remaining subranges (its neighbors are unknown until the rest is resolved). The key inversion: instead of picking the first balloon to burst in a range, pick the LAST balloon to burst in the range `(l, r)` — its final neighbors are guaranteed to be exactly `nums[l]` and `nums[r]` (everything between will already be gone), which cleanly decouples the range into two independent subranges `(l,k)` and `(k,r)`.
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Interval DP: state = `(l, r)` a range boundary (with padding sentinels of value 1); iterate over increasing interval length; recurrence chooses a pivot `k` splitting the range into two independent solved subranges.
  - Reframe "which comes first" as "which comes last" to make subproblems independent when order affects neighbors/context.
- **Invariant / state**: `dp[l][r]` = max coins obtainable by bursting all balloons strictly between indices `l` and `r` (both boundary balloons still intact and untouched).
- **Key code idiom**:
```python
for length in range(2, n + 2):
    for l in range(0, n + 2 - length):
        r = l + length
        for k in range(l + 1, r):
            dp[l][r] = max(dp[l][r], nums[l]*nums[k]*nums[r] + dp[l][k] + dp[k][r])
return dp[0][n+1]
```
- **Complexity**: O(n^3) time, O(n^2) space.
- **Siblings**: none in this batch (only interval DP problem); classic siblings outside the 150: Matrix Chain Multiplication, Minimum Cost to Merge Stones.

---

### 0010 Regular Expression Matching  [2-D DP, Hard]
- **Trigger**: pattern matching with wildcards (`.` and `*`) against a string — feasibility over two sequences, but `*` creates a variable-length, non-local transition (zero-or-more of the preceding pattern char).
- **Brute force -> optimal leap**: recursion at `(i, j)` normally advances both indices by 1, but `*` requires branching into "skip the `x*` pair entirely" or "consume one char of `s` and stay on the same pattern position" (to allow repeats) — exponential without caching; memoize on `(i, j)`.
- **Core principle(s)**:
  - Overlapping subproblems → memoize/tabulate.
  - Two-sequence index-pair DP, boolean OR combinator, with a special-cased transition for the `*` quantifier: `dp[i][j] = dp[i][j+2]` (skip `x*`) `or (match and dp[i+1][j])` (consume and retry same pattern position).
- **Invariant / state**: `dp[i][j]` = True iff `s[i:]` matches pattern `p[j:]`.
- **Key code idiom**:
```python
match = i < len(s) and (s[i] == p[j] or p[j] == '.')
if (j+1) < len(p) and p[j+1] == '*':
    cache[i][j] = cache[i][j+2] or (match and cache[i+1][j])
elif match:
    cache[i][j] = cache[i+1][j+1]
```
- **Complexity**: O(m*n) time and space.
- **Siblings**: Interleaving String (0097) — same "OR over valid transitions" two-index feasibility skeleton; LCS/Edit Distance/Distinct Subsequences — same family with different combinators/transition rules.

---

## Batch-level synthesis

### 1. Principle tally

| # | Principle | Problems |
|---|---|---|
| P1 | Overlapping recursive subproblems → memoize (top-down cache) or tabulate (bottom-up array), turning exponential brute force into polynomial | ALL 23 problems (universal umbrella; not repeated below) |
| P2 | Counting-ways DP: `dp[state] = SUM over valid transitions of dp[predecessor]` | 0070 Climbing Stairs, 0091 Decode Ways, 0062 Unique Paths, 0115 Distinct Subsequences, 0518 Coin Change II, 0494 Target Sum |
| P3 | Boolean reachability/feasibility DP: `dp[state] = OR over valid transitions` | 0139 Word Break, 0097 Interleaving String, 0010 Regular Expression Matching (partly), 0416 Partition Equal Subset Sum (feasibility framing) |
| P4 | Binary take/skip decision recurrence: `dp[i] = best(take_i, skip_i)` | 0198 House Robber, 0213 House Robber II, 0416 Partition Equal Subset Sum, 0494 Target Sum |
| P5 | Knapsack over a sum/amount axis (0/1 or unbounded); loop order/iteration direction controls reuse semantics (single-use vs. repeatable, combination vs. permutation) | 0416 Partition Equal Subset Sum (0/1), 0494 Target Sum (0/1, via reduction), 0322 Coin Change (unbounded, min), 0518 Coin Change II (unbounded, count) |
| P6 | Fixed-lookback recurrence (depends only on the last k states) → collapse to O(1) rolling variables | 0070 Climbing Stairs, 0746 Min Cost Climbing Stairs, 0198 House Robber, 0213 House Robber II, 0309 Buy/Sell w/ Cooldown |
| P7 | Two-sequence index-pair DP: state = `(i, j)` positions in two sequences, branch on match/mismatch, combinator varies with the ask (max=LCS, min+1=edit distance, sum=count subsequences, OR=interleave/regex) | 1143 LCS, 0072 Edit Distance, 0115 Distinct Subsequences, 0097 Interleaving String, 0010 Regex Matching |
| P8 | Unrestricted-lookback DP: `dp[i] = best over ALL valid earlier j`, no fixed window, so an explicit inner scan (or memoized DFS on the implied graph) is required | 0300 Longest Increasing Subsequence, 0329 Longest Increasing Path in a Matrix |
| P9 | Circular-constraint reduction: break a circular array problem into two linear subproblems (exclude first / exclude last), combine with max | 0213 House Robber II |
| P10 | State-machine DP: augment state with a mode/flag dimension when legal next actions depend on more than position alone | 0309 Buy/Sell Stock w/ Cooldown |
| P11 | Interval DP: state = range `(l, r)`; choose a pivot representing the LAST operation in the range so the two sub-ranges become independent | 0312 Burst Balloons |
| P12 | Center-expansion: replace an O(n^2)-space interval-DP table with O(1)-space outward expansion when the structure (palindrome) is symmetric around a center | 0005 Longest Palindromic Substring, 0647 Palindromic Substrings |
| P13 | Track dual running extremes (max AND min) when the combining operator is non-monotonic (sign flips under multiplication) | 0152 Maximum Product Subarray |
| P14 | 2-D counting-path DP generalizing P2 to a grid: `dp[i][j] = dp[i-1][j] + dp[i][j-1]` | 0062 Unique Paths |

### 2. Candidate MERGES
- **P2 + P3 + P4 + P5 + P14 are one skeleton wearing different clothes**: nearly every DP problem here is "identify predecessor states via a recurrence, then combine them with an operator chosen by what's being asked" — `SUM`/count for "how many ways," `OR` for "is it possible," `MAX`/`MIN` for "optimize a value." Once a learner sees dp[i][j] = combine(dp[predecessors]), the only real decision left is which combinator the problem's phrasing implies. Recommend merging into a single principle: **"DP recurrence = (find valid predecessor states) + (combine with SUM/OR/MIN/MAX depending on whether the ask is count/feasibility/optimize)."**
- **P5 (knapsack) is a specialization of P4 (take/skip)**: knapsack DP is just the take/skip decision applied per-item with the state being an achievable sum; the loop-order subtlety (combinations vs. permutations, 0/1 vs. unbounded) is an implementation detail on top of the same take/skip idea.
- **P8 (unrestricted lookback: LIS) and P7 (two-sequence index-pair DP)** are structurally related — both scan a set of "compatible" earlier states — but differ in whether the compatibility set is a fixed adjacent index (P7) or an unbounded scan/filter (P8). Worth noting as siblings but not fully merging, since the O(n) vs O(n^2) per-step cost differs materially.
- **P6 (rolling window) and P10 (state machine)** are both just "space optimization once you know the recurrence's dependency depth" — P10 is P6 with an extra state dimension. Could merge as "once the recurrence's dependency set is bounded (by position lookback and/or a small mode enum), collapse to O(1) variables."
- **P12 (center expansion) is a special case of P11 (interval DP)**: both operate over ranges `(l, r)`; center expansion is what happens when the range's validity condition is symmetric and can be checked outward from a midpoint in O(1) extra space, instead of needing a full O(n^2) table like general interval DP (Burst Balloons) where the recurrence isn't symmetric around a fixed center.

### 3. Genuinely one-off tricks
- **Burst Balloons' "reframe first-to-burst as last-to-burst"** — a non-obvious reversal specific to problems where an operation's cost depends on current neighbors that change as other operations happen. Should be memorized as a named trick ("think about what happens last, not what happens first") rather than derived from a general principle.
- **Maximum Product Subarray's dual max/min tracking** — the sign-flip-under-multiplication issue is specific to product problems; nothing else in this batch needs two running extremes.
- **Regular Expression Matching's `*`-quantifier transition** (`dp[i][j+2]` skip vs. `dp[i+1][j]` consume-and-retry) is a memorizable special case layered on top of the general two-sequence template — the "match" logic is standard, but the `*` handling is bespoke regex-engine logic.
- **Interleaving String's index-elimination** (realizing `k = i+j` so the third dimension is redundant) is a nice one-off algebraic simplification, not a broadly reusable principle beyond "look for redundant state dimensions."

### 4. Decision cues
| If you see... | Think... |
|---|---|
| "number of ways" / "how many distinct ways" over a single sequence with local transitions | Counting DP, `dp[i] = SUM of dp[valid predecessors]` (P2) |
| "can you form / is it possible" over a single sequence or two sequences | Feasibility DP, `dp[state] = OR of valid transitions` (P3) |
| "no two adjacent" + maximize/minimize over one array | Take/skip recurrence with 2-step lookback → rolling variables (P4, P6) |
| Circular array + "no two adjacent" | Run the linear solution twice, excluding first then last, take best (P9) |
| "subset" + "equal sum" / "reach exact target" with items usable once each | 0/1 knapsack over a sum-indexed array, iterate sums backward or snapshot per item (P5) |
| "minimum coins" / "combinations to make amount" with unlimited reuse | Unbounded knapsack; loop coin-outer for combinations (order-independent), amount-outer for permutations/min (P5) |
| Two strings/sequences + compare/transform/count relationship between them | Two-sequence index-pair DP `dp[i][j]`, branch on char match; pick combinator to match the ask (P7) |
| "subsequence" (non-contiguous) + "increasing"/compatible with ALL prior elements | Unrestricted-lookback DP, O(n^2) inner scan over all valid predecessors (P8) |
| Grid where each step must strictly increase/decrease in value | Memoized DFS is safe (no cycles possible); same idea as LIS generalized to a graph (P8) |
| Sequential decisions where "what you can do next" depends on more than your position (e.g., holding an asset, cooldown) | Add a mode/flag dimension to the state (state-machine DP) (P10) |
| An operation's value depends on its current neighbors, and neighbors change as other operations are applied | Interval DP over `(l, r)`; consider fixing what happens LAST in the range, not first (P11) |
| Symmetric structure (palindrome) + optimize/count over substrings | Center expansion, O(1) space instead of an O(n^2) DP table (P12) |
| Contiguous subarray + optimize a PRODUCT | Track both running max and running min (sign flips) (P13) |
| Grid + count paths with restricted moves (e.g., only right/down) | 2-D counting DP, `dp[i][j] = SUM of dp[reachable-from cells]`, rolling row for O(n) space (P14) |
