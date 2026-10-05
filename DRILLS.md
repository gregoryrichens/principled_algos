# Drill deck: the 36 idioms to write from memory

> **New here?** Terms like *principle*, *trigger*, *invariant*, *template* and *card* are defined, with an example, in `README.md` under "The words used everywhere in this folder".

*These are the "times tables". Each card states its problems in full with examples, says when to reach for it, gives a plain-English sentence to say before you write, and states what stays true. The answer is hidden: the code, with comments, and a list of explained checks to compare your version against. Work a card by reading the problems, saying the sentence aloud, writing the code on paper or in a blank file, then opening the answer. A card is done when it comes out clean in under two minutes three sessions in a row.*

Cards 1–27 are grouped by the principle they belong to in `PRINCIPLES.md`. Cards 28–36 were added after review; they fill gaps and sit in their own group at the end, each tagged with its principle. Each card also lists two to four problems to run it on immediately (LeetCode ids; problems outside the 150 are marked "outside").

Scoring per attempt: **clean** (no bug, under 2 min), **slow** (correct, over 2 min), **bug** (any error). Log it in `SCHEDULE.md`'s format.

---

## MOVE 1 — Remember

### Card 1 · Look it up instead of searching for it (P1)

**The problems**

- **Two Sum (1).** Given a list of numbers and a target, return the positions of the two numbers that add up to the target. Exactly one pair exists.
  `nums = [3, 8, 4, 6], target = 10` → `[2, 3]` (4 + 6 = 10)
- **Group Anagrams (49).** Given a list of lowercase words, group together the words that use exactly the same letters.
  `["eat", "tea", "tan", "ate", "nat", "bat"]` → `[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]`

**When to reach for this card.** Your slow solution has an inner loop whose only job is to search for something: "is the partner I need somewhere in the list?" or "which other words have the same letters?"

**Say this before you write.** "I'll walk through the input once and keep a dictionary of what I've already seen. For each item, I work out what I'm looking for and check the dictionary instead of scanning the list."

**What stays true.** The dictionary holds every item I have already walked past, and nothing else.

**Write, from memory:**
1. Two Sum. The key you look up is the *partner* you need: `target - n`.
2. Group Anagrams. The key is the word's *letter count*, which every anagram shares.

<details><summary>Answer</summary>

```python
# Two Sum
seen = {}                              # value -> position where we saw it
for i, n in enumerate(nums):
    if target - n in seen:             # is the partner already behind us?
        return [seen[target - n], i]
    seen[n] = i                        # store n so a later number can find it

# Group Anagrams
groups = collections.defaultdict(list) # letter-count key -> words with those letters
for s in strs:
    key = [0] * 26                     # key[0] = number of a's, key[1] = b's, ...
    for c in s:
        key[ord(c) - ord("a")] += 1
    groups[tuple(key)].append(s)       # tuple, because a list can't be a dictionary key
return list(groups.values())
```

**Compare your answer against these:**
- **Check, then store.** In Two Sum, if you store `n` before checking, a 5 with target 10 would pair with itself.
- **The key must be a tuple, not a list.** Python won't accept a list as a dictionary key because lists can change after being stored.
- **`ord(c) - ord("a")` only works for lowercase a–z.** Problem 49 guarantees that. If the input could contain other characters, use `"".join(sorted(s))` as the key instead.
- **If the keys are small whole numbers, a plain list beats a dictionary.** You index straight into it and no hashing is needed.
</details>

**Now use it on:** Two Sum 1 · Group Anagrams 49 · Valid Sudoku 36 (no digit may repeat in any row, column, or 3×3 box: use keys like `("row", 4, "7")`).

### Card 2 · Running products from both sides (P2)

**The problems**

- **Product of Array Except Self (238).** Return a list where position `i` holds the product of every number except `nums[i]`. No division, O(n) time.
  `nums = [2, 3, 4, 5]` → `[60, 40, 30, 24]` (for example, 60 = 3·4·5)
- **Trapping Rain Water (42).** Bars of width 1 have heights `height[i]`. Return how much rain water is trapped between them.
  `height = [3, 0, 2, 0, 4]` → `7` (3 + 1 + 3 units above the three low bars)

**When to reach for this card.** Every position needs something about *everything to its left* and *everything to its right*, and the slow solution rescans those sides for each position.

**Say this before you write.** "Each answer is a left part combined with a right part. I'll build the left parts in one pass, left to right, carrying a running value, then do the same from the right."

**What stays true.** When I use the running value at position `i`, it covers exactly the elements before `i` (or after it, on the way back), never `i` itself.

**Write, from memory:**
1. Product of Array Except Self, using the output list for the left products and a single variable for the right product.
2. Trapping Rain Water with two lists: the tallest bar to the left of each position (including itself), and the tallest to the right.

<details><summary>Answer</summary>

```python
# Product of Array Except Self
result = [1] * len(nums)
for i in range(1, len(nums)):
    result[i] = result[i - 1] * nums[i - 1]      # product of everything left of i
right = 1                                  # product of everything right of i
for i in range(len(nums) - 1, -1, -1):
    result[i] *= right                        # use it first...
    right *= nums[i]                       # ...then include nums[i] for the next position
return result

# Trapping Rain Water
n = len(height)
left_max, right_max = [0] * n, [0] * n
for i in range(n):
    left_max[i] = max(left_max[i - 1] if i else 0, height[i])
for i in range(n - 1, -1, -1):
    right_max[i] = max(right_max[i + 1] if i < n - 1 else 0, height[i])
return sum(min(left_max[i], right_max[i]) - height[i] for i in range(n))
```

**Compare your answer against these:**
- **Leave out the current element.** `res[i]` must be the product of `nums[0..i-1]`, not `nums[0..i]`. That is why the first loop multiplies by `nums[i - 1]`.
- **Use, then update.** In the backward pass, multiply `res[i]` by `right` *before* folding `nums[i]` into `right`. Swapping the two lines includes each number in its own answer.
- **No extra list for products.** The output list holds the left products, and the right product is one variable, so the extra memory is O(1).
- **Water uses the shorter wall.** Water above bar `i` is `min(tallest left, tallest right) − height[i]`. Including the bar itself in both maximums guarantees this is never negative.
</details>

**Now use it on:** Product Except Self 238 · Trapping Rain Water 42 (then rewrite it with two pointers and two variables, as in P2) · for "count the stretches that sum to k", see Card 28.

### Card 3 · Best so far, in one pass (P2 / P7)

**The problems**

- **Best Time to Buy and Sell Stock (121).** `prices[i]` is the price on day `i`. Buy once, then sell on a later day. Return the largest profit, or 0.
  `prices = [7, 1, 5, 3, 6, 4]` → `5` (buy at 1, sell at 6)
- **Maximum Subarray (53).** Return the largest sum of any non-empty stretch of consecutive numbers.
  `nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]` → `6` (the stretch `[4, -1, 2, 1]`)

**When to reach for this card.** The slow solution tries every (start, end) pair, but for each end, only one fact about the past matters: the cheapest price so far, or the best sum of a stretch ending just before here.

**Say this before you write.** "I'll walk through once, carrying the one fact about the past that the future needs, and update the best answer at each step."

**What stays true.** `cheapest` is the lowest price on any day so far. `run` is the largest sum of a stretch that ends at the current number.

**Write, from memory:**
1. Best Time to Buy and Sell Stock, carrying the cheapest price so far.
2. Maximum Subarray, where each number either extends the current stretch or starts a new one.

<details><summary>Answer</summary>

```python
# Best Time to Buy and Sell Stock
cheapest, best = prices[0], 0
for p in prices:
    cheapest = min(cheapest, p)            # the best day to have bought, if selling today
    best = max(best, p - cheapest)
return best

# Maximum Subarray (Kadane's algorithm)
best, run = nums[0], 0
for x in nums:
    run = max(run + x, x)                  # extend the stretch, or start fresh at x
    best = max(best, run)
return best
```

**Compare your answer against these:**
- **Start `best` at the first element, not 0, in Maximum Subarray.** If every number is negative, the answer is the largest negative number. Starting at 0 would wrongly return 0.
- **Say the input guarantee out loud.** `prices[0]` and `nums[0]` crash on an empty list. Both problems promise at least one element, so it's safe, but interviewers like to hear that you noticed.
- **Products need two running values.** For Maximum Product Subarray (152), a negative number turns the smallest product into the largest, so carry both the largest and the smallest product ending here.
- **This is a tiny dynamic program.** "The best stretch ending here" is a DP state (P3) that only depends on the previous one, so it fits in one variable.
</details>

**Now use it on:** Best Time 121 · Maximum Subarray 53 · Maximum Product Subarray 152 (the largest product of a stretch of consecutive numbers; carry the running max and min).

### Card 4 · Recursion plus a memory of answers (P3)

**The problems**

- **Coin Change (322).** Given coin values (unlimited supply of each) and an amount, return the fewest coins that add up to the amount, or −1 if it's impossible.
  `coins = [1, 3, 4], amount = 6` → `2` (3 + 3; taking the biggest coin first gives 4 + 1 + 1, which is worse)
- **Decode Ways (91).** Letters are encoded as `"1"` to `"26"`. Count the ways to decode a string of digits.
  `s = "226"` → `3` ("2 2 6", "22 6", "2 26")

**When to reach for this card.** The question asks "how many ways", "is it possible" or "the fewest / most", each step is a small choice, and a plain recursive solution calls itself with the same arguments many times.

**Say this before you write.** "The state is ___. From a state, my choices are ___. I combine them with ___ because the question asks for ___. The base case is ___. Then I cache the answer for each state."

**What stays true.** Every cached value is the exact, final answer for the state it is stored under.

**Write, from memory:**
1. Coin Change, top-down: a recursive function of the remaining amount, with `@lru_cache`.
2. The same recurrence bottom-up: fill a list from amount 0 upward.

<details><summary>Answer</summary>

```python
# Top-down
from functools import lru_cache

@lru_cache(None)                           # remembers the answer for every argument it has seen
def fewest(a):                             # a = the amount still to make
    if a == 0: return 0
    if a < 0:  return float("inf")         # overshot: this route is impossible
    return min(1 + fewest(a - c) for c in coins)

ans = fewest(amount)
return -1 if ans == float("inf") else ans

# Bottom-up
dp = [0] + [float("inf")] * amount         # dp[a] = fewest coins that make a
for a in range(1, amount + 1):
    for c in coins:
        if c <= a:
            dp[a] = min(dp[a], dp[a - c] + 1)
return -1 if dp[amount] == float("inf") else dp[amount]
```

**Compare your answer against these:**
- **Is the state enough?** Ask: could two calls with the same argument ever need different answers? Here, no: once you know the remaining amount, how you got there doesn't matter. If the answer is yes, the state needs another piece of information.
- **Two kinds of base case.** Success returns the value of "nothing left to do": 0 coins (for "fewest"), 1 way (for "how many"), `True` (for "is it possible"). A dead end returns the value that can never win: infinity for `min`, 0 for `+`, `False` for `or`.
- **Watch the recursion depth.** Python stops at about 1,000 nested calls. With `coins = [1]` and `amount = 10000`, the top-down version raises `RecursionError`, so use the bottom-up version there.
- **Change one word to change the question.** Replace `min(...)` with a sum and the same recursion counts the ways instead.
</details>

**Now use it on:** Coin Change 322 · Decode Ways 91 (state: position in the string; take one digit if it isn't `"0"`, or two digits if they form 10–26; add the counts).

### Card 5 · Dynamic programming in two variables (P3)

**The problems**

- **House Robber (198).** Houses in a row hold `nums[i]` money. You can't rob two neighbors. Return the most you can rob.
  `nums = [2, 7, 9, 3, 1]` → `12` (houses 0, 2, 4)
- **Climbing Stairs (70).** Climb `n` steps, 1 or 2 at a time. How many different sequences reach the top?
  `n = 4` → `5`
- **Min Cost Climbing Stairs (746).** `cost[i]` is paid when you step on step `i`. You may start on step 0 or 1 and climb 1 or 2 at a time. Return the cheapest way to get past the last step.
  `cost = [10, 15, 20]` → `15` (start on step 1, then jump past the end)

**When to reach for this card.** The answer at position `i` only depends on the answers at `i − 1` and `i − 2`, so you don't need to keep the whole list.

**Say this before you write.** "The answer here is built from the previous two answers. I'll keep those two in variables and shift them forward each step."

**What stays true.** Entering step `i`, the two variables hold the answers for `i − 2` and `i − 1`.

**Write, from memory:**
1. House Robber (rob this house plus two back, or skip it and keep one back).
2. Climbing Stairs, by changing the combining rule to a sum.
3. Min Cost Climbing Stairs, where the answer is the cheaper of the last two.

<details><summary>Answer</summary>

```python
# House Robber
two_back, one_back = 0, 0                  # best totals up to house i-2 and i-1
for x in nums:
    two_back, one_back = one_back, max(two_back + x, one_back)
return one_back

# Climbing Stairs
a, b = 1, 1                                # ways to reach step 0 and step 1
for _ in range(2, n + 1):
    a, b = b, a + b
return b

# Min Cost Climbing Stairs
a = b = 0                                  # cheapest cost to stand on step i-2 and i-1
for c in cost:
    a, b = b, min(a, b) + c                # to stand here: come from either, then pay c
return min(a, b)                           # the top is one past the last step
```

**Compare your answer against these:**
- **Assign both at once.** `a, b = b, a + b` computes the right side with the *old* values before assigning. Writing `a = b` then `b = a + b` on two lines uses the new `a` and gives the wrong answer.
- **Houses in a circle (House Robber II, 213).** The first and last houses become neighbors. Run the straight-line version twice, on `nums[1:]` and on `nums[:-1]`, and take the larger.
- **The combining rule follows the question.** `max` for the most money, `+` for the number of ways, `min` for the cheapest cost. The two-variable shape stays the same.
</details>

**Now use it on:** House Robber 198 · Climbing Stairs 70 · Min Cost Climbing Stairs 746 · House Robber II 213.

### Card 6 · Reaching an exact total with items (P3)

**The problems**

- **Coin Change II (518).** Count the combinations of coins (unlimited supply of each) that add up to `amount`. Different orders of the same coins count once.
  `amount = 5, coins = [1, 2, 5]` → `4` (5; 2+2+1; 2+1+1+1; 1+1+1+1+1)
- **Partition Equal Subset Sum (416).** Can the list be split into two groups with equal sums? Each number goes in exactly one group.
  `nums = [1, 5, 11, 5]` → `True` ([1, 5, 5] and [11])

**When to reach for this card.** You must reach an exact total using items, either with unlimited reuse or with each item at most once.

**Say this before you write.** "I'll keep a list indexed by total, `dp[s]`. For each item, every total `s` can also be reached from `s − item`. The direction of the inner loop decides whether an item can be reused."

**What stays true.** `dp[s]` is the answer for total `s` using only the items processed so far.

**Write, from memory:**
1. Coin Change II: count the combinations, with reuse allowed.
2. Partition Equal Subset Sum: can some subset reach half the total, using each number once?

<details><summary>Answer</summary>

```python
# Coin Change II
dp = [0] * (amount + 1)
dp[0] = 1                                  # one way to make 0: use nothing
for c in coins:                            # coins in the outer loop: each combination counted once
    for s in range(c, amount + 1):         # upward: dp[s - c] may already include this coin (reuse)
        dp[s] += dp[s - c]
return dp[amount]

# Partition Equal Subset Sum
total = sum(nums)
if total % 2:
    return False                           # an odd total can't split into two equal halves
target = total // 2
dp = [False] * (target + 1)
dp[0] = True                               # the empty subset reaches 0
for x in nums:
    for s in range(target, x - 1, -1):     # downward: dp[s - x] doesn't include x yet (use once)
        dp[s] = dp[s] or dp[s - x]
return dp[target]
```

**Compare your answer against these:**
- **The odd-total check is real code.** Without it, `total // 2` rounds down: `[1, 2]` has total 3, half becomes 1, and the code wrongly returns `True`.
- **Upward means reuse, downward means once.** Looping `s` upward lets `dp[s - c]` already contain coin `c` from this same pass, so the coin can be used again. Looping downward reads values from before this item was considered, so each item is used at most once.
- **Loop order matters only for counting.** Coins outside and totals inside counts *combinations* (2+1 and 1+2 once). Totals outside and coins inside counts *orderings* (both), as in Combination Sum IV (377). For "fewest" or "is it possible", either order gives the same answer.
</details>

**Now use it on:** Coin Change II 518 · Partition Equal Subset Sum 416 · Target Sum 494 (put + or − before each number and count the ways to hit the target; rewrite as "count subsets that sum to (total + target) / 2", after checking that `total + target` is even and `abs(target) <= total`).

### Card 7 · Two strings on a grid (P3)

**The problems**

- **Longest Common Subsequence (1143).** Return the length of the longest string that can be obtained from both strings by deleting characters.
  `"abcde", "ace"` → `3` ("ace")
- **Edit Distance (72).** Return the fewest single-character inserts, deletes or replacements that turn `s` into `t`.
  `"horse", "ros"` → `3` (replace h→r, delete r, delete e)
- **Distinct Subsequences (115).** Count the ways `t` can be formed from `s` by deleting characters.
  `s = "rabbbit", t = "rabbit"` → `3` (any one of the three b's can be dropped)
- **Interleaving String (97).** Can `s3` be formed by weaving together `s1` and `s2`, keeping the characters of each in their original order?
  `s1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"` → `True`
- **Regular Expression Matching (10).** Does pattern `p` match all of `s`? In `p`, `.` matches any single character and `x*` matches zero or more copies of `x`.
  `s = "aab", p = "c*a*b"` → `True` (`c*` matches nothing, `a*` matches "aa")

**When to reach for this card.** Two strings and a question about how they relate: common parts, converting one into the other, one inside the other, one matching the other.

**Say this before you write.** "`dp[i][j]` is the answer for the rest of the first string from `i` and the rest of the second from `j`. I compare `s[i]` with `t[j]` and look at the cells below, to the right and diagonally. I fill from the bottom-right, with an extra row and column for 'used up'."

**What stays true.** Every cell below and to the right of the one I'm filling already holds its final answer.

**Write, from memory:**
1. LCS.
2. Then Edit Distance, Distinct Subsequences, Interleaving String and Regex Matching. For each, say what the edge row and column hold and what the match / no-match rules are.

<details><summary>Answer</summary>

```python
# Longest Common Subsequence
dp = [[0] * (len(t) + 1) for _ in range(len(s) + 1)]
for i in range(len(s) - 1, -1, -1):
    for j in range(len(t) - 1, -1, -1):
        if s[i] == t[j]:
            dp[i][j] = 1 + dp[i + 1][j + 1]            # use this matching character
        else:
            dp[i][j] = max(dp[i + 1][j], dp[i][j + 1]) # drop one of the two characters
return dp[0][0]

# Edit Distance
m, n = len(s), len(t)
dp = [[0] * (n + 1) for _ in range(m + 1)]
for i in range(m + 1): dp[i][n] = m - i                # t used up: delete the rest of s
for j in range(n + 1): dp[m][j] = n - j                # s used up: insert the rest of t
for i in range(m - 1, -1, -1):
    for j in range(n - 1, -1, -1):
        if s[i] == t[j]:
            dp[i][j] = dp[i + 1][j + 1]                # no edit needed
        else:                                          # delete, insert, or replace
            dp[i][j] = 1 + min(dp[i + 1][j], dp[i][j + 1], dp[i + 1][j + 1])
return dp[0][0]

# Distinct Subsequences: count the ways t appears in s
m, n = len(s), len(t)
dp = [[0] * (n + 1) for _ in range(m + 1)]
for i in range(m + 1): dp[i][n] = 1                    # an empty t appears exactly once
for i in range(m - 1, -1, -1):
    for j in range(n - 1, -1, -1):
        dp[i][j] = dp[i + 1][j]                        # skip s[i]
        if s[i] == t[j]:
            dp[i][j] += dp[i + 1][j + 1]               # or use s[i] for t[j]
return dp[0][0]

# Interleaving String
m, n = len(s1), len(s2)
if m + n != len(s3): return False
dp = [[False] * (n + 1) for _ in range(m + 1)]
dp[m][n] = True
for i in range(m, -1, -1):                             # start AT m and n: the edges aren't constant
    for j in range(n, -1, -1):
        if i < m and s1[i] == s3[i + j] and dp[i + 1][j]: dp[i][j] = True
        if j < n and s2[j] == s3[i + j] and dp[i][j + 1]: dp[i][j] = True
return dp[0][0]

# Regular Expression Matching (p is the pattern)
m, n = len(s), len(p)
dp = [[False] * (n + 1) for _ in range(m + 1)]
dp[m][n] = True                                        # empty text matches empty pattern
for i in range(m, -1, -1):                             # row m isn't constant: "a*" can match nothing
    for j in range(n - 1, -1, -1):
        first = i < m and p[j] in (s[i], ".")          # does the current character match?
        if j + 1 < n and p[j + 1] == "*":
            dp[i][j] = dp[i][j + 2] or (first and dp[i + 1][j])   # zero copies, or one more
        else:
            dp[i][j] = first and dp[i + 1][j + 1]
return dp[0][0]
```

**Compare your answer against these:**
- **One extra row and column.** They stand for "that string is used up", which is where the base cases live.
- **Fill order.** Loop `i` and `j` downward so `dp[i + 1][...]` and `dp[...][j + 1]` are already filled when you need them.
- **The edges change from problem to problem.** LCS: all 0. Edit Distance: the number of characters left in the other string. Distinct Subsequences: 1 down the "t used up" column. Interleaving and Regex: the last row and column are *not* constant, so their loops start at `m` and `n` themselves, with `i < m` / `j < n` guards before indexing.
- **Regex's star looks two columns ahead.** `dp[i][j + 2]` tries "`x*` matches zero copies" (skip the pattern pair). `first and dp[i + 1][j]` tries "it matches one more character, and the same `x*` may keep matching".
- **Interleaving has a hidden third index.** The position in `s3` is always `i + j`, so it doesn't need its own dimension.
</details>

**Now use it on:** LCS 1143 · Edit Distance 72 · Distinct Subsequences 115 · Interleaving String 97 · Regular Expression Matching 10.

---

## MOVE 2 — Eliminate

### Card 8 · Binary search for the first value that passes a test (P4)

**The problems**

- **Koko Eating Bananas (875).** Pile `i` has `piles[i]` bananas. At speed `k`, Koko eats `k` bananas from one pile per hour (finishing a smaller pile ends that hour). Return the smallest `k` that finishes everything within `h` hours.
  `piles = [3, 6, 7, 11], h = 8` → `4`
- **Search Insert Position (35, outside the 150).** In a sorted list, return the position of `target`, or where it would be inserted to keep the list sorted.
  `nums = [1, 3, 5, 6], target = 2` → `1`

**When to reach for this card.** You can ask a yes/no question of each candidate ("is this speed fast enough?"), and the answers go no, no, ..., no, yes, yes, ..., yes. You want the first yes.

**Say this before you write.** "The answer is somewhere in `[lo, hi]`. I test the middle. If it passes, it might be the answer, so I keep it: `hi = mid`. If it fails, it and everything below it are out: `lo = mid + 1`. I stop when `lo == hi`."

**What stays true.** The answer is always inside `[lo, hi]`. `lo` only moves past values proven to fail, and `hi` only lands on values that pass.

**Write, from memory:**
1. The general "first passing value" loop.
2. Koko, where the test is "total hours at speed `mid` ≤ `h`".

<details><summary>Answer</summary>

```python
# Koko Eating Bananas
lo, hi = 1, max(piles)                            # the answer is in [lo, hi]
while lo < hi:
    mid = (lo + hi) // 2
    hours = sum((p + mid - 1) // mid for p in piles)   # each pile, rounded up
    if hours <= h:
        hi = mid                                  # fast enough: mid might be the answer
    else:
        lo = mid + 1                              # too slow, and so is everything slower
return lo
```

**Compare your answer against these:**
- **Match the loop to the update.** `while lo < hi` goes with `hi = mid` (keep the candidate). `while lo <= hi` goes with `hi = mid - 1` plus a separate variable recording the best answer. Mixing them loops forever or skips the answer.
- **Say why the answers switch only once.** Eating faster can never make you slower, so once a speed works, every higher speed works too. If you can't say a sentence like that, binary search may not apply.
- **The range must contain the answer.** `hi = max(piles)` always works: at that speed every pile takes one hour, and `h` is at least the number of piles.
- **Rounding up without floats.** `(p + k - 1) // k` equals `p / k` rounded up. `math.ceil(p / k)` also works.
</details>

**Now use it on:** Koko 875 · Search Insert Position 35 (outside; the test is `nums[mid] >= target`, and the range is `[0, len(nums)]` because the answer can be one past the end).

### Card 9 · Binary search for a value, and in a rotated list (P4)

**The problems**

- **Binary Search (704).** In a sorted list, return the position of `target`, or −1.
  `nums = [-1, 0, 3, 5, 9, 12], target = 9` → `4`
- **Find Minimum in Rotated Sorted Array (153).** A sorted list of distinct numbers was rotated (some elements moved from the front to the back). Return the smallest element in O(log n).
  `nums = [4, 5, 6, 7, 0, 1, 2]` → `0`
- **Search in Rotated Sorted Array (33).** Same kind of list; return the position of `target`, or −1, in O(log n).
  `nums = [4, 5, 6, 7, 0, 1, 2], target = 0` → `4`

**When to reach for this card.** A sorted list, or a sorted list that has been rotated, and O(log n) is required.

**Say this before you write.** "The target, if present, is in `[l, r]`. One look at the middle tells me which half it cannot be in."

**What stays true.** The target (or the minimum) is always inside `[l, r]`.

**Write, from memory:**
1. Classic binary search.
2. Find Minimum in Rotated Sorted Array, comparing the middle with the right end.

<details><summary>Answer</summary>

```python
# Binary Search
l, r = 0, len(nums) - 1
while l <= r:
    m = (l + r) // 2
    if nums[m] == target: return m
    if nums[m] < target: l = m + 1          # m and everything left of it are too small
    else:                r = m - 1          # m and everything right of it are too big
return -1

# Find Minimum in Rotated Sorted Array
l, r = 0, len(nums) - 1
while l < r:
    m = (l + r) // 2
    if nums[m] > nums[r]: l = m + 1         # m is before the drop: the minimum is to its right
    else:                 r = m             # m is at or after the drop: it might be the minimum
return nums[l]
```

**Compare your answer against these:**
- **Compare with the right end, not the left.** Everything before the drop is larger than `nums[r]`, and everything from the drop on is not. Comparing with `nums[l]` doesn't split cleanly when the list isn't rotated at all.
- **Rotated search (33) has two steps.** First decide which half is in normal sorted order (`nums[l] <= nums[m]` means the left half is). Then check whether the target lies within that half's range of values; if so search there, otherwise search the other half. Full code in P4.
- **Duplicates break it.** With repeated values (`[1, 1, 1, 0, 1]`), "which half is sorted?" can't always be answered, and the worst case becomes O(n).
</details>

**Now use it on:** Binary Search 704 · Find Min in Rotated 153 · Search in Rotated 33 · Search a 2D Matrix 74 (rows sorted, each row starting after the previous ends; treat position `p` as row `p // cols`, column `p % cols`).

### Card 10 · Two pointers moving inward (P5)

**The problems**

- **Two Sum II (167).** In a sorted list, return the 1-based positions of the two numbers that add up to `target`. Use O(1) extra memory.
  `numbers = [1, 3, 4, 6, 8, 11], target = 10` → `[3, 4]`
- **3Sum (15).** Return every distinct triple that adds up to 0.
  `nums = [-1, 0, 1, 2, -1, -4]` → `[[-1, -1, 2], [-1, 0, 1]]`
- **Container With Most Water (11).** Choose two vertical lines; the water held is `min(heights) × distance`. Return the most water.
  `height = [1, 8, 6, 2, 5, 4, 8, 3, 7]` → `49`

**When to reach for this card.** A sorted list and a pair (or triple) with a target sum; or a question about two ends where you can argue one end is hopeless.

**Say this before you write.** "One pointer at each end. If the sum is too big, the right number is too big to pair with anything that's left, so I drop it. If it's too small, I drop the left one."

**What stays true.** Every pair that uses a position outside `[l, r]` has already been ruled out.

**Write, from memory:**
1. Two Sum II.
2. 3Sum: sort, fix the first number with a loop, run Two Sum II on the rest, and skip duplicates.

<details><summary>Answer</summary>

```python
# Two Sum II
l, r = 0, len(numbers) - 1
while l < r:
    s = numbers[l] + numbers[r]
    if s == target: return [l + 1, r + 1]
    if s < target: l += 1                  # numbers[l] is too small for any partner left
    else:          r -= 1                  # numbers[r] is too big for any partner left

# 3Sum
nums.sort()
res = []
for i in range(len(nums)):
    if nums[i] > 0: break                  # sorted: the three can't sum to 0 any more
    if i and nums[i] == nums[i - 1]: continue    # same first number: same triples
    l, r = i + 1, len(nums) - 1
    while l < r:
        s = nums[i] + nums[l] + nums[r]
        if s < 0:   l += 1
        elif s > 0: r -= 1
        else:
            res.append([nums[i], nums[l], nums[r]])
            l += 1; r -= 1
            while l < r and nums[l] == nums[l - 1]: l += 1   # skip repeated second numbers
return res
```

**Compare your answer against these:**
- **Say why the dropped number is hopeless.** "11 plus the smallest number left is already too big" is the whole algorithm. If you can't say it for a new problem, two pointers may not apply.
- **Skip duplicates in two places.** Skip a repeated first number in the outer loop, and after recording a triple, skip repeated second numbers. (Skipping repeated third numbers too is harmless but unnecessary: once the second number is new, the third is forced.)
- **Container With Most Water drops the shorter line.** Every other container using the shorter line is narrower and no taller, so it can't do better.
</details>

**Now use it on:** Two Sum II 167 · 3Sum 15 · Container With Most Water 11 · Valid Palindrome 125 (ignoring case and non-alphanumeric characters, does the string read the same both ways?).

### Card 11 · A stack of items still waiting for an answer (P6)

**The problems**

- **Daily Temperatures (739).** For each day, return how many days until a warmer temperature, or 0 if none comes.
  `[73, 74, 75, 71, 69, 72, 76, 73]` → `[1, 1, 4, 2, 1, 1, 0, 0]`
- **Largest Rectangle in Histogram (84).** Bars of width 1 have heights `heights[i]`. Return the area of the largest rectangle inside them.
  `[2, 1, 5, 6, 2, 3]` → `10` (the 5 and 6 bars hold a 5 × 2 rectangle)

**When to reach for this card.** "For every element, find the next (or previous) larger (or smaller) one", or something that stretches until a smaller element blocks it.

**Say this before you write.** "I keep a stack of positions still waiting for their answer. Each new element settles every waiting element it beats, from the top down, then waits itself."

**What stays true.** The stack holds exactly the positions without an answer yet, and their values never increase from bottom to top. (Equal values stay, because the pop test is strictly `<`.)

**Write, from memory:**
1. Daily Temperatures.
2. Then say out loud what changes for Largest Rectangle.

<details><summary>Answer</summary>

```python
# Daily Temperatures
res = [0] * len(T)
stack = []                                # positions waiting for a warmer day
for i, t in enumerate(T):
    while stack and T[stack[-1]] < t:     # today is warmer than the top: it's their answer
        j = stack.pop()
        res[j] = i - j
    stack.append(i)
return res
```

Largest Rectangle: the stack holds `(start, height)` with heights increasing. A shorter bar pops every taller one and scores its rectangle as `height × (i − start)`; the new bar takes the start position of the last bar it popped, since it can stretch back that far. At the end, anything still on the stack stretches to the end of the list: `height × (n − start)`.

**Compare your answer against these:**
- **Store positions, not values.** The answer is a distance (or a width), so you need positions. Values can be looked up from them.
- **`<` or `<=` decides what happens with ties.** Popping on `<` leaves equal values on the stack, which is right for "strictly warmer". Popping on `<=` keeps the stack strictly decreasing.
- **Deal with what's left.** Positions still on the stack at the end never found an answer: 0 for Daily Temperatures, "stretches to the end" for the histogram.
</details>

**Now use it on:** Daily Temperatures 739 · Largest Rectangle 84 · Sliding Window Maximum 239 (the largest value in every window of `k` consecutive elements; the deque stores **positions**, because the test for "has the front left the window?" is `q[0] <= r - k`; full version on Card 34).

### Card 12 · Greedy: the farthest reach, and dropping a negative running total (P7)

**The problems**

- **Jump Game (55).** `nums[i]` is the longest jump allowed from position `i`. Starting at 0, can you reach the last position?
  `[2, 3, 1, 1, 4]` → `True`; `[3, 2, 1, 0, 4]` → `False`
- **Jump Game II (45).** Same rules; the end is always reachable. Return the fewest jumps.
  `[2, 3, 1, 1, 4]` → `2` (0 → 1 → 4)
- **Gas Station (134).** Stations on a circular road give `gas[i]`; driving to the next costs `cost[i]`. Return the starting station that lets you go all the way around, or −1.
  `gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2]` → `3`

**When to reach for this card.** "Can you reach the end", "fewest jumps", "a circular route with a running balance". One number carried through a single pass decides it.

**Say this before you write.** "I'll carry one number: the leftmost position known to reach the end (or the farthest I can reach, or the fuel since my last restart), and one sentence explains why keeping only that number is safe."

**What stays true.** Jump Game: `goal` is the leftmost position known to reach the end. Jump Game II: `[l, r]` is every position reachable in exactly `jumps` jumps. Gas Station: `tank` is the fuel collected since the current candidate start.

**Write, from memory:**
1. Jump Game, scanning backward.
2. Jump Game II, in rounds.
3. Gas Station.

<details><summary>Answer</summary>

```python
# Jump Game
goal = len(nums) - 1
for i in range(len(nums) - 2, -1, -1):
    if i + nums[i] >= goal:
        goal = i                           # i can land on goal, so i reaches the end
return goal == 0

# Jump Game II
l = r = jumps = 0                          # [l, r]: positions reachable in `jumps` jumps
while r < len(nums) - 1:
    far = max(i + nums[i] for i in range(l, r + 1))
    l, r = r + 1, far                      # the next round of positions
    jumps += 1
return jumps

# Gas Station
if sum(gas) < sum(cost): return -1         # not enough fuel in total: no start works
tank = start = 0
for i in range(len(gas)):
    tank += gas[i] - cost[i]
    if tank < 0:
        tank, start = 0, i + 1             # every start from `start` to i fails here
return start
```

**Compare your answer against these:**
- **State the reason in one sentence.** Jump Game: "any position that can reach a good position further right can also reach the leftmost one, since a jump can be any length up to the maximum." Gas Station: "a start between the old start and `i` would arrive at `i` with even less fuel."
- **Jump Game II is breadth-first search in disguise.** Each `[l, r]` window is one round. The loop relies on the guarantee that the end is reachable: without it, a round could be empty and `max()` would raise an error.
- **Gas Station needs the total check first.** The reset logic only finds a valid start if one exists.
</details>

**Now use it on:** Jump Game 55 · Jump Game II 45 · Gas Station 134 · Maximum Subarray 53 (the same "drop a negative running total" idea; Card 3).

---

## MOVE 3 — Sweep

### Card 13 · Sliding window: longest and shortest (P8)

**The problems**

- **Longest Substring Without Repeating Characters (3).** Return the length of the longest stretch with no repeated character.
  `"abcabcbb"` → `3` ("abc")
- **Minimum Window Substring (76).** Return the shortest stretch of `s` containing every character of `t` (with repeats), or `""`.
  `s = "ADOBECODEBANC", t = "ABC"` → `"BANC"`

**When to reach for this card.** "Substring", "subarray", "consecutive" or "window", plus "longest", "shortest" or "how many", with a condition on the stretch's contents.

**Say this before you write.** "I'll grow the window on the right one step at a time, shrink it from the left only as much as needed, and keep a set or count of what's inside so I never rebuild it. For the longest window I shrink while it's invalid; for the shortest, while it's valid."

**What stays true.** Longest: after shrinking, `[l, r]` is the longest valid window ending at `r`. Shortest: I record inside the shrink loop, so every valid window ending at `r` gets considered, and when the loop exits `[l, r]` is invalid. In both, the set or counts describe exactly what's in `[l, r]`.

**Write, from memory:**
1. Longest Substring Without Repeating Characters, with a set.
2. Minimum Window Substring, with counts and a `have` / `need` counter.

<details><summary>Answer</summary>

```python
# Longest Substring Without Repeating Characters
seen, l, best = set(), 0, 0
for r, c in enumerate(s):
    while c in seen:                       # adding c would repeat: shrink from the left
        seen.remove(s[l]); l += 1
    seen.add(c)
    best = max(best, r - l + 1)
return best

# Minimum Window Substring
need = collections.Counter(t)
have, required = 0, len(need)              # distinct characters satisfied / needed
window = {}
l = 0
best = (0, float("inf"))                   # (start, end) of the best window
for r, c in enumerate(s):
    window[c] = window.get(c, 0) + 1
    if c in need and window[c] == need[c]:
        have += 1                          # c just reached its required count
    while have == required:                # valid: record it, then shrink
        if r - l + 1 < best[1] - best[0]:
            best = (l, r + 1)
        window[s[l]] -= 1
        if s[l] in need and window[s[l]] < need[s[l]]:
            have -= 1                      # s[l] just fell below its requirement
        l += 1
return s[best[0]:best[1]] if best[1] != float("inf") else ""
```

**Compare your answer against these:**
- **Longest shrinks while invalid; shortest shrinks while valid.** Getting this backwards is the most common bug.
- **`have` / `required` makes the validity check instant.** Comparing two whole dictionaries at every step would be slow. Only update `have` when a character's count *crosses* its requirement.
- **Guard the "nothing found" case.** If no window was valid, `best[1]` is still infinity, and slicing with it raises `TypeError`.
- **The condition must only get harder as the window grows.** "Sum exactly `k`" with negative numbers can become valid by *adding* an element, so a window doesn't work there. Use Card 28.
</details>

**Now use it on:** Longest Substring 3 · Longest Repeating Character Replacement 424 (the longest stretch that can be made one letter by changing at most `k` characters; valid when `length − count of the most common letter ≤ k`) · Minimum Window 76 · Permutation in String 567 (does `s2` contain a rearrangement of `s1` as a consecutive stretch? a fixed-size window of letter counts).

### Card 14 · Sort, then one pass: merge, keep the most, count the overlap (P9)

**The problems**

- **Merge Intervals (56).** Merge all overlapping `[start, end]` intervals.
  `[[1, 3], [2, 6], [8, 10], [15, 18]]` → `[[1, 6], [8, 10], [15, 18]]`
- **Non-overlapping Intervals (435).** Return the fewest intervals to remove so that the rest don't overlap (touching is fine).
  `[[1, 2], [2, 3], [3, 4], [1, 3]]` → `1`
- **Meeting Rooms II (253).** Return the fewest rooms needed to hold all meetings.
  `[[0, 30], [5, 10], [15, 20]]` → `2`

**When to reach for this card.** `[start, end]` pairs, with "merge", "overlap", "rooms" or "remove the fewest".

**Say this before you write.** "Once they're sorted, each interval can only interact with the one just before it, so one pass with a little state is enough. For rooms, I turn each meeting into a +1 and a −1 event and track the running count."

**What stays true.** Merge: `out[-1]` is the block still being built, and every earlier block is finished. Remove the fewest: `prev_end` is the end of the last interval kept. Rooms: `cur` is the number of meetings in progress at the current time.

**Write, from memory:**
1. Merge Intervals.
2. Non-overlapping Intervals (sorted by start; on overlap, keep the one that ends first).
3. Meeting Rooms II as a sweep over events.

<details><summary>Answer</summary>

```python
# Merge Intervals
iv.sort()
out = []
for s, e in iv:
    if out and s <= out[-1][1]:
        out[-1][1] = max(out[-1][1], e)    # overlaps the last block: extend it
    else:
        out.append([s, e])                 # a new block (a fresh list, so it can be changed)
return out

# Non-overlapping Intervals
iv.sort()
removed, prev_end = 0, float("-inf")
for s, e in iv:
    if s >= prev_end:
        prev_end = e                       # no overlap: keep it
    else:
        removed += 1                       # overlap: drop the one that ends later
        prev_end = min(prev_end, e)
return removed

# Meeting Rooms II
events = [(s, 1) for s, e in iv] + [(e, -1) for s, e in iv]
events.sort()                              # at equal times, (t, -1) sorts first: free the room first
cur = best = 0
for _, change in events:
    cur += change
    best = max(best, cur)
return best
```

**Compare your answer against these:**
- **Two ways to keep the most intervals.** Sort by start and, on overlap, keep the smaller end (above). Or sort by end and keep every interval that starts at or after the last kept end. Both are correct.
- **Ties decide whether touching counts as overlapping.** Sorting `(time, -1)` before `(time, +1)` means a meeting ending at 10 frees its room for one starting at 10.
- **Append a fresh list.** `out[-1][1] = ...` changes the block in place, so it must be a list. Appending `[s, e]` (not the input pair itself) makes this safe even if the input holds tuples. Starting from an empty `out` with the `if out` check also handles an empty input.
- **Insert Interval (57) is Merge Intervals with the input already sorted.**
</details>

**Now use it on:** Merge Intervals 56 · Non-overlapping Intervals 435 · Meeting Rooms II 253 · Insert Interval 57 (insert one new interval into a sorted, non-overlapping list, merging as needed).

### Card 15 · Heaps: keep the best k, merge sorted lists, find the median (P10)

**The problems**

- **Kth Largest Element in an Array (215).** Return the `k`-th largest element.
  `nums = [3, 2, 1, 5, 6, 4], k = 2` → `5`
- **Merge K Sorted Lists (23).** Merge `k` sorted linked lists into one sorted list.
  `[1→4→5, 1→3→4, 2→6]` → `1→1→2→3→4→4→5→6`
- **Find Median from Data Stream (295).** Build `addNum(num)` and `findMedian()`.
  add 5, 15, 1, 3 → medians `5, 10, 5, 4`

**When to reach for this card.** "The k largest / closest", "merge k sorted things", "running median", or any loop that keeps asking for the smallest or largest item of a changing collection.

**Say this before you write.** "A heap hands me the smallest item instantly and adds or removes one in O(log n). For the k largest I keep a min-heap of size k and evict its smallest."

**What stays true.** The heap holds exactly the items still in the running, and the best of them is at index 0.

**Write, from memory:**
1. Kth largest with a heap of size `k`.
2. Merge K Sorted Lists: the heap holds the current front node of each list.
3. The running median with two heaps.

<details><summary>Answer</summary>

```python
# Kth Largest: keep the k largest in a min-heap
h = []
for x in nums:
    heapq.heappush(h, x)
    if len(h) > k: heapq.heappop(h)        # evict the smallest; the k largest remain
return h[0]

# Merge K Sorted Lists
h = [(node.val, i, node) for i, node in enumerate(lists) if node]
heapq.heapify(h)
dummy = cur = ListNode()
while h:
    _, i, node = heapq.heappop(h)          # the smallest front node
    cur.next = node; cur = node
    if node.next:
        heapq.heappush(h, (node.next.val, i, node.next))   # its list's next node takes its place
return dummy.next

# Running median
small, large = [], []                      # small: max-heap (negated), large: min-heap
def add(x):
    heapq.heappush(small, -x)
    heapq.heappush(large, -heapq.heappop(small))    # move small's largest across
    if len(large) > len(small):
        heapq.heappush(small, -heapq.heappop(large))
def median():
    return -small[0] if len(small) > len(large) else (-small[0] + large[0]) / 2
```

**Compare your answer against these:**
- **"k largest" uses a min-heap.** You need quick access to the smallest of your kept items, because that's the one to evict.
- **Put a tiebreaker in the tuple.** If two nodes have the same value, Python compares the next item in the tuple, and it can't compare `ListNode` objects. The list index `i` sits in between; since each list has at most one node in the heap at a time, `(val, i)` is always unique and the node is never compared.
- **Negate for a max-heap.** Python only has a min-heap. Store `-x` and negate again when reading.
- **Another way to find the kth largest:** quickselect, on Card 31.
</details>

**Now use it on:** Kth Largest 215 · Merge K Lists 23 · Find Median 295 · K Closest Points to Origin 973 (the `k` points nearest to (0, 0); keep a heap of size `k` keyed on negative distance).

---

## MOVE 4 — Decompose

### Card 16 · Tree: return what the parent needs, record the best on the side (P11)

**The problems**

- **Diameter of Binary Tree (543).** Return the number of edges on the longest path between any two nodes.
  `[1, 2, 3, 4, 5]` → `3` (4 → 2 → 1 → 3)
- **Binary Tree Maximum Path Sum (124).** Values may be negative. Return the largest sum along any path of connected nodes.
  `[-10, 9, 20, null, null, 15, 7]` → `42` (15 → 20 → 7)
- **Balanced Binary Tree (110).** Is every node's left and right subtree height within 1 of each other?
  `[3, 9, 20, null, null, 15, 7]` → `True`

**When to reach for this card.** Each node's answer comes from its children, but the overall answer is a different thing from what a parent needs (a path through the node versus the height below it).

**Say this before you write.** "My recursive function returns what the parent needs: the height, or the best one-sided path. While it's at each node, it also updates a separate best with the answer that bends through that node."

**What stays true.** When a call returns, its whole subtree has been handled and the return value is exactly what the parent needs.

**Write, from memory:**
1. Diameter.
2. Maximum Path Sum.
3. Say what changes for Balanced.

<details><summary>Answer</summary>

```python
# Diameter of Binary Tree
best = 0
def height(node):
    nonlocal best
    if not node: return 0
    L, R = height(node.left), height(node.right)
    best = max(best, L + R)                # the longest path bending at this node
    return 1 + max(L, R)                   # the height, for the parent
height(root)
return best

# Binary Tree Maximum Path Sum
best = root.val                            # not 0: an all-negative tree must return its largest node
def gain(node):                            # the best downward path starting at node
    nonlocal best
    if not node: return 0
    L = max(gain(node.left), 0)            # a negative branch is better left out
    R = max(gain(node.right), 0)
    best = max(best, node.val + L + R)
    return node.val + max(L, R)            # the parent can only extend one side
gain(root)
return best
```

Balanced: return a pair `(is_balanced, height)` from each call, and a node is balanced when both children are and `abs(left_height - right_height) <= 1`.

**Compare your answer against these:**
- **`nonlocal best`.** Without it, `best = ...` inside the inner function creates a new local variable and the outer `best` never changes. (A one-element list also works.)
- **Clip negatives, and don't start at 0, for path sums.** A negative branch only lowers the total, so treat it as 0. But `best` must start at a real node value: with `best = 0`, the tree `[-3]` would return 0.
- **Diameter counts edges.** `height` counts nodes, so `L + R` is the number of edges on the path bending at this node.
- **Decide the return value before coding.** Write down "this returns ___" first.
</details>

**Now use it on:** Diameter 543 · Max Path Sum 124 · Balanced 110 · Maximum Depth 104 (the number of nodes on the longest root-to-leaf path: `1 + max(left, right)`).

### Card 17 · Tree: pass the ancestors' limits down (P11)

**The problems**

- **Validate Binary Search Tree (98).** In a binary search tree, every value in a node's left subtree is smaller and every value in its right subtree is larger. Is this tree one?
  `[5, 1, 6, null, null, 3, 7]` → `False` (3 is under 5's right side but smaller than 5)
- **Count Good Nodes in Binary Tree (1448).** A node is "good" if no value on the path from the root to it is larger. Count them.
  `[3, 1, 4, 3, null, 1, 5]` → `4`

**When to reach for this card.** A node's answer depends on its *ancestors*: an allowed range, the largest value on the way down.

**Say this before you write.** "I pass down what the node needs to know about everything above it: a `(low, high)` range, or the largest value so far. Each child gets a tightened version."

**What stays true.** The arguments describe exactly the limits set by all of the node's ancestors.

**Write, from memory:**
1. Validate BST, passing a range down.
2. Count Good Nodes, passing the largest value so far down.

<details><summary>Answer</summary>

```python
# Validate Binary Search Tree
def valid(node, lo, hi):                   # node's value must be strictly between lo and hi
    if not node: return True
    if not (lo < node.val < hi): return False
    return valid(node.left, lo, node.val) and valid(node.right, node.val, hi)
return valid(root, float("-inf"), float("inf"))

# Count Good Nodes
def good(node, mx):                        # mx = the largest value on the path above node
    if not node: return 0
    count = 1 if node.val >= mx else 0
    mx = max(mx, node.val)
    return count + good(node.left, mx) + good(node.right, mx)
return good(root, root.val)
```

**Compare your answer against these:**
- **Checking only the parent is the classic wrong answer.** In the example, 3 < 6 passes a parent-only check, but 3 is also under 5's right side and must be greater than 5.
- **Strict inequalities.** A binary search tree has no duplicates here, so equal values are invalid.
- **Only one side tightens per child.** Going left, the upper limit becomes the node's value; going right, the lower limit does.
- **Another way:** visiting left subtree, node, right subtree ("in-order") lists a valid BST's values in increasing order. The loop version is on Card 30.
</details>

**Now use it on:** Validate BST 98 · Count Good Nodes 1448 · Kth Smallest in a BST 230 (the `k`-th smallest value; in-order visiting gives sorted order, so stop at the `k`-th node).

### Card 18 · Tree: level by level with a queue (P11 / P13)

**The problems**

- **Binary Tree Level Order Traversal (102).** Return the values level by level, left to right.
  `[3, 9, 20, null, null, 15, 7]` → `[[3], [9, 20], [15, 7]]`
- **Binary Tree Right Side View (199).** Return the values you'd see looking at the tree from the right, top to bottom.
  `[1, 2, 3, null, 5, null, 4]` → `[1, 3, 4]`

**When to reach for this card.** "By level", "right side", "left side", "minimum depth", "zigzag".

**Say this before you write.** "I use a queue. Before each level I read the queue's length; exactly that many nodes belong to this level, and their children go to the back for the next one."

**What stays true.** At the top of the outer loop, the queue holds exactly one full level.

**Write, from memory:**
1. Level Order Traversal.

<details><summary>Answer</summary>

```python
res, q = [], collections.deque([root] if root else [])
while q:
    level = []
    for _ in range(len(q)):                # the length is read once: exactly this level
        node = q.popleft()
        level.append(node.val)
        if node.left:  q.append(node.left)
        if node.right: q.append(node.right)
    res.append(level)
return res
```

**Compare your answer against these:**
- **Read the length before the inner loop.** `range(len(q))` is computed once. Children added during the loop belong to the next level and aren't counted.
- **Handle an empty tree.** Start with an empty queue when `root` is `None`, or the loop crashes on `None.val`.
- **Right Side View** is the same loop, keeping only `level[-1]`.
</details>

**Now use it on:** Level Order 102 · Right Side View 199 · Minimum Depth of Binary Tree 111 (outside; the first level containing a leaf).

### Card 19 · Backtracking: choose, explore, undo (P12)

**The problems**

- **Subsets (78).** Return every subset of a list of distinct numbers.
  `[1, 2, 3]` → `[[1, 2, 3], [1, 2], [1, 3], [1], [2, 3], [2], [3], []]`
- **Combination Sum II (40).** Each number may be used once, the input may contain repeats, and the output must not. Return every combination that sums to `target`.
  `candidates = [10, 1, 2, 7, 6, 1, 5], target = 8` → `[[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]`
- **Permutations (46).** Return every ordering of a list of distinct numbers.
  `[1, 2, 3]` → six orderings

**When to reach for this card.** "Return all ..." subsets, combinations, orderings or splits, and the input is small.

**Say this before you write.** "One shared `path`. At each level I make a choice, recurse, then undo the choice. I save a copy when `path` is complete, stop early when it can't be completed, and skip repeated values at the same level."

**What stays true.** `path` holds exactly the choices made from the start down to the current call.

**Write, from memory:**
1. Subsets: include or exclude each element.
2. Combination Sum II: a start index, sorted input, skip duplicates, stop when too big.
3. Permutations: track which elements are used.

<details><summary>Answer</summary>

```python
# Subsets
def subsets(i):
    if i == len(nums):
        res.append(path[:]); return        # a copy: path keeps changing
    path.append(nums[i]); subsets(i + 1); path.pop()   # include nums[i], then undo
    subsets(i + 1)                                      # exclude it

# Combination Sum II
cands.sort()
def comb(start, remain):
    if remain == 0:
        res.append(path[:]); return
    for i in range(start, len(cands)):
        if cands[i] > remain: break                          # sorted: everything after is too big
        if i > start and cands[i] == cands[i - 1]: continue  # same value as the option just tried
        path.append(cands[i])
        comb(i + 1, remain - cands[i])                       # i + 1: each number used once
        path.pop()

# Permutations
def perm():
    if len(path) == len(nums):
        res.append(path[:]); return
    for i in range(len(nums)):
        if used[i]: continue
        used[i] = True; path.append(nums[i])
        perm()
        path.pop(); used[i] = False                          # undo both changes
```

**Compare your answer against these:**
- **Copy only at the end.** `res.append(path[:])` saves a snapshot. Appending `path` itself stores the same list every time, and it ends up empty.
- **The recursive index controls reuse.** `comb(i, ...)` would allow the same number again; `comb(i + 1, ...)` doesn't.
- **Skip duplicates at the same level only.** The check is `i > start`, not `i > 0`. Using the second `1` *after* the first (to build `[1, 1, 6]`) is still allowed.
- **Sorting makes pruning a `break`.** Once one candidate is too big, every later one is too.
</details>

**Now use it on:** Subsets 78 · Combination Sum II 40 · Permutations 46 · N-Queens 51 (place `n` queens on an `n × n` board with no two attacking; one queen per row, with sets for used columns, `row − col` and `row + col`).

---

## MOVE 5 — Model as a graph

### Card 20 · Grid flood fill (P13)

**The problems**

- **Number of Islands (200).** In a grid of `"1"` (land) and `"0"` (water), count the groups of land connected up, down, left or right.
  `[["1","1","0","0","0"], ["1","1","0","0","0"], ["0","0","1","0","0"], ["0","0","0","1","1"]]` → `3`
- **Max Area of Island (695).** Return the number of cells in the largest island.

**When to reach for this card.** A grid, and "connected", "islands", "regions", "areas".

**Say this before you write.** "I scan the grid. Each unvisited land cell starts a new island, and I flood the whole island from it, marking every cell so it's never counted again."

**What stays true.** Every marked cell has already been counted as part of an island.

**Write, from memory:**
1. Number of Islands, marking cells by overwriting them with `"0"`.

<details><summary>Answer</summary>

```python
R, C = len(g), len(g[0])
def fill(r, c):
    if not (0 <= r < R and 0 <= c < C) or g[r][c] != "1":
        return 0                           # off the grid, water, or already visited
    g[r][c] = "0"                          # mark before exploring further
    fill(r + 1, c); fill(r - 1, c); fill(r, c + 1); fill(r, c - 1)
    return 1
return sum(fill(r, c) for r in range(R) for c in range(C))
```

**Compare your answer against these:**
- **Check the bounds before indexing.** `g[r][c]` with `r = -1` doesn't crash in Python; it silently reads the last row. Put the bounds test first.
- **Mark before recursing.** Otherwise two neighbors keep calling each other forever.
- **Max Area returns the size instead of 1:** `1 + fill(...) + fill(...) + ...`. If you mustn't change the input, keep a `seen` set instead.
- **Deep recursion on big grids.** An all-land 300 × 300 grid means a chain of 90,000 calls, far past Python's limit of about 1,000. Use the loop version on Card 30, or breadth-first search.
</details>

**Now use it on:** Number of Islands 200 · Max Area of Island 695 · Surrounded Regions 130 (flip every `"O"` region not connected to the border into `"X"`; flood from the border first to mark the safe ones).

### Card 21 · Breadth-first search from several starts: rounds are time (P13)

**The problems**

- **Rotting Oranges (994).** 0 is empty, 1 is fresh, 2 is rotten. Each minute, rotten oranges rot their fresh neighbors. Return the minutes until none are fresh, or −1.
  `[[2, 1, 1], [1, 1, 0], [0, 1, 1]]` → `4`
- **Walls and Gates (286).** Fill each empty room with its distance to the nearest gate.

**When to reach for this card.** Something spreads from several places at once, "distance to the nearest ___", "fewest steps".

**Say this before you write.** "I put every starting point in the queue at once. Each round of the loop takes out exactly one wave and adds the next; the number of rounds is the time."

**What stays true.** At the start of round `d`, the queue holds exactly the cells first reached at time `d`.

**Write, from memory:**
1. Rotting Oranges.

<details><summary>Answer</summary>

```python
R, C = len(g), len(g[0])
q = collections.deque(); fresh = 0
for r in range(R):
    for c in range(C):
        if g[r][c] == 1: fresh += 1
        elif g[r][c] == 2: q.append((r, c))            # every rotten orange starts together
t = 0
while q and fresh:
    for _ in range(len(q)):                            # one minute's wave
        r, c = q.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and g[nr][nc] == 1:
                g[nr][nc] = 2; fresh -= 1; q.append((nr, nc))   # mark as it joins the queue
    t += 1
return t if fresh == 0 else -1
```

**Compare your answer against these:**
- **Mark when adding to the queue, not when removing.** Otherwise two rotten neighbors both add the same orange, and it's processed twice.
- **Put all the starting points in before the loop.** They act at the same moment; adding them one at a time would give wrong times.
- **Stop when nothing is fresh.** Looping `while q` alone runs one extra empty minute at the end and gives an answer one too high.
</details>

**Now use it on:** Rotting Oranges 994 · Walls and Gates 286 · Word Ladder 127 (the fewest words in a chain from `beginWord` to `endWord`, changing one letter at a time; breadth-first search over words, finding neighbors through wildcard patterns like `h*t`).

### Card 22 · Ordering with prerequisites, recursively (P14)

**The problems**

- **Course Schedule II (210).** `[a, b]` means course `b` must be taken before `a`. Return a valid order for all courses, or `[]`.
  `4, [[1, 0], [2, 0], [3, 1], [3, 2]]` → `[0, 1, 2, 3]` (or `[0, 2, 1, 3]`)
- **Course Schedule (207).** Same input; return whether all courses can be finished.
  `2, [[1, 0], [0, 1]]` → `False`

**When to reach for this card.** "Prerequisites", "must come before", "build order", "can all be finished".

**Say this before you write.** "To place a course, I first place all its prerequisites, then add it. A course I meet again while it's still in progress means I've gone around a loop."

**What stays true.** Every course in `order` comes after all of its prerequisites. `in_progress` is exactly the chain of calls I'm inside right now.

**Write, from memory:**
1. Course Schedule II with a depth-first search and two sets.

<details><summary>Answer</summary>

```python
needs = {c: [] for c in range(n)}
for crs, pre in prereqs: needs[crs].append(pre)
order, done, in_progress = [], set(), set()
def place(u):
    if u in in_progress: return False      # back around to a course in progress: a cycle
    if u in done:        return True
    in_progress.add(u)
    for v in needs[u]:
        if not place(v): return False
    in_progress.remove(u); done.add(u)
    order.append(u)                        # all its prerequisites are already in order
    return True
for c in range(n):
    if not place(c): return []
return order
```

**Compare your answer against these:**
- **Two sets, not one.** `in_progress` detects cycles. `done` stops finished courses being explored again; without it the search can take exponential time.
- **Direction.** Adding a course after its prerequisites gives prerequisites first. If your edges point the other way, reverse the result.
- **Recursion depth.** A chain of 2,000 courses (allowed in 207/210) exceeds Python's limit of about 1,000. In Python the queue version on Card 29 is safer, and it's what most interviewers expect.
</details>

**Now use it on:** Course Schedule 207 · Course Schedule II 210 · Alien Dictionary 269 (words sorted in an unknown alphabet; each neighboring pair's first differing letters give "this letter comes first"; order the letters).

### Card 23 · Union-Find: merge groups as connections arrive (P14)

**The problems**

- **Redundant Connection (684).** A tree on nodes 1 to `n` had one extra edge added. Return that edge (the last one, if several would work).
  `[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]` → `[1, 4]`
- **Number of Connected Components (323).** Given `n` nodes and undirected edges, count the separate groups.
  `n = 5, [[0, 1], [1, 2], [3, 4]]` → `2`

**When to reach for this card.** Undirected connections, and "how many groups", "is it a tree", "which connection closes a loop".

**Say this before you write.** "Each node points to a parent; following parents reaches the group's root. Two nodes are connected exactly when they have the same root. A union links two roots; if they're already the same, this edge closes a loop."

**What stays true.** `find(x) == find(y)` exactly when `x` and `y` are connected by the edges processed so far.

**Write, from memory:**
1. `find` with path shortening and `union` by size.
2. Redundant Connection.

<details><summary>Answer</summary>

```python
parent = list(range(n + 1)); size = [1] * (n + 1)
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]      # shortcut: point at the grandparent
        x = parent[x]
    return x
def union(a, b):
    ra, rb = find(a), find(b)
    if ra == rb: return False              # already connected: this edge makes a loop
    if size[ra] < size[rb]: ra, rb = rb, ra
    parent[rb] = ra; size[ra] += size[rb]  # hang the smaller group under the larger
    return True
for a, b in edges:
    if not union(a, b): return [a, b]
```

**Compare your answer against these:**
- **Always shorten paths and merge by size.** Without them, parent chains can grow to length n and every `find` becomes slow. With both, each operation is effectively constant time.
- **Counting groups.** Start with `n` groups and subtract 1 for every successful `union`.
- **Testing for a tree.** Exactly `n − 1` edges, and every `union` succeeds (no loops).
</details>

**Now use it on:** Redundant Connection 684 · Connected Components 323 · Graph Valid Tree 261 (do the `n` nodes and edges form one tree?).

### Card 24 · Cheapest routes: Dijkstra, and rounds for a stop limit (P15)

**The problems**

- **Network Delay Time (743).** `[u, v, w]` means a signal takes time `w` from `u` to `v`. From node `k`, how long until every node has it? −1 if some never do.
  `times = [[1, 2, 4], [1, 3, 1], [3, 2, 1], [2, 4, 1]], n = 4, k = 1` → `3`
- **Cheapest Flights Within K Stops (787).** Return the cheapest price from `src` to `dst` with at most `k` stops, or −1.
  `n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1` → `700`

**When to reach for this card.** Connections with costs, and "the cheapest / fastest way to reach"; add a limit on the number of steps for the second version.

**Say this before you write.** "Dijkstra: a heap of `(cost, node)`; the cheapest entry I pop is final, so I settle it and push its neighbors. With a stop limit: `k + 1` rounds, each extending every route by one flight, working from a copy of the previous round."

**What stays true.** Dijkstra: every settled node has its final cost. Rounds: after round `i`, each price is the cheapest using at most `i` flights.

**Write, from memory:**
1. Network Delay Time.
2. Cheapest Flights Within K Stops with `k + 1` rounds.

<details><summary>Answer</summary>

```python
# Network Delay Time (Dijkstra)
adj = collections.defaultdict(list)
for u, v, w in times: adj[u].append((v, w))
h, done, t = [(0, k)], set(), 0
while h:
    d, u = heapq.heappop(h)
    if u in done: continue                 # an old, slower entry
    done.add(u); t = d                     # the cheapest unsettled entry is final
    for v, w in adj[u]:
        if v not in done: heapq.heappush(h, (d + w, v))
return t if len(done) == n else -1

# Cheapest Flights Within K Stops (Bellman-Ford, k + 1 rounds)
dist = [float("inf")] * n; dist[src] = 0
for _ in range(k + 1):
    nxt = dist[:]                          # extend only last round's routes
    for u, v, w in flights:
        if dist[u] + w < nxt[v]: nxt[v] = dist[u] + w
    dist = nxt
return -1 if dist[dst] == float("inf") else dist[dst]
```

**Compare your answer against these:**
- **Skip stale entries.** A node can be in the heap several times. `if u in done: continue` ignores the slower copies.
- **One line changes the problem.** Push `max(d, w)` instead of `d + w` for "the smallest possible worst step" (Swim in Rising Water). Push `w` alone for "connect everything cheaply" (Prim's method), adding `w` to a total on each successful pop and stopping when every node is done.
- **The copy in the rounds version.** Without `nxt = dist[:]`, one round could chain several flights together and quietly exceed the stop limit.
- **Why not Dijkstra with stops?** It settles a node at its cheapest price even if that route used too many stops, and never reconsiders it. A heap version that tracks stops is on Card 36.
</details>

**Now use it on:** Network Delay 743 · Swim in Rising Water 778 (the earliest time to cross a grid where you can only enter squares at most as high as the current time) · Cheapest Flights 787 · Min Cost to Connect All Points 1584 (connect all points as cheaply as possible, where a connection costs the Manhattan distance).

---

## MOVE 6 — Manipulate in place

### Card 25 · Linked lists: reverse, two speeds, a gap with a dummy (P16)

**The problems**

- **Reverse Linked List (206).** Reverse the list and return the new head.
  `1→2→3→4→5` → `5→4→3→2→1`
- **Linked List Cycle (141).** Does the list loop back on itself?
- **Remove Nth Node From End of List (19).** Remove the `n`-th node from the end.
  `1→2→3→4→5, n = 2` → `1→2→3→5`

**When to reach for this card.** Any singly linked list problem.

**Say this before you write.** "Reverse: save `next`, flip the arrow, step forward. Two speeds: slow moves one, fast moves two; they meet only if there's a loop. Gap: start from a dummy node in front of the head, open a gap of `n`, then move both until the front falls off."

**What stays true.** Reverse: `prev` is the head of the reversed part and `cur` the head of the rest. Two speeds: `fast` has moved exactly twice as far as `slow`. Gap: `right` is `n + 1` steps ahead of `left`, so `left` stops just before the node to delete.

**Write, from memory:**
1. Reverse.
2. Cycle detection (and note where `slow` is when `fast` reaches the end).
3. Remove the n-th node from the end.

<details><summary>Answer</summary>

```python
# Reverse Linked List
prev, cur = None, head
while cur:
    nxt = cur.next                         # save the rest first
    cur.next = prev                        # flip the arrow
    prev, cur = cur, nxt
return prev

# Linked List Cycle
slow = fast = head
while fast and fast.next:
    slow, fast = slow.next, fast.next.next
    if slow is fast: return True           # fast caught up: there's a loop
return False                               # (with no loop, slow is now at the middle)

# Remove Nth Node From End
dummy = ListNode(0, head)                  # a node before the head, in case the head is removed
left, right = dummy, head
for _ in range(n): right = right.next      # open a gap
while right: left, right = left.next, right.next
left.next = left.next.next                 # skip the target
return dummy.next
```

**Compare your answer against these:**
- **Save `next` before overwriting it.** Once `cur.next = prev` runs, the old `cur.next` is gone unless you saved it.
- **Check `fast.next` before `fast.next.next`.** The loop condition `fast and fast.next` protects the double step.
- **Return `dummy.next`, not `head`.** If the head itself was removed, `head` points at a node no longer in the list.
- **Where does the loop start?** That takes a second phase (Linked List Cycle II 142, Find the Duplicate Number 287), on Card 36.
</details>

**Now use it on:** Reverse 206 · Linked List Cycle 141 · Remove Nth 19 · Reorder List 143 (turn `1→2→3→4→5` into `1→5→2→4→3`: find the middle, reverse the second half, weave; all three moves in one problem).

### Card 26 · XOR and counting bits (P17)

**The problems**

- **Single Number (136).** Every number appears twice except one. Find it with O(1) extra memory.
  `[4, 1, 2, 1, 2]` → `4`
- **Missing Number (268).** The list holds `n` distinct numbers from 0 to `n`. Which is missing?
  `[3, 0, 1]` → `2`
- **Number of 1 Bits (191).** Count the 1s in a number's binary form.
  `11` (binary `1011`) → `3`
- **Counting Bits (338).** Return the 1-bit count of every number from 0 to `n`.
  `5` → `[0, 1, 1, 2, 1, 2]`

**When to reach for this card.** "Appears twice except one", "missing from 0 to n", "count the 1 bits".

**Say this before you write.** "XOR cancels pairs: `x ^ x = 0` and order doesn't matter, so XORing everything leaves the odd one out. `n & (n − 1)` removes the lowest 1 bit."

**What stays true.** `res` is the XOR of everything seen so far, so every value seen twice has cancelled.

**Write, from memory:**
1. Single Number.
2. Missing Number (XOR every index and every value, plus `n`).
3. Number of 1 Bits.
4. Counting Bits.

<details><summary>Answer</summary>

```python
# Single Number
res = 0
for x in nums: res ^= x                    # pairs cancel
return res

# Missing Number
res = len(nums)                            # the index n has no slot in the list, so start with it
for i, x in enumerate(nums): res ^= i ^ x  # every number that's present cancels with its index
return res

# Number of 1 Bits
x, count = n, 0
while x:
    x &= x - 1                             # remove the lowest 1 bit
    count += 1
return count

# Counting Bits
dp = [0] * (n + 1)
for i in range(1, n + 1):
    dp[i] = dp[i >> 1] + (i & 1)           # i's bits = (i without its last bit) + its last bit
return dp
```

**Compare your answer against these:**
- **XOR ignores order.** The pairs don't need to be next to each other.
- **`n & (n − 1)` is a fact to memorize.** Subtracting 1 flips the lowest 1 bit to 0 and every 0 after it to 1; ANDing with the original clears just that bit.
- **`i >> 1` and `i & 1`.** `i >> 1` is `i` with its last bit dropped (a smaller number already computed), and `i & 1` is that last bit.
- **Don't reuse a variable an earlier snippet used up.** The 1-bits loop works on a copy `x` so `n` survives.
</details>

**Now use it on:** Single Number 136 · Missing Number 268 · Number of 1 Bits 191 · Counting Bits 338 · Reverse Bits 190 (reverse the 32 bits of a number: 32 times, `res = (res << 1) | (n & 1)` then `n >>= 1`).

### Card 27 · Arithmetic one digit at a time (P17 / P16)

**The problems**

- **Add Two Numbers (2).** Two linked lists hold numbers with the digits reversed (`2→4→3` is 342). Return their sum in the same form.
  `2→4→3` + `5→6→4` → `7→0→8` (342 + 465 = 807)
- **Reverse Integer (7).** Reverse the digits of a 32-bit integer; return 0 if the result doesn't fit in 32 bits.
  `-123` → `-321`; `1534236469` → `0`
- **Multiply Strings (43).** Multiply two non-negative integers given as strings, without converting them to integers.
  `"12" × "34"` → `"408"`

**When to reach for this card.** Numbers given as strings, digit lists or linked lists; "plus one", "add", "multiply"; reversing a number with an overflow limit.

**Say this before you write.** "I work from the last digit, one position at a time: add the digits and the carry, keep `sum % 10`, carry `sum // 10`, and keep going while there's a carry left."

**What stays true.** Every position to the right of the current one is final, and `carry` holds what spills into the current position.

**Write, from memory:**
1. Add Two Numbers.
2. The overflow check for Reverse Integer.
3. The Multiply Strings accumulator.

<details><summary>Answer</summary>

```python
# Add Two Numbers
dummy = cur = ListNode(); carry = 0
while l1 or l2 or carry:                   # "or carry": a final carry makes one more digit
    v = (l1.val if l1 else 0) + (l2.val if l2 else 0) + carry
    carry, d = divmod(v, 10)
    cur.next = ListNode(d); cur = cur.next
    l1 = l1.next if l1 else None
    l2 = l2.next if l2 else None
return dummy.next

# Reverse Integer
INT_MAX = 2**31 - 1
res, sign, x = 0, (1 if x >= 0 else -1), abs(x)
while x:
    x, d = divmod(x, 10)
    if res > (INT_MAX - d) // 10: return 0 # check BEFORE the multiply would overflow
    res = res * 10 + d
return sign * res

# Multiply Strings
if num1 == "0" or num2 == "0": return "0"
res = [0] * (len(num1) + len(num2))        # the product has at most this many digits
for i in range(len(num1) - 1, -1, -1):
    for j in range(len(num2) - 1, -1, -1):
        res[i + j + 1] += int(num1[i]) * int(num2[j])
        res[i + j] += res[i + j + 1] // 10 # push the carry one place left
        res[i + j + 1] %= 10
return "".join(map(str, res)).lstrip("0")
```

**Compare your answer against these:**
- **Loop `while ... or carry`.** Without it, 5 + 5 returns `0` instead of `0→1`.
- **Check overflow before the operation.** In languages with fixed-size integers, the multiply itself overflows, so the check must come first.
- **The same check works for negatives.** The negative limit is −2³¹, one further than the positive limit, but no 32-bit input reverses to exactly that value, so checking the magnitude against `INT_MAX` is enough. Don't "fix" it.
- **Python never overflows.** The pre-multiply check is interview ritual; in Python, checking the final result against the range gives the same answer.
- **Where digits land in Multiply Strings.** Digit `i` of `num1` times digit `j` of `num2` goes into `res[i + j + 1]`, with its carry going into `res[i + j]`.
</details>

**Now use it on:** Add Two Numbers 2 · Plus One 66 (a number as a list of digits; add one, carrying from the right) · Reverse Integer 7 · Multiply Strings 43.

---

## ADDED AFTER REVIEW — Cards 28–36

*Gaps the review found: techniques the principles and contrasts rely on that no card taught, plus loop versions of the recursive cards that overflow Python's recursion limit. Each card is tagged with its principle.*

### Card 28 · Running totals plus a dictionary of earlier totals (P1 + P2)

**The problems**

- **Subarray Sum Equals K (560, outside the 150).** Count the stretches of consecutive numbers that add up to exactly `k`. Numbers may be negative.
  `nums = [1, 2, 3], k = 3` → `2` (`[1, 2]` and `[3]`)
- **Contiguous Array (525, outside).** In a list of 0s and 1s, return the length of the longest stretch with equally many 0s and 1s.
  `[0, 1, 1, 0, 1]` → `4` (`[0, 1, 1, 0]`)

**When to reach for this card.** "Count (or find the longest) stretch with sum exactly `k`" or "with a balance of zero", especially when negative numbers stop a sliding window from working.

**Say this before you write.** "The sum of a stretch is the running total at its end minus the running total just before its start. So a stretch ending here sums to `k` exactly when some earlier running total equals `total − k`. I keep a dictionary of earlier running totals."

**What stays true.** Before handling position `i`, the dictionary describes every running total from before `i`, including the empty start (total 0).

**Write, from memory:**
1. Subarray Sum Equals K, with a dictionary from running total to how many times it has occurred.
2. Contiguous Array, counting 1 as +1 and 0 as −1, with a dictionary from running total to its *first* position.

<details><summary>Answer</summary>

```python
# Subarray Sum Equals K
count, total, res = {0: 1}, 0, 0         # {0: 1}: the empty start, before any numbers
for x in nums:
    total += x
    res += count.get(total - k, 0)       # look up BEFORE adding this total
    count[total] = count.get(total, 0) + 1
return res

# Contiguous Array
first, total, best = {0: -1}, 0, 0       # running total -> earliest position it occurred
for i, x in enumerate(nums):
    total += 1 if x == 1 else -1
    if total in first:
        best = max(best, i - first[total])   # same total twice: the stretch between is balanced
    else:
        first[total] = i                 # keep only the earliest position
return best
```

**Compare your answer against these:**
- **The starting entry stands for "before any numbers".** `{0: 1}` (or `{0: -1}` for the longest version) lets stretches that begin at position 0 be found. Without it, `[3]` with `k = 3` returns 0.
- **Look up before inserting.** If you add the current total first, then with `k = 0` every position matches itself and counts an empty stretch.
- **Longest: never overwrite the first position. Count: always add one.** Overwriting would shorten the longest stretch; not counting repeats would miss stretches.
</details>

**Now use it on:** Subarray Sum Equals K 560 (outside) · Contiguous Array 525 (outside) · Continuous Subarray Sum 523 (outside; is there a stretch of length at least 2 whose sum is a multiple of `k`? key the dictionary on `total % k`).

### Card 29 · Ordering with prerequisites, using a queue (P14)

**The problems**

- **Course Schedule II (210).** `[a, b]` means take `b` before `a`. Return a valid order for all courses, or `[]`.
  `4, [[1, 0], [2, 0], [3, 1], [3, 2]]` → `[0, 1, 2, 3]`
- **Course Schedule (207).** Can every course be finished?
  `2, [[1, 0], [0, 1]]` → `False` (each needs the other)

**When to reach for this card.** The same situations as Card 22, and in Python this is the default choice because it has no recursion limit.

**Say this before you write.** "I count each course's untaken prerequisites. Courses at zero go in a queue. Taking a course lowers the count of every course that needs it, and any that reach zero join the queue. If some courses never get taken, there's a cycle."

**What stays true.** The queue holds exactly the untaken courses whose prerequisites are all taken, and every course in `order` comes after its prerequisites.

**Write, from memory:**
1. Course Schedule II.
2. Course Schedule, by changing only the return line.

<details><summary>Answer</summary>

```python
unlocks = [[] for _ in range(n)]           # unlocks[pre] = courses that need pre
missing = [0] * n                          # untaken prerequisites per course
for crs, pre in prereqs:
    unlocks[pre].append(crs); missing[crs] += 1
q = collections.deque(i for i in range(n) if missing[i] == 0)
order = []
while q:
    u = q.popleft(); order.append(u)
    for v in unlocks[u]:
        missing[v] -= 1
        if missing[v] == 0: q.append(v)    # its last prerequisite was just taken
return order if len(order) == n else []    # Course Schedule: return len(order) == n
```

**Compare your answer against these:**
- **Point edges from prerequisite to course.** Then `order` comes out prerequisites first and needs no reversing.
- **Start the queue with every course at zero,** not just the first one found.
- **A cycle shows up as missing courses.** Courses on a cycle each wait for another on the same cycle, so their counts never reach zero and they never enter `order`.
</details>

**Now use it on:** Course Schedule 207 · Course Schedule II 210 · Alien Dictionary 269 (build "letter before letter" edges from each pair of neighboring words first; if a longer word comes before its own prefix, like `"abc"` before `"ab"`, return `""`).

### Card 30 · Depth-first search with a loop instead of recursion (P13 / P11)

**The problems**

- **Number of Islands (200),** on a grid large enough to break recursion (up to 300 × 300).
- **Kth Smallest Element in a BST (230).** Return the `k`-th smallest value in a binary search tree.
  `root = [3, 1, 4, null, 2], k = 1` → `1`

**When to reach for this card.** A recursive search that can go as deep as the input is big (big grids, trees shaped like long chains); or "visit a search tree's values in sorted order".

**Say this before you write.** "Grid: a list used as a stack replaces the recursion; I mark cells as I push them. Tree: go left as far as possible pushing nodes, pop one and visit it, then move to its right child."

**What stays true.** Grid: every cell on the stack is land that's already marked. In-order: the stack holds the ancestors whose left side is being visited, not yet visited themselves, so nodes come off in sorted order.

**Write, from memory:**
1. Number of Islands with an explicit stack.
2. Kth Smallest with the in-order loop.

<details><summary>Answer</summary>

```python
# Number of Islands, no recursion
R, C = len(g), len(g[0]); count = 0
for sr in range(R):
    for sc in range(C):
        if g[sr][sc] != "1": continue
        count += 1; g[sr][sc] = "0"; stack = [(sr, sc)]
        while stack:
            r, c = stack.pop()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < R and 0 <= nc < C and g[nr][nc] == "1":
                    g[nr][nc] = "0"; stack.append((nr, nc))   # mark as it's pushed
return count

# Kth Smallest Element in a BST (in-order with a loop)
stack, cur = [], root
while stack or cur:
    while cur:                             # go left as far as possible
        stack.append(cur); cur = cur.left
    cur = stack.pop()                      # the next smallest value
    k -= 1
    if k == 0: return cur.val
    cur = cur.right                        # then its right subtree
```

**Compare your answer against these:**
- **Mark when pushing, not when popping.** Otherwise a cell can be pushed once by each of its neighbors.
- **Stack or queue: one line apart.** Replacing `stack.pop()` with `deque.popleft()` turns this into breadth-first search, with nothing else changed.
- **The in-order rhythm:** left all the way, pop, visit, go right. The loop runs `while stack or cur`, because either one can still hold unvisited nodes.
</details>

**Now use it on:** Number of Islands 200 (loop version) · Kth Smallest in a BST 230 · Binary Tree Inorder Traversal 94 (outside; list the values in left-node-right order) · Max Area of Island 695.

### Card 31 · Quickselect: the k-th largest in O(n) on average (P10 / P4)

**The problems**

- **Kth Largest Element in an Array (215).** Return the `k`-th largest element (counting repeats).
  `nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4` → `4`

**When to reach for this card.** "The k-th largest / smallest" in a fixed list, when you want O(n) on average rather than the O(n log k) of a heap.

**Say this before you write.** "The k-th largest sits at position `len − k` in sorted order. I pick a random pivot, split the list into smaller, equal and larger parts, and continue only in the part that contains that position."

**What stays true.** The target position is always inside `[lo, hi]`. After a split, `[lo, lt)` is smaller than the pivot, `[lt, gt]` equals it, and `(gt, hi]` is larger.

**Write, from memory:**
1. Kth Largest with a random pivot and a three-way split.

<details><summary>Answer</summary>

```python
target = len(nums) - k                     # the k-th largest's position in ascending order
lo, hi = 0, len(nums) - 1
while True:
    p = nums[random.randint(lo, hi)]       # a random pivot
    lt, i, gt = lo, lo, hi
    while i <= gt:                         # split into < p, == p, > p
        if nums[i] < p:
            nums[lt], nums[i] = nums[i], nums[lt]; lt += 1; i += 1
        elif nums[i] > p:
            nums[gt], nums[i] = nums[i], nums[gt]; gt -= 1   # don't advance i
        else:
            i += 1
    if target < lt:   hi = lt - 1          # the answer is among the smaller values
    elif target > gt: lo = gt + 1          # among the larger values
    else:             return p             # the target position holds a pivot value
```

**Compare your answer against these:**
- **Average O(n), worst case O(n²).** A fixed pivot (always the first element) is slow on sorted input, and a two-way split is slow when every value is equal. Problem 215 has both kinds of test, and they time out the simple version. A random pivot and a three-way split handle them.
- **Don't advance `i` after swapping with `gt`.** The value swapped in from the right hasn't been checked yet.
- **Pick the right tool.** Need the top `k` in order: sort. Data arriving as a stream: a heap (Card 15). One answer from a fixed list: quickselect.
</details>

**Now use it on:** Kth Largest 215 · K Closest Points 973 (quickselect on distance) · Top K Frequent 347 (the `k` most common values; quickselect on counts).

### Card 32 · Longest Increasing Subsequence: O(n²), then O(n log n) (P3 + P4)

**The problems**

- **Longest Increasing Subsequence (300).** Return the length of the longest subsequence (not necessarily consecutive) whose values strictly increase.
  `[10, 9, 2, 5, 3, 7, 101, 18]` → `4` (`2, 3, 7, 18`)

**When to reach for this card.** One sequence, and "longest increasing", "longest chain", "nested envelopes"; the elements don't have to be next to each other.

**Say this before you write.** "Slow version: the longest run ending at `i` is one more than the best run ending at any earlier, smaller value. Fast version: `tails[L]` is the smallest possible last value of an increasing run of length `L + 1`; each new value replaces the first tail that is at least as big, found by binary search."

**What stays true.** Slow: `dp[i]` is the longest increasing subsequence ending exactly at `i`. Fast: `tails` is strictly increasing, and its length is the answer so far.

**Write, from memory:**
1. The O(n²) version.
2. The `bisect_left` version.

<details><summary>Answer</summary>

```python
# O(n^2)
dp = [1] * len(nums)                       # dp[i] = longest increasing run ending at i
for i in range(len(nums)):
    for j in range(i):
        if nums[j] < nums[i]:
            dp[i] = max(dp[i], dp[j] + 1)  # extend the run ending at j
return max(dp, default=0)

# O(n log n)
tails = []
for x in nums:
    i = bisect.bisect_left(tails, x)       # the first tail >= x
    if i == len(tails): tails.append(x)    # x extends the longest run
    else:               tails[i] = x       # a smaller ending for runs of length i + 1
return len(tails)
```

Traced on the example, `tails` goes: [10] → [9] → [2] → [2, 5] → [2, 3] → [2, 3, 7] → [2, 3, 7, 101] → [2, 3, 7, 18]. Length 4.

**Compare your answer against these:**
- **`bisect_left` for strictly increasing, `bisect_right` for "never decreasing".** `bisect_left` makes an equal value replace its twin instead of extending the run.
- **`tails` is not itself a valid subsequence.** Only its length means anything. `[2, 3, 7, 18]` happens to be one here, but in general it mixes values from different runs.
- **One sequence versus two.** Here the state looks back at every earlier position. With two sequences, you need the grid on Card 7.
</details>

**Now use it on:** Longest Increasing Subsequence 300 · Russian Doll Envelopes 354 (outside; sort by width ascending and height descending, then run the fast version on heights) · Number of Longest Increasing Subsequences 673 (outside; the O(n²) version, also counting how many runs reach each length).

### Card 33 · Trie: a tree of letters for prefix lookups (P1)

**The problems**

- **Implement Trie (208).** Build `insert(word)`, `search(word)` (was this exact word inserted?) and `startsWith(prefix)` (was any word with this prefix inserted?).
  insert "apple"; search "apple" → `True`; search "app" → `False`; startsWith "app" → `True`
- **Design Add and Search Words (211).** Like `search`, but `.` matches any one letter.
  after adding "bad", "dad", "mad": search ".ad" → `True`; search "b.." → `True`; search "pad" → `False`

**When to reach for this card.** Many words that share beginnings, and "starts with", "autocomplete", "words with wildcards", "find every word on a board".

**Say this before you write.** "Each node is a dictionary from a letter to the next node. A word is a path from the root, with an end marker on its last node. Lookups follow one letter at a time, so they cost the word's length, however many words are stored."

**What stays true.** The node reached by following `s` from the root exists exactly when some inserted word starts with `s`, and it holds the end marker `"$"` exactly when `s` itself was inserted.

**Write, from memory:**
1. Implement Trie, using plain dictionaries as nodes.
2. The wildcard search.

<details><summary>Answer</summary>

```python
class Trie:
    def __init__(self):
        self.root = {}
    def insert(self, word):
        node = self.root
        for c in word:
            node = node.setdefault(c, {})  # follow the letter, creating the node if needed
        node["$"] = True                   # a word ends here
    def _walk(self, s):
        node = self.root
        for c in s:
            if c not in node: return None  # the path breaks: no word starts with s
            node = node[c]
        return node
    def search(self, word):
        node = self._walk(word)
        return node is not None and "$" in node
    def startsWith(self, prefix):
        return self._walk(prefix) is not None

def search(node, word, i=0):               # 211: "." matches any one letter
    if i == len(word): return "$" in node
    if word[i] == ".":
        return any(search(child, word, i + 1) for c, child in node.items() if c != "$")
    return word[i] in node and search(node[word[i]], word, i + 1)
```

**Compare your answer against these:**
- **`search` needs the end marker; `startsWith` doesn't.** After inserting "apple", the path "app" exists, but no word ends there.
- **The wildcard must skip `"$"`.** Its value is `True`, not a child dictionary, so treating it as a child would crash.
- **Word Search II (212):** after finding a word on the board, delete its end marker (and remove empty branches) so the search doesn't report it again or keep exploring dead paths.
</details>

**Now use it on:** Implement Trie 208 · Design Add and Search Words 211 · Word Search II 212 (find every dictionary word that can be traced through neighboring cells on a letter board; a grid search guided by the trie).

### Card 34 · Monotonic deque: the largest value in every window (P6 + P8)

**The problems**

- **Sliding Window Maximum (239).** Return the largest value in every window of `k` consecutive elements.
  `nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3` → `[3, 3, 5, 5, 6, 7]`

**When to reach for this card.** "The maximum (or minimum) of every window of size `k`."

**Say this before you write.** "I keep a deque of positions whose values decrease from front to back. A new value removes every smaller value behind it (they can never be a maximum again), then joins at the back. If the front has slid out of the window, I drop it. The front is the window's maximum."

**What stays true.** `q` holds positions inside the window `[r − k + 1, r]`, their values strictly decrease from front to back, and `nums[q[0]]` is the window's largest value.

**Write, from memory:**
1. Sliding Window Maximum.

<details><summary>Answer</summary>

```python
q, res = collections.deque(), []
for r, x in enumerate(nums):
    while q and nums[q[-1]] <= x:
        q.pop()                            # older and not larger: can never be a maximum again
    q.append(r)
    if q[0] <= r - k:
        q.popleft()                        # the front has slid out of the window
    if r >= k - 1:
        res.append(nums[q[0]])             # a full window exists from here on
return res
```

**Compare your answer against these:**
- **Store positions.** The "has it left the window?" test, `q[0] <= r - k`, needs positions, not values.
- **Two ends, two jobs.** The back removes values the new one beats (the stack idea, P6). The front removes values that left the window (the window idea, P8).
- **Record only once a full window exists** (`r >= k - 1`).
</details>

**Now use it on:** Sliding Window Maximum 239 · Shortest Subarray with Sum at Least K 862 (outside; the same deque over running totals).

### Card 35 · LRU Cache: `OrderedDict`, then a hand-built linked list (P1 + P16)

**The problems**

- **LRU Cache (146).** Build a cache with a fixed capacity. `get(key)` returns the value or −1. `put(key, value)` stores it. When full, adding a new key evicts the key used (read or written) longest ago. Both must be O(1).
  capacity 2: put(1, 1), put(2, 2), get(1) → `1`, put(3, 3) evicts key 2, get(2) → `−1`

**When to reach for this card.** "Design ... with O(1) get and put", "evict the least recently used".

**Say this before you write.** "A dictionary finds a key in O(1), but can't tell which key is oldest. So I pair it with a doubly linked list in order of use: every use moves a node to the 'newest' end, and eviction removes from the 'oldest' end. Dummy nodes at both ends remove every edge case."

**What stays true.** The dictionary holds exactly the cached keys. The list is in order of use: least recent next to `head`, most recent next to `tail`.

**Write, from memory:**
1. The `OrderedDict` version.
2. The version with a dictionary and a doubly linked list with dummy head and tail nodes (what interviewers usually ask for).

<details><summary>Answer</summary>

```python
# With OrderedDict
class LRUCache:
    def __init__(self, capacity):
        self.cap, self.d = capacity, collections.OrderedDict()
    def get(self, key):
        if key not in self.d: return -1
        self.d.move_to_end(key)                      # just used: now the newest
        return self.d[key]
    def put(self, key, value):
        self.d[key] = value; self.d.move_to_end(key)
        if len(self.d) > self.cap: self.d.popitem(last=False)   # remove the oldest

# By hand
class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val, self.prev, self.next = key, val, None, None

class LRUCache:
    def __init__(self, capacity):
        self.cap, self.map = capacity, {}
        self.head, self.tail = Node(), Node()        # dummies: never removed
        self.head.next, self.tail.prev = self.tail, self.head
    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev
    def _add(self, node):                            # insert just before tail: the newest
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
            lru = self.head.next                     # the oldest real node
            self._remove(lru); del self.map[lru.key]
```

**Compare your answer against these:**
- **Dummy nodes mean no `None` checks.** Every real node always has a real `prev` and `next`, so `_remove` and `_add` are two lines each.
- **Each node stores its key.** When you evict the oldest node, you need its key to delete it from the dictionary.
- **`put` on an existing key.** Unlink the old node first (and treat it as a use). Otherwise the list keeps a stale node and the counts go wrong.
</details>

**Now use it on:** LRU Cache 146 · LFU Cache 460 (outside; evict the least *frequently* used, breaking ties by least recent; one such list per use count).

### Card 36 · Dijkstra with a stop count, and finding where a cycle starts (P15 / P16)

**The problems**

- **Cheapest Flights Within K Stops (787),** this time with a heap.
  `n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1` → `700`
- **Find the Duplicate Number (287).** `n + 1` numbers, each from 1 to `n`, with exactly one repeated value. Find it without changing the list, using O(1) extra memory.
  `[1, 3, 4, 2, 2]` → `2`

**When to reach for this card.** Dijkstra with an extra limit such as "at most k stops"; "find the duplicate in `[1..n]`", "where does the cycle begin?"

**Say this before you write.** "Flights: the heap holds `(cost, city, flights used)`, and I only skip a popped entry if a cheaper one already reached that city using no more flights. Duplicate: treat `i → nums[i]` as a linked list; phase one finds a meeting point inside the loop, phase two walks from the start and from the meeting point at the same speed until they meet at the loop's entrance."

**What stays true.** Flights: entries come off the heap cheapest first, so the first time the destination is popped, that price is the cheapest route within the limit. Duplicate: the distance from the start to the loop's entrance equals the distance from the meeting point to the entrance (going around the loop).

**Write, from memory:**
1. Cheapest Flights with a heap.
2. Find the Duplicate Number with Floyd's two phases.

<details><summary>Answer</summary>

```python
# Cheapest Flights Within K Stops, with a heap
adj = collections.defaultdict(list)
for u, v, w in flights: adj[u].append((v, w))
h = [(0, src, 0)]                          # (cost, city, flights used)
fewest = {}                                # city -> fewest flights among earlier (cheaper) pops
while h:
    d, u, e = heapq.heappop(h)
    if u == dst: return d
    if e > k or fewest.get(u, float("inf")) <= e:
        continue                           # out of stops, or a cheaper pop already did better
    fewest[u] = e
    for v, w in adj[u]:
        heapq.heappush(h, (d + w, v, e + 1))
return -1

# Find the Duplicate Number
slow = fast = 0                            # phase 1: meet somewhere inside the loop
while True:
    slow, fast = nums[slow], nums[nums[fast]]
    if slow == fast: break
slow2 = 0                                  # phase 2: same speed, from the start and the meeting point
while slow != slow2:
    slow, slow2 = nums[slow], nums[slow2]
return slow                                # the loop's entrance = the duplicated value
```

Phase one on `[1, 3, 4, 2, 2]`: (slow, fast) goes (1, 3), (3, 4), (2, 4), (4, 4): they meet at 4. Phase two: (4, 0) → (2, 1) → (4, 3) → (2, 2): they meet at **2**.

**Compare your answer against these:**
- **Don't settle a city on its own, as Card 24 does.** A cheap route that used too many stops would lock the city and hide a pricier route that's the only one within the limit. Skip a pop only if an earlier (so no more expensive) pop reached the same city with **no more** flights.
- **`k` stops means at most `k + 1` flights,** so an entry that has used more than `k` flights can't take another.
- **Floyd's first step must happen before the check.** Both pointers start at 0, so test *after* moving (the `while True ... break` shape). Position 0 is never inside the loop, because every value is at least 1, so starting there is safe.
</details>

**Now use it on:** Cheapest Flights 787 · Find the Duplicate Number 287 · Linked List Cycle II 142 (outside; return the node where a linked list's loop begins, using the same phase two) · Happy Number 202 (repeatedly replace a number with the sum of the squares of its digits; does it reach 1, or loop forever?).
