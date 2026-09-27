# Batch F — Greedy, Math & Geometry, Bit Manipulation (23 problems)

## Greedy

### 53 Maximum Subarray [Greedy, Medium]
- **Trigger**: "contiguous subarray" + "maximize the sum".
- **Brute force -> optimal leap**: instead of summing every O(n^2) subarray, keep one running sum and reset it to 0 whenever it goes negative — a negative running prefix can never help any future subarray, so throwing it away is safe.
- **Core principle(s)**: Greedy reset on negative running aggregate — discard accumulated state the moment it becomes a net liability and restart from the next element. Safe because a negative prefix sum only ever *lowers* the sum of anything appended after it (exchange argument: replacing "prefix + rest" with "rest alone" is never worse).
- **Invariant / state**: `total` = best sum of a subarray ending at the current index (reset to 0, i.e. "start fresh", whenever it goes negative); `res` = best seen so far.
- **Key code idiom**:
```python
res, total = nums[0], 0
for n in nums:
    total += n
    res = max(res, total)
    if total < 0:
        total = 0
```
- **Complexity**: O(n) time, O(1) space.
- **Sibling problems**: 152 Maximum Product Subarray, 134 Gas Station (same reset trick), House Robber-style running DP.

### 55 Jump Game [Greedy, Medium]
- **Trigger**: array of max-jump-lengths + boolean "can you reach the end" question.
- **Brute force -> optimal leap**: exponential recursive exploration of every reachable index collapses into one backward pass that tracks the leftmost index still known to reach the end (`goal`); index `i` is fine iff it can jump to `goal`.
- **Core principle(s)**: Track the farthest-needed boundary while scanning and shrink/extend it in one linear pass — reachability is monotonic, so a single frontier variable captures everything a full search would explore.
- **Invariant / state**: `goal` = smallest index from which the last index is known reachable.
- **Key code idiom**:
```python
goal = len(nums) - 1
for i in range(len(nums) - 2, -1, -1):
    if i + nums[i] >= goal:
        goal = i
return goal == 0
```
- **Complexity**: O(n) time, O(1) space.
- **Sibling problems**: 45 Jump Game II, 134 Gas Station, 763 Partition Labels.

### 45 Jump Game II [Greedy, Medium]
- **Trigger**: same array as Jump Game but "minimum number of jumps" — optimize a count, not just feasibility.
- **Brute force -> optimal leap**: BFS over reachable sets is O(n^2); instead treat the positions reachable in exactly `k` jumps as one contiguous window `[l, r]` and greedily extend `r` to the farthest reach found inside that window before incrementing the jump count — this is BFS by levels done implicitly.
- **Core principle(s)**: Track the farthest-needed boundary while scanning and lock in a "level"/segment once the scan catches up to it (same family as Jump Game and Partition Labels, but the boundary now marks jump layers instead of a single goal).
- **Invariant / state**: `[l, r]` = all indices reachable in exactly `res` jumps; `maxJump` = farthest index reachable in `res + 1` jumps.
- **Key code idiom**:
```python
l, r, res = 0, 0, 0
while r < len(nums) - 1:
    maxJump = max(i + nums[i] for i in range(l, r + 1))
    l, r = r + 1, maxJump
    res += 1
```
- **Complexity**: O(n) time, O(1) space.
- **Sibling problems**: 55 Jump Game, 127 Word Ladder / 994 Rotting Oranges (BFS layers made explicit instead of greedy).

### 134 Gas Station [Greedy, Medium]
- **Trigger**: circular array, "does a valid start exist / find it" via a running balance (gas − cost).
- **Brute force -> optimal leap**: simulating every candidate start is O(n^2). One pass suffices: if `sum(gas) < sum(cost)` no answer exists; otherwise scan left to right accumulating `gas[i]-cost[i]`, and whenever the running tank goes negative, reset and try the *next* station as the new start.
- **Core principle(s)**: Greedy reset on negative running aggregate (identical mechanism to Kadane's). Exchange argument: if starting at `s` fails at index `i` (tank first goes negative there), then for every `s'` strictly between `s` and `i`, the partial sums from `s` to `s'-1` were all ≥ 0 (else we'd have failed sooner), so starting at `s'` only removes a non-negative surplus — `s'` fails at `i` too. Hence it's safe to jump straight past `i`.
- **Invariant / state**: `current_gas` = tank balance since the last reset start; `total_gas` = balance over the whole trip (global feasibility check).
- **Key code idiom**:
```python
total_gas = current_gas = start_station = 0
for i in range(len(gas)):
    diff = gas[i] - cost[i]
    total_gas += diff
    current_gas += diff
    if current_gas < 0:
        start_station, current_gas = i + 1, 0
return start_station if total_gas >= 0 else -1
```
- **Complexity**: O(n) time, O(1) space.
- **Sibling problems**: 53 Maximum Subarray, 42 Trapping Rain Water (prefix-balance reasoning).

### 846 Hand of Straights [Greedy, Medium]
- **Trigger**: partition a multiset into fixed-size runs of *consecutive* values.
- **Brute force -> optimal leap**: instead of trying all ways to build groups, notice the smallest remaining card value has nowhere else to go — it can only be the *start* of a new run (nothing smaller exists to place it mid-run) — so always consume a full run beginning at the current minimum (sorted order or min-heap + frequency map).
- **Core principle(s)**: Forced-choice greedy — find the element whose role in any valid solution is uniquely determined (the global/local extreme), and commit to it immediately; this monotonically shrinks the remaining problem without ever needing to backtrack.
- **Invariant / state**: `count[v]` = copies of `v` still unused; processing order guarantees we always start a run at the current minimum available value.
- **Key code idiom**:
```python
count = Counter(hand)
for card in sorted(hand):
    if count[card] > 0:
        for i in range(groupSize):
            if count[card + i] <= 0:
                return False
            count[card + i] -= 1
```
- **Complexity**: O(n log n) time, O(n) space.
- **Sibling problems**: 1296 Divide Array in Sets of K Consecutive Numbers (identical structure), Task Scheduler.

### 1899 Merge Triplets to Form Target Triplet [Greedy, Medium]
- **Trigger**: combine values via element-wise max, must land exactly on a target.
- **Brute force -> optimal leap**: don't search subsets; a triplet with *any* coordinate exceeding the target can never be used (max is monotone and can only push a coordinate up, never down), so discard those, then take the coordinate-wise max of everything that survives and compare to target.
- **Core principle(s)**: Prune candidates that are dominated/infeasible before a monotone aggregation (max/min-combine) — filtering first turns an exponential "which subset works" search into one linear pass.
- **Invariant / state**: `max_values[i]` = best achievable value at coordinate `i` using only triplets that don't exceed `target` anywhere.
- **Key code idiom**:
```python
good = set()
for t in triplets:
    if t[0] > target[0] or t[1] > target[1] or t[2] > target[2]:
        continue
    for i, v in enumerate(t):
        if v == target[i]:
            good.add(i)
return len(good) == 3
```
- **Complexity**: O(n) time, O(1) space.
- **Sibling problems**: video-stitching / interval-covering greedy filters generally.

### 763 Partition Labels [Greedy, Medium]
- **Trigger**: split a string so each character occurs in only one piece — "last occurrence" of each symbol matters.
- **Brute force -> optimal leap**: precompute each character's last index, then scan left to right extending the current partition's `end` to the max last-index of any character seen so far; when the scan index reaches `end`, the partition is forced closed (extending further is unnecessary and stopping earlier would split a character across pieces).
- **Core principle(s)**: Track the farthest-needed boundary while scanning and lock in a segment when the scan catches up to it — the exact same frontier-tracking idea as Jump Game / Jump Game II, applied to intervals of "must stay together" instead of "must be reachable".
- **Invariant / state**: `end` = farthest last-occurrence among characters seen in the current partition; `start` = beginning of that partition.
- **Key code idiom**:
```python
last_index = {c: i for i, c in enumerate(s)}
result, start, end = [], 0, 0
for i, c in enumerate(s):
    end = max(end, last_index[c])
    if i == end:
        result.append(end - start + 1)
        start = end + 1
```
- **Complexity**: O(n) time, O(1) space (26-letter alphabet).
- **Sibling problems**: 56 Merge Intervals, 55/45 Jump Game family.

### 678 Valid Parenthesis String [Greedy, Medium]
- **Trigger**: string with a wildcard character that can be 3 different things (`(`, `)`, or empty) + "is it validly parenthesizable".
- **Brute force -> optimal leap**: branching on every `*` is exponential; instead of tracking the exact (ambiguous) count of unmatched `(`, track the *range* `[lowMin, highMax]` of counts that are still achievable. If `highMax` ever goes negative the string is unsalvageable; `lowMin` is clamped at 0 because we can always choose to treat an ambiguous `*`/`)` as not decreasing below a valid state.
- **Core principle(s)**: When the exact state is genuinely ambiguous/multivalued, track the *interval* of feasible states instead of enumerating every branch — collapses exponential branching to O(1) extra state.
- **Invariant / state**: `[lowMin, highMax]` = min/max possible number of unmatched `(` consistent with all choices made so far, with `lowMin` never allowed below 0.
- **Key code idiom**:
```python
leftMin = leftMax = 0
for c in s:
    if c == '(':
        leftMin, leftMax = leftMin + 1, leftMax + 1
    elif c == ')':
        leftMin, leftMax = leftMin - 1, leftMax - 1
    else:
        leftMin, leftMax = leftMin - 1, leftMax + 1
    if leftMax < 0:
        return False
    leftMin = max(leftMin, 0)
return leftMin == 0
```
- **Complexity**: O(n) time, O(1) space.
- **Sibling problems**: interval/range-DP feasibility problems in general; loosely related to Jump Game II's window `[l, r]`.

## Math & Geometry

### 48 Rotate Image [Math & Geometry, Medium]
- **Trigger**: rotate a square matrix 90° "in place" (O(1) extra space implied).
- **Brute force -> optimal leap**: allocating a new matrix is trivial; the in-place version decomposes the rotation into simple composable steps — transpose (reflect across the main diagonal) then reverse every row — or equivalently a direct 4-way cyclic swap of the four rotational positions of each element, shrinking a `[l, r]` boundary inward.
- **Core principle(s)**: Decompose a complex in-place geometric transform into a sequence of simple, well-understood sub-transforms (or an explicit index-mapped k-cycle) to avoid extra memory.
- **Invariant / state**: after transposing, `matrix[i][j]` holds the original `matrix[j][i]`; reversing rows then completes the rotation. (4-way swap version: each cycle of 4 positions is fully resolved via one saved temp before moving to the next `i`.)
- **Key code idiom**:
```python
n = len(matrix)
for i in range(n):
    for j in range(i, n):
        matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
for row in matrix:
    row.reverse()
```
- **Complexity**: O(n^2) time, O(1) space.
- **Sibling problems**: 54 Spiral Matrix, 73 Set Matrix Zeroes.

### 54 Spiral Matrix [Math & Geometry, Medium]
- **Trigger**: "traverse the matrix in spiral order".
- **Brute force -> optimal leap**: simulating with a visited-set and direction vector works but needs O(m·n) extra bookkeeping; instead maintain four shrinking boundary pointers (`top, bottom, left, right`) and consume one full edge of the current ring per step.
- **Core principle(s)**: Maintain shrinking boundary pointers to peel a matrix (or array) one ring/layer at a time — an O(1)-extra-space alternative to visited-marking simulation. Same family as Rotate Image's shrinking `[l, r]`.
- **Invariant / state**: `[top, bottom] x [left, right]` = the not-yet-visited sub-rectangle.
- **Key code idiom**:
```python
top, bottom, left, right = 0, rows - 1, 0, cols - 1
while top <= bottom and left <= right:
    for j in range(left, right + 1): res.append(matrix[top][j])
    top += 1
    for i in range(top, bottom + 1): res.append(matrix[i][right])
    right -= 1
    if top <= bottom:
        for j in range(right, left - 1, -1): res.append(matrix[bottom][j])
        bottom -= 1
    if left <= right:
        for i in range(bottom, top - 1, -1): res.append(matrix[i][left])
        left += 1
```
- **Complexity**: O(m·n) time, O(1) extra space.
- **Sibling problems**: 48 Rotate Image, 59 Spiral Matrix II.

### 73 Set Matrix Zeroes [Math & Geometry, Medium]
- **Trigger**: "zero out row+col of every 0 cell" + implicit O(1) space constraint.
- **Brute force -> optimal leap**: two boolean arrays of size `m` and `n` (O(m+n) space) become unnecessary once you realize the matrix's own first row and first column can serve as that marker storage, with one scalar flag to resolve the overlap at `matrix[0][0]`.
- **Core principle(s)**: Reuse part of the input's own storage as your auxiliary data structure, trading O(m+n)/O(m·n) space for O(1).
- **Invariant / state**: `matrix[0][c] == 0` means "column c must become zero"; `matrix[r][0] == 0` means "row r must become zero"; `rowZero` flag guards the row-0/col-0 overlap cell.
- **Key code idiom**:
```python
for r in range(ROWS):
    for c in range(COLS):
        if matrix[r][c] == 0:
            matrix[0][c] = 0
            if r > 0: matrix[r][0] = 0
            else: rowZero = True
for r in range(1, ROWS):
    for c in range(1, COLS):
        if matrix[0][c] == 0 or matrix[r][0] == 0:
            matrix[r][c] = 0
```
- **Complexity**: O(m·n) time, O(1) space.
- **Sibling problems**: Find All Duplicates in an Array (sign-flipping in place), other "encode state in the input" tricks.

### 202 Happy Number [Math & Geometry, Easy]
- **Trigger**: repeatedly apply a deterministic function (sum of squared digits) and ask "does this reach 1, or loop forever" — no explicit list/graph given.
- **Brute force -> optimal leap**: a hash set recording every value seen (O(n) space) detects the loop, but the sequence `n -> f(n)` *is* an implicit linked list, so Floyd's slow/fast pointer technique detects the cycle in O(1) space instead.
- **Core principle(s)**: Any deterministic "apply f repeatedly" sequence can be treated as an implicit linked list; use slow/fast pointers to detect a cycle in O(1) space instead of a hash set in O(n) space.
- **Invariant / state**: `fast` is always exactly two applications of `f` ahead of `slow`; they meet iff the sequence is cyclic (and non-happy).
- **Key code idiom**:
```python
slow, fast = n, sumSquareDigits(n)
while slow != fast:
    slow = sumSquareDigits(slow)
    fast = sumSquareDigits(sumSquareDigits(fast))
return fast == 1
```
- **Complexity**: ~O(log n) time per step (bounded state space), O(1) space.
- **Sibling problems**: 141 Linked List Cycle, 287 Find the Duplicate Number.

### 66 Plus One [Math & Geometry, Easy]
- **Trigger**: a digit array represents an integer; "add one" without overflowing a native int type.
- **Brute force -> optimal leap**: converting the array to an int, adding, and converting back defeats the purpose (and breaks for arbitrary-length numbers); instead simulate the carry by hand from the least-significant digit, stopping the moment a digit doesn't roll over from 9 to 0.
- **Core principle(s)**: Simulate manual place-value arithmetic one digit position at a time with carry propagation, so no single variable ever needs to hold the whole number.
- **Invariant / state**: every digit to the right of the current index is already resolved/correct; loop exits as soon as no carry remains.
- **Key code idiom**:
```python
for i in range(len(digits) - 1, -1, -1):
    if digits[i] < 9:
        digits[i] += 1
        return digits
    digits[i] = 0
return [1] + digits
```
- **Complexity**: O(n) time, O(1) extra space.
- **Sibling problems**: 43 Multiply Strings, 415 Add Strings, 2 Add Two Numbers.

### 50 Pow(x, n) [Math & Geometry, Medium]
- **Trigger**: compute `x^n` fast; hint explicitly wants O(log n).
- **Brute force -> optimal leap**: a linear multiplication loop (O(n)) becomes O(log n) by halving the exponent each recursive call and squaring the result: `x^n = (x^(n//2))^2`, with one extra factor of `x` when `n` is odd.
- **Core principle(s)**: Exponentiation by squaring — a divide-and-conquer that halves the problem size every step, turning O(n) into O(log n); handle a negative exponent by inverting the base and recursing on `|n|`.
- **Invariant / state**: `helper(x, n)` always returns exactly `x^n`; recursion depth is O(log n).
- **Key code idiom**:
```python
def helper(x, n):
    if n == 0: return 1
    half = helper(x, n // 2)
    return half * half * x if n % 2 else half * half
```
- **Complexity**: O(log n) time, O(log n) space (call stack).
- **Sibling problems**: fast matrix exponentiation, binary search (halving), 338 Counting Bits (halving relation, but via DP not recursion).

### 43 Multiply Strings [Math & Geometry, Medium]
- **Trigger**: multiply two numbers given as strings; O(m·n) time hint rules out converting to native ints.
- **Brute force -> optimal leap**: rather than generating each partial product as a string and repeatedly string-adding them, use one result array of length `m+n` indexed by digit position; every digit pair `(i, j)` contributes directly into position `i+j` (carrying into `i+j-1`), so all carries can be normalized in a single final pass.
- **Core principle(s)**: Simulate manual place-value arithmetic (long multiplication) using a positional accumulator array — the same "digit by digit with carry" idea as Plus One, generalized to cross-products.
- **Invariant / state**: `res[k]` accumulates the (possibly >9) sum of all digit-products landing at position `k` before carry-normalization.
- **Key code idiom**:
```python
res = [0] * (len(num1) + len(num2))
for i1, d1 in enumerate(reversed(num1)):
    for i2, d2 in enumerate(reversed(num2)):
        res[i1 + i2] += int(d1) * int(d2)
        res[i1 + i2 + 1] += res[i1 + i2] // 10
        res[i1 + i2] %= 10
```
- **Complexity**: O(m·n) time, O(m+n) space.
- **Sibling problems**: 66 Plus One, 415 Add Strings, 2 Add Two Numbers.

### 2013 Detect Squares [Math & Geometry, Medium]
- **Trigger**: online `add(point)` / `count(point)` queries asking how many axis-aligned squares the query point could complete.
- **Brute force -> optimal leap**: checking all triples of stored points is O(n^3); instead exploit that a square is fully determined by one *diagonal* partner — given query `(px, py)` and any stored point `(x, y)` with `|x-px| == |y-py|` and not sharing a row/col, the other two corners are forced to be `(x, py)` and `(px, y)`, so the contribution is `count(x,py) * count(px,y)` for each candidate diagonal point.
- **Core principle(s)**: Exploit a geometric constraint (equal side lengths pin down the remaining points exactly) to collapse an O(n^2)/O(n^3) search into O(n) candidates with O(1) hashmap lookups each.
- **Invariant / state**: `ptsCount[(x, y)]` = number of times point `(x, y)` was added (duplicates allowed).
- **Key code idiom**:
```python
def count(self, point):
    px, py = point
    res = 0
    for x, y in self.pts:
        if abs(py - y) != abs(px - x) or x == px or y == py:
            continue
        res += self.ptsCount[(x, py)] * self.ptsCount[(px, y)]
    return res
```
- **Complexity**: `add` O(1), `count` O(n), space O(n).
- **Sibling problems**: none directly in NC150; general "anchor point derives the rest algebraically" geometry problems.

## Bit Manipulation

### 136 Single Number [Bit Manipulation, Easy]
- **Trigger**: every element appears twice except one; O(1) space rules out a hash set.
- **Brute force -> optimal leap**: hash-set toggling (add/remove, O(n) space) is replaced by XOR-ing every element together — identical values cancel to 0, leaving only the singleton.
- **Core principle(s)**: XOR self-cancellation (`a^a=0`, `a^0=a`) turns pair-cancellation into a single running accumulator instead of a data structure.
- **Invariant / state**: `res` = XOR of all elements processed so far; fully-paired values always cancel back out.
- **Key code idiom**:
```python
res = 0
for n in nums:
    res ^= n
return res
```
- **Complexity**: O(n) time, O(1) space.
- **Sibling problems**: 268 Missing Number, Single Number II/III.

### 191 Number of 1 Bits [Bit Manipulation, Easy]
- **Trigger**: count set bits in an integer.
- **Brute force -> optimal leap**: instead of testing all 32 bit positions one by one (`n & (1<<i)`), repeatedly clear the *lowest* set bit with `n &= n - 1`; the loop then runs exactly popcount times instead of 32.
- **Core principle(s)**: Whole-word bit tricks can beat naive per-bit iteration — `n & (n-1)` clears the lowest set bit, giving an O(popcount) algorithm instead of O(bit-width).
- **Invariant / state**: each iteration removes exactly one set bit; loop count == number of set bits.
- **Key code idiom**:
```python
res = 0
while n:
    n &= n - 1
    res += 1
return res
```
- **Complexity**: O(popcount) time (≤32), O(1) space.
- **Sibling problems**: 190 Reverse Bits, 338 Counting Bits, 371 Sum of Two Integers.

### 338 Counting Bits [Bit Manipulation, Easy]
- **Trigger**: "for every `i` in `[0, n]`, count its set bits" — recomputing per `i` costs O(n log n).
- **Brute force -> optimal leap**: instead of recomputing popcount from scratch, note `bits(i) = bits(i >> 1) + (i & 1)` (dropping the lowest bit is a right shift), so build the whole answer array bottom-up, reusing a strictly smaller, already-computed entry.
- **Core principle(s)**: Relate `f(i)` to `f` of a smaller/related index via the number's binary structure and fill a DP array bottom-up — turns O(n log n) into O(n) by reusing prior work instead of recomputing.
- **Invariant / state**: `dp[i] = dp[i >> 1] + (i & 1)` is correct given all `dp[j]`, `j < i`, are already correct.
- **Key code idiom**:
```python
dp = [0] * (n + 1)
for i in range(1, n + 1):
    dp[i] = dp[i >> 1] + (i & 1)
return dp
```
- **Complexity**: O(n) time, O(n) space.
- **Sibling problems**: 50 Pow(x, n) (halving, but via recursion not DP reuse), classic DP-on-index problems (Climbing Stairs).

### 190 Reverse Bits [Bit Manipulation, Easy]
- **Trigger**: reverse the 32 bits of an integer.
- **Brute force -> optimal leap**: there's no shortcut around visiting each bit (fixed 32-bit width keeps it O(1) regardless), so build the result by reading `n`'s bits from LSB to MSB and shifting each one into the opposite end of the output.
- **Core principle(s)**: Simulate manual place-value arithmetic one bit position at a time with shift/mask — the base-2 analogue of Plus One / Multiply Strings' digit-by-digit carrying.
- **Invariant / state**: after `i` iterations, `res` holds the reverse of `n`'s lowest `i` bits placed in the top `i` bits.
- **Key code idiom**:
```python
res = 0
for _ in range(32):
    res = (res << 1) | (n & 1)
    n >>= 1
return res
```
- **Complexity**: O(1) (32 iterations), O(1) space.
- **Sibling problems**: 191 Number of 1 Bits, 7 Reverse Integer (same "reverse the digits" idea in base 10).

### 268 Missing Number [Bit Manipulation, Easy]
- **Trigger**: array of `n` distinct numbers from `[0, n]` missing exactly one value; avoid O(n log n) sort or O(n) extra hash-set space.
- **Brute force -> optimal leap**: instead of sorting or hashing, XOR every index `0..n` together with every array value — every present number cancels with its index-XOR partner, leaving only the missing number.
- **Core principle(s)**: XOR self-cancellation again — pair "expected" values (indices) against "actual" values (array elements) so everything present cancels, isolating the one discrepancy.
- **Invariant / state**: `missing_num` = XOR of `{0..n}` and `{nums}` processed so far; final value is order-independent.
- **Key code idiom**:
```python
res = len(nums)
for i, num in enumerate(nums):
    res ^= i ^ num
return res
```
- **Complexity**: O(n) time, O(1) space.
- **Sibling problems**: 136 Single Number, 41 First Missing Positive (different technique, same spirit).

### 371 Sum of Two Integers [Bit Manipulation, Medium]
- **Trigger**: add two integers without using `+`/`-`.
- **Brute force -> optimal leap**: rebuild the `+` operator from its bitwise truth table instead of using it — XOR gives the sum ignoring carries, `AND` shifted left by 1 gives the carry to fold back in; repeat until the carry dies out, masking to 32 bits to emulate fixed-width two's-complement overflow.
- **Core principle(s)**: Rebuild an arithmetic operator from bitwise primitives (`XOR` = sum-without-carry, `AND<<1` = carry-to-propagate) and iterate until the derived carry vanishes; mask to a fixed width to simulate signed-integer overflow/wraparound.
- **Invariant / state**: `a` = sum accumulated so far, `b` = remaining carry still to be folded in; loop ends when `b == 0`.
- **Key code idiom**:
```python
MASK, MAX_INT = 0xFFFFFFFF, 0x7FFFFFFF
while b != 0:
    a, b = (a ^ b) & MASK, ((a & b) << 1) & MASK
return a if a <= MAX_INT else ~(a ^ MASK)
```
- **Complexity**: O(1) time (bounded by 32-bit width), O(1) space.
- **Sibling problems**: 191/190/338 (bit tricks), 66/43 (arithmetic simulation, decimal analog).

### 7 Reverse Integer [Bit Manipulation, Medium]
- **Trigger**: reverse the digits of a signed 32-bit integer; return 0 on overflow.
- **Brute force -> optimal leap**: string-reverse-and-parse works but sidesteps the fixed-width constraint (and needs a 64-bit intermediate); do it arithmetically via `%10`/`//10` digit extraction, and — critically — check for overflow *before* the multiply/add that would cause it, by comparing the partial result against `MAX // 10` (and the next digit against `MAX % 10`) rather than computing first and checking after.
- **Core principle(s)**: (1) Simulate place-value arithmetic one digit at a time (same family as Plus One/Multiply Strings/Reverse Bits, just traversed in the opposite direction). (2) Guard against overflow by checking the boundary *before* performing the operation, since the overflowed value itself may not be representable/trustworthy.
- **Invariant / state**: `res` always holds a correctly-reversed, in-range prefix of the digits processed so far.
- **Key code idiom**:
```python
res = 0
sign = 1 if x > 0 else -1
x = abs(x)
while x:
    pop, x = x % 10, x // 10
    if res > (INT_MAX - pop) // 10:
        return 0
    res = res * 10 + pop
return res * sign
```
- **Complexity**: O(log₁₀ x) time, O(1) space.
- **Sibling problems**: 190 Reverse Bits (reverse in base 2), 66 Plus One, 371 Sum of Two Integers (overflow masking).

---

## Synthesis

### 1. Principle tally

| # | Principle | Problems |
|---|---|---|
| 1 | Greedy reset on negative running aggregate (discard state once it's a net liability, restart) | 53, 134 |
| 2 | Track the farthest-needed boundary while scanning; lock in a segment/answer when the scan catches up to it (greedy frontier = implicit BFS layers / interval merge) | 55, 45, 763 |
| 3 | Forced-choice greedy: handle the most-constrained/extreme element first because its role is uniquely determined | 846 |
| 4 | Prune dominated/infeasible candidates before a monotone (max/min) aggregation | 1899 |
| 5 | Track a range/interval of feasible states instead of one exact but ambiguous state | 678 |
| 6 | Decompose an in-place geometric transform into simple composable steps / shrinking boundary pointers to avoid extra memory | 48, 54 |
| 7 | Reuse part of the input's own storage as auxiliary marker space for O(1) extra space | 73 |
| 8 | Treat a deterministic "apply f repeatedly" sequence as an implicit linked list; slow/fast pointers detect a cycle in O(1) space | 202 |
| 9 | Simulate manual place-value arithmetic one digit/bit position at a time with carry/shift (works in any base) | 66, 43, 190, 7 |
| 10 | Halve the problem each step: divide-and-conquer for O(log n), or DP that reuses the answer to a smaller/related (bit-shifted) index | 50, 338 |
| 11 | Exploit a geometric constraint to derive the remaining unknowns algebraically, collapsing the search space | 2013 |
| 12 | XOR self-cancellation (`a^a=0`) to cancel paired/expected values and isolate the outlier | 136, 268 |
| 13 | Whole-word bit tricks beat per-bit iteration (e.g. `n & (n-1)` clears the lowest set bit) | 191 |
| 14 | Rebuild an arithmetic operator from bitwise primitives and iterate until the derived carry vanishes | 371 |
| 15 | Guard against overflow by checking the bound before performing the operation, not after | 7, 371 |

### 2. Candidate MERGES
- **#1 (reset-on-negative) and #2 (extend-to-farthest-then-lock)**: both are "single forward pass tracking one scalar frontier that only ever needs to move forward" — the parent idea is *greedy single-pass frontier tracking*; they differ only in the update rule (reset to zero vs. extend to max). Could be presented as one principle with two sub-cases.
- **#5 (track a range of states) as a generalization of #2 (track one boundary)**: instead of one number you track two (`lowMin`/`highMax`), for the same reason — ambiguity about the exact state. Arguably #5 = #2 with 2 coordinates.
- **#9 (positional digit/bit simulation) and #14 (rebuild operator from bitwise primitives)**: both are "manually simulate arithmetic instead of trusting the built-in operator/type," just at different granularity (per-position vs. whole-word-with-carry-loop). Could merge under *manual arithmetic simulation*, with #14 as a specialized whole-word variant.
- **#6 (in-place geometric transform via boundary pointers) and #7 (reuse input storage as marker)**: both are "achieve O(1) extra space by manipulating the existing structure in place" — #7 is really a special case of the same space-reuse philosophy as #6, just marking state instead of transforming values.
- **#3 (forced-choice greedy) and #4 (prune dominated candidates)**: both "exploit structure to eliminate/commit choices immediately instead of searching," just one commits (must-include) and the other excludes (must-discard). Loosely related, not a clean merge.

### 3. Genuinely one-off tricks (memorize, don't generalize)
- **2013 Detect Squares**: the exact corner-derivation algebra (`(x,py)` and `(px,y)` from a diagonal point) is specific to axis-aligned squares.
- **371 Sum of Two Integers**: the full XOR/AND-carry-loop plus the 32-bit mask-and-restore-sign dance is a specific, low-transfer bit trick.
- **73 Set Matrix Zeroes**: the exact scheme of using row 0 / col 0 as markers plus one `rowZero` flag for the overlap cell is implementation-specific (the general "reuse storage" idea transfers; this exact bookkeeping doesn't).
- **191 Number of 1 Bits**: the `n & (n-1)` identity itself is a memorizable bit fact, not a derivable principle.
- **202 Happy Number**: the specific Floyd's-cycle setup (`slow = n`, `fast = f(n)`, compare before advancing) needs to be memorized precisely even though the parent idea (cycle detection via slow/fast) is well known.
- **678 Valid Parenthesis String**: the exact clamp rule (`lowMin = max(lowMin, 0)`) is a subtle correctness detail worth memorizing on its own.

### 4. Decision cues

| If you see in the problem... | Think... |
|---|---|
| "contiguous subarray/segment, maximize/minimize a running sum" | Greedy reset-on-negative (Kadane-style) |
| Circular array + feasibility/start-index from a running balance | Greedy reset-on-negative, plus a global sum check first |
| "can you reach the end" / "min steps to reach the end" via jump lengths | Track farthest-reachable boundary, extend and lock per level |
| Partition/group elements so each "obligation" (last occurrence, run) stays together | Track farthest-needed boundary, close segment when scan catches up |
| Must partition into groups with a forced minimum/maximum element | Forced-choice greedy: handle the extreme element first |
| Combine values via max/min into an exact target | Discard candidates that already exceed the target before aggregating |
| A wildcard/uncertain symbol makes the exact state ambiguous | Track a `[min, max]` range of feasible states instead of one value |
| Rotate/traverse a matrix in place, O(1) space | Shrinking boundary pointers / decompose into transpose+reverse |
| Need O(1) space but also need "seen before" markers over a grid | Reuse first row/col (or sign bits) of the input as the marker structure |
| Repeatedly apply a function to a number/state and ask about cycles | Floyd's slow/fast pointer cycle detection |
| Add/multiply numbers represented as digit arrays or strings | Simulate manual arithmetic digit-by-digit with carry |
| Need `x^n` or similar repeated-operation fast | Halve the exponent (exponentiation by squaring) |
| Need `f(i)` for all `i` in a range, `f` relates to binary structure | DP: relate `f(i)` to `f(i >> 1)` or `f(i - offset)` |
| Query "does this point complete a square/shape" repeatedly | Use one geometric anchor point to derive the rest algebraically via hashmap |
| "Every element appears twice except one" / "one missing from a full range" | XOR self-cancellation |
| Must implement `+`/count bits without using the `+`/native-count facility | Bitwise primitives (XOR=sum, AND=carry) or `n & (n-1)` |
| Fixed-width integer overflow (32-bit) must be respected | Check the bound *before* the operation (compare against `MAX // 10`, mask to `0xFFFFFFFF`) |
