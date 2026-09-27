# Batch A notes — Arrays & Hashing, Two Pointers, Sliding Window, Stack

---

### 217 Contains Duplicate [Arrays & Hashing, Easy]
- **Trigger**: "does this collection contain a repeated element" — no order requirement.
- **Brute force -> optimal leap**: O(n^2) all-pairs compare -> O(n) single pass using a hash set to remember what's been seen.
- **Core principle(s)**:
  - Trade space for time: store what you've seen in a hash structure so "have I seen X" becomes O(1) instead of a loop.
- **Invariant / state**: `hashset` always equals the set of elements seen so far.
- **Key code idiom**:
```python
hashset = set()
for n in nums:
    if n in hashset:
        return True
    hashset.add(n)
```
- **Complexity**: O(n) time, O(n) space.
- **Sibling problems**: Two Sum (1), Valid Sudoku (36), Longest Consecutive Sequence (128), LC 217-family duplicate-detection problems.

---

### 242 Valid Anagram [Arrays & Hashing, Easy]
- **Trigger**: "same characters, different order" / equality that should ignore ordering.
- **Brute force -> optimal leap**: sort both strings and compare (O(n log n)) -> build character-frequency signatures and compare those (O(n)).
- **Core principle(s)**:
  - Reduce an order-independent equality check to comparing canonical frequency signatures (hash map or fixed-size count array) instead of sorting.
- **Invariant / state**: `countS`/`countT` = frequency of each char seen so far in each string.
- **Key code idiom**:
```python
countS, countT = {}, {}
for i in range(len(s)):
    countS[s[i]] = 1 + countS.get(s[i], 0)
    countT[t[i]] = 1 + countT.get(t[i], 0)
return countS == countT
```
- **Complexity**: O(n) time, O(1) space (bounded alphabet).
- **Sibling problems**: Group Anagrams (49), Permutation in String (567).

---

### 1 Two Sum [Arrays & Hashing, Easy]
- **Trigger**: "find pair summing to target" in an unsorted array, need indices.
- **Brute force -> optimal leap**: check every pair O(n^2) -> for each element look up its complement (`target - n`) in a hash map built while scanning, O(n).
- **Core principle(s)**:
  - Trade space for time: store what you've seen in a hash structure so "have I seen X" becomes O(1) instead of a loop.
  - Rearrange the target equation (`need = target - cur`) to turn a pair-search into a single-element lookup.
- **Invariant / state**: `prevMap` holds every value's index for all indices processed before `i`.
- **Key code idiom**:
```python
prevMap = {}
for i, n in enumerate(nums):
    diff = target - n
    if diff in prevMap:
        return [prevMap[diff], i]
    prevMap[n] = i
```
- **Complexity**: O(n) time, O(n) space.
- **Sibling problems**: Two Sum II (167), 3Sum (15), Contains Duplicate (217).

---

### 49 Group Anagrams [Arrays & Hashing, Medium]
- **Trigger**: "bucket items that are equivalent under reordering" (anagram groups).
- **Brute force -> optimal leap**: compare every string to every other string O(n^2 * k) -> map each string to a canonical key (sorted string, or 26-length count tuple) and group by that key in a hash map, O(n*k).
- **Core principle(s)**:
  - Reduce an order-independent equality check to comparing canonical frequency signatures instead of sorting (count-array key avoids the log factor of sorting).
- **Invariant / state**: `groups[key]` accumulates all strings seen so far sharing that canonical signature.
- **Key code idiom**:
```python
ans = collections.defaultdict(list)
for s in strs:
    count = [0] * 26
    for c in s:
        count[ord(c) - ord("a")] += 1
    ans[tuple(count)].append(s)
return list(ans.values())
```
- **Complexity**: O(n*k) time (k = max string length), O(n*k) space.
- **Sibling problems**: Valid Anagram (242), Permutation in String (567).

---

### 347 Top K Frequent Elements [Arrays & Hashing, Medium]
- **Trigger**: "k most/least frequent" with a bound on possible frequencies (frequency ≤ n).
- **Brute force -> optimal leap**: sort all elements by frequency, O(n log n) -> since frequency is bounded by n, use frequency as a bucket index (bucket sort) and read off the top buckets, O(n).
- **Core principle(s)**:
  - Trade space for time: count frequencies in a hash map first (O(1) lookups) before doing anything else.
  - Bucket sort by bounded value: when a key is known to lie in `[0, n]`, use it directly as an array index instead of comparison-sorting.
- **Invariant / state**: `freq[c]` = list of numbers whose count is exactly `c`.
- **Key code idiom**:
```python
freq = [[] for i in range(len(nums) + 1)]
for n, c in count.items():
    freq[c].append(n)
res = []
for i in range(len(freq) - 1, 0, -1):
    res += freq[i]
    if len(res) == k:
        return res
```
- **Complexity**: O(n) time, O(n) space.
- **Sibling problems**: Sort Colors / bucket-sort style problems; Kth Largest Element variants outside the 150.

---

### 238 Product of Array Except Self [Arrays & Hashing, Medium]
- **Trigger**: "for every index, aggregate over everything except that index" without division.
- **Brute force -> optimal leap**: recompute the product of the rest of the array for every index, O(n^2) -> precompute running prefix products and running suffix products, combine per index in O(1), O(n) total, O(1) extra space.
- **Core principle(s)**:
  - Precompute directional running aggregates (prefix pass, suffix pass) so each position's answer assembles from two O(1) pieces instead of an O(n) rescan.
- **Invariant / state**: after the first loop, `res[i]` = product of all elements left of `i`; `postfix` = running product of all elements right of the current index during the second loop.
- **Key code idiom**:
```python
res = [1] * len(nums)
for i in range(1, len(nums)):
    res[i] = res[i-1] * nums[i-1]
postfix = 1
for i in range(len(nums) - 1, -1, -1):
    res[i] *= postfix
    postfix *= nums[i]
```
- **Complexity**: O(n) time, O(1) extra space (output excluded).
- **Sibling problems**: Trapping Rain Water (42), Best Time to Buy/Sell Stock (121, one-directional running aggregate).

---

### 36 Valid Sudoku [Arrays & Hashing, Medium]
- **Trigger**: "no duplicates" across multiple overlapping groupings (rows, columns, 3x3 boxes) simultaneously.
- **Brute force -> optimal leap**: rescan the relevant row/column/box for every cell -> single pass, recording membership in per-row/col/box hash sets (or one set with composite `(row, val)`/`(col, val)`/`(box, val)` keys), O(1) duplicate check per cell.
- **Core principle(s)**:
  - Trade space for time: store what you've seen in a hash structure so "have I seen X" becomes O(1) instead of a loop — generalize the key to a composite tuple to check several constraints (row/col/box) in one structure.
- **Invariant / state**: `seen` contains exactly the `(row,num)`, `(num,col)`, `(box,num)` markers for all cells processed so far.
- **Key code idiom**:
```python
for i in range(9):
    for j in range(9):
        if board[i][j] != ".":
            num = board[i][j]
            if (i, num) in seen or (num, j) in seen or (i//3, j//3, num) in seen:
                return False
            seen.add((i, num)); seen.add((num, j)); seen.add((i//3, j//3, num))
```
- **Complexity**: O(1) time/space (fixed 9x9 board), or O(n^2) generalized.
- **Sibling problems**: Contains Duplicate (217), Group Anagrams (49, composite key idea).

---

### 271 Encode and Decode Strings [Arrays & Hashing, Medium]
- **Trigger**: "serialize a list of strings into one string and back" when strings can contain any character (so a plain separator is unsafe).
- **Brute force -> optimal leap**: use a delimiter character and hope it never appears in the data (fragile) -> prefix each string with its length and a delimiter that only separates length from payload, so decoding never has to guess where a string ends.
- **Core principle(s)**:
  - Make the encoding self-describing (length-prefixed) so decoding never depends on the payload's content.
- **Invariant / state**: decode pointer `i` always sits at the start of a `"<len>#<payload>"` record.
- **Key code idiom**:
```python
def encode(strs):
    return "".join(f"{len(s)}#{s}" for s in strs)

def decode(s):
    res, i = [], 0
    while i < len(s):
        j = s.find("#", i)
        length = int(s[i:j])
        i = j + 1
        res.append(s[i:i+length])
        i += length
    return res
```
- **Complexity**: O(m) time per call (m = total chars), O(m+n) space.
- **Sibling problems**: none in the 150 — this is a self-contained serialization trick (netstring-style encoding, used e.g. in run-length/TLV protocols).

---

### 128 Longest Consecutive Sequence [Arrays & Hashing, Medium]
- **Trigger**: "longest run of consecutive integers" in an unsorted array, need better than O(n log n).
- **Brute force -> optimal leap**: sort then scan (O(n log n)), or for every number walk forward counting the run (O(n^2) because many numbers redundantly re-walk the same run) -> put all numbers in a hash set, but only *start* walking forward from numbers that are provably the start of a run (`num - 1` not in the set), so each run is walked exactly once.
- **Core principle(s)**:
  - Trade space for time: store what you've seen in a hash structure so "have I seen X" becomes O(1) instead of a loop.
  - Anchor expensive work at detectable start points: use a cheap O(1) check to filter down to only the positions worth doing real work from, so total work stays O(n) instead of O(n) redundant restarts.
- **Invariant / state**: for a number confirmed to be a run-start, `length` counts consecutive members `num, num+1, num+2, ...` present in the set.
- **Key code idiom**:
```python
numSet = set(nums)
for n in numSet:
    if (n - 1) not in numSet:          # only start at true run-starts
        length = 1
        while (n + length) in numSet:
            length += 1
        longest = max(length, longest)
```
- **Complexity**: O(n) time, O(n) space.
- **Sibling problems**: Contains Duplicate (217); conceptually related to "visited" pruning in graph/DFS problems outside this batch.

---

### 125 Valid Palindrome [Two Pointers, Easy]
- **Trigger**: "reads the same forwards and backwards" — a property defined by comparing mirrored positions.
- **Brute force -> optimal leap**: build a cleaned copy and compare it to its reverse (O(n) extra space) -> walk from both ends inward, skipping non-alphanumeric chars, comparing in place, O(1) space.
- **Core principle(s)**:
  - Two pointers converging from both ends: exploit a symmetric/mirror structure to check the whole property in one pass without materializing a copy.
- **Invariant / state**: everything strictly outside `[left, right]` has already been verified to mirror correctly.
- **Key code idiom**:
```python
left, right = 0, len(s) - 1
while left < right:
    while left < right and not s[left].isalnum(): left += 1
    while left < right and not s[right].isalnum(): right -= 1
    if s[left].lower() != s[right].lower(): return False
    left += 1; right -= 1
```
- **Complexity**: O(n) time, O(1) space.
- **Sibling problems**: Two Sum II (167), Container With Most Water (11) — same convergent-pointer shape.

---

### 167 Two Sum II Input Array Is Sorted [Two Pointers, Medium]
- **Trigger**: "find pair summing to target" but the array is *sorted* — sortedness is the signal to drop the hash map.
- **Brute force -> optimal leap**: hash-map lookup (O(n) space) or all-pairs O(n^2) -> because the array is sorted, a pointer at each end can decide deterministically which side to move: sum too big -> shrink from the right, sum too small -> grow from the left. O(1) space.
- **Core principle(s)**:
  - Two pointers converging from both ends: sortedness lets you discard an entire side as impossible at each step instead of testing every pair.
- **Invariant / state**: every pair strictly outside `[l, r]` has already been ruled out as not the answer.
- **Key code idiom**:
```python
l, r = 0, len(numbers) - 1
while l < r:
    curSum = numbers[l] + numbers[r]
    if curSum > target: r -= 1
    elif curSum < target: l += 1
    else: return [l + 1, r + 1]
```
- **Complexity**: O(n) time, O(1) space.
- **Sibling problems**: Two Sum (1), 3Sum (15), Container With Most Water (11).

---

### 15 3Sum [Two Pointers, Medium]
- **Trigger**: "find all triplets summing to target/0" — one more dimension than Two Sum, need to avoid duplicate triplets.
- **Brute force -> optimal leap**: three nested loops O(n^3) -> sort the array, fix the first element with a single loop, then solve the remaining "two sum on sorted array" with the two-pointer technique, giving O(n^2); sortedness also makes duplicate-skipping trivial (adjacent equal values).
- **Core principle(s)**:
  - Two pointers converging from both ends: sortedness lets you discard an entire side as impossible at each step instead of testing every pair.
  - Sorting first turns "avoid duplicates" into "skip adjacent equal values," and turns an extra loop level into a two-pointer sweep.
- **Invariant / state**: for fixed `i`, `[l, r]` always brackets the untested candidates whose sum with `nums[i]` could still be zero.
- **Key code idiom**:
```python
nums.sort()
for i, a in enumerate(nums):
    if a > 0: break
    if i > 0 and a == nums[i-1]: continue
    l, r = i+1, len(nums)-1
    while l < r:
        s = a + nums[l] + nums[r]
        if s > 0: r -= 1
        elif s < 0: l += 1
        else:
            res.append([a, nums[l], nums[r]])
            l += 1; r -= 1
            while nums[l] == nums[l-1] and l < r: l += 1
```
- **Complexity**: O(n^2) time, O(1) extra space (excluding output / sort space).
- **Sibling problems**: Two Sum (1), Two Sum II (167), Container With Most Water (11).

---

### 11 Container With Most Water [Two Pointers, Medium]
- **Trigger**: "maximize area/value formed by choosing two indices" with area depending on `min(a,b) * distance`.
- **Brute force -> optimal leap**: try every pair O(n^2) -> two pointers at both ends; always move the pointer at the *shorter* line inward, because keeping the shorter line can never produce a larger area than what's already been seen (width only shrinks from here), so it's safe to discard it. O(n).
- **Core principle(s)**:
  - Two pointers converging from both ends: when one endpoint is provably never going to beat the current best again (its constraint dominates), you can safely discard it and never re-examine it.
- **Invariant / state**: `res` = best area seen among all pairs already implicitly considered; `[l, r]` = remaining candidate pairs.
- **Key code idiom**:
```python
l, r = 0, len(height) - 1
res = 0
while l < r:
    res = max(res, min(height[l], height[r]) * (r - l))
    if height[l] < height[r]: l += 1
    else: r -= 1
```
- **Complexity**: O(n) time, O(1) space.
- **Sibling problems**: Trapping Rain Water (42), Two Sum II (167).

---

### 42 Trapping Rain Water [Two Pointers, Hard]
- **Trigger**: "amount trapped at each position depends on the max to its left AND the max to its right" — a two-sided dependency per index.
- **Brute force -> optimal leap**: for every index, scan left and right for the max, O(n^2) -> precompute left-max and right-max in one prefix/suffix pass each (O(n) space), or collapse this into two pointers with running `leftMax`/`rightMax`, moving whichever side has the smaller max (because that side's water level is already determined, O(1) space).
- **Core principle(s)**:
  - Precompute/maintain directional running aggregates (here: running max from each side) so each position's answer assembles from O(1) lookups instead of an O(n) rescan.
  - Two pointers converging from both ends: advance the side whose running max is smaller, because that side's trapped-water amount is already fully determined by that smaller max.
- **Invariant / state**: `leftMax`/`rightMax` = max height seen so far from each side; whichever is smaller determines the water level at the pointer about to move.
- **Key code idiom**:
```python
l, r = 0, len(height) - 1
leftMax, rightMax = height[l], height[r]
res = 0
while l < r:
    if leftMax < rightMax:
        l += 1; leftMax = max(leftMax, height[l]); res += leftMax - height[l]
    else:
        r -= 1; rightMax = max(rightMax, height[r]); res += rightMax - height[r]
```
- **Complexity**: O(n) time, O(1) space (two-pointer version) / O(n) space (prefix-suffix arrays version).
- **Sibling problems**: Product of Array Except Self (238), Container With Most Water (11).

---

### 121 Best Time to Buy And Sell Stock [Sliding Window, Easy]
- **Trigger**: "best single buy-then-sell profit" over a sequence — one pass, need the best (min-so-far, current) pair.
- **Brute force -> optimal leap**: try every buy/sell pair O(n^2) -> scan once, tracking the minimum price seen so far, and at each day compute profit if sold today; O(n).
- **Core principle(s)**:
  - Maintain a running aggregate (best-so-far) while scanning once, so each new element only needs O(1) work against a cached summary instead of rescanning the prefix.
- **Invariant / state**: `lowest` = min(prices[0..i]); `res` = max profit achievable using any buy day ≤ i and sell day ≤ i.
- **Key code idiom**:
```python
lowest = prices[0]
for price in prices:
    lowest = min(lowest, price)
    res = max(res, price - lowest)
```
- **Complexity**: O(n) time, O(1) space.
- **Sibling problems**: Product of Array Except Self (238) / Trapping Rain Water (42) — same "cache a running directional aggregate" idea, folded to O(1) space here since only one direction is needed.

---

### 3 Longest Substring Without Repeating Characters [Sliding Window, Medium]
- **Trigger**: "contiguous substring/subarray" + "no repeats" + optimize length.
- **Brute force -> optimal leap**: check every substring for duplicates O(n^2) or O(n^3) -> maintain a window `[l, r]` that always satisfies "no repeats," expand `r` and shrink `l` only when needed, reusing the hash set's state across iterations instead of rebuilding it. O(n).
- **Core principle(s)**:
  - Variable-size sliding window: expand the right edge to grow, shrink the left edge only while the invariant is violated, and reuse incremental state (a hash set here) instead of recomputing over the whole window each time.
- **Invariant / state**: `charSet` == the set of characters currently inside `[l, r]`, which always contains no duplicates.
- **Key code idiom**:
```python
charSet = set()
l = 0
for r in range(len(s)):
    while s[r] in charSet:
        charSet.remove(s[l]); l += 1
    charSet.add(s[r])
    res = max(res, r - l + 1)
```
- **Complexity**: O(n) time, O(min(n, alphabet)) space.
- **Sibling problems**: Longest Repeating Character Replacement (424), Permutation in String (567), Minimum Window Substring (76).

---

### 424 Longest Repeating Character Replacement [Sliding Window, Medium]
- **Trigger**: "contiguous substring" + "at most k changes allowed" + optimize length.
- **Brute force -> optimal leap**: check every substring, count most-frequent char, verify `len - maxFreq <= k`, O(n^2) -> slide a window and maintain a running character-frequency count plus the max frequency seen in the window; shrink only when the window becomes invalid, and (key trick) never bother to decrease `maxf` on shrink because a stale-too-high `maxf` can only ever make the window *harder* to grow, never wrongly accept an answer. O(n).
- **Core principle(s)**:
  - Variable-size sliding window: expand right to grow, shrink left only while the invariant (`window_len - max_freq <= k`) is violated, reusing incremental frequency-count state.
- **Invariant / state**: `count[c]` = frequency of `c` in current window; `maxf` = a running upper bound on the best in-window frequency; window is valid iff `(r-l+1) - maxf <= k`.
- **Key code idiom**:
```python
count = {}
l = maxf = 0
for r in range(len(s)):
    count[s[r]] = 1 + count.get(s[r], 0)
    maxf = max(maxf, count[s[r]])
    if (r - l + 1) - maxf > k:
        count[s[l]] -= 1
        l += 1
```
- **Complexity**: O(n) time, O(26) space.
- **Sibling problems**: Longest Substring Without Repeating Characters (3), Permutation in String (567), Minimum Window Substring (76).

---

### 567 Permutation In String [Sliding Window, Medium]
- **Trigger**: "does some contiguous window of s2 match s1 up to reordering" — fixed window size equal to `len(s1)`.
- **Brute force -> optimal leap**: sort every window of length `len(s1)` and compare to sorted `s1`, O(n * k log k) -> maintain a fixed-size window's character-count array incrementally (add the entering char, remove the leaving char) and compare counts to `s1`'s count array; comparison itself can be made O(1) amortized by tracking a running "matches" counter instead of comparing whole arrays each slide.
- **Core principle(s)**:
  - Variable/fixed-size sliding window: maintain window state incrementally (one char in, one char out) instead of recomputing from scratch each shift.
  - Reduce an order-independent equality check to comparing canonical frequency signatures instead of sorting.
- **Invariant / state**: `s2Count` = character counts of the current length-`len(s1)` window; window matches iff `s2Count == s1Count` (checked incrementally via a `matches` counter).
- **Key code idiom**:
```python
l = 0
for r in range(len(s1), len(s2)):
    if matches == 26: return True
    # add s2[r], remove s2[l] from s2Count, updating `matches` in O(1)
    ...
    l += 1
return matches == 26
```
- **Complexity**: O(n) time, O(26) space.
- **Sibling problems**: Valid Anagram (242), Group Anagrams (49), Minimum Window Substring (76).

---

### 76 Minimum Window Substring [Sliding Window, Hard]
- **Trigger**: "smallest contiguous window containing all of t's characters (with multiplicity)" — variable-size window, minimize instead of maximize.
- **Brute force -> optimal leap**: check every substring against a frequency requirement, O(n^2) -> grow the window until it satisfies the "contains all needed chars" invariant, then greedily shrink from the left while it still satisfies it (to find the true minimum for that right edge), recording the best; maintain `have`/`need` counters so validity is checked in O(1) instead of comparing whole maps.
- **Core principle(s)**:
  - Variable-size sliding window: expand right to grow, shrink left as much as possible while the invariant still holds (here the invariant is "covers t", so we shrink instead of stopping at first violation) — same expand/contract skeleton as problems 3 and 424, just with the roles of "valid" and "invalid" reversed for a minimization goal.
- **Invariant / state**: `window[c]` = count of `c` in current window; `have` = number of distinct required chars currently satisfied in full; window is valid iff `have == need`.
- **Key code idiom**:
```python
l = 0
for r in range(len(s)):
    c = s[r]
    window[c] = 1 + window.get(c, 0)
    if c in countT and window[c] == countT[c]:
        have += 1
    while have == need:
        if (r - l + 1) < resLen:
            res, resLen = [l, r], r - l + 1
        window[s[l]] -= 1
        if s[l] in countT and window[s[l]] < countT[s[l]]:
            have -= 1
        l += 1
```
- **Complexity**: O(n + m) time, O(k) space.
- **Sibling problems**: Longest Substring Without Repeating Characters (3), Longest Repeating Character Replacement (424), Permutation in String (567).

---

### 239 Sliding Window Maximum [Sliding Window, Hard]
- **Trigger**: "max/min of every window of size k" — need O(1) amortized per slide, not O(k) or O(log k).
- **Brute force -> optimal leap**: scan each window for its max, O(n*k) (or a heap, O(n log n)) -> keep a deque of *candidate* indices in strictly decreasing value order; any element smaller than the one just pushed can never be the max while a bigger later element is still in range, so it's safely discarded forever. The front of the deque is always the current window's max.
- **Core principle(s)**:
  - Monotonic stack/deque: maintain a strictly increasing/decreasing sequence of candidates so each element is pushed and popped at most once (amortized O(1)), because a dominated element can never become the answer while its dominator is still in play.
- **Invariant / state**: `q` holds indices with strictly decreasing `nums` values, restricted to the current window; `nums[q[0]]` is always the current window's max.
- **Key code idiom**:
```python
q = collections.deque()
for r in range(len(nums)):
    while q and nums[q[-1]] < nums[r]:
        q.pop()
    q.append(r)
    if q[0] <= r - k:
        q.popleft()
    if r + 1 >= k:
        output.append(nums[q[0]])
```
- **Complexity**: O(n) time, O(k) space.
- **Sibling problems**: Daily Temperatures (739), Largest Rectangle in Histogram (84), Car Fleet (853).

---

### 20 Valid Parentheses [Stack, Easy]
- **Trigger**: "matching/nesting" of open/close symbols — validity depends on last-opened-first-closed order.
- **Brute force -> optimal leap**: repeatedly remove matched adjacent pairs and check if the string empties out, O(n^2) -> push openers on a stack; on a closer, it must match the *most recently* pushed opener (top of stack), O(n).
- **Core principle(s)**:
  - Use a stack to hold pending state that must be resolved in LIFO order: the most recent unresolved opener is always the correct match for the next closer.
- **Invariant / state**: `stack` = openers seen so far that have not yet been closed, in order of opening (top = most recent).
- **Key code idiom**:
```python
stack = []
for c in s:
    if c not in bracketMap:
        stack.append(c); continue
    if not stack or stack[-1] != bracketMap[c]:
        return False
    stack.pop()
return not stack
```
- **Complexity**: O(n) time, O(n) space.
- **Sibling problems**: Generate Parentheses (22), Evaluate Reverse Polish Notation (150) — LIFO pending-state family.

---

### 155 Min Stack [Stack, Medium]
- **Trigger**: "support push/pop plus O(1) query of running min/max" — need a summary statistic that survives arbitrary pops.
- **Brute force -> optimal leap**: rescan the stack for the min on every query, O(n) per query -> keep a second, parallel stack that always has, at its top, the min of everything currently in the main stack; push/pop both stacks in lockstep.
- **Core principle(s)**:
  - Maintain an auxiliary parallel structure carrying a running aggregate (min here) in lockstep with the primary structure, so the aggregate survives pops without rescanning — the stack analogue of prefix-aggregate techniques.
- **Invariant / state**: `minStack[-1]` == min of all elements currently in `stack`.
- **Key code idiom**:
```python
def push(self, val):
    self.stack.append(val)
    self.minStack.append(min(val, self.minStack[-1] if self.minStack else val))

def pop(self):
    self.stack.pop()
    self.minStack.pop()
```
- **Complexity**: O(1) time per operation, O(n) space.
- **Sibling problems**: Product of Array Except Self (238, prefix/suffix caching) — same "cache the aggregate instead of recomputing" idea, adapted to a LIFO structure.

---

### 150 Evaluate Reverse Polish Notation [Stack, Medium]
- **Trigger**: "postfix expression" — operators apply to the operands most recently seen.
- **Brute force -> optimal leap**: repeatedly scan for an operator and reduce its two left neighbors in the array, O(n^2) -> push operands on a stack; when an operator appears, its operands are always exactly the top two stack entries (the most recently produced values), O(n).
- **Core principle(s)**:
  - Use a stack to hold pending state that must be resolved in LIFO order: an operator always consumes the most recently produced operands.
- **Invariant / state**: `stack` holds the values of all sub-expressions evaluated so far that haven't yet been consumed by a later operator.
- **Key code idiom**:
```python
stack = []
for c in tokens:
    if c in "+-*/":
        b, a = stack.pop(), stack.pop()
        stack.append(int(eval(f"{a}{c}{b}")))
    else:
        stack.append(int(c))
return stack[0]
```
- **Complexity**: O(n) time, O(n) space.
- **Sibling problems**: Valid Parentheses (20), Generate Parentheses (22).

---

### 22 Generate Parentheses [Stack, Medium]
- **Trigger**: "generate all valid combinations" under a local structural constraint (well-formed parens) — search space, need pruning.
- **Brute force -> optimal leap**: generate all `2^(2n)` strings and filter for validity -> backtrack while only ever extending with choices that *cannot* yet be invalid (`open < n` to add "(", `close < open` to add ")"), so every leaf reached is already guaranteed valid.
- **Core principle(s)**:
  - Prune recursive search with a cheap partial-validity invariant, so the algorithm only ever explores/generates candidates that can still lead to a valid answer, instead of generating everything and filtering after the fact.
- **Invariant / state**: at every recursive call, the partial string built so far is a valid prefix of *some* well-formed parenthesization (`close <= open <= n`).
- **Key code idiom**:
```python
def backtrack(openN, closedN):
    if openN == closedN == n:
        res.append("".join(stack)); return
    if openN < n:
        stack.append("("); backtrack(openN + 1, closedN); stack.pop()
    if closedN < openN:
        stack.append(")"); backtrack(openN, closedN + 1); stack.pop()
```
- **Complexity**: O(4^n / sqrt(n)) time (Catalan number of valid strings), O(n) recursion depth/space.
- **Sibling problems**: Valid Parentheses (20); backtracking-with-pruning problems outside the 150 (Subsets, Combination Sum, N-Queens).

---

### 739 Daily Temperatures [Stack, Medium]
- **Trigger**: "next greater element" to the right, for every index, in one pass.
- **Brute force -> optimal leap**: for each index scan rightward for the first greater value, O(n^2) -> keep a stack of indices whose "next greater" hasn't been found yet, in increasing-value order from bottom to top; whenever a new value beats the stack's top, that new index *is* the answer for everything it pops, and each index is pushed/popped once.
- **Core principle(s)**:
  - Monotonic stack: maintain a stack that is always increasing (bottom to top) in the relevant value; the current element resolves every element it invalidates at the top, in O(1) amortized per resolution.
- **Invariant / state**: `stack` holds indices `i0 < i1 < ... ` with `temperatures[i0] > temperatures[i1] > ...` (no "next warmer day" found yet for any of them).
- **Key code idiom**:
```python
stack = []  # (temp, index)
for i, t in enumerate(temperatures):
    while stack and t > stack[-1][0]:
        stackT, stackInd = stack.pop()
        res[stackInd] = i - stackInd
    stack.append((t, i))
```
- **Complexity**: O(n) time, O(n) space.
- **Sibling problems**: Sliding Window Maximum (239), Largest Rectangle in Histogram (84), Car Fleet (853).

---

### 853 Car Fleet [Stack, Medium]
- **Trigger**: "groups of items merge/collapse when a later one catches up to an earlier one" — ordering by position determines who can affect whom.
- **Brute force -> optimal leap**: simulate positions over time, O(n * time-steps) -> sort cars by starting position descending (front car processed first) so that once you know the leading car's time-to-target, every following, slower-arriving car necessarily joins its fleet; a monotonic stack of "fleet arrival times" collapses each new car into the last fleet if it wouldn't arrive later, else starts a new fleet.
- **Core principle(s)**:
  - Sort first to fix an order in which a greedy, single-pass decision becomes valid (front-to-back order removes the ambiguity of "who catches whom").
  - Monotonic stack: a running record (here, of fleet arrival times) lets each new element be resolved against only the most recent unresolved group, in O(1) amortized, instead of comparing against everything.
- **Invariant / state**: `stack` holds the arrival time of each distinct fleet formed so far, from front (smallest time) to back; a new car either merges into the current back-most fleet (its time ≤ top) or starts a new one.
- **Key code idiom**:
```python
pair = sorted(zip(position, speed), reverse=True)
stack = []
for p, s in pair:
    stack.append((target - p) / s)
    if len(stack) >= 2 and stack[-1] <= stack[-2]:
        stack.pop()
return len(stack)
```
- **Complexity**: O(n log n) time (sort dominates), O(n) space.
- **Sibling problems**: Daily Temperatures (739), Largest Rectangle in Histogram (84), Sliding Window Maximum (239).

---

### 84 Largest Rectangle In Histogram [Stack, Hard]
- **Trigger**: "rectangle extends until a shorter bar blocks it on either side" — need, for every bar, the nearest smaller bar to the left and right.
- **Brute force -> optimal leap**: for every bar, expand left/right until hitting a shorter bar, O(n^2) -> maintain a monotonically increasing stack of (index, height); when a shorter bar arrives, it finalizes the area for every taller bar it pops (their right boundary is the current index, their left boundary is whatever's now below them on the stack), each bar pushed/popped once.
- **Core principle(s)**:
  - Monotonic stack: maintain increasing order so a new smaller element resolves (finalizes the boundary/area for) every larger element it invalidates, in O(1) amortized per resolution.
- **Invariant / state**: `stack` holds `(start_index, height)` pairs with strictly increasing height from bottom to top; each entry's implicit right boundary is "not yet determined" until a smaller bar pops it.
- **Key code idiom**:
```python
stack = []  # (index, height)
for i, h in enumerate(heights):
    start = i
    while stack and stack[-1][1] > h:
        index, height = stack.pop()
        maxArea = max(maxArea, height * (i - index))
        start = index
    stack.append((start, h))
```
- **Complexity**: O(n) time, O(n) space.
- **Sibling problems**: Daily Temperatures (739), Sliding Window Maximum (239), Car Fleet (853).

---

## Batch-level synthesis

### 1. Principle tally

| Principle | Problems |
|---|---|
| **Hash for O(1) membership/frequency** — store seen values/counts in a hash structure so lookup replaces a scan | 217, 1, 36, 128 |
| **Canonical frequency signature as hash/comparison key** — reduce order-independent equality to comparing counts/sorted form | 242, 49, 567 |
| **Prefix/suffix (directional running aggregate) precomputation** — cache a running min/max/product from one or both directions instead of rescanning | 238, 42, 121 |
| **Two pointers converging from both ends** — exploit sortedness or mirror symmetry to eliminate an entire side/pair-set per step | 125, 167, 15, 11, 42 |
| **Variable-size sliding window (expand/shrink with incremental state)** | 3, 424, 567, 76 |
| **Monotonic stack/deque** — keep a monotonic order so each element is resolved (pushed/popped) at most once, O(1) amortized | 239, 739, 84, 853 |
| **Stack for LIFO-order pending resolution** (matching / postfix evaluation) | 20, 150 |
| **Auxiliary parallel structure carrying a running aggregate** (stack analogue of prefix caching) | 155 |
| **Bucket sort by bounded value** — use a bounded key directly as an array index | 347 |
| **Sort first to fix an order that makes a single greedy pass valid** | 853, 15 |
| **Prune recursive search with a partial-validity invariant** | 22 |
| **Anchor expensive work at detectable start points** (avoid redundant restarts) | 128 |
| **One-off (self-describing serialization)** | 271 |

### 2. Candidate MERGES
- **Prefix/suffix precomputation** (238, 42) and **running-best-so-far single pass** (121) are the same idea — caching a running aggregate instead of recomputing — just applied bidirectionally with O(n) storage vs. unidirectionally folded into O(1) space. Consider one principle: "cache a running directional aggregate."
- **Two pointers converging from both ends** (125, 167, 15, 11) and the pointer half of **Trapping Rain Water** (42) are the same mechanism as sortedness/monotonicity-exploitation elsewhere in the 150 (e.g. binary search discarding a half) — the shared idea is "use a monotonic guarantee to eliminate a side/region in O(1) instead of testing it."
- **Monotonic stack/deque** (239, 739, 84) and **Car Fleet's** sort+collapse stack (853) are the same "resolve/merge against only the most recent unresolved group" mechanism; Car Fleet just needs an explicit sort first to establish the order monotonic-stack problems get for free from the array index. Consider merging into one principle: "monotonic stack: process in a fixed order, collapse dominated/merged elements against the most recent survivor."
- **Stack for LIFO pending resolution** (20, 150) and **Auxiliary parallel structure** (155, Min Stack) both boil down to "a stack tracks state that must be resolved/queried in last-in-first-out order"; Min Stack is really "LIFO + cached aggregate" — could be presented as the same base principle with an optional aggregate-caching extension.
- **Hash for O(1) membership** (217, 1, 36, 128) and **canonical frequency signature as key** (242, 49, 567) are both "put an appropriately-shaped key into a hash structure for O(1) lookup" — the only difference is the key's shape (raw value / complement / sorted-or-counted signature). Could merge into one umbrella principle with sub-notes on key choice.

### 3. Genuinely one-off tricks
- **Encode and Decode Strings (271)**: length-prefix delimiter encoding. Doesn't generalize to other batch problems; it's a serialization-format trick to memorize.
- **Longest Repeating Character Replacement (424)**'s specific micro-trick of never decrementing `maxf` on window shrink (relying on the fact a stale high-water-mark can't cause a false accept) is a one-off implementation detail worth memorizing, even though the surrounding sliding-window skeleton is general.
- **Car Fleet (853)**'s `time = (target - position) / speed` formula and the "sort by position descending, not ascending" choice is domain-specific setup; the collapsing-stack part is general (monotonic stack) but the setup must be derived per-problem.

### 4. Decision cues
| If you see... | Think... |
|---|---|
| "have I seen this / count of this" with no order requirement | Hash set/map for O(1) membership or frequency |
| Equality that ignores ordering (anagrams, permutations) | Canonical signature (sorted string / count array) as hash key |
| "for every index, aggregate over the rest of the array" | Prefix + suffix running aggregate (or one-directional running best if only one side matters) |
| Array is sorted (or the check is inherently symmetric, e.g. palindrome) + pair/triplet search | Two pointers converging from both ends |
| "contiguous subarray/substring" + optimize length/count subject to a shrinkable/growable condition | Variable-size sliding window with incrementally maintained state |
| "next greater/smaller element", "max of every window", "collapsing/merging adjacent groups" | Monotonic stack/deque |
| Matching pairs, or "must resolve using the most recently seen unresolved item" (parens, postfix expr) | Stack, LIFO resolution |
| Need O(1) query of a running min/max under arbitrary push/pop | Auxiliary parallel stack caching the aggregate |
| Key/frequency is bounded by n (or a small constant) | Bucket sort / fixed-size count array instead of comparison sort |
| Generating all combinations under a structural constraint | Backtracking with early pruning via a partial-validity invariant |
| Need to avoid O(n) redundant restarts of a "walk until end" style loop | Anchor work only at cheaply-detectable start points |
