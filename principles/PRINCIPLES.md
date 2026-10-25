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

- **In one sentence** – the principle in plain words.
- **Start with a problem** – a real problem from the 150, stated in full, with a small example.
- **The slow way** and **where the time goes** – the obvious solution, and exactly what it wastes.
- **The fix** – the improvement in plain words, traced step by step on the example in a table, and only then the code, with comments.
- **What stays true** – the one sentence (the *invariant*) that keeps the code correct. It comes after you have seen the code work, when it means something.
- **How to recognize it** – what a problem statement looks like when this principle applies.
- **More worked examples** and **where else it shows up** – every related problem gets a one-line statement, so you can see why the technique fits it.
- **Common mistakes** – the places people actually go wrong.

You need Python basics (lists, dictionaries, loops, functions, recursion). No algorithms knowledge is assumed, and every problem is stated before it is used.

---

# MOVE 1 — REMEMBER
*"My brute force recomputes something it already computed."*

The single largest family. Nested loops usually mean the inner loop is re-deriving a fact about elements you've already touched. Store the fact instead. The three principles differ in **what** you store: a lookup table of things seen (P1), a running summary of a prefix (P2), or the answer to a smaller version of the same problem (P3).

---

## P1. Hash it: stop searching, start remembering

**In one sentence.** If your slow solution has an inner loop whose only job is to *look for something* ("have I seen this before?", "where is it?", "how many of these are there?"), keep a set or dictionary of what you have already seen, and the inner loop disappears.

### Start with a problem

**Two Sum (LeetCode 1).** You are given a list of numbers and a target. Return the positions of the two numbers that add up to the target. Exactly one such pair exists.

```
nums = [3, 8, 4, 6]    target = 10
answer: [2, 3]         because nums[2] + nums[3] = 4 + 6 = 10
```

**The slow way.** Try every pair. For each number, scan everything after it for a number that completes the sum.

```python
for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == target:
            return [i, j]
```

Four numbers make 6 pairs. Ten thousand numbers make about 50 million pairs. The work grows with the square of the input: O(n²).

**Where the time goes.** Look at what the inner loop is really doing. When we stand on the `4`, the only number that can help is a `6` (because 10 − 4 = 6). So the inner loop is not "trying pairs" at all. It is searching the list for one specific value, and we run a search like that for every number.

Python's sets and dictionaries answer "is 6 in here?" in a single step, however many items they hold. So we can replace the search with a lookup, as long as we store the numbers as we go.

**The fix.** Walk through the list once. For each number:

1. Work out the partner it needs: `target - number`.
2. Check whether that partner is among the numbers you have already passed. If it is, you are done.
3. If not, store the current number and its position, so that a *later* number can find it.

Here is that process on the example:

| Position | Number | Partner needed | Already stored (value → position) | Result |
|---|---|---|---|---|
| 0 | 3 | 7 | *(nothing)* | no 7 yet; store 3 |
| 1 | 8 | 2 | 3→0 | no 2 yet; store 8 |
| 2 | 4 | 6 | 3→0, 8→1 | no 6 yet; store 4 |
| 3 | 6 | 4 | 3→0, 8→1, 4→2 | **4 is stored at position 2**, so return `[2, 3]` |

```python
def twoSum(nums, target):
    seen = {}                          # value -> the position where we saw it
    for i, n in enumerate(nums):
        partner = target - n
        if partner in seen:            # one step, instead of scanning the list
            return [seen[partner], i]
        seen[n] = i                    # store this number for later numbers to find
```

That is one pass over the list, so O(n). We spend some memory (the dictionary) and save a lot of time. That trade is the whole principle.

**Why check first and store second?** Suppose the target is 10 and the current number is 5. Its partner is also 5. If we stored the 5 first and then checked, we would find the number we are standing on and pair it with itself. Checking first guarantees that `seen` only contains numbers *before* the current one.

### What stays true (the invariant)

**"`seen` contains every number I have already walked past, and nothing else."**

Each line of the loop either relies on that sentence (the lookup) or keeps it true (storing the number at the end). If you can say the sentence, you can rebuild the code without memorizing it.

### How to recognize it

The most reliable signal is your own brute force. Write the slow version, then ask: *is the inner loop only searching for something?* If so, this principle applies.

The problem wording often gives it away too:

- "Find a pair", "find a duplicate", "find the matching element."
- Anything about counting: "most frequent", "uses the same letters", "anagram."
- You need to connect one thing to another: "each original node to its copy", "each value to its position."
- "No value may repeat in any row, column, or box."

### The one real decision: what do you store?

The loop barely changes from problem to problem. What changes is the **key**, the thing you store and look up. Each case below has a one-line problem so you can see why that key fits.

1. **The value itself.** *Contains Duplicate (217): does any number appear twice?* Keep a set of numbers seen. If the current number is already in it, you have found a duplicate.
2. **The partner you need.** *Two Sum*, above. You look up `target - n`, not `n`.
3. **A signature shared by things you want to treat as equal.** *Group Anagrams (49): group words that use exactly the same letters, such as "eat", "tea", "ate".* These words look different, but they have identical letter counts. Use the letter count as the key and all anagrams land in the same bucket. There is a full worked example below.
4. **Several facts packed into one key.** *Valid Sudoku (36): check that no digit repeats in any row, column, or 3×3 box.* You could keep 27 separate sets. Or you can keep one set of keys like `("row", 4, "7")`, meaning "a 7 has already appeared in row 4", and check all three rules against that one set.
5. **One object mapped to another.** *Clone Graph (133), Copy List with Random Pointer (138): make a complete copy of a structure of linked nodes.* Keep a dictionary from each original node to its copy. When you reach a node you have met before, reuse its copy instead of making a second one.
6. **A small number, used as a list index.** *Top K Frequent Elements (347): return the k numbers that appear most often.* Every frequency is between 1 and n, the length of the list. So instead of a dictionary you can use a plain list where slot `f` holds the numbers that appear `f` times. Reading the slots from the top down gives the most frequent numbers first, and nothing needs sorting.
7. **A prefix of a word.** This is a *trie*, covered at the end of this section.

### Worked example 2: Group Anagrams (LeetCode 49)

**Problem.** Given a list of lowercase words, group together the words that are anagrams of each other (the same letters, rearranged).

```
input:  ["eat", "tea", "tan", "ate", "nat", "bat"]
output: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]    (any order)
```

**The slow way.** Compare every word with every other word and check whether they are anagrams. That is a lot of comparisons, and each one looks at every letter.

**The insight.** Two words are anagrams exactly when they contain the same letters the same number of times. So count the letters of each word *once*, and use the count as a dictionary key. Anagrams produce identical counts and end up under the same key. Words that are not anagrams produce different counts.

```
"eat" -> a:1, e:1, t:1   \
"tea" -> a:1, e:1, t:1    }-- same key, same group
"ate" -> a:1, e:1, t:1   /
"tan" -> a:1, n:1, t:1   -- a different key
```

```python
from collections import defaultdict

def groupAnagrams(strs):
    groups = defaultdict(list)         # letter-count key -> words with those letters
    for word in strs:
        count = [0] * 26               # count[0] is how many a's, count[1] b's, ...
        for c in word:
            count[ord(c) - ord("a")] += 1
        groups[tuple(count)].append(word)
    return list(groups.values())
```

**Why `tuple(count)`?** Python refuses to use a list as a dictionary key, because a list can be changed after it has been stored. A tuple cannot change, so converting the list to a tuple makes it a valid key.

**A simpler key.** Sorting a word's letters also produces a shared signature: "eat", "tea" and "ate" all become "aet". `"".join(sorted(word))` works as the key too. It is a little slower on long words, but it is easier to write and perfectly acceptable in an interview.

### Worked example 3: Longest Consecutive Sequence (LeetCode 128), the subtle one

**Problem.** Given an unsorted list of integers, return the length of the longest run of consecutive values (such as 1, 2, 3, 4). The values can be anywhere in the list. You must do it in O(n) time, which rules out sorting.

```
input:  [100, 4, 200, 1, 3, 2]
output: 4          because 1, 2, 3, 4 are all present
```

**The slow way.** For each number, count upward (is n+1 present? n+2?), searching the list for each one. Every "is it present?" check is a scan of the whole list.

**Step 1: make the checks instant.** Put every number into a set. Now "is n+1 present?" takes one step. That is P1 as usual.

**Step 2: stop repeating work.** There is still a waste. Starting from every number means the run 1, 2, 3, 4 gets counted from 1, then again from 2, then from 3, then from 4. On one long run of n numbers, that adds up to roughly n²/2 steps again.

The fix is to count only from the **start** of a run. A number starts a run exactly when the number just below it is missing. `1` starts a run because `0` is absent. `2` does not start one because `1` is present, so we skip it. Now each run is walked exactly once.

```python
def longestConsecutive(nums):
    num_set = set(nums)
    longest = 0
    for n in num_set:
        if n - 1 not in num_set:          # n is the start of a run
            length = 1
            while n + length in num_set:  # walk forward to the end of the run
                length += 1
            longest = max(longest, length)
    return longest
```

The code has a loop inside a loop, but the inner loop only runs from the start of a run, and every number belongs to exactly one run. So the total number of inner steps is at most n, and the whole thing is O(n).

### Two data structures built on this idea

Some interview problems ask you to *build* a data structure. Two common ones are really just dictionaries arranged cleverly.

**The trie (prefix tree).** Used in *Implement Trie (208)*, *Design Add and Search Words (211)* and *Word Search II (212)*.

The problem: store many words so you can quickly answer "is this word stored?" and "does any stored word start with this prefix?"

The idea: build a tree where each node is a dictionary from a letter to the next node. The word "car" is stored as root → `c` → `a` → `r`, with a flag on the `r` node marking "a word ends here". If you also store "cat", it reuses the `c` and `a` nodes and only adds a new `t` node. Looking up a word or a prefix means following one letter at a time, so it takes as many steps as the word has letters. The number of words stored does not matter.

```python
class TrieNode:
    def __init__(self):
        self.children = {}      # letter -> TrieNode
        self.end = False        # True if a stored word ends at this node

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.end = True

    def _walk(self, prefix):
        # Follow the letters of prefix. Return the node you end on, or None if the path breaks.
        node = self.root
        for c in prefix:
            if c not in node.children:
                return None
            node = node.children[c]
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.end     # the path exists AND a word ends here

    def startsWith(self, prefix):
        return self._walk(prefix) is not None    # the path exists at all
```

Problem 211 adds a wildcard: in a search, `.` matches any single letter. When the search reaches a `.`, it cannot follow one child, so it tries every child and succeeds if any of them leads to a match:

```python
def search_with_dots(node, word, i=0):
    if i == len(word):
        return node.end
    if word[i] == ".":
        return any(search_with_dots(child, word, i + 1) for child in node.children.values())
    child = node.children.get(word[i])
    return child is not None and search_with_dots(child, word, i + 1)
```

**The LRU cache.** *LRU Cache (146)*: build a cache with a fixed capacity. `get(key)` returns a stored value. `put(key, value)` stores one. When the cache is full, adding a new key must throw out the key that was **least recently used** (read or written longest ago). Both operations must take O(1) time.

A dictionary gives O(1) lookup, but it cannot tell you which key is the oldest. So you pair it with a second structure that keeps keys in order of use, where you can move a key to the "most recent" end, or remove the oldest one, in O(1). Python's `OrderedDict` is both structures in one:

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = OrderedDict()             # oldest key at the front, newest at the back

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)            # it was just used, so it is now the newest
        return self.data[key]

    def put(self, key, value):
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)     # remove from the front: the oldest key
```

Interviewers often ask you to build it without `OrderedDict`. Then you use a dictionary from key to node, plus a doubly linked list of nodes ordered from oldest to newest. That version is Card 35 in `DRILLS.md`.

**Design problems in general** (146, 155, 295, 355, 981, 2013) follow the same recipe. List every operation the structure must support and how fast each one must be. Then pick a dictionary plus whatever one other structure (a list, stack, heap, or linked list) makes the slowest operation fast enough.

### Where else it shows up

**In the NeetCode 150:** Contains Duplicate 217, Valid Anagram 242, Two Sum 1, Group Anagrams 49, Top K Frequent 347, Valid Sudoku 36, Longest Consecutive Sequence 128, Copy List with Random Pointer 138, Clone Graph 133, LRU Cache 146, Time Based Key-Value Store 981, Design Twitter 355, Detect Squares 2013, Implement Trie 208, Add and Search Words 211, Word Search II 212.

It also plays a supporting role in many problems filed under other principles. The sliding-window problems (3, 76, 567) keep the window's contents in a set or count dictionary. Construct Binary Tree from Preorder and Inorder (105) uses a dictionary from value to position. Word Search (79) and N-Queens (51) track "already used" squares in a set. Word Ladder (127) groups words by patterns like `h*t`.

**Beyond the list:** anything that asks you to count, group, remove duplicates, or find a matching partner. Subarray Sum Equals K combines this principle with running totals (P2) and is Card 28.

### Common mistakes

- **Using a list as a dictionary key.** Python raises `TypeError: unhashable type: 'list'`. Convert it with `tuple(...)`, or build a string key.
- **Storing before checking in a pair problem.** The current element can then pair with itself. Check first, store second.
- **Reaching for a dictionary when a list would do.** If the keys are small whole numbers (0 to n, or the 26 letters), a list indexed by the key is simpler and faster. Top K Frequent's bucket list is the example.
- **Forgetting that "seen" means "before now".** In the pair problems, the stored items are only the ones before the current position. If you fill the set with the whole input up front, you need to handle the "pairs with itself" case separately.

---

## P2. Running aggregates: carry a summary forward instead of recomputing it

**In one sentence.** If every position needs something about *everything to its left* (or right), such as a product, a sum, a maximum or a minimum, compute that summary once while walking along, because the summary for position `i` is just the summary for position `i - 1` plus one more element.

### Start with a problem

**Product of Array Except Self (LeetCode 238).** You are given a list of numbers. Return a new list where position `i` holds the product of every number *except* `nums[i]`. You may not use division, and you must do it in O(n) time.

```
nums   = [2, 3, 4, 5]
answer = [60, 40, 30, 24]     because 3·4·5 = 60, 2·4·5 = 40, 2·3·5 = 30, 2·3·4 = 24
```

**The slow way.** For each position, multiply together every other number.

```python
answer = []
for i in range(len(nums)):
    product = 1
    for j in range(len(nums)):
        if j != i:
            product *= nums[j]
    answer.append(product)
```

Every position does a full pass over the list, so the work is n × n: O(n²).

**Where the time goes.** Split each answer into two halves: the product of everything to the **left** of `i`, times the product of everything to the **right** of `i`.

For position 2 (the `4`), the left part is `2 · 3`. For position 3 (the `5`), the left part is `2 · 3 · 4`. The slow code multiplies `2 · 3` again from scratch, even though it had just computed it. In general, the left product for position `i` is the left product for position `i - 1`, times one more number. The same is true from the right.

**The fix.** Make two passes instead of n.

1. Walk left to right, carrying a running product. At each position, write down the product of everything *before* it, then multiply the current number in.
2. Walk right to left doing the same thing, giving the product of everything *after* each position.
3. Each answer is the left product times the right product.

Here is that process on the example:

| Position | Number | Product of everything to the left | Product of everything to the right | Answer (left × right) |
|---|---|---|---|---|
| 0 | 2 | 1 *(nothing to the left)* | 3·4·5 = 60 | 60 |
| 1 | 3 | 2 | 4·5 = 20 | 40 |
| 2 | 4 | 2·3 = 6 | 5 | 30 |
| 3 | 5 | 2·3·4 = 24 | 1 *(nothing to the right)* | 24 |

Read the "left" column top to bottom: each entry is the one above it times the number above it. That is the running product, and it is why one pass is enough.

```python
def productExceptSelf(nums):
    n = len(nums)
    result = [1] * n
    # Pass 1: result[i] = product of everything to the LEFT of i.
    for i in range(1, n):
        result[i] = result[i - 1] * nums[i - 1]
    # Pass 2: multiply in the product of everything to the RIGHT of i.
    right = 1                            # product of everything after position i
    for i in range(n - 1, -1, -1):
        result[i] *= right                  # use it first...
        right *= nums[i]                 # ...then include nums[i] for the next position
    return result
```

Two passes over the list, so O(n). The output list doubles as storage for the left products, and the right product is a single variable, so no extra lists are needed.

**Why "use it, then include the current number"?** On the way back, `right` must hold the product of everything *after* `i` at the moment it is used. If you multiplied `nums[i]` in first, position `i` would include its own number, which is exactly what the problem forbids.

### What stays true (the invariant)

**"When I reach position `i`, my running value summarizes exactly the elements before `i`, not including `i` itself."**

In the first pass that value is `res[i - 1] * nums[i - 1]`. In the second pass it is `right`. Every off-by-one bug in this family comes from including or excluding the current element at the wrong moment, and the sentence tells you which.

### How to recognize it

Write the slow version and look at the inner loop. If it recomputes a sum, product, maximum or minimum over a range that grows by one element each time, this principle applies.

The wording often says:

- "For every position, compute something about all the other elements."
- "Without using division."
- "The best pair where one comes before the other" (buy before sell).
- A value at position `i` depends on the tallest (or smallest) thing to its left **and** to its right.

### The simplest version: one direction, one variable

Many problems only need the left side. Then the summary is a single variable and you do not need a list at all.

**Best Time to Buy and Sell Stock (LeetCode 121).** `prices[i]` is a stock's price on day `i`. You may buy once and sell once, on a later day. Return the largest possible profit, or 0 if no profit is possible.

```
prices = [7, 1, 5, 3, 6, 4]
answer: 5          buy at 1 (day 1), sell at 6 (day 4)
```

The slow way tries every (buy day, sell day) pair: O(n²). But if you are going to sell today, the best day to have bought is simply the cheapest day so far. So carry "cheapest price so far" forward:

| Day | Price | Cheapest so far | Profit if I sell today | Best profit |
|---|---|---|---|---|
| 0 | 7 | 7 | 0 | 0 |
| 1 | 1 | 1 | 0 | 0 |
| 2 | 5 | 1 | 4 | 4 |
| 3 | 3 | 1 | 2 | 4 |
| 4 | 6 | 1 | 5 | **5** |
| 5 | 4 | 1 | 3 | 5 |

```python
def maxProfit(prices):
    cheapest = prices[0]                 # the only fact about the past we need
    best = 0
    for price in prices:
        cheapest = min(cheapest, price)
        best = max(best, price - cheapest)
    return best
```

### Worked example 2: Trapping Rain Water (LeetCode 42)

**Problem.** A list of non-negative numbers gives the heights of a row of bars, each one unit wide. After rain, water collects between the bars. Return the total amount of water trapped.

```
height = [3, 0, 2, 0, 4]
answer: 7
```

**The insight.** Water above a bar rises to the height of the *shorter* of the two tallest walls around it: the tallest bar on its left (including itself) and the tallest on its right (including itself). So:

```
water at i = min(tallest on the left, tallest on the right) - height[i]
```

**The slow way** scans left and right from every bar to find those two walls: O(n²). But "tallest to the left" is a running maximum, and "tallest to the right" is a running maximum from the other end. Compute both lists once:

| Position | Height | Tallest on the left | Tallest on the right | Water = min(left, right) − height |
|---|---|---|---|---|
| 0 | 3 | 3 | 4 | 3 − 3 = 0 |
| 1 | 0 | 3 | 4 | 3 − 0 = 3 |
| 2 | 2 | 3 | 4 | 3 − 2 = 1 |
| 3 | 0 | 3 | 4 | 3 − 0 = 3 |
| 4 | 4 | 4 | 4 | 4 − 4 = 0 |

Total: 7.

```python
def trap(height):
    n = len(height)
    if n == 0:
        return 0
    left_max = [0] * n                   # left_max[i] = tallest bar in height[0..i]
    left_max[0] = height[0]
    for i in range(1, n):
        left_max[i] = max(left_max[i - 1], height[i])
    right_max = [0] * n                  # right_max[i] = tallest bar in height[i..n-1]
    right_max[-1] = height[-1]
    for i in range(n - 2, -1, -1):
        right_max[i] = max(right_max[i + 1], height[i])
    return sum(min(left_max[i], right_max[i]) - height[i] for i in range(n))
```

**Doing it with no extra lists.** Put a pointer at each end and keep the two running maximums as plain variables. Whichever side has the *smaller* running maximum can be settled right now: its water level is that smaller maximum, because the other side is already known to have a wall at least that tall. Settle it, move that pointer inward, repeat.

```python
def trap(height):
    l, r = 0, len(height) - 1
    left_max = right_max = 0
    water = 0
    while l <= r:
        if left_max <= right_max:        # the left side's level is decided
            left_max = max(left_max, height[l])
            water += left_max - height[l]
            l += 1
        else:                            # the right side's level is decided
            right_max = max(right_max, height[r])
            water += right_max - height[r]
            r -= 1
    return water
```

This version mixes two principles: the running maximums are P2, and moving the pointers inward is P5.

### Worked example 3: counting subarrays with a given sum (running totals plus a dictionary)

**Subarray Sum Equals K (LeetCode 560, outside the 150).** Count the contiguous stretches of the list whose numbers add up to exactly `k`. Numbers may be negative.

```
nums = [1, 2, 3]    k = 3
answer: 2           [1, 2] and [3]
```

**The insight.** Keep a running total. The sum of any stretch equals *the running total at its end* minus *the running total just before its start*. So a stretch ending here sums to `k` exactly when some earlier running total equals `current total − k`. That is a lookup, which is P1: keep a dictionary counting how many times each running total has occurred.

| Position | Number | Running total | Looking for (total − k) | Earlier totals seen (total → count) | Stretches found here |
|---|---|---|---|---|---|
| start | | 0 | | 0→1 *(the empty start)* | |
| 0 | 1 | 1 | −2 | 0→1 | 0 |
| 1 | 2 | 3 | 0 | 0→1, 1→1 | 1 (the stretch `[1, 2]`) |
| 2 | 3 | 6 | 3 | 0→1, 1→1, 3→1 | 1 (the stretch `[3]`) |

```python
def subarraySum(nums, k):
    seen = {0: 1}                        # running total -> how many times it has occurred
    total = count = 0
    for x in nums:
        total += x
        count += seen.get(total - k, 0)  # earlier points where a matching stretch began
        seen[total] = seen.get(total, 0) + 1
    return count
```

The starting entry `{0: 1}` stands for "before any numbers". Without it, stretches that start at position 0 are never counted. This combination is drilled on Card 28.

### Where else it shows up

Each of these carries a running summary forward:

- **Min Stack (155).** *Build a stack that also reports its smallest element in O(1).* Store, next to each pushed value, the minimum of the stack up to that point. Popping removes both, so the minimum is always on top.
- **Maximum Subarray (53).** *Find the contiguous stretch with the largest sum.* Carry "the best sum of a stretch ending here". Covered in P7 and Card 3.
- **Maximum Product Subarray (152).** *Same, but for products.* Carry both the largest *and* the smallest product ending here, because multiplying by a negative number swaps them.
- **Partition Labels (763).** *Cut a string into as many pieces as possible so that each letter appears in only one piece.* Precompute the last position of every letter, then extend the current piece's end as you walk. Covered in P7.
- **Trapping Rain Water (42)** and **Product of Array Except Self (238)**, above.
- **Best Time to Buy and Sell Stock (121)**, above.

**Beyond the list:** range-sum queries (precompute running totals once, then any range sum is one subtraction), running totals over a grid for rectangle sums, and "longest stretch with equal numbers of 0s and 1s" (Contiguous Array 525, Card 28).

### Common mistakes

- **Including the current element too early.** "Everything except `i`" means the left product must cover `0..i-1`, not `0..i`. Use the running value, then update it.
- **Starting "best" at 0 when all values could be negative.** In Maximum Subarray, a list of all negatives should return the largest (least negative) value, not 0. Start from the first element.
- **Forgetting that a negative flips products.** For products, the smallest running value can become the largest after one multiplication by a negative. Track both.
- **Forgetting the `{0: 1}` starting entry** in the running-total-plus-dictionary version.

---

## P3. Dynamic programming: solve each smaller question once and write the answer down

**In one sentence.** If the natural recursive solution keeps asking the *same smaller question* over and over, store each answer the first time you compute it (in a dictionary or a list), and an exponential solution becomes a polynomial one.

"Dynamic programming" (DP) is an old, unhelpful name. The idea is just: **recursion plus a memory of answers already worked out.**

### Start with a problem

**Climbing Stairs (LeetCode 70).** A staircase has `n` steps. Each move, you climb either 1 step or 2 steps. How many different sequences of moves reach the top?

```
n = 4
answer: 5        1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2
```

**The slow way.** Think about the *last* move. To stand on step `n`, you came either from step `n - 1` (with a 1-step) or from step `n - 2` (with a 2-step). So the number of ways to reach `n` is the ways to reach `n - 1` plus the ways to reach `n - 2`. That gives a short recursive function:

```python
def ways(n):
    if n <= 1:
        return 1                 # one way to stand on step 0 (do nothing) or step 1
    return ways(n - 1) + ways(n - 2)
```

It is correct, but `ways(40)` takes many seconds and `ways(60)` would take years. Each call makes two more calls, so the number of calls roughly doubles with every step: O(2ⁿ).

**Where the time goes.** Draw the calls for `ways(5)`:

```
ways(5)
├── ways(4)
│   ├── ways(3)
│   │   ├── ways(2) ...
│   │   └── ways(1)
│   └── ways(2) ...
└── ways(3)                  <- computed again, from scratch
    ├── ways(2) ...          <- and again
    └── ways(1)
```

`ways(3)` is computed twice, `ways(2)` three times, and it gets worse as `n` grows. But `ways(3)` is always the same number. The function is answering a small number of distinct questions (`ways(0)` up to `ways(n)`: only `n + 1` of them) an exponential number of times.

**The fix.** Remember each answer the first time you compute it. There are two ways to write that.

*Top-down (memoization):* keep the recursive function, and add a dictionary that stores answers. Before computing, check whether the answer is already stored. This is P1 applied to function calls.

```python
def climbStairs(n):
    memo = {}                            # step -> number of ways to reach it
    def ways(i):
        if i <= 1:
            return 1
        if i not in memo:
            memo[i] = ways(i - 1) + ways(i - 2)
        return memo[i]
    return ways(n)
```

*Bottom-up (tabulation):* fill in the answers in order from the smallest question upward, so that everything you need is already computed when you need it.

| Step `i` | Ways to reach `i - 2` | Ways to reach `i - 1` | Ways to reach `i` |
|---|---|---|---|
| 0 | | | 1 *(base case)* |
| 1 | | | 1 *(base case)* |
| 2 | 1 | 1 | 2 |
| 3 | 1 | 2 | 3 |
| 4 | 2 | 3 | **5** |
| 5 | 3 | 5 | 8 |

Each row only needs the two rows above it, so you do not even need a list. Two variables are enough:

```python
def climbStairs(n):
    ways_to_reach_n_from_two_back, ways_to_reach_n_from_one_back = 1, 1            # ways to reach step i-2 and step i-1
    for _ in range(2, n + 1):
        ways_to_reach_n_from_two_back, ways_to_reach_n_from_one_back = ways_to_reach_n_from_one_back, ways_to_reach_n_from_two_back + ways_to_reach_n_from_one_back
    return ways_to_reach_n_from_one_back
```

^that optimized for space but is not intuitively understood
this is more intuitive
```python
def climbStairs(n):
    ways_to_reach_target_steps_at_index = [0] * (n + 1)
    ways_to_reach_target_steps_at_index[0] = 1 # do nothing you reach 0 steps
    ways_to_reach_target_steps_at_index[1] = 1 # take 1 step reach 1 steps
    for i in range(2, n + 1):
        ways_to_reach_target_steps_at_index[i] = ways_to_reach_target_steps_at_index[i-1] + ways_to_reach_target_steps_at_index[i-2]
        # it may not be immediately intuitive, but reaching 4 steps is the combo of reaching two steps and 3 steps
        # why? you still have to move from step 2 to 4 or step 3 to 4
        # but because there is only one way to go from each step directly to 4, no additional WAYS are spawned by taking the step
        # so the total number of ways is just the sum of 
    return ways_to_reach_target_steps_at_index[n]
```

Both versions compute each of the `n + 1` answers once: O(n).

### What stays true (the invariant)

**"Every answer I have stored is the exact, final answer to the smaller question it names."**

That sentence is why the stored value can be reused without checking it. It also tells you what to store: a precise description of a smaller question. That description is called the **state**.

### How to recognize it

The wording usually asks for one of three things:

- **"How many ways ..."** (count the possibilities).
- **"Is it possible to ..."** (yes or no).
- **"What is the minimum / maximum / fewest / longest ..."** (the best value).

And the situation looks like a sequence of small choices: take this item or skip it, step 1 or step 2, use this coin or not, match these two characters or not. The number of complete sequences of choices is exponential, but the number of *distinct situations you can be in* is small.

The most reliable test: write the recursive brute force, then ask whether it ever calls itself with the same arguments twice. If it does, add a memory.

### The recipe

Every DP solution is written by answering four questions:

1. **What is the state?** The smallest description of "where I am" that determines the rest of the answer. For stairs it is "which step am I on". If two calls with the same state could give different answers, the state is missing something.
2. **What are the choices from here?** For stairs: a 1-step or a 2-step.
3. **How do the choices combine?** This is decided by what the question asks for:

   | The question asks | Combine the choices with | Base case returns | Examples |
   |---|---|---|---|
   | how many ways | `+` (add them up) | 1 | Climbing Stairs, Decode Ways, Unique Paths, Coin Change II |
   | is it possible | `or` / `any` | `True` | Word Break, Partition Equal Subset Sum, Interleaving String |
   | best value | `min` / `max` | 0 (or ±infinity for "impossible") | Coin Change, House Robber, Edit Distance |

4. **What are the base cases?** The smallest states whose answer you know directly (step 0 and step 1).

### Worked example 2: Coin Change (LeetCode 322)

**Problem.** You have coins of certain values, with an unlimited supply of each. Return the fewest coins that add up to `amount`, or −1 if it cannot be done.

```
coins = [1, 3, 4]    amount = 6
answer: 2            3 + 3
```

Notice that the obvious greedy idea, "always take the biggest coin that fits", gives 4 + 1 + 1 = three coins. That is wrong, which is why we need to consider every choice.

**The recipe.**

1. State: the amount still to make. (Which coins you used to get here does not matter, since supply is unlimited.)
2. Choices: use one coin of any value that fits.
3. Combine: `min`, because the question asks for the fewest. Using coin `c` costs 1 coin plus the best way to make `amount - c`.
4. Base case: making 0 takes 0 coins.

Fill the table from 0 upward. Each cell tries every coin:

| Amount | Use a 1 (1 + best[a−1]) | Use a 3 (1 + best[a−3]) | Use a 4 (1 + best[a−4]) | Fewest coins |
|---|---|---|---|---|
| 0 | | | | 0 *(base case)* |
| 1 | 1 + 0 = 1 | too big | too big | 1 |
| 2 | 1 + 1 = 2 | too big | too big | 2 |
| 3 | 1 + 2 = 3 | 1 + 0 = 1 | too big | 1 |
| 4 | 1 + 1 = 2 | 1 + 1 = 2 | 1 + 0 = 1 | 1 |
| 5 | 1 + 1 = 2 | 1 + 2 = 3 | 1 + 1 = 2 | 2 |
| 6 | 1 + 2 = 3 | 1 + 1 = **2** | 1 + 2 = 3 | **2** |

```python
def coinChange(coins, amount):
    IMPOSSIBLE = amount + 1                  # more coins than could ever be needed
    best = [IMPOSSIBLE] * (amount + 1)       # best[a] = fewest coins that make a
    best[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                best[a] = min(best[a], 1 + best[a - c])
    return best[amount] if best[amount] != IMPOSSIBLE else -1
```

The table has `amount + 1` cells and each tries every coin: O(amount × number of coins).

**Two changes turn this into other problems.** Replace `min(...)` with `+=` and it counts the *number of ways* instead (Coin Change II, 518). Replace it with `or` and it answers "is this amount reachable at all". The table and the loop stay the same.

### Worked example 3: House Robber (LeetCode 198)

**Problem.** Houses in a row hold `nums[i]` money each. You cannot rob two neighboring houses. Return the most money you can rob.

```
nums = [2, 7, 9, 3, 1]
answer: 12          rob houses 0, 2 and 4: 2 + 9 + 1
```

**The recipe.** At each house you either *rob it* (and add its money to the best total from two houses back) or *skip it* (and keep the best total from one house back). Combine with `max`. Only the last two totals matter, so two variables are enough:

| House | Money | Best up to two houses back | Best up to the previous house | Rob this one: money + two back | Skip it: previous | Best up to here |
|---|---|---|---|---|---|---|
| 0 | 2 | 0 | 0 | 2 | 0 | 2 |
| 1 | 7 | 0 | 2 | 7 | 2 | 7 |
| 2 | 9 | 2 | 7 | 11 | 7 | 11 |
| 3 | 3 | 7 | 11 | 10 | 11 | 11 |
| 4 | 1 | 11 | 11 | 12 | 11 | **12** |

```python
def rob(nums):
    two_back, one_back = 0, 0                # best totals up to house i-2 and i-1
    for money in nums:
        two_back, one_back = one_back, max(money + two_back, one_back)
    return one_back
```

### Worked example 4: two strings at once (Longest Common Subsequence, LeetCode 1143)

**Problem.** Given two strings, return the length of their longest common *subsequence*: the longest string you can get from both by deleting characters (without reordering the rest).

```
text1 = "abcde"    text2 = "ace"
answer: 3          "ace"
```

**The recipe.** The state is a pair of positions `(i, j)`: "what is the answer for the rest of `text1` starting at `i`, and the rest of `text2` starting at `j`?"

- If `text1[i] == text2[j]`, that character can be part of the answer: `1 + answer(i + 1, j + 1)`.
- If not, one of the two characters is useless here. Try dropping each and take the better: `max(answer(i + 1, j), answer(i, j + 1))`.
- Base case: if either string is used up, the answer is 0.

The states form a grid. Fill it from the bottom-right corner, so the cells below and to the right are always ready:

|  | a (j=0) | c (j=1) | e (j=2) | *(end)* |
|---|---|---|---|---|
| **a** (i=0) | **3** | 2 | 1 | 0 |
| **b** (i=1) | 2 | 2 | 1 | 0 |
| **c** (i=2) | 2 | 2 | 1 | 0 |
| **d** (i=3) | 1 | 1 | 1 | 0 |
| **e** (i=4) | 1 | 1 | 1 | 0 |
| *(end)* | 0 | 0 | 0 | 0 |

For example, the cell (c, c) is a match, so it is 1 plus the cell diagonally below-right (1), giving 2. The cell (b, a) is not a match, so it is the larger of the cell below (2) and the cell to the right (2).

```python
def longestCommonSubsequence(text1, text2):
    m, n = len(text1), len(text2)
    # dp[i][j] = answer for text1[i:] and text2[j:]; the extra row and column are the "used up" base case
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m - 1, -1, -1):
        for j in range(n - 1, -1, -1):
            if text1[i] == text2[j]:
                dp[i][j] = 1 + dp[i + 1][j + 1]
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])
    return dp[0][0]
```

**The same grid solves a whole family.** Only the rule inside the loop and the edge values change:

| Problem | What it asks | When the characters match | When they don't | Edge values (one string used up) |
|---|---|---|---|---|
| LCS 1143 | longest common subsequence | `1 + dp[i+1][j+1]` | `max(dp[i+1][j], dp[i][j+1])` | 0 |
| Edit Distance 72 | fewest inserts, deletes or replacements to turn `s` into `t` | `dp[i+1][j+1]` (no edit needed) | `1 + min(delete, insert, replace)` = `1 + min(dp[i+1][j], dp[i][j+1], dp[i+1][j+1])` | the number of characters left in the other string |
| Distinct Subsequences 115 | how many ways `t` appears in `s` as a subsequence | `dp[i+1][j] + dp[i+1][j+1]` (skip `s[i]`, or use it) | `dp[i+1][j]` (skip `s[i]`) | 1 when `t` is used up, 0 when only `s` is |
| Interleaving String 97 | can `s1` and `s2` be woven together, keeping each one's order, to form `s3`? | take the next character of `s3` from `s1` (if it matches) **or** from `s2` (if it matches) | | `True` when all three are used up |
| Regular Expression Matching 10 | does pattern `p` (with `.` = any character and `x*` = zero or more `x`) match all of `s`? | see Card 7 | | `True` when both are used up |

The full code for all five is on Card 7.

### More shapes you will meet

**Extra information in the state (Best Time to Buy and Sell Stock with Cooldown, 309).** *You may buy and sell many times, but after selling you must wait one day before buying again. Maximize profit.* Knowing the day is not enough to decide what you may do: you also need to know whether you are currently holding the stock. So the state is `(day, holding)`.

```python
from functools import lru_cache

def maxProfit(prices):
    @lru_cache(None)                         # Python's built-in memo: stores answers by argument
    def best(i, holding):
        if i >= len(prices):
            return 0
        wait = best(i + 1, holding)
        if holding:
            return max(wait, prices[i] + best(i + 2, False))   # sell, then skip a day
        return max(wait, -prices[i] + best(i + 1, True))       # buy
    return best(0, False)
```

**A grid, one row at a time (Unique Paths, 62).** *A robot starts at the top-left of an m × n grid and moves only right or down. How many paths reach the bottom-right?* The paths from a cell = the paths from the cell to its right + the paths from the cell below. Each row only needs the row below it, so keep one row:

```python
def uniquePaths(m, n):
    row = [1] * n                            # bottom row: only one path (keep going right)
    for _ in range(m - 1):
        new = [1] * n                        # rightmost column: only one path (keep going down)
        for j in range(n - 2, -1, -1):
            new[j] = new[j + 1] + row[j]     # right + down
        row = new
    return row[0]
```

**Looking back at every earlier position (Longest Increasing Subsequence, 300).** *Return the length of the longest subsequence whose values strictly increase.* For `[10, 9, 2, 5, 3, 7, 101, 18]` the answer is 4 (`2, 3, 7, 18`). The state is "the longest increasing subsequence that ends exactly at position `i`", and it can extend any earlier position with a smaller value:

```python
def lengthOfLIS(nums):
    ends_here = [1] * len(nums)              # ends_here[i] = longest increasing run ending at i
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                ends_here[i] = max(ends_here[i], ends_here[j] + 1)
    return max(ends_here, default=0)
```

That is O(n²). A faster O(n log n) version uses binary search (P4) and is on Card 32.

**Choosing the last step instead of the first (Burst Balloons, 312).** Covered in P18. When choosing the *first* action changes what the later choices look like, try choosing the *last* action instead.

### Where else it shows up

- **Min Cost Climbing Stairs (746).** *Each step has a cost; you may start on step 0 or 1 and climb 1 or 2 at a time. Minimize the cost to get past the top.* Climbing Stairs with `min` and costs instead of `+`.
- **House Robber II (213).** *House Robber, but the houses are in a circle, so the first and last are neighbors.* Run House Robber twice, once without the first house and once without the last, and take the larger.
- **Decode Ways (91).** *Letters are encoded as "1" to "26". Count the ways to decode a digit string.* Like Climbing Stairs: take one digit (if it is not "0") or two digits (if they form 10–26).
- **Word Break (139).** *Can the string be split into words from a dictionary?* State: "can the rest of the string from position `i` be split?" Try every dictionary word that matches at `i`, combine with `or`.
- **Partition Equal Subset Sum (416).** *Can the list be split into two groups with equal sums?* Can some subset reach exactly half the total? Card 6.
- **Coin Change II (518).** *Count the ways to make the amount.* Card 6.
- **Target Sum (494).** *Put `+` or `−` in front of each number; count the ways to reach the target.* P18 shows how it becomes a subset count.
- **Longest Increasing Path in a Matrix (329).** *Longest path in a grid moving to strictly larger neighbors.* State: "the longest path starting from cell `(r, c)`", memoized.
- **Counting Bits (338).** *For every number from 0 to n, count its 1 bits.* The count for `i` is the count for `i // 2` plus the last bit.
- **Maximum Product Subarray (152)** and **Maximum Subarray (53)** carry a two-value state; see P2 and P7.
- **Palindromic Substrings (647)** and **Longest Palindromic Substring (5)** can be done with a grid, but expanding outward from each center is simpler; see P5.

### Common mistakes

- **A state that is missing information.** If two calls with the same arguments could correctly return different answers, the state is incomplete. The cooldown problem needs "am I holding a stock?"; Target Sum needs the running total.
- **Filling cells in the wrong order.** In bottom-up code, every cell a formula reads must already be filled. Check the direction of your loops against the formula (`i + 1` means loop `i` downward).
- **Wrong base case values.** "How many ways" starts at 1 (there is one way to do nothing), "fewest" starts at 0, and "impossible" must be a value you can recognize at the end (`amount + 1` or `float('inf')`).
- **Recursion too deep.** Python stops at about 1,000 nested calls. If the chain of states can be longer than that (Coin Change with `amount = 10000` and a coin of 1), write the bottom-up version.

---

# MOVE 2 — ELIMINATE
*"I can prove some candidates can never win, so I skip them without looking."*

The slow solution checks every candidate. Each of these four principles supplies an **argument** that lets you throw candidates away in bulk without checking them. The argument almost always comes from **order** (the list is sorted, or a yes/no answer switches only once) or from **one option beating another** (if A is at least as good as B no matter what happens later, B can be dropped).

---

## P4. Binary search: one question rules out half of what is left

**In one sentence.** If you can ask a yes/no question about a candidate, and the answers run "no, no, no, ..., yes, yes, yes" as the candidate increases, then checking the middle candidate tells you which half to throw away, and you find the switch point in about log₂(n) checks instead of n.

### Start with a problem

**Binary Search (LeetCode 704).** Given a list of numbers sorted from smallest to largest, and a target, return the position of the target, or −1 if it is not there. It must run in O(log n) time.

```
nums = [-1, 0, 3, 5, 9, 12]    target = 12
answer: 5
```

**The slow way.** Check every position from the left:

```python
for i, x in enumerate(nums):
    if x == target:
        return i
return -1
```

For a list of a million numbers, that can take a million checks: O(n).

**Where the time goes.** When the slow code checks `nums[2] = 3` and it is not 12, it learns only "position 2 is not the answer". But the list is sorted, so it could have learned much more: since 3 is smaller than 12, *everything to the left of position 2 is smaller still*, and none of it can be the answer. The slow code throws that information away.

**The fix.** Keep a range `[l, r]` of positions where the target could still be. Check the middle of the range. If the middle value is too small, the target can only be to its right, so discard the left half. If it is too big, discard the right half. Repeat until you find it or the range is empty.

Here is that process on the example:

| Range `[l, r]` | Middle `m` | `nums[m]` | Compared with 12 | What we discard |
|---|---|---|---|---|
| [0, 5] | 2 | 3 | too small | positions 0–2; `l = 3` |
| [3, 5] | 4 | 9 | too small | positions 3–4; `l = 5` |
| [5, 5] | 5 | 12 | **equal** | return 5 |

And when the target is missing, say target = 2:

| Range `[l, r]` | Middle `m` | `nums[m]` | Compared with 2 | What we discard |
|---|---|---|---|---|
| [0, 5] | 2 | 3 | too big | positions 2–5; `r = 1` |
| [0, 1] | 0 | −1 | too small | position 0; `l = 1` |
| [1, 1] | 1 | 0 | too small | position 1; `l = 2` |
| [2, 1] | | | the range is empty | return −1 |

```python
def search(nums, target):
    l, r = 0, len(nums) - 1              # the target, if present, is somewhere in nums[l..r]
    while l <= r:                        # the range still has at least one position
        m = (l + r) // 2
        if nums[m] == target:
            return m
        if nums[m] < target:
            l = m + 1                    # m and everything left of it are too small
        else:
            r = m - 1                    # m and everything right of it are too big
    return -1
```

Each check halves the range. A million positions become 500,000, then 250,000, and so on: about 20 checks in total. That is O(log n).

### What stays true (the invariant)

**"If the answer exists, it is inside `[l, r]`. Everything outside has been proven wrong."**

Every update keeps this true: `l = m + 1` is only done when `m` and everything left of it are proven too small. When you write a binary search, check each branch against this sentence. It is the fastest way to catch off-by-one errors.

### The bigger idea: search for the answer itself

Binary search does not need a sorted list. It needs a yes/no question whose answers switch from "no" to "yes" exactly once as the candidate grows. Very often the candidates are *possible answers*, and the question is "is this answer good enough?"

**Koko Eating Bananas (LeetCode 875).** There are piles of bananas, `piles[i]` in pile `i`. Koko picks an eating speed of `k` bananas per hour. Each hour she eats `k` bananas from one pile (if the pile has fewer, she finishes it and waits for the next hour). Return the smallest `k` that lets her finish every pile within `h` hours.

```
piles = [3, 6, 7, 11]    h = 8
answer: 4
```

Nothing here is sorted. But look at the question "can she finish in time at speed `k`?" Eating faster never hurts, so the answers look like:

```
speed:     1    2    3    4    5    6   ...   11
in time?   no   no   no   yes  yes  yes ...   yes
```

We want the first "yes". The smallest possible speed is 1. The largest we ever need is `max(piles)` = 11, since at that speed every pile takes one hour.

At speed `k`, a pile of `p` bananas takes `p / k` hours, rounded up. Here is the search:

| Range `[lo, hi]` | Middle speed | Hours needed (each pile, rounded up) | In time (≤ 8)? | What we keep |
|---|---|---|---|---|
| [1, 11] | 6 | 1 + 1 + 2 + 2 = 6 | yes | 6 might be the answer; `hi = 6` |
| [1, 6] | 3 | 1 + 2 + 3 + 4 = 10 | no | too slow; `lo = 4` |
| [4, 6] | 5 | 1 + 2 + 2 + 3 = 8 | yes | `hi = 5` |
| [4, 5] | 4 | 1 + 2 + 2 + 3 = 8 | yes | `hi = 4` |
| [4, 4] | | | | `lo == hi`, answer 4 |

```python
def minEatingSpeed(piles, h):
    lo, hi = 1, max(piles)               # the answer is somewhere in [lo, hi]
    while lo < hi:
        k = (lo + hi) // 2
        hours = sum((p + k - 1) // k for p in piles)   # (p + k - 1) // k rounds p / k up
        if hours <= h:
            hi = k                       # k works, so the answer is k or smaller; keep k
        else:
            lo = k + 1                   # k is too slow, and so is everything below it
    return lo
```

Notice that this loop is slightly different from the first one. Here, when the middle works, we **keep** it (`hi = k`), because it might be the answer. So the loop runs while `lo < hi` and stops when the range has shrunk to a single value. The two styles are:

| You are looking for | Loop condition | When the middle is not the answer | Finish |
|---|---|---|---|
| an exact value | `while l <= r` | `l = m + 1` or `r = m - 1` | return inside the loop, or −1 |
| the first candidate that passes a test | `while lo < hi` | pass: `hi = m`; fail: `lo = m + 1` | return `lo` |

Mixing them (for example `while lo <= hi` with `hi = m`) either loops forever or skips the answer. Pick one per problem and stay in it.

### How to recognize it

- The input is sorted, or sorted and then rotated, or a grid whose rows and columns are sorted.
- The problem demands O(log n), or the values go up to a billion so anything that tries each value is too slow.
- "Find the minimum X such that ..." or "the maximum X such that ...", where making X bigger only ever makes the condition easier (or only harder).
- "Find the largest value that is at most t" (a floor), as in Time Based Key-Value Store.

### Worked example 2: Find Minimum in Rotated Sorted Array (LeetCode 153)

**Problem.** A sorted list of distinct numbers has been *rotated*: some number of elements were moved from the front to the back. Return the smallest element in O(log n).

```
nums = [4, 5, 6, 7, 0, 1, 2]     (originally [0, 1, 2, 4, 5, 6, 7])
answer: 0
```

**The yes/no question.** Compare an element with the *last* element. Everything before the drop (4, 5, 6, 7) is larger than the last element. Everything from the drop onward (0, 1, 2) is not. So "is `nums[m]` ≤ the last element?" goes no, no, no, no, yes, yes, yes, and the first "yes" is the minimum.

| Range `[l, r]` | Middle `m` | `nums[m]` | `nums[r]` | Decision |
|---|---|---|---|---|
| [0, 6] | 3 | 7 | 2 | 7 > 2: the drop is to the right; `l = 4` |
| [4, 6] | 5 | 1 | 2 | 1 ≤ 2: `m` might be the minimum; `r = 5` |
| [4, 5] | 4 | 0 | 1 | 0 ≤ 1: `r = 4` |
| [4, 4] | | | | answer `nums[4]` = 0 |

```python
def findMin(nums):
    l, r = 0, len(nums) - 1
    while l < r:
        m = (l + r) // 2
        if nums[m] > nums[r]:
            l = m + 1                    # m is before the drop; the minimum is to its right
        else:
            r = m                        # m is at or after the drop; it might be the minimum
    return nums[l]
```

**Search in Rotated Sorted Array (33)** asks for a target instead of the minimum. At any middle point, one of the two halves is in normal sorted order. Check which one, then check whether the target lies within that half's range of values:

```python
def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        m = (l + r) // 2
        if nums[m] == target:
            return m
        if nums[l] <= nums[m]:                   # the left half nums[l..m] is sorted
            if nums[l] <= target < nums[m]:
                r = m - 1                        # target is inside the sorted left half
            else:
                l = m + 1
        else:                                    # the right half nums[m..r] is sorted
            if nums[m] < target <= nums[r]:
                l = m + 1                        # target is inside the sorted right half
            else:
                r = m - 1
    return -1
```

### Where else it shows up

- **Search a 2D Matrix (74).** *Each row is sorted and each row starts after the previous one ends. Find a target.* Treat the grid as one long sorted list: position `p` is row `p // cols`, column `p % cols`.
- **Time Based Key-Value Store (981).** *Store values with timestamps; `get(key, t)` returns the value with the latest timestamp at most `t`.* Each key's timestamps arrive in increasing order, so its list is already sorted. Binary-search for the last timestamp ≤ `t`.
- **Median of Two Sorted Arrays (4).** *Find the median of two sorted lists in O(log(m + n)).* Binary-search how many elements of the shorter list belong in the lower half. The code is in "Tricks that genuinely must be memorized" below.
- **Lowest Common Ancestor of a Binary Search Tree (235).** *Find the deepest node that has both `p` and `q` below it.* In a search tree, one comparison tells you whether both are to the left, both to the right, or split (in which case you are at the answer). See P11.
- **Longest Increasing Subsequence (300)** in O(n log n): Card 32.

**Beyond the list:** "first bad version", "search insert position", first and last position of a value, shipping packages within D days, splitting an array to minimize the largest sum, finding a peak.

### Common mistakes

- **Mismatched loop styles.** `while l <= r` goes with `r = m - 1`. `while lo < hi` goes with `hi = m`. See the table above.
- **A question that is not really one-switch.** "Search the answer" only works if every candidate above a passing one also passes. Say out loud why that is true before you code.
- **Starting the range too small.** The range must contain the answer. For Koko, `hi = max(piles)` always works; `hi = sum(piles) // h` might not.
- **Rotated arrays with duplicates.** `[1, 1, 1, 0, 1]` breaks the "which half is sorted" test, and you are forced to step one position at a time in the worst case.

---

## P5. Two pointers: start at both ends, and let one comparison rule out a whole side

**In one sentence.** With a pointer at each end of a sorted list (or a list you compare against its mirror image), a single comparison tells you that one of the two end elements cannot be part of any answer, so you drop it and move inward, and every element is looked at once.

### Start with a problem

**Two Sum II, Input Array Is Sorted (LeetCode 167).** Given a list sorted from smallest to largest and a target, return the positions of the two numbers that add up to the target. Positions are counted from 1. Exactly one answer exists, and you may use only O(1) extra memory (so no dictionary).

```
numbers = [1, 3, 4, 6, 8, 11]    target = 10
answer: [3, 4]                   because 4 + 6 = 10 (positions 3 and 4, counting from 1)
```

**The slow way.** Try every pair:

```python
for i in range(len(numbers)):
    for j in range(i + 1, len(numbers)):
        if numbers[i] + numbers[j] == target:
            return [i + 1, j + 1]
```

That is O(n²). The dictionary trick from P1 would make it O(n), but it needs O(n) memory, which this problem forbids.

**Where the time goes.** Put one finger on the smallest number (1) and one on the largest (11). Their sum is 12, which is too big. Now think about the 11: the *smallest* thing it could possibly pair with is 1, and even that is too big. So 11 cannot be in the answer at all, with any partner. The slow code would still try 11 with 3, with 4, with 6, with 8. All wasted.

The same reasoning works the other way. If the sum is too small, the smallest number is useless, because even its biggest possible partner is not enough.

**The fix.** Start with `l` at the left end and `r` at the right end.

1. If `numbers[l] + numbers[r]` is the target, done.
2. If it is too big, the right number is too big for *everyone*. Drop it: `r -= 1`.
3. If it is too small, the left number is too small for *everyone*. Drop it: `l += 1`.

Here is that process on the example:

| `l` | `r` | `numbers[l]` | `numbers[r]` | Sum | Decision |
|---|---|---|---|---|---|
| 0 | 5 | 1 | 11 | 12 | too big: 11 can't pair with anything; `r -= 1` |
| 0 | 4 | 1 | 8 | 9 | too small: 1 can't pair with anything; `l += 1` |
| 1 | 4 | 3 | 8 | 11 | too big: drop 8 |
| 1 | 3 | 3 | 6 | 9 | too small: drop 3 |
| 2 | 3 | 4 | 6 | **10** | return `[3, 4]` |

```python
def twoSum(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        total = numbers[l] + numbers[r]
        if total == target:
            return [l + 1, r + 1]        # the problem counts positions from 1
        if total > target:
            r -= 1                       # numbers[r] is too big to pair with anything left
        else:
            l += 1                       # numbers[l] is too small to pair with anything left
```

Each step removes one number for good, so there are at most n steps: O(n) time, and only two variables of memory.

### What stays true (the invariant)

**"Any pair that uses a number outside `[l, r]` has already been ruled out."**

This is why moving a pointer is safe. It is also the test for whether two pointers apply to a new problem: you must be able to say *why* the number you drop can never be part of a better answer. If you can't, you probably need a dictionary (P1) or sorting (P9) instead.

### How to recognize it

- The list is sorted and you are looking for a pair (or triple) with a given sum.
- The word "palindrome", or any check that compares position `i` with position `n - 1 - i`.
- "Maximize the area / width / something between two positions", where you can argue the worse end can never help.
- Two sorted lists that need to be merged (here both pointers move the same way, each along its own list).

### Worked example 2: Container With Most Water (LeetCode 11)

**Problem.** `height[i]` is the height of a vertical line at position `i`. Choose two lines. Together with the ground they form a container, which holds `min(the two heights) × (distance between them)` water. Return the most water any container can hold.

```
height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
answer: 49          the lines at positions 1 (height 8) and 8 (height 7): min(8, 7) × 7 = 49
```

Nothing here is sorted, but the same kind of argument works. Start with the widest container (both ends). The water level is set by the *shorter* line. Any other container that uses that shorter line is narrower and can't be taller than the shorter line, so it holds less. The shorter line can never do better than it does right now, so drop it.

| `l` | `r` | Heights | Width | Water | Shorter side (dropped) |
|---|---|---|---|---|---|
| 0 | 8 | 1, 7 | 8 | 8 | left |
| 1 | 8 | 8, 7 | 7 | **49** | right |
| 1 | 7 | 8, 3 | 6 | 18 | right |
| 1 | 6 | 8, 8 | 5 | 40 | tie: drop either (the code drops the right) |
| 1 | 5 | 8, 4 | 4 | 16 | right |
| 1 | 4 | 8, 5 | 3 | 15 | right |
| 1 | 3 | 8, 2 | 2 | 4 | right |
| 1 | 2 | 8, 6 | 1 | 6 | right; now `l == r`, so stop. Best: 49 |

```python
def maxArea(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        best = max(best, min(height[l], height[r]) * (r - l))
        if height[l] < height[r]:
            l += 1                       # the left line can't do better with anyone closer
        else:
            r -= 1
    return best
```

### Worked example 3: 3Sum (LeetCode 15)

**Problem.** Return every distinct triple of numbers from the list that adds up to 0. No triple may appear twice in the output.

```
nums = [-1, 0, 1, 2, -1, -4]
answer: [[-1, -1, 2], [-1, 0, 1]]
```

**The idea.** Sort the list first (P9): `[-4, -1, -1, 0, 1, 2]`. Then fix the first number of the triple with an ordinary loop, and use Two Sum II on the rest to find two numbers that add up to minus the first. Sorting also makes duplicates sit next to each other, so skipping a value equal to the previous one avoids repeated triples.

```python
def threeSum(nums):
    nums.sort()
    res = []
    for i in range(len(nums)):
        if nums[i] > 0:
            break                                # smallest of the three is positive: no zero sum
        if i > 0 and nums[i] == nums[i - 1]:
            continue                             # same first number as last time: same triples
        l, r = i + 1, len(nums) - 1
        while l < r:
            total = nums[i] + nums[l] + nums[r]
            if total < 0:
                l += 1
            elif total > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1                       # skip repeats of the second number
    return res
```

Sorting costs O(n log n) and the loops cost O(n²), which is the best known for this problem.

### Pointers that move outward: palindromes

**Longest Palindromic Substring (5).** *Return the longest stretch of the string that reads the same forwards and backwards.* For `"babad"` the answer is `"bab"` (or `"aba"`).

Every palindrome has a center: a single character (odd length) or a gap between two characters (even length). Start two pointers at a center and move them *outward* while the characters match. There are about 2n centers and each expansion is at most n steps, so O(n²) with no extra memory.

```python
def longestPalindrome(s):
    best = ""
    for center in range(len(s)):
        for l, r in ((center, center), (center, center + 1)):   # odd-length, even-length
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            if r - l - 1 > len(best):
                best = s[l + 1 : r]              # the loop stopped one step past each end
    return best
```

**Palindromic Substrings (647)** *(count all palindromic stretches)* is the same loop, adding 1 for every successful expansion instead of tracking the longest.

### Where else it shows up

- **Valid Palindrome (125).** *Ignoring case and anything that is not a letter or digit, does the string read the same both ways?* One pointer at each end; skip non-alphanumeric characters; compare and move inward.
- **Trapping Rain Water (42).** The pointer version in P2.
- **Merge Two Sorted Lists (21).** *Merge two sorted linked lists into one sorted list.* One pointer on each list; take the smaller head each time. See P16.
- **Reorder List (143).** *Rearrange `1→2→3→4→5` into `1→5→2→4→3`.* Split, reverse the second half, then walk both halves together. See P16.
- **Spiral Matrix (54).** *Return a grid's elements in clockwise spiral order.* Keep four boundaries (top, bottom, left, right) and move each inward after walking its edge.

**Beyond the list:** remove duplicates or move zeros in place (a "read" pointer and a "write" pointer), squares of a sorted array, 4Sum, boats to save people, "is `s` a subsequence of `t`".

### Common mistakes

- **Moving a pointer without a reason.** Always be able to say why the dropped element cannot be in any answer. That argument is the algorithm.
- **Duplicates in 3Sum.** Skip a repeated first number, and after recording a triple, skip repeated second numbers. Otherwise the same triple is recorded several times.
- **Confusing this with a sliding window.** When both pointers move in the *same* direction and you care about everything between them, that is P8, which has a different rule for moving.

---

## P6. Stack: keep the unfinished items in a pile, and settle them from the top

**In one sentence.** When each new item either resolves some of the items still waiting for an answer, or has to wait itself, and the one it resolves is always *the most recent one still waiting*, keep the waiting items on a stack (a Python list you only append to and pop from the end), and every item is added once and removed once.

### Start with a problem

**Daily Temperatures (LeetCode 739).** `temperatures[i]` is the temperature on day `i`. For each day, return how many days you have to wait for a warmer day. If no warmer day comes, the answer is 0.

```
temperatures = [73, 74, 75, 71, 69, 72, 76, 73]
answer       = [ 1,  1,  4,  2,  1,  1,  0,  0]
```

For example, day 2 is 75°. The next warmer day is day 6 (76°), so day 2 waits 4 days.

**The slow way.** For each day, scan forward until a warmer day appears:

```python
answer = [0] * len(temperatures)
for i in range(len(temperatures)):
    for j in range(i + 1, len(temperatures)):
        if temperatures[j] > temperatures[i]:
            answer[i] = j - i
            break
```

On a list that keeps getting colder, every day scans to the end: O(n²).

**Where the time goes.** Flip the question around. Instead of each day looking *forward* for its answer, let each new day look *back* at the days that are still waiting, and tell them "I'm your answer".

When a new day arrives, which waiting days does it answer? Every waiting day that is colder than it. And here is the key observation: the waiting days are always lined up from warmest (oldest) to coldest (newest). Why? Whenever a day arrives, it answers every colder day still waiting, so those leave the line. Whatever stays waiting behind it must be at least as warm as it is. So a new day only needs to check the *most recent* waiting day, then the one before that, and so on, stopping at the first one that is not colder. Everything further back is warmer still.

That is exactly what a stack does: add to the top, look at the top, remove from the top.

**The fix.** Walk through the days once, keeping a stack of the days still waiting for an answer.

1. While the day on top of the stack is colder than today, today is its answer: pop it and record `today - that day`.
2. Push today onto the stack. It is now waiting too.
3. Whatever is left on the stack at the end never found a warmer day: its answer stays 0.

Here is that process on the example (the stack is shown as `day:temperature`, bottom to top):

| Day | Temp | Days answered by today (popped) | Stack after pushing today |
|---|---|---|---|
| 0 | 73 | none | 0:73 |
| 1 | 74 | day 0 (waited 1) | 1:74 |
| 2 | 75 | day 1 (waited 1) | 2:75 |
| 3 | 71 | none: 75 is not colder | 2:75, 3:71 |
| 4 | 69 | none: 71 is not colder | 2:75, 3:71, 4:69 |
| 5 | 72 | day 4 (waited 1), day 3 (waited 2); stop at 75 | 2:75, 5:72 |
| 6 | 76 | day 5 (waited 1), day 2 (waited 4) | 6:76 |
| 7 | 73 | none | 6:76, 7:73 |
| end | | days 6 and 7 never answered: 0 | |

```python
def dailyTemperatures(temperatures):
    answer = [0] * len(temperatures)
    waiting = []                                     # days with no warmer day yet (their positions)
    for today, temp in enumerate(temperatures):
        while waiting and temperatures[waiting[-1]] < temp:
            day = waiting.pop()                      # today is the first warmer day after `day`
            answer[day] = today - day
        waiting.append(today)
    return answer
```

There is a loop inside a loop, but each day is pushed once and popped at most once, so the inner loop runs at most n times *in total*. The whole thing is O(n).

**Why store positions instead of temperatures?** The answer is a distance in days, so you need to know *when* each waiting day was. The temperature can always be looked up from the position.

### What stays true (the invariant)

**"The stack holds exactly the days that have not found a warmer day yet, and their temperatures never increase from bottom to top."**

Because the temperatures never increase going up the stack, the top is always the coldest waiting day. If today is not warmer than the top, it is not warmer than anything below it either, so you can stop looking. A stack kept in order like this is called a **monotonic stack**.

### How to recognize it

- "For every element, find the next (or previous) element that is larger (or smaller)."
- "How long until ...", "how far back until ...".
- "Largest rectangle", "how many cars form groups".
- Matching or nesting: brackets, tags, undo operations, expressions.

### The other kind of stack problem: matching and nesting

**Valid Parentheses (LeetCode 20).** *A string contains only `()[]{}`. Return whether every bracket is closed by the right type, in the right order.* `"([]{})"` is valid; `"([)]"` is not.

A closing bracket must match the most recently opened bracket that is still open. "Most recent, still unmatched" is the top of a stack.

```python
def isValid(s):
    match = {")": "(", "]": "[", "}": "{"}
    stack = []                                       # opening brackets not yet closed
    for c in s:
        if c not in match:
            stack.append(c)                          # an opening bracket: it waits
        elif not stack or stack[-1] != match[c]:
            return False                             # nothing to close, or the wrong type
        else:
            stack.pop()                              # closed the most recent open bracket
    return not stack                                 # anything left was never closed
```

**Evaluate Reverse Polish Notation (150)** works the same way. *Evaluate an expression written with operators after their operands, like `["2", "1", "+", "3", "*"]` meaning (2 + 1) × 3 = 9.* Numbers are pushed; an operator pops the two most recent numbers and pushes the result.

### Worked example 2: Largest Rectangle in Histogram (LeetCode 84)

**Problem.** `heights[i]` is the height of a bar of width 1. Return the area of the largest rectangle that fits inside the bars.

```
heights = [2, 1, 5, 6, 2, 3]
answer: 10          the bars of height 5 and 6 together hold a 5 × 2 rectangle
```

**The idea.** A rectangle that uses a bar's full height can stretch left and right until it hits a *shorter* bar. So every bar needs to know where the nearest shorter bar is on each side. Keep a stack of bars whose right edge is not known yet, in increasing height order. When a shorter bar arrives, it is the right edge for every taller bar on the stack: pop them and compute their areas. The new bar can also stretch back left as far as the leftmost bar it popped.

The stack holds `(start position, height)`:

| Position | Height | Popped (area = height × (position − start)) | Stack after |
|---|---|---|---|
| 0 | 2 | | (0, 2) |
| 1 | 1 | (0, 2): 2 × 1 = 2 | (0, 1) *(starts at 0, where the popped bar started)* |
| 2 | 5 | | (0, 1), (2, 5) |
| 3 | 6 | | (0, 1), (2, 5), (3, 6) |
| 4 | 2 | (3, 6): 6 × 1 = 6; (2, 5): 5 × 2 = **10** | (0, 1), (2, 2) |
| 5 | 3 | | (0, 1), (2, 2), (5, 3) |
| end (6) | | (5, 3): 3 × 1 = 3; (2, 2): 2 × 4 = 8; (0, 1): 1 × 6 = 6 | |

```python
def largestRectangleArea(heights):
    best = 0
    stack = []                                       # (start, height), heights increasing
    for i, h in enumerate(heights):
        start = i
        while stack and stack[-1][1] > h:
            s, height = stack.pop()                  # i is the first shorter bar to its right
            best = max(best, height * (i - s))
            start = s                                # the new bar can stretch back to here
        stack.append((start, h))
    for s, height in stack:                          # never met a shorter bar: stretch to the end
        best = max(best, height * (len(heights) - s))
    return best
```

### Where else it shows up

- **Min Stack (155).** *Build a stack with `push`, `pop`, `top` and `getMin`, all O(1).* Keep a second stack where each entry is the minimum at that height of the main stack (a running aggregate, P2).
- **Car Fleet (853).** *Cars drive toward a target at different speeds and cannot pass; a car that catches up joins the car ahead as one "fleet". Count the fleets that arrive.* Sort cars by position, closest to the target first, and work out each car's arrival time if it drove alone. A car that would arrive no later than the fleet ahead of it catches up and joins that fleet. Otherwise it starts a new fleet. The stack holds each fleet's arrival time.
  ```python
  def carFleet(target, position, speed):
      fleets = []                                  # arrival time of each fleet, closest first
      for p, s in sorted(zip(position, speed), reverse=True):
          t = (target - p) / s
          if not fleets or t > fleets[-1]:
              fleets.append(t)                     # can't catch the fleet ahead: a new fleet
      return len(fleets)
  ```
- **Sliding Window Maximum (239).** *Return the largest value in every window of `k` consecutive elements.* A stack that can also drop items from the bottom (a deque). Card 34.
- **Generate Parentheses (22)** looks like a stack problem but is backtracking; see P12.

**Beyond the list:** next greater element, stock span, remove k digits to make the smallest number, asteroid collision, decode string (`"3[a2[c]]"`), simplify a file path, basic calculator.

### Common mistakes

- **Storing values when you need positions.** Distances and widths need positions.
- **`<` versus `<=` in the pop condition.** It decides what happens with equal values. For Daily Temperatures, an equal temperature is not warmer, so pop only on strictly colder (`<`).
- **Forgetting what is left at the end.** Items still on the stack never found their answer. Some problems want 0 for them, some want "stretches to the end".

---

## P7. Greedy: make the choice you can prove is never worse, and never look back

**In one sentence.** If you can show that one particular choice (the farthest reach, the earliest finish, the smallest item) is always at least as good as any alternative, take it immediately and move on, instead of trying every combination of choices.

The danger with greedy solutions is that many "obvious" choices are wrong (Coin Change in P3 is the classic trap). So a greedy solution is only as good as the one-sentence argument for why its choice is safe. Every example below comes with that argument.

### Start with a problem

**Jump Game (LeetCode 55).** You start at position 0 of a list. `nums[i]` is the *maximum* jump length from position `i` (you may jump any distance from 1 up to it). Return whether you can reach the last position.

```
nums = [2, 3, 1, 1, 4]    answer: True     (0 → 1 → 4, for example)
nums = [3, 2, 1, 0, 4]    answer: False    (every route gets stuck on the 0 at position 3)
```

**The slow way.** Try every possible jump from every position, recursively. From position 0 you might jump 1 or 2; from each of those, try every jump again, and so on. The number of routes grows exponentially. Even with memoization (P3), each position looks at up to n jumps: O(n²).

**Where the time goes.** We don't need to know *which* route works, only whether one exists. And "can position `i` reach the end?" has a simple answer once we know about positions further right: position `i` can reach the end if it can jump onto *any* position that can reach the end. Since the jump can be any length up to `nums[i]`, it is enough for `i` to reach the *leftmost* position already known to work.

**The fix.** Walk backward from the end, keeping one number: `goal`, the leftmost position known to reach the end. Start with `goal` = the last position. For each earlier position `i`, if `i + nums[i] >= goal`, then `i` can jump onto `goal`, so `i` becomes the new goal. At the end, check whether the goal reached position 0.

Here is that process on `[2, 3, 1, 1, 4]`:

| Position `i` | `nums[i]` | Farthest it can reach (`i + nums[i]`) | Current goal | Reaches the goal? | New goal |
|---|---|---|---|---|---|
| *(start)* | | | 4 | | 4 |
| 3 | 1 | 4 | 4 | yes | 3 |
| 2 | 1 | 3 | 3 | yes | 2 |
| 1 | 3 | 4 | 2 | yes | 1 |
| 0 | 2 | 2 | 1 | yes | **0** → True |

And on `[3, 2, 1, 0, 4]`: position 3 reaches only 3, position 2 only 3, position 1 only 3, position 0 only 3. None reaches the goal at 4, so the goal never moves and the answer is False.

```python
def canJump(nums):
    goal = len(nums) - 1                 # leftmost position known to reach the end
    for i in range(len(nums) - 2, -1, -1):
        if i + nums[i] >= goal:
            goal = i                     # i can land on goal, so i reaches the end too
    return goal == 0
```

One pass, one variable: O(n) time, O(1) memory.

**Why is it safe to keep only the leftmost goal?** Any position that can reach some good position further right can also reach the leftmost good one, because a jump can be any length up to the maximum. So nothing is lost by forgetting the others.

### What stays true (the invariant)

**"Every choice I have committed to so far is part of some best possible answer."**

In Jump Game the committed fact is "`goal` reaches the end". Greedy algorithms keep this sentence true by making only choices that can be justified with an **exchange argument**: take any best answer that made a different choice, swap in the greedy choice, and show the result is still valid and no worse.

### How to recognize it

- "Can you reach ...", "minimum number of jumps / removals", "maximum number of non-overlapping ...".
- Some item's handling is forced: the smallest card must start a group, the interval that ends earliest should be kept.
- A running total that, once negative, can only hurt what follows.
- It looks like DP, but the input is large (100,000 items) and there is an obvious "best" choice at each step.

### Three shapes greedy solutions take

**1. Carry a frontier.** Keep one number, such as "the farthest position I can reach", and extend it while scanning. Jump Game (above), Jump Game II, Partition Labels.

**2. Drop a running total when it goes negative.** A negative total can only drag down whatever comes after it, so start fresh. Maximum Subarray, Gas Station.

**3. Sort, then handle the most constrained item first.** Once the items are in the right order, the right move for the first one is forced. Non-overlapping Intervals, Hand of Straights.

### Worked example 2: Maximum Subarray (LeetCode 53)

**Problem.** Return the largest sum of any contiguous, non-empty stretch of the list.

```
nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
answer: 6          the stretch [4, -1, 2, 1]
```

**The argument.** Walk along keeping `run`, the sum of the current stretch. If `run` ever drops below 0, any stretch that continued it would be better off starting fresh after it (adding a negative number only lowers the sum). So reset `run` to 0.

| Number | `run` after adding it | Best so far | Reset? |
|---|---|---|---|
| −2 | −2 | −2 | yes, `run = 0` |
| 1 | 1 | 1 | |
| −3 | −2 | 1 | yes, `run = 0` |
| 4 | 4 | 4 | |
| −1 | 3 | 4 | |
| 2 | 5 | 5 | |
| 1 | 6 | **6** | |
| −5 | 1 | 6 | |
| 4 | 5 | 6 | |

```python
def maxSubArray(nums):
    best = nums[0]                       # not 0: if every number is negative, the answer is negative
    run = 0
    for x in nums:
        run += x
        best = max(best, run)
        if run < 0:
            run = 0                      # a negative prefix can only hurt what follows
    return best
```

This is known as **Kadane's algorithm**. It is also a DP with a tiny state ("the best sum of a stretch ending here") and a running aggregate (P2). All three views are correct.

### Worked example 3: Gas Station (LeetCode 134)

**Problem.** Gas stations sit on a circular road. Station `i` gives `gas[i]` fuel, and driving from station `i` to the next costs `cost[i]`. You start with an empty tank. Return the station you can start from to drive all the way around once, or −1 if none works. The answer, if it exists, is unique.

```
gas  = [1, 2, 3, 4, 5]
cost = [3, 4, 5, 1, 2]
answer: 3
```

**The argument.** First, if the total gas is less than the total cost, no start works. Otherwise, try starting at 0 and keep a running tank. If the tank goes negative at station `i`, the start fails, and so does *every station between the start and `i`*: each of them would have arrived at `i` with even less fuel (they miss the non-negative fuel collected before them). So skip straight to `i + 1`.

| Station | gas − cost | Tank | Went negative? | Candidate start |
|---|---|---|---|---|
| 0 | −2 | −2 | yes, reset | 1 |
| 1 | −2 | −2 | yes, reset | 2 |
| 2 | −2 | −2 | yes, reset | 3 |
| 3 | 3 | 3 | | 3 |
| 4 | 3 | 6 | | **3** |

```python
def canCompleteCircuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1                        # not enough fuel in total: no start can work
    tank = start = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            tank, start = 0, i + 1       # every start from `start` to i fails here
    return start
```

### Worked example 4: Non-overlapping Intervals (LeetCode 435)

**Problem.** Given intervals `[start, end]`, return the fewest you must remove so that the rest do not overlap. Intervals that only touch (`[1, 2]` and `[2, 3]`) do not count as overlapping.

```
intervals = [[1, 2], [2, 3], [3, 4], [1, 3]]
answer: 1          remove [1, 3]
```

**The argument.** Sort by start. When two intervals overlap, one of them must go. Keep the one that **ends earlier**: it leaves more room for everything after it, so it can never be the worse choice.

Sorted: `[1, 2], [1, 3], [2, 3], [3, 4]`.

| Interval | End of the last kept interval | Overlap? | Action | Removed |
|---|---|---|---|---|
| [1, 2] | | | keep; last end = 2 | 0 |
| [1, 3] | 2 | yes (1 < 2) | remove one; keep the smaller end, 2 | 1 |
| [2, 3] | 2 | no (2 ≥ 2) | keep; last end = 3 | 1 |
| [3, 4] | 3 | no | keep; last end = 4 | **1** |

```python
def eraseOverlapIntervals(intervals):
    intervals.sort()
    removed = 0
    last_end = intervals[0][1]
    for start, end in intervals[1:]:
        if start >= last_end:
            last_end = end                       # no overlap: keep it
        else:
            removed += 1                         # overlap: drop whichever ends later
            last_end = min(last_end, end)
    return removed
```

### Where else it shows up

- **Jump Game II (45).** *Same jumps, but return the fewest jumps to reach the end (reaching it is guaranteed).* Think in rounds: all positions reachable in `j` jumps form a window; the next window runs from just past it to the farthest point reachable from inside it. Count the windows.
  ```python
  def jump(nums):
      l = r = jumps = 0                        # [l, r] = positions reachable in `jumps` jumps
      while r < len(nums) - 1:
          farthest = max(i + nums[i] for i in range(l, r + 1))
          l, r = r + 1, farthest
          jumps += 1
      return jumps
  ```
- **Hand of Straights (846).** *Can the cards be split into groups of `groupSize` consecutive values?* The smallest remaining card must start a group (nothing smaller exists to put before it). So repeatedly take the smallest and use up the next `groupSize − 1` values.
  ```python
  from collections import Counter

  def isNStraightHand(hand, groupSize):
      if len(hand) % groupSize:
          return False
      count = Counter(hand)
      for x in sorted(count):
          n = count[x]                         # this many groups must start at x
          if n:
              for y in range(x, x + groupSize):
                  if count[y] < n:
                      return False
                  count[y] -= n
      return True
  ```
- **Merge Triplets to Form Target Triplet (1899).** *You may "merge" triplets by taking the largest value in each of the three positions. Can you produce exactly the target?* Throw away any triplet that is larger than the target in some position (it would ruin that position). Then check that, among the rest, each target value appears in its position somewhere.
- **Partition Labels (763).** *Cut a string into as many pieces as possible so each letter appears in only one piece; return the piece lengths.* Record each letter's last position. Walk along, extending the current piece's end to the last position of every letter you meet. When you reach that end, cut.
  ```python
  def partitionLabels(s):
      last = {c: i for i, c in enumerate(s)}   # last position of each letter
      sizes, start, end = [], 0, 0
      for i, c in enumerate(s):
          end = max(end, last[c])
          if i == end:                         # everything in this piece ends by here
              sizes.append(end - start + 1)
              start = i + 1
      return sizes
  ```
- **Valid Parenthesis String (678).** *Brackets plus `*`, which can be `(`, `)` or nothing. Is it valid?* Instead of trying every choice for each `*`, track the *range* of how many brackets could be open: the fewest and the most. It fails if the most drops below 0; it succeeds if the fewest can be 0 at the end.
  ```python
  def checkValidString(s):
      lo = hi = 0                              # fewest and most '(' that could be open
      for c in s:
          if c == "(":
              lo, hi = lo + 1, hi + 1
          elif c == ")":
              lo, hi = lo - 1, hi - 1
          else:
              lo, hi = lo - 1, hi + 1          # '*' could close, open, or do nothing
          if hi < 0:
              return False                     # too many ')' whatever the stars are
          lo = max(lo, 0)                      # can't have fewer than 0 open
      return lo == 0
  ```
- **Task Scheduler (621).** *Tasks labeled by letters; the same letter needs `n` idle slots between repeats. Minimum total time?* Schedule the most frequent task first. The answer has a formula: `max(len(tasks), (maxFreq − 1) × (n + 1) + number of tasks with maxFreq)`.
- **Container With Most Water (11).** Dropping the shorter wall (P5) is an exchange argument.
- **Min Cost to Connect All Points (1584).** Adding the cheapest edge that doesn't form a loop is greedy; see P15.

**Not greedy, even though it looks it:** Reconstruct Itinerary (332). "Always fly to the alphabetically smallest airport" fails on tickets JFK→KUL, JFK→NRT, NRT→JFK: it flies to KUL first and gets stuck with two tickets unused. It needs the algorithm in "Tricks that genuinely must be memorized".

**Beyond the list:** activity selection, minimum arrows to burst balloons, assign cookies, candy distribution, minimum platforms, fractional knapsack.

### Common mistakes

- **Greedy without a reason.** If you can't state in one sentence why the choice is safe, it is probably wrong. Coin Change and "take or skip each item with a weight limit" look greedy but need DP (P3).
- **Sorting by the wrong thing.** For merging intervals, sort by start. For keeping the most non-overlapping intervals, sort by end (keep any interval that starts after the last kept one ends), or sort by start and keep the smaller end on each overlap, as above.
- **Forgetting the global check.** Gas Station's reset logic only finds the right start if some start exists; check the totals first.

---

# MOVE 3 — SWEEP
*"I can process the input in one pass, carrying a small summary of what matters."*

These three principles share a shape: one pass forward, a few variables that are updated a little at each step, and the promise that those variables are *enough*, so nothing already passed ever needs to be looked at again. The difference is what the variables hold: a stretch of consecutive elements (P8), the previous item in sorted order (P9), or the current smallest or largest item of a changing collection (P10).

---

## P8. Sliding window: grow the right edge, shrink the left edge, never start over

**In one sentence.** For "the longest (or shortest) stretch of consecutive elements that satisfies some condition", keep a window `[l, r]`: move `r` forward one step at a time, move `l` forward only as far as needed to make the window valid again, and update a small summary of the window's contents at each move instead of rebuilding it.

### Start with a problem

**Longest Substring Without Repeating Characters (LeetCode 3).** Return the length of the longest stretch of consecutive characters in a string in which no character appears twice.

```
s = "abcabcbb"
answer: 3          "abc"
```

**The slow way.** Try every start and every end, and check each stretch for repeats:

```python
best = 0
for i in range(len(s)):
    for j in range(i, len(s)):
        if len(set(s[i : j + 1])) == j - i + 1:     # no repeats in s[i..j]
            best = max(best, j - i + 1)
```

There are about n²/2 stretches, and checking each one looks at up to n characters: O(n³).

**Where the time goes.** Two kinds of waste.

First, each check rebuilds the set of characters from scratch, even though `s[i..j+1]` is just `s[i..j]` plus one character.

Second, many stretches are hopeless. If `s[i..j]` already contains a repeat, then every longer stretch starting at `i` contains it too. And once the stretch starting at `i` has hit a repeat, there is no point going back to try a start before `i`.

**The fix.** Keep one window and a set of the characters inside it.

1. Move the right edge `r` forward, one character at a time.
2. If the new character is already in the set, the window is invalid. Remove characters from the left (and from the set) until that earlier copy is gone.
3. Add the new character. The window is now valid; record its length.

Both edges only ever move forward, so each character enters the window once and leaves once.

Here is that process on the example:

| `r` | New char | Already in the window? | Removed from the left | Window after | Length |
|---|---|---|---|---|---|
| 0 | a | no | | a | 1 |
| 1 | b | no | | ab | 2 |
| 2 | c | no | | abc | **3** |
| 3 | a | yes | a | bca | 3 |
| 4 | b | yes | b | cab | 3 |
| 5 | c | yes | c | abc | 3 |
| 6 | b | yes | a, then b | cb | 2 |
| 7 | b | yes | c, then b | b | 1 |

```python
def lengthOfLongestSubstring(s):
    in_window = set()                    # the characters in s[l..r]
    l = 0
    best = 0
    for r in range(len(s)):
        while s[r] in in_window:         # adding s[r] would create a repeat
            in_window.remove(s[l])
            l += 1
        in_window.add(s[r])
        best = max(best, r - l + 1)      # s[l..r] has no repeats
    return best
```

`r` moves n times and `l` moves at most n times in total, so O(n).

### What stays true (the invariant)

**"After the shrinking step, `s[l..r]` is the longest valid window that ends at `r`, and the set describes exactly what is inside it."**

The set is never rebuilt, only edited at the edges. If you ever find yourself building it from scratch inside the loop, the window has been lost.

### How to recognize it

- The words **substring**, **subarray**, **contiguous**, **consecutive** or **window**, together with "longest", "shortest" or "how many".
- The condition is about the *contents* of the stretch: no repeats, at most k distinct values, contains every letter of t, sum at most k.
- **Adding elements can only make the condition harder to satisfy** (or only easier). This is what makes shrinking from the left safe. If the condition can flip back and forth, a window will not work.
- A fixed window size `k` is given.

### Longest versus shortest: the loop flips

| You want | Grow `r`, then shrink `l` ... | Record the answer ... |
|---|---|---|
| the **longest** valid window | while the window is **invalid** | after shrinking (the window is valid) |
| the **shortest** valid window | while the window is **valid** | inside the shrink loop, before each shrink |

For "shortest", you shrink while you still can, because every step makes a shorter valid window.

### Worked example 2: Minimum Window Substring (LeetCode 76)

**Problem.** Given strings `s` and `t`, return the shortest stretch of `s` that contains every character of `t` (including repeats). Return `""` if there is none.

```
s = "ADOBECODEBANC"    t = "ABC"
answer: "BANC"
```

**Checking validity quickly.** Comparing two dictionaries at every step would be slow. Instead, count how many *distinct* characters of `t` currently have enough copies in the window (`have`), and compare it with how many distinct characters `t` needs (`need`). Update `have` only when a character's count crosses its requirement.

Here are the key moments (`need` = 3: one A, one B, one C):

| `r` | Char | `have` after adding | Window valid? | Shrinking | Shortest so far |
|---|---|---|---|---|---|
| 0–4 | A D O B E | 2 (A, B) | no | | |
| 5 | C | 3 | yes: "ADOBEC" | record 6; drop A → `have` = 2 | "ADOBEC" |
| 6–9 | O D E B | 2 | no | | |
| 10 | A | 3 | yes: "DOBECODEBA" | drop D, O, B (a second B is still inside), E, C → `have` = 2 | "ADOBEC" |
| 11 | N | 2 | no | | |
| 12 | C | 3 | yes: "ODEBANC" | drop O, D, E, recording "EBANC" and "BANC"; drop B → `have` = 2 | **"BANC"** |

```python
def minWindow(s, t):
    if not t or len(s) < len(t):
        return ""
    required = {}
    for c in t:
        required[c] = required.get(c, 0) + 1
    need = len(required)                         # distinct characters still to satisfy
    window = {}
    have = 0
    best_l, best_len = 0, float("inf")
    l = 0
    for r, c in enumerate(s):
        window[c] = window.get(c, 0) + 1
        if c in required and window[c] == required[c]:
            have += 1                            # c just reached its required count
        while have == need:                      # valid: record it, then try to shrink
            if r - l + 1 < best_len:
                best_l, best_len = l, r - l + 1
            window[s[l]] -= 1
            if s[l] in required and window[s[l]] < required[s[l]]:
                have -= 1                        # s[l] just dropped below its requirement
            l += 1
    return s[best_l : best_l + best_len] if best_len != float("inf") else ""
```

### Where else it shows up

- **Longest Repeating Character Replacement (424).** *You may change up to `k` characters. Return the longest stretch that can be made all one letter.* A window is valid when `length − (count of its most common letter) ≤ k`: the other letters are the ones you would change. Keep a letter count for the window.
  ```python
  def characterReplacement(s, k):
      count = {}
      l = 0
      top = 0                                  # highest count of one letter seen in a window
      best = 0
      for r, c in enumerate(s):
          count[c] = count.get(c, 0) + 1
          top = max(top, count[c])
          while (r - l + 1) - top > k:         # more than k letters would need changing
              count[s[l]] -= 1
              l += 1
          best = max(best, r - l + 1)
      return best
  ```
  `top` is never lowered when the window shrinks. That is deliberate: an out-of-date `top` can only make the window look *less* valid than it is, so it never produces a wrong answer, and the answer only grows when a genuinely higher count appears.
- **Permutation in String (567).** *Does `s2` contain some rearrangement of `s1` as a consecutive stretch?* Slide a window of exactly `len(s1)` across `s2`, keeping letter counts, and compare them with `s1`'s counts. (Letter counts as a signature are P1.)
- **Sliding Window Maximum (239).** *Return the largest value in every window of size `k`.* The window slides as usual; the maximum is tracked with a monotonic deque (P6). Card 34.
- **Best Time to Buy and Sell Stock (121)** is sometimes listed here, but it is really the running minimum of P2.

**Beyond the list:** the largest sum of `k` consecutive elements, the shortest stretch with sum at least `s`, the longest stretch with at most `k` distinct characters, "fruit into baskets", max consecutive ones with up to `k` flips, all anagrams of a pattern in a string.

### Common mistakes

- **Using a window when the condition is not one-directional.** "Sum exactly `k`" with negative numbers can go from invalid to valid by *adding* an element, so shrinking is not safe. Use running totals plus a dictionary (P2, Card 28).
- **Forgetting to update the summary when shrinking.** Every `l += 1` must also remove `s[l]` from the set or decrement its count.
- **Shrinking in the wrong condition.** Longest: shrink while invalid. Shortest: shrink while valid.
- **Returning a slice when nothing was found.** Guard the "no valid window" case before slicing.

---

## P9. Sort first: then each item only needs to be compared with its neighbor

**In one sentence.** If the problem is about how items relate to each other (overlaps, duplicates, what comes before what), sort them first; after sorting, each item can only interact with the ones right next to it, so one pass with a little state replaces comparing every pair.

Python's `sort()` takes O(n log n) time. That is only slightly more than one pass over the list, and much less than the O(n²) of comparing every pair.

### Start with a problem

**Merge Intervals (LeetCode 56).** Each interval is `[start, end]`. Merge all overlapping intervals and return the result. Intervals that touch (one ends where the next starts) count as overlapping.

```
intervals = [[8, 10], [1, 3], [15, 18], [2, 6]]
answer:     [[1, 6], [8, 10], [15, 18]]         [1, 3] and [2, 6] overlap, so they become [1, 6]
```

**The slow way.** Compare every interval with every other. Whenever two overlap, merge them and start over, since the merged interval might now overlap something it didn't before. That is at least O(n²), and repeated passes can make it worse.

**Where the time goes.** Without any order, an interval could overlap anything, anywhere in the list, so you have to check everything. But imagine the intervals laid out on a number line from left to right. An interval can only overlap the ones that start near it. If they were in order of start, you would only ever need to look at the block you are currently building.

**The fix.** Sort by start. Then walk through once, keeping the list of merged blocks:

1. If the next interval starts at or before the end of the last block, it overlaps: stretch the last block's end to cover it.
2. Otherwise it starts after the last block ends. Nothing later can reach back to that block (they all start even later), so it is finished. Start a new block.

Sorted: `[1, 3], [2, 6], [8, 10], [15, 18]`.

| Interval | Last block so far | Overlap? (start ≤ last block's end) | Blocks after |
|---|---|---|---|
| [1, 3] | none | | [1, 3] |
| [2, 6] | [1, 3] | 2 ≤ 3, yes | [1, **6**] |
| [8, 10] | [1, 6] | 8 ≤ 6, no | [1, 6], [8, 10] |
| [15, 18] | [8, 10] | 15 ≤ 10, no | [1, 6], [8, 10], [15, 18] |

```python
def merge(intervals):
    intervals.sort()                             # by start (then by end, which doesn't matter here)
    merged = []
    for start, end in intervals:
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)   # overlaps the last block: extend it
        else:
            merged.append([start, end])          # starts after the last block ends: a new block
    return merged
```

**Why `max` when extending?** The new interval might sit entirely inside the last block (`[1, 10]` then `[2, 5]`). Taking the larger end keeps the block from shrinking.

### What stays true (the invariant)

**"Every interval before the current one has been merged into `merged`, and only the last block in `merged` can still grow."**

That second half is what sorting buys you. Earlier blocks are finished because nothing still to come can reach back to them.

### How to recognize it

- Intervals, `[start, end]` pairs: merge them, insert one, count overlaps, find free time, count rooms.
- "Are any two items equal / overlapping / too close?"
- A greedy choice that is only safe when the items are handled in a particular order (by end time, by size, by position).
- The problem would be easy if the input were sorted, and nothing stops you from sorting it.

### Worked example 2: Meeting Rooms II (LeetCode 253)

**Problem.** Each meeting is `[start, end]`. Return the fewest rooms needed so that no two meetings in the same room overlap. A meeting that ends at time `t` frees its room for one starting at `t`.

```
intervals = [[0, 30], [5, 10], [15, 20]]
answer: 2
```

**The idea.** The number of rooms needed is the largest number of meetings happening at the same moment. Turn every meeting into two *events*: "+1 at its start" and "−1 at its end". Sort all the events by time and walk through them, keeping a running count of meetings in progress. The highest the count ever reaches is the answer.

When a start and an end happen at the same time, process the end first, so the room is freed before it is needed. Sorting `(time, change)` pairs does this automatically, because −1 sorts before +1.

| Event (time, change) | Meetings in progress | Most so far |
|---|---|---|
| (0, +1) | 1 | 1 |
| (5, +1) | 2 | **2** |
| (10, −1) | 1 | 2 |
| (15, +1) | 2 | 2 |
| (20, −1) | 1 | 2 |
| (30, −1) | 0 | 2 |

```python
def minMeetingRooms(intervals):
    events = []
    for start, end in intervals:
        events.append((start, 1))                # a meeting begins
        events.append((end, -1))                 # a meeting ends
    events.sort()                                # at equal times, -1 (end) comes before +1 (start)
    in_progress = most = 0
    for _, change in events:
        in_progress += change
        most = max(most, in_progress)
    return most
```

This technique is called a **sweep line**: imagine a vertical line moving left to right across the timeline, and keep a count of what it is currently crossing.

### Worked example 3: answering queries in sorted order (Minimum Interval to Include Each Query, LeetCode 1851)

**Problem.** Given intervals and a list of query points, for each query return the length of the *shortest* interval that contains it (`end − start + 1`), or −1 if none does.

```
intervals = [[1, 4], [2, 4], [3, 6], [4, 4]]    queries = [2, 3, 4, 5]
answer: [3, 3, 1, 4]
```

**The idea.** Sort the intervals by start, and handle the queries from smallest to largest. As the query point moves right, add every interval that has now started to a heap (P10) ordered by length. Throw away, from the top of the heap, any interval that has already ended. The top of the heap is then the shortest interval containing the query.

```python
import heapq

def minInterval(intervals, queries):
    intervals.sort()
    active = []                                  # heap of (length, end) for intervals that have started
    answer = {}
    i = 0
    for q in sorted(queries):
        while i < len(intervals) and intervals[i][0] <= q:
            start, end = intervals[i]
            heapq.heappush(active, (end - start + 1, end))
            i += 1
        while active and active[0][1] < q:       # the shortest one has already ended
            heapq.heappop(active)
        answer[q] = active[0][0] if active else -1
    return [answer[q] for q in queries]          # report in the original order
```

### Where else it shows up

- **Insert Interval (57).** *The intervals are already sorted and don't overlap; insert a new one and merge as needed.* The Merge Intervals pass, with the new interval dropped into place.
- **Meeting Rooms (252).** *Can one person attend every meeting?* Sort by start, then check that each meeting starts at or after the previous one ends.
- **Non-overlapping Intervals (435).** *Fewest removals so none overlap.* Sort, then the greedy choice in P7.
- **3Sum (15).** Sorting makes two pointers work and puts duplicates next to each other. P5.
- **Car Fleet (853).** Sort cars by position, then a stack. P6.
- **Hand of Straights (846).** Sort, then the smallest card starts each group. P7.
- **Subsets II (90), Combination Sum II (40).** Sorting puts equal values side by side so duplicates can be skipped. P12.
- **Min Cost to Connect All Points (1584)** with Kruskal's method: sort all connections by cost, then add them cheapest first. P15.

**Beyond the list:** employee free time, car pooling, "my calendar", intersections of two lists of intervals, the skyline problem, the year with the most people alive.

### Common mistakes

- **Sorting by the wrong key.** Merge by start. For "most intervals you can keep", sort by end (or sort by start and use the P7 trick).
- **Ties in a sweep line.** Decide whether something ending at `t` and something starting at `t` overlap, and order the events so the code agrees.
- **Modifying tuples.** `merged[-1][1] = ...` needs lists. Append `[start, end]`, not the original pair, if the input might contain tuples.
- **Forgetting the original order.** When you sort queries to answer them efficiently, store answers by query and report them in the order they were asked.

---

## P10. Heap: when you keep needing the smallest (or largest) of a changing collection

**In one sentence.** If your algorithm repeatedly says "take the smallest (or largest) item left, do something, maybe add new items", use a heap, which hands you the smallest item instantly and lets you add or remove an item in O(log n), instead of re-sorting or scanning every time.

### What a heap is, in Python terms

A heap is an ordinary Python list that the `heapq` module keeps arranged so that **the smallest item is always at index 0**. The rest of the list is only partly ordered, which is what makes updates cheap.

```python
import heapq

h = []
heapq.heappush(h, 5)       # add an item: O(log n)
heapq.heappush(h, 2)
heapq.heappush(h, 8)
h[0]                       # peek at the smallest: 2, O(1)
heapq.heappop(h)           # remove and return the smallest: 2, O(log n)
heapq.heapify(some_list)   # rearrange an existing list into a heap in place: O(n)
```

Python only has a *min*-heap. For the largest item instead, store negated values (`-x`) and negate again when you read them.

### Start with a problem

**Kth Largest Element in a Stream (LeetCode 703).** Build a class that is given `k` and an initial list of numbers. Its `add(val)` method adds a number to the stream and returns the `k`-th largest number seen so far.

```
k = 3, nums = [4, 5, 8, 2]
add(3)  -> 4       (numbers so far: 2 3 4 5 8; the 3rd largest is 4)
add(5)  -> 5
add(10) -> 5
add(9)  -> 8
add(4)  -> 8
```

**The slow way.** Keep every number in a list. On each `add`, append the number, sort the list, and return the `k`-th from the end. Every call costs O(n log n), and `n` keeps growing.

**Where the time goes.** Sorting puts *all* the numbers in order, but we only ever look at the top `k`. Worse, any number that is not in the current top `k` can never get back in: new numbers only push the bar higher. So those numbers don't need to be kept at all.

**The fix.** Keep only the `k` largest numbers seen so far, in a min-heap. The smallest of those `k` (which is at index 0) *is* the `k`-th largest overall. When a new number arrives, push it; if the heap now has more than `k` items, pop the smallest.

Here is that process on the example, with `k = 3` (heap contents shown sorted for readability):

| Step | Push | Heap after push | Too big? Pop the smallest | Heap after | Answer (`h[0]`) |
|---|---|---|---|---|---|
| start | 4, 5, 8, 2 | 2 4 5 8 | pop 2 | 4 5 8 | |
| add(3) | 3 | 3 4 5 8 | pop 3 | 4 5 8 | **4** |
| add(5) | 5 | 4 5 5 8 | pop 4 | 5 5 8 | **5** |
| add(10) | 10 | 5 5 8 10 | pop 5 | 5 8 10 | **5** |
| add(9) | 9 | 5 8 9 10 | pop 5 | 8 9 10 | **8** |
| add(4) | 4 | 4 8 9 10 | pop 4 | 8 9 10 | **8** |

```python
import heapq

class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.heap = []                           # the k largest numbers seen so far
        for x in nums:
            self.add(x)

    def add(self, val):
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)             # drop the smallest; it can never be top-k again
        return self.heap[0]                      # the smallest of the top k = the k-th largest
```

Each `add` is one push and at most one pop on a heap of size `k`: O(log k).

**Why a *min*-heap for the *largest* numbers?** Because the question is "which of my top `k` should I throw out when a new one arrives?", and the answer is always the smallest of them. The min-heap puts exactly that one at the front.

### What stays true (the invariant)

**"The heap holds exactly the items that are still candidates, and the best of them is at index 0."**

For this problem, "candidates" means "the `k` largest so far". In other problems it means "stones not yet smashed", "the next node from each list", or "the cheapest place I can reach next".

### How to recognize it

- "The `k` largest / smallest / closest / most frequent", especially when `k` is much smaller than `n` or the data arrives as a stream.
- "Repeatedly take the two largest and combine them", "always do the most frequent task next".
- Merging `k` lists that are each already sorted.
- A running median.
- Any algorithm that says "always expand the cheapest option next" (Dijkstra and Prim in P15).

### Four ways heaps are used

| Pattern | How it works | Problems |
|---|---|---|
| **Keep only the best k** | push each item; pop whenever the heap exceeds `k` | Kth Largest in a Stream 703, K Closest Points 973, Kth Largest Element 215 |
| **A live "biggest item" source** | put everything in, then repeatedly pop, process, and push results back | Last Stone Weight 1046, Task Scheduler 621 |
| **Merge k sorted lists** | the heap holds the current front item of each list; pop the smallest, push the next item from that same list | Merge K Sorted Lists 23, Design Twitter 355 |
| **Two heaps split at the middle** | a max-heap holds the smaller half, a min-heap the larger half | Find Median from Data Stream 295 |

### Worked example 2: Last Stone Weight (LeetCode 1046)

**Problem.** Each turn, take the two heaviest stones and smash them together. If they weigh the same, both are destroyed; otherwise the lighter is destroyed and the heavier loses that much weight. Return the weight of the last stone, or 0 if none are left.

```
stones = [2, 7, 4, 1, 8, 1]
answer: 1
```

| Heaviest two | Result | Stones left |
|---|---|---|
| 8, 7 | a stone of 1 | 2 4 1 1 1 |
| 4, 2 | a stone of 2 | 2 1 1 1 |
| 2, 1 | a stone of 1 | 1 1 1 |
| 1, 1 | both destroyed | 1 |
| | one stone left | **1** |

```python
import heapq

def lastStoneWeight(stones):
    heap = [-s for s in stones]                  # negate: Python's heap is a min-heap
    heapq.heapify(heap)
    while len(heap) > 1:
        first = -heapq.heappop(heap)             # heaviest
        second = -heapq.heappop(heap)            # second heaviest
        if first != second:
            heapq.heappush(heap, -(first - second))
    return -heap[0] if heap else 0
```

### Worked example 3: Find Median from Data Stream (LeetCode 295)

**Problem.** Build a class with `addNum(num)` and `findMedian()`. The median is the middle value of all numbers added so far, or the average of the two middle values if there is an even count.

**The idea.** Split the numbers into a smaller half and a larger half. Keep the smaller half in a max-heap (so its largest is at the front) and the larger half in a min-heap (so its smallest is at the front). Keep the halves the same size, or let one have one extra. Then the median is always at the front of one or both heaps.

Adding 5, 15, 1, 3:

| Add | Goes to | Rebalance? | Smaller half | Larger half | Median |
|---|---|---|---|---|---|
| 5 | smaller | | 5 | | 5 |
| 15 | smaller (larger half is empty) | smaller has 2 more: move 15 | 5 | 15 | (5 + 15) / 2 = 10 |
| 1 | smaller (1 < 15) | | 1 5 | 15 | 5 |
| 3 | smaller (3 < 15) | smaller has 2 more: move 5 | 1 3 | 5 15 | (3 + 5) / 2 = 4 |

```python
import heapq

class MedianFinder:
    def __init__(self):
        self.small = []                          # max-heap (negated): the smaller half
        self.large = []                          # min-heap: the larger half

    def addNum(self, num):
        if self.large and num > self.large[0]:
            heapq.heappush(self.large, num)
        else:
            heapq.heappush(self.small, -num)
        # keep the sizes within one of each other
        if len(self.small) > len(self.large) + 1:
            heapq.heappush(self.large, -heapq.heappop(self.small))
        if len(self.large) > len(self.small) + 1:
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def findMedian(self):
        if len(self.small) > len(self.large):
            return -self.small[0]
        if len(self.large) > len(self.small):
            return self.large[0]
        return (-self.small[0] + self.large[0]) / 2
```

### Worked example 4: Kth Largest Element in an Array (LeetCode 215), three ways

**Problem.** Return the `k`-th largest element of a list (not the `k`-th distinct one). `[3, 2, 1, 5, 6, 4]` with `k = 2` gives 5.

```python
import heapq, random

def kth_largest_sort(nums, k):                   # O(n log n); simplest
    return sorted(nums)[-k]

def kth_largest_heap(nums, k):                   # O(n log k); also works on a stream
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]

def kth_largest_quickselect(nums, k):            # O(n) on average
    target = len(nums) - k                       # its position if the list were sorted ascending
    lo, hi = 0, len(nums) - 1
    while True:
        pivot = nums[random.randint(lo, hi)]
        # rearrange nums[lo..hi] into three parts: < pivot, == pivot, > pivot
        lt, i, gt = lo, lo, hi
        while i <= gt:
            if nums[i] < pivot:
                nums[lt], nums[i] = nums[i], nums[lt]
                lt += 1
                i += 1
            elif nums[i] > pivot:
                nums[gt], nums[i] = nums[i], nums[gt]
                gt -= 1                          # don't advance i: the swapped-in value is unchecked
            else:
                i += 1
        if target < lt:
            hi = lt - 1                          # the answer is among the smaller values
        elif target > gt:
            lo = gt + 1                          # the answer is among the larger values
        else:
            return pivot                         # the answer's position holds a pivot value
```

**Quickselect** picks a random value, splits the list around it, and then only continues in the part that contains the target position, discarding the rest. On average each round throws away about half, so the total work is about n + n/2 + n/4 + ... ≈ 2n. It is covered on Card 31. Knowing all three versions, and when each is best, is a common interview conversation.

### Where else it shows up

- **K Closest Points to Origin (973).** *Return the `k` points nearest to (0, 0).* Keep the best `k` by distance. To keep the *smallest* distances in a min-heap you would evict the wrong end, so push `(-distance, point)` and pop when the size exceeds `k`.
- **Merge K Sorted Lists (23).** *Merge `k` sorted linked lists into one.* Put the first node of each list in a heap; pop the smallest, attach it, push that node's successor. Card 15.
- **Task Scheduler (621).** *Same-letter tasks need `n` idle slots between them; minimize the total time.* A max-heap of remaining counts plus a queue of tasks cooling down (or the formula in P7).
- **Design Twitter (355).** *Return the 10 most recent tweets from a user and everyone they follow.* Each person's tweets are already in time order, so this is a merge of sorted lists, stopped after 10.
- **Top K Frequent Elements (347).** Count with a dictionary (P1), then keep the `k` most frequent in a heap, or use the bucket list from P1.
- **Minimum Interval to Include Each Query (1851)** and **Meeting Rooms II (253).** Heaps of active intervals, P9.
- **Network Delay Time (743), Swim in Rising Water (778), Min Cost to Connect All Points (1584).** A heap of "the cheapest place to go next", P15.

**Beyond the list:** reorganize a string so no two neighbors match, ugly numbers, sliding window median, the skyline problem, minimum cost to hire `k` workers.

### Common mistakes

- **Using a max-heap for "the k largest".** It is a min-heap of size `k`: you need quick access to the smallest of your kept items, because that is the one you evict.
- **Comparing things that can't be compared.** Heap entries are tuples compared item by item. If two entries tie on the first value, Python compares the second, and it will crash on objects like list nodes. Put a unique number (such as an index) second: `(value, i, node)`.
- **Forgetting to negate back.** With negated values, every read needs a minus sign.
- **Choosing the wrong tool for kth-largest.** Sort if you need the top `k` in order; a heap for a stream or small `k`; quickselect for one answer from a fixed list.

---

# MOVE 4 — DECOMPOSE
*"The answer for the whole is defined by the answers for its parts."*

Recursion is the natural tool when the input is built from smaller copies of itself (trees), when the problem says "list every possible ..." (each choice leads to more choices), or when a big problem splits into independent smaller ones. Dynamic programming (P3) is recursion where the smaller problems *repeat*; the two principles here are recursion where they do not.

---

## P11. Tree recursion: decide what each node reports up, and what it passes down

**In one sentence.** Solve a tree problem by writing a function for one node that asks its two children for their answers, combines them, and returns what its own parent needs; anything a node needs to know about its ancestors is passed down as an argument.

### Trees in Python, briefly

A binary tree is made of nodes. Each node has a value and up to two children, `left` and `right`. A missing child is `None`.

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

LeetCode writes trees level by level, left to right, with `null` for missing children. `[1, 2, 3, 4, 5]` means:

```
        1
       / \
      2   3
     / \
    4   5
```

Because each child is itself the top of a smaller tree, a function on trees is naturally recursive: handle `None`, call yourself on the two children, combine.

### Start with a problem

**Diameter of Binary Tree (LeetCode 543).** Return the length of the longest path between any two nodes, measured in edges (the lines between nodes). The path does not have to pass through the root.

```
root = [1, 2, 3, 4, 5]      (the tree drawn above)
answer: 3                   the path 4 → 2 → 1 → 3 (or 5 → 2 → 1 → 3) has 3 edges
```

**The slow way.** The longest path that bends at a given node goes down the deepest route on its left and the deepest route on its right. So its length is the left subtree's height plus the right subtree's height. Compute that at every node and take the largest:

```python
def height(node):                        # number of nodes on the longest downward path
    if not node:
        return 0
    return 1 + max(height(node.left), height(node.right))

def diameter(node):
    if not node:
        return 0
    through_here = height(node.left) + height(node.right)
    return max(through_here, diameter(node.left), diameter(node.right))
```

Every call to `height` walks the whole subtree below it, and `diameter` calls `height` at every node. For a tree shaped like a long chain, that is O(n²).

**Where the time goes.** The height of node 2's subtree is computed when handling node 2, and then computed *again* as part of the height of node 1's subtree, and so on up the tree. Each node's height is recomputed once for every ancestor it has.

But look at what the two functions need. `diameter` at a node needs its children's heights. `height` at a node also needs its children's heights. So one walk can do both: each node asks its children for their heights, uses them to check the path that bends here, and then reports its own height upward.

**The fix.** Write one recursive function that **returns the height** (what the parent needs) and, as a side effect, **updates a running best** with the path through the current node (the actual answer).

The function finishes the children before the parent, so the nodes complete in this order: 4, 5, 2, 3, 1.

| Node | Height of left child | Height of right child | Path bending here (left + right) | Best so far | Returns (1 + the taller side) |
|---|---|---|---|---|---|
| 4 | 0 | 0 | 0 | 0 | 1 |
| 5 | 0 | 0 | 0 | 0 | 1 |
| 2 | 1 | 1 | 2 | 2 | 2 |
| 3 | 0 | 0 | 0 | 2 | 1 |
| 1 | 2 | 1 | 3 | **3** | 3 |

```python
def diameterOfBinaryTree(root):
    best = 0
    def height(node):
        nonlocal best                          # we assign to best, which lives outside this function
        if not node:
            return 0
        left = height(node.left)
        right = height(node.right)
        best = max(best, left + right)         # the answer: longest path bending at this node
        return 1 + max(left, right)            # what the parent needs: this subtree's height
    height(root)
    return best
```

Every node is visited once: O(n).

**Why does `left + right` count edges?** `height` counts nodes on a downward path. A path from the deepest node on the left, up to this node, and down to the deepest on the right, uses `left` edges on one side and `right` on the other.

### What stays true (the invariant)

**"When `height(node)` returns, that node's whole subtree has been fully handled, and the returned value is exactly what the parent needs from it."**

So before writing any tree function, decide two things:

1. **What does each call return to its parent?** Here, the height.
2. **Is the overall answer the same thing?** If not (here, the answer is a path length, not a height), keep the answer in a separate variable and update it along the way.

### How to recognize it

- Almost every binary tree problem: depth, balance, paths, comparing two trees, inverting, building from traversals, turning into text and back.
- The answer at a node depends on its **descendants** (height, subtree sum): compute bottom-up, as above, with results *returned* upward.
- The answer at a node depends on its **ancestors** (the allowed range in a search tree, the largest value on the path so far): pass that information *down* as arguments.
- "Level by level", "what you see from the right side": use a queue (worked example 4).

### Worked example 2: passing information down (Validate Binary Search Tree, LeetCode 98)

**Problem.** A *binary search tree* (BST) is a tree where, for every node, every value in its left subtree is smaller and every value in its right subtree is larger. Return whether a given tree is a valid BST.

```
        5
       / \
      1   6
         / \
        3   7

answer: False       3 is in 5's right subtree but is smaller than 5
```

**The trap.** Checking only each node against its parent passes this tree: 1 < 5, 6 > 5, 3 < 6, 7 > 6. But 3 breaks the rule relative to its *grandparent*.

**The fix.** Every node must lie inside a range set by all its ancestors. Going left, the upper limit becomes the parent's value. Going right, the lower limit becomes the parent's value. Pass the range down:

| Node | Allowed range (from ancestors) | Inside the range? |
|---|---|---|
| 5 | (−∞, ∞) | yes |
| 1 | (−∞, 5) | yes |
| 6 | (5, ∞) | yes |
| 3 | (5, 6) | **no**: return False |

```python
def isValidBST(root):
    def valid(node, low, high):                  # every value here must be strictly between low and high
        if not node:
            return True
        if not (low < node.val < high):
            return False
        return (valid(node.left, low, node.val) and      # left side: upper limit tightens
                valid(node.right, node.val, high))       # right side: lower limit tightens
    return valid(root, float("-inf"), float("inf"))
```

### Worked example 3: when the best path can have negative values (Binary Tree Maximum Path Sum, LeetCode 124)

**Problem.** Node values may be negative. A path is any chain of connected nodes (at least one). Return the largest sum of values along any path.

It is the diameter skeleton with values instead of edge counts, plus one change: if a child's best downward sum is negative, don't use it (treat it as 0).

```python
def maxPathSum(root):
    best = root.val                              # not 0: an all-negative tree must return its largest node
    def gain(node):                              # best sum of a path going down from node
        nonlocal best
        if not node:
            return 0
        left = max(gain(node.left), 0)           # a negative branch is better left out
        right = max(gain(node.right), 0)
        best = max(best, node.val + left + right)
        return node.val + max(left, right)       # the parent can only extend one side
    gain(root)
    return best
```

### Worked example 4: level by level (Binary Tree Level Order Traversal, LeetCode 102)

**Problem.** Return the values level by level, left to right, as a list of lists.

```
      3
     / \
    9  20
       / \
      15  7

answer: [[3], [9, 20], [15, 7]]
```

**The idea.** Use a queue (`collections.deque`): take nodes from the front, add their children to the back. To know where one level ends, note the queue's length *before* processing a level. Exactly that many nodes belong to it.

| Queue at the start of the level | Nodes taken (this level) | Children added |
|---|---|---|
| 3 | 3 | 9, 20 |
| 9, 20 | 9, 20 | 15, 7 |
| 15, 7 | 15, 7 | none |

```python
from collections import deque

def levelOrder(root):
    result = []
    queue = deque([root] if root else [])
    while queue:
        level = []
        for _ in range(len(queue)):              # exactly the nodes of this level
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result
```

This is breadth-first search (BFS), which P13 uses on graphs.

### Where else it shows up

- **Invert Binary Tree (226).** *Mirror the tree.* Swap each node's children, then invert both.
- **Maximum Depth of Binary Tree (104).** *Count the nodes on the longest root-to-leaf path.* `1 + max(depth(left), depth(right))`.
- **Balanced Binary Tree (110).** *Is every node's left and right height within 1 of each other?* Return both "balanced?" and "height" from each call (a tuple), exactly like Diameter.
- **Same Tree (100).** *Are two trees identical?* Recurse on both in lockstep: same value, same left, same right.
- **Subtree of Another Tree (572).** *Does tree `s` contain `t` as an exact subtree?* At each node of `s`, run Same Tree against `t`.
- **Lowest Common Ancestor of a BST (235).** *The deepest node with both `p` and `q` beneath it (a node counts as beneath itself).* If both values are smaller than the current node, go left; if both are larger, go right; otherwise you are at the split, which is the answer.
- **Binary Tree Right Side View (199).** *The values you'd see looking from the right.* Level order, keeping the last node of each level.
- **Count Good Nodes in Binary Tree (1448).** *Count nodes with no larger value on the path from the root.* Pass the largest value seen so far down.
- **Kth Smallest Element in a BST (230).** *Return the `k`-th smallest value.* Visiting left subtree, node, right subtree ("in-order") visits a BST's values in sorted order; stop at the `k`-th. The loop version is on Card 30.
- **Construct Binary Tree from Preorder and Inorder Traversal (105).** *Rebuild the tree from two visit orders.* The first value of the preorder list is the root; its position in the inorder list splits the rest into left and right subtrees. A dictionary from value to inorder position (P1) makes each split O(1).
- **Serialize and Deserialize Binary Tree (297).** *Turn a tree into a string and back.* Write values in preorder with an explicit marker (such as `"N"`) for every missing child, so the shape can be rebuilt exactly.
- **Merge K Sorted Lists (23)** and **Pow(x, n) (50)** use the same "split in half, solve each half, combine" recursion on lists and numbers.

**Beyond the list:** symmetric tree, path sum, house robber on a tree (return a pair: best with and without this node), flatten a tree to a list, lowest common ancestor in an ordinary tree.

### Common mistakes

- **Not deciding the return value first.** Write down what each call returns before coding. A tuple like `(is_balanced, height)` is fine.
- **Forgetting `nonlocal`.** Assigning `best = ...` inside the inner function without `nonlocal best` creates a new local variable, and the outer `best` never changes.
- **Checking only against the parent.** Search-tree rules involve all ancestors; pass a range down.
- **Recursion depth.** Python allows about 1,000 nested calls. A tree shaped like a chain of 10,000 nodes needs a loop with an explicit stack (Card 30).

---

## P12. Backtracking: build answers one choice at a time, undo, and try the next choice

**In one sentence.** To produce *all* the subsets, combinations, arrangements or placements that satisfy some rule, make one decision at a time with recursion: make a choice, recurse to make the rest, undo the choice, try the next option, and give up on a branch the moment it can no longer lead to a valid answer.

### Start with a problem

**Subsets (LeetCode 78).** Given a list of distinct numbers, return every possible subset (including the empty one and the full list).

```
nums = [1, 2, 3]
answer: [[1, 2, 3], [1, 2], [1, 3], [1], [2, 3], [2], [3], []]     (any order)
```

**The slow way that doesn't work.** For three numbers you could write three nested loops, each deciding "in or out". But the number of loops would have to equal the length of the list, which you don't know when you write the code.

**What makes this different.** There are 2ⁿ subsets, and you have to output all of them, so no solution can be faster than about 2ⁿ. The goal here isn't to beat that. It is to (a) generate every answer exactly once, (b) not waste time on partial answers that can't be completed, and (c) not copy lists more than necessary.

**The fix.** Replace the unknown number of nested loops with recursion. Each level of recursion makes one decision: "is `nums[i]` in the subset or not?"

1. Keep one shared list, `path`, holding the choices made so far.
2. At level `i`, first **choose** to include `nums[i]`: append it and recurse to level `i + 1`.
3. Then **undo** that choice (pop it) and recurse to level `i + 1` again, this time without it.
4. When `i` reaches the end of the list, `path` is a complete subset: save a copy.

The decisions form a tree. Here are the leaves in the order the code reaches them:

| Decision for 1 | Decision for 2 | Decision for 3 | `path` at the leaf (saved) |
|---|---|---|---|
| in | in | in | [1, 2, 3] |
| in | in | out | [1, 2] |
| in | out | in | [1, 3] |
| in | out | out | [1] |
| out | in | in | [2, 3] |
| out | in | out | [2] |
| out | out | in | [3] |
| out | out | out | [] |

```python
def subsets(nums):
    result = []
    path = []                                    # the choices made so far
    def decide(i):
        if i == len(nums):
            result.append(path.copy())           # a complete subset; copy it, path will keep changing
            return
        path.append(nums[i])                     # choose: include nums[i]
        decide(i + 1)
        path.pop()                               # undo
        decide(i + 1)                            # the other choice: leave nums[i] out
    decide(0)
    return result
```

**Why `path.copy()`?** There is only one `path` list, and it keeps changing as the recursion continues. Appending `path` itself would store the same list eight times, and it would be empty by the end.

### What stays true (the invariant)

**"`path` holds exactly the choices made on the way from the start to the current call, and everything in `result` is a complete, valid answer."**

The "undo" step is what keeps the first half true: when a call returns, `path` is exactly as it was when the call began.

### How to recognize it

- "Return **all** ..." subsets, combinations, permutations, ways to split a string, valid arrangements, board placements.
- The input is tiny (n up to about 10–20), because the output itself is exponential.
- Each step has a few options, and some options can be ruled out immediately (a queen under attack, a sum already too big, a piece that isn't a palindrome).

### Cutting branches early: Combination Sum (LeetCode 39)

**Problem.** Given distinct positive numbers and a target, return every combination that adds up to the target. Each number may be used any number of times. `[2, 2, 3]` and `[2, 3, 2]` count as the same combination.

```
candidates = [2, 3, 6, 7]    target = 7
answer: [[2, 2, 3], [7]]
```

**The decision at each step.** "Use `candidates[i]` (again), or move on to the next candidate?" Moving on is permanent: once we pass a candidate we never go back to it, which is what stops `[2, 3, 2]` from being generated after `[2, 2, 3]`.

**Pruning.** If the running total goes over the target, no amount of adding more positive numbers will fix it, so return immediately. Without this check, the recursion would keep adding numbers forever.

```python
def combinationSum(candidates, target):
    result = []
    path = []
    def build(i, total):
        if total == target:
            result.append(path.copy())
            return
        if i == len(candidates) or total > target:
            return                               # out of candidates, or already too big: dead end
        path.append(candidates[i])               # choose: use candidates[i]
        build(i, total + candidates[i])          # stay on i, so it can be used again
        path.pop()                               # undo
        build(i + 1, total)                      # move on without it, for good
    build(0, 0)
    return result
```

The index you recurse with controls reuse: `build(i, ...)` allows the same number again; `build(i + 1, ...)` does not.

### Avoiding duplicate answers when the input has duplicates

**Subsets II (90).** *Same as Subsets, but the list may contain repeated numbers, and the output must not contain repeated subsets.* For `[1, 2, 2]` the answer is `[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]`.

Sort the list so equal values sit together. Then, at any one decision point, only try the *first* of a run of equal values as "the next element to add". Choosing the second `2` there would produce exactly the same subsets as choosing the first.

```python
def subsetsWithDup(nums):
    nums.sort()
    result, path = [], []
    def build(start):
        result.append(path.copy())               # every partial path is itself a valid subset
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue                         # same value as the option just tried at this level
            path.append(nums[i])
            build(i + 1)
            path.pop()
    build(0)
    return result
```

The check is `i > start`, not `i > 0`: skipping is only about repeats *at the same level*. Using the second `2` *after* the first (to build `[2, 2]`) is still allowed.

### Worked example 2: placing pieces with conflict checks (N-Queens, LeetCode 51)

**Problem.** Place `n` queens on an `n × n` chessboard so that no two share a row, column or diagonal. Return every such board.

**The decisions.** Put exactly one queen in each row, one row per level of recursion. For the current row, try each column.

**Fast conflict checks.** Keep three sets: the columns in use, and the two diagonal directions in use. Every square on the same "↘" diagonal has the same `row − col`, and every square on the same "↙" diagonal has the same `row + col`. So a square is safe exactly when its column, `row − col` and `row + col` are all unused.

```python
def solveNQueens(n):
    result = []
    board = [["."] * n for _ in range(n)]
    cols, diag1, diag2 = set(), set(), set()     # diag1: row - col, diag2: row + col
    def place(row):
        if row == n:
            result.append(["".join(r) for r in board])
            return
        for col in range(n):
            if col in cols or row - col in diag1 or row + col in diag2:
                continue                         # attacked: skip this square
            cols.add(col); diag1.add(row - col); diag2.add(row + col)
            board[row][col] = "Q"
            place(row + 1)
            cols.remove(col); diag1.remove(row - col); diag2.remove(row + col)   # undo
            board[row][col] = "."
    place(0)
    return result
```

### Four shapes the decisions take

| At each level you decide ... | How the code looks | Problems |
|---|---|---|
| in or out, for one element | two recursive calls | Subsets 78, Target Sum 494 (`+` or `−`) |
| which element comes next, from the ones after the last pick | a loop starting at `start` | Combination Sum 39 / II 40, Subsets II 90, Palindrome Partitioning 131 |
| which unused element comes next | a loop over everything, skipping used ones | Permutations 46, N-Queens 51 (one column per row) |
| one option for this position | a loop over that position's options | Letter Combinations 17, Generate Parentheses 22 |

### Where else it shows up

- **Permutations (46).** *Return every ordering of a list of distinct numbers.* Loop over all numbers, skip ones already used (track with a set or a boolean list), choose, recurse, undo.
- **Combination Sum II (40).** *Like Combination Sum, but each number may be used once and the input has repeats.* Sort, recurse with `i + 1`, and skip repeats at the same level as in Subsets II.
- **Word Search (79).** *Can the word be traced through neighboring grid cells, using each cell at most once?* From each cell, walk to neighbors matching the next letter. Mark a cell as used before exploring from it and unmark it when backing out.
  ```python
  def exist(board, word):
      R, C = len(board), len(board[0])
      def walk(r, c, i):                       # can word[i:] be traced starting at (r, c)?
          if i == len(word):
              return True
          if not (0 <= r < R and 0 <= c < C) or board[r][c] != word[i]:
              return False
          board[r][c] = "#"                    # mark as used on this path
          found = any(walk(r + dr, c + dc, i + 1) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))
          board[r][c] = word[i]                # undo
          return found
      return any(walk(r, c, 0) for r in range(R) for c in range(C))
  ```
- **Palindrome Partitioning (131).** *Split a string into pieces that are all palindromes; return every such split.* Choose where the next piece ends; only recurse if that piece is a palindrome.
- **Letter Combinations of a Phone Number (17).** *Return every string that digits like `"23"` could spell on a phone keypad.* One level per digit, one option per letter on that key.
- **Generate Parentheses (22).** *Return every valid string of `n` pairs of brackets.* Add `(` if fewer than `n` have been opened; add `)` only if it would close an open one.
  ```python
  def generateParenthesis(n):
      result, path = [], []
      def build(opened, closed):
          if len(path) == 2 * n:
              result.append("".join(path))
              return
          if opened < n:
              path.append("("); build(opened + 1, closed); path.pop()
          if closed < opened:
              path.append(")"); build(opened, closed + 1); path.pop()
      build(0, 0)
      return result
  ```
- **Word Search II (212).** *Find every dictionary word that can be traced on the board.* Word Search, guided by a trie (P1) so a path stops as soon as no word starts with it.
- **Target Sum (494).** Two choices per number (`+` or `−`). As a plain backtracking search it is 2ⁿ; P18 shows how to make it fast.

**Beyond the list:** Sudoku solver, restoring IP addresses, "expression add operators", Word Break II, splitting into `k` equal-sum groups.

### Common mistakes

- **Saving `path` instead of a copy.** Always `path.copy()` (or `path[:]`) when saving an answer.
- **Forgetting to undo.** Every change made before a recursive call must be reversed after it: the `pop`, the set removal, the board reset.
- **Skipping duplicates across levels.** The duplicate check is `i > start`, so it only applies among the options at one level.
- **Needing a count, not a list.** If you only need how many answers exist (or the best one), and the same situation recurs, add memoization and it becomes DP (P3).

---

# MOVE 5 — MODEL AS A GRAPH
*"There are things, and connections between things."*

Half the difficulty of graph problems is noticing that there is a graph: a grid where each cell is connected to the cells beside it, words that differ by one letter, courses with prerequisites, a list where each value points to another position. Once you see the graph, the question tells you how to explore it: *what can I reach, or how many separate groups are there* (P13), *the fewest steps* (P13, breadth-first), *what order satisfies these dependencies* (P14), *which items are in the same group as connections arrive* (P14, Union-Find), *the cheapest route when connections have costs* (P15), *the cheapest way to connect everything* (P15).

---

## P13. Graph search: spot the "things" and "connections", then visit each thing once

**In one sentence.** Many problems are secretly about things connected to other things (grid cells to their neighbors, words to words one letter apart); once you see that, explore outward from a starting point, keeping a record of what you have already visited, and use depth-first search (DFS) to cover a whole connected region or breadth-first search (BFS) when you need the fewest steps.

A **graph** is just a set of things (called *nodes*) and connections between pairs of them (called *edges*). The graph is rarely given to you as such. In a grid, the nodes are cells and the edges join each cell to the cells above, below, left and right.

### Start with a problem

**Number of Islands (LeetCode 200).** A grid holds `"1"` for land and `"0"` for water. An island is a group of land cells connected up, down, left or right (not diagonally). Count the islands.

```
grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"],
]
answer: 3
```

**The slow way.** Counting land cells is easy; the hard part is knowing which cells belong to the *same* island. A naive approach checks, for each new land cell, whether it can reach any land cell already counted, searching the grid each time. For an `R × C` grid that is roughly (R·C)² work.

**Where the time goes.** The same cells get searched over and over, once for every land cell that asks about them. But "which island is this cell on?" has the same answer for every cell of an island. If we explored each island *once*, as soon as we first touch it, we could mark all of its cells and never think about them again.

**The fix.** Scan the grid. When you find a land cell that hasn't been visited:

1. It must belong to a new island. Add 1 to the count.
2. **Flood** the whole island from that cell: mark it visited, then do the same to each neighboring land cell, and their neighbors, and so on, until the island is used up.
3. Continue the scan. Every other cell of that island is already marked, so it won't be counted again.

The simplest way to mark a cell visited is to overwrite it with `"0"` ("sink" it).

| Scan reaches | Land and not yet sunk? | Islands | Cells sunk by the flood |
|---|---|---|---|
| (0, 0) | yes | 1 | (0, 0), (1, 0), (1, 1), (0, 1) |
| (0, 1), (1, 0), (1, 1) | no, already sunk | 1 | |
| (2, 2) | yes | 2 | (2, 2) |
| (3, 3) | yes | 3 | (3, 3), (3, 4) |
| (3, 4) | no, already sunk | **3** | |

```python
def numIslands(grid):
    rows, cols = len(grid), len(grid[0])
    def sink(r, c):                              # flood the island containing (r, c)
        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] != "1":
            return                               # off the grid, water, or already sunk
        grid[r][c] = "0"                         # mark visited before exploring further
        sink(r + 1, c)
        sink(r - 1, c)
        sink(r, c + 1)
        sink(r, c - 1)
    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                islands += 1                     # an untouched land cell: a new island
                sink(r, c)
    return islands
```

Each cell is sunk at most once, and each sinking checks four neighbors: O(R × C).

This way of exploring (go as deep as possible along one route before backing up) is **depth-first search**, or DFS.

### What stays true (the invariant)

**"Every cell I have marked has already been counted as part of an island, and every cell of an island I've counted is marked."**

This is why the scan can safely skip marked cells. For a graph search in general: **mark a node the moment you first reach it**, and never process a marked node again.

### How to recognize it

- A grid with "connected", "islands", "regions", "spreads", "flows", "surrounded".
- "The fewest steps / moves / transformations" to get from one state to another: BFS (below).
- Something spreading from **several** starting points at once ("rotting oranges", "distance to the nearest gate"): BFS with all the starting points in the queue at the beginning.
- "Which cells can reach the border / the ocean?": search *from* the border instead of from every cell (worked example 3).
- Copying a structure whose nodes point at each other.

### Worked example 2: fewest steps with BFS (Rotting Oranges, LeetCode 994)

**Problem.** In a grid, 0 is empty, 1 is a fresh orange and 2 is a rotten orange. Every minute, each rotten orange rots the fresh oranges directly next to it (up, down, left, right). Return the minutes until no fresh orange is left, or −1 if some can never rot.

```
grid = [[2, 1, 1],
        [1, 1, 0],
        [0, 1, 1]]
answer: 4
```

**Why not DFS?** DFS runs down one long route first, so it reaches cells in an order unrelated to how far away they are. Here we need to process the grid in "waves": everything one minute away, then everything two minutes away, and so on.

**Breadth-first search (BFS)** does exactly that. Keep a queue. Start it with every rotten orange (all of them rot their neighbors at the same time). Then repeatedly take one whole wave out of the queue, and put the oranges it rots into the queue as the next wave.

| Minute | Oranges rotting this minute (the new wave) | Fresh left |
|---|---|---|
| 0 | (0, 0) is already rotten | 6 |
| 1 | (0, 1), (1, 0) | 4 |
| 2 | (0, 2), (1, 1) | 2 |
| 3 | (2, 1) | 1 |
| 4 | (2, 2) | **0** → answer 4 |

```python
from collections import deque

def orangesRotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))             # every rotten orange starts at minute 0
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while queue and fresh > 0:
        for _ in range(len(queue)):              # exactly the oranges that rotted last minute
            r, c = queue.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2             # mark it now, so no one else adds it again
                    fresh -= 1
                    queue.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1
```

**What stays true in BFS:** at the start of each round of the outer loop, the queue holds exactly the cells that are that many steps from the start. That is why BFS finds the **fewest steps** in any graph where every step costs the same.

### Worked example 3: searching backward from the goal (Pacific Atlantic Water Flow, LeetCode 417)

**Problem.** `heights` is a grid of land heights. The Pacific Ocean touches the top and left edges; the Atlantic touches the bottom and right edges. Rain flows from a cell to a neighbor of equal or lower height. Return every cell from which water can reach *both* oceans.

**The slow way** runs a search from every cell to see which oceans it reaches: one search per cell, so roughly (R·C)².

**The flip.** Instead, start at the ocean and walk *uphill* (to neighbors of equal or greater height). Every cell you reach is one that could drain down to that ocean. Do this once from the Pacific edges and once from the Atlantic edges, then return the cells reached by both. Two searches in total.

```python
def pacificAtlantic(heights):
    rows, cols = len(heights), len(heights[0])
    pacific, atlantic = set(), set()
    def climb(r, c, reached, prev_height):
        if ((r, c) in reached or not (0 <= r < rows and 0 <= c < cols)
                or heights[r][c] < prev_height):
            return                               # visited, off the grid, or downhill from here
        reached.add((r, c))
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            climb(nr, nc, reached, heights[r][c])
    for c in range(cols):
        climb(0, c, pacific, heights[0][c])                  # top edge
        climb(rows - 1, c, atlantic, heights[rows - 1][c])   # bottom edge
    for r in range(rows):
        climb(r, 0, pacific, heights[r][0])                  # left edge
        climb(r, cols - 1, atlantic, heights[r][cols - 1])   # right edge
    return [[r, c] for r in range(rows) for c in range(cols)
            if (r, c) in pacific and (r, c) in atlantic]
```

### Where else it shows up

- **Max Area of Island (695).** *The size of the largest island.* Number of Islands, with the flood returning how many cells it sank.
- **Surrounded Regions (130).** *Capture every region of `"O"` not connected to the border by flipping it to `"X"`.* Flood from every border `"O"` first to mark the safe ones; flip the rest.
- **Walls and Gates (286).** *Fill each empty room with its distance to the nearest gate.* BFS starting from every gate at once, like Rotting Oranges.
- **Clone Graph (133).** *Return a deep copy of a connected graph.* DFS or BFS, with a dictionary from each original node to its copy (P1) doubling as the visited record.
- **Word Ladder (127).** *Change `beginWord` into `endWord` one letter at a time, each step being a word in the list. Return the fewest words in the sequence.* The words are nodes; two are connected if they differ by one letter. BFS gives the fewest steps. To find neighbors fast, group words by patterns like `h*t` (P1).
  ```python
  from collections import defaultdict, deque

  def ladderLength(beginWord, endWord, wordList):
      if endWord not in wordList:
          return 0
      by_pattern = defaultdict(list)          # "h*t" -> every word matching it
      for w in wordList + [beginWord]:
          for i in range(len(w)):
              by_pattern[w[:i] + "*" + w[i + 1:]].append(w)
      queue, seen, length = deque([beginWord]), {beginWord}, 1
      while queue:
          for _ in range(len(queue)):
              w = queue.popleft()
              if w == endWord:
                  return length
              for i in range(len(w)):
                  for nxt in by_pattern[w[:i] + "*" + w[i + 1:]]:
                      if nxt not in seen:
                          seen.add(nxt)
                          queue.append(nxt)
          length += 1
      return 0
  ```
- **Graph Valid Tree (261).** *Do these `n` nodes and edges form a tree?* A tree has exactly `n − 1` edges and every node is reachable from node 0. See P14.
- **Longest Increasing Path in a Matrix (329).** *The longest path moving to strictly larger neighbors.* DFS from each cell with a memo (P3). No visited check is needed, because a strictly increasing path can never loop back.
- **Word Search (79), Word Search II (212).** Grid DFS that un-marks cells when backing out. P12.
- **Binary Tree Level Order (102), Right Side View (199).** BFS on a tree. P11.
- **Jump Game II (45).** BFS in disguise: each "window" of positions is one wave. P7.
- **Reconstruct Itinerary (332).** A DFS that uses up edges. "Tricks that genuinely must be memorized".

**Beyond the list:** flood fill, distance to the nearest 0 in a grid, shortest path in a binary grid, "open the lock", knight moves, keys and rooms, checking whether a graph can be split into two groups with no edges inside a group.

### Common mistakes

- **Marking too late.** In BFS, mark a node when you *add it to the queue*, not when you take it out. Otherwise the same node is added many times.
- **Using DFS for "fewest steps".** DFS finds *a* path, not the shortest. Use BFS.
- **Recursion limits on big grids.** A 300 × 300 grid of all land makes the recursive flood 90,000 calls deep, far past Python's limit of about 1,000. Use a loop with an explicit stack (Card 30) or BFS.
- **Building neighbors the slow way.** In Word Ladder, comparing every pair of words is O(n²); grouping by wildcard pattern is much faster.

---

## P14. Dependencies and groups: order things that must come first, and merge things that belong together

**In one sentence.** When items depend on other items ("take A before B"), repeatedly take any item whose requirements are all met (a *topological sort*), and a cycle shows up as items that can never be taken; when you only need to know which items end up in the same group, merge groups as connections arrive with a *Union-Find* structure.

### Start with a problem

**Course Schedule II (LeetCode 210).** There are `numCourses` courses, numbered from 0. Each pair `[a, b]` in `prerequisites` means you must take course `b` before course `a`. Return any order in which you can take all the courses, or an empty list if it is impossible.

```
numCourses = 4
prerequisites = [[1, 0], [2, 0], [3, 1], [3, 2]]
answer: [0, 1, 2, 3]       (or [0, 2, 1, 3])
```

Draw the prerequisites as arrows from "must come first" to "comes after":

```
    0 ──► 1
    │     │
    ▼     ▼
    2 ──► 3
```

**The slow way.** Repeatedly scan every course, looking for one you haven't taken whose prerequisites are all taken. Take it and scan again. Each scan looks at every course and its prerequisites, and you do one scan per course: roughly O(n × (n + number of prerequisites)).

**Where the time goes.** Each scan re-checks courses whose situation hasn't changed. A course only becomes available at the moment its *last* missing prerequisite is taken. So we don't need to re-check everything; we only need to update the courses that directly depend on the one we just took.

**The fix (Kahn's algorithm).**

1. For every course, count its prerequisites not yet taken. Call this its **in-degree** (the number of arrows pointing into it).
2. Put every course with a count of 0 in a queue. These can be taken now.
3. Take a course from the queue and add it to the order. For each course that depends on it, subtract 1 from that course's count. If a count reaches 0, that course is now available: add it to the queue.
4. When the queue is empty, if every course is in the order, return it. If some are missing, they are stuck in a cycle (A needs B, B needs A), and it is impossible.

Here is that process on the example:

| Take | Courses that depend on it | Counts after (courses 0 to 3) | Newly available | Order so far |
|---|---|---|---|---|
| *(start)* | | 0, 1, 1, 2 | 0 | |
| 0 | 1, 2 | 0, **0**, **0**, 2 | 1, 2 | 0 |
| 1 | 3 | 0, 0, 0, 1 | | 0, 1 |
| 2 | 3 | 0, 0, 0, **0** | 3 | 0, 1, 2 |
| 3 | none | | | 0, 1, 2, 3 |

All four courses made it, so `[0, 1, 2, 3]` is valid.

With a cycle, say `[[0, 1], [1, 0]]`, both courses start with a count of 1. Nothing ever reaches 0, the queue starts empty, and the order ends up with 0 of 2 courses: impossible.

```python
from collections import deque

def findOrder(numCourses, prerequisites):
    unlocks = [[] for _ in range(numCourses)]    # unlocks[b] = courses that need b first
    missing = [0] * numCourses                   # prerequisites not yet taken, per course
    for course, pre in prerequisites:
        unlocks[pre].append(course)
        missing[course] += 1
    queue = deque(c for c in range(numCourses) if missing[c] == 0)
    order = []
    while queue:
        c = queue.popleft()
        order.append(c)
        for nxt in unlocks[c]:
            missing[nxt] -= 1
            if missing[nxt] == 0:
                queue.append(nxt)                # its last prerequisite was just taken
    return order if len(order) == numCourses else []   # anything missing is stuck in a cycle
```

Each course is added to the queue once and each prerequisite pair is looked at once: O(courses + prerequisites).

### What stays true (the invariant)

**"Every course in `order` comes after all of its prerequisites, and the queue holds exactly the untaken courses whose prerequisites are all taken."**

A course in a cycle can never have its count reach 0, because it waits for something that waits for it. That is why "not everything got taken" means "there is a cycle".

### How to recognize it

- "Prerequisites", "must come before", "build order", "dependencies", "is it possible to finish all ...".
- An order has to be *derived* from comparisons, as in Alien Dictionary.
- Undirected connections plus "how many separate groups", "is this a tree", "which connection is redundant", "merge accounts that share an email": Union-Find (below).

### The recursive version (DFS)

The same problem can be solved with depth-first search. To place a course, first place all its prerequisites (recursively), then add the course. A course that is "in progress" (on the current chain of recursive calls) and gets visited again means you have gone around a loop: a cycle.

```python
def findOrder(numCourses, prerequisites):
    needs = {c: [] for c in range(numCourses)}   # needs[c] = prerequisites of c
    for course, pre in prerequisites:
        needs[course].append(pre)
    order = []
    done = set()                                 # courses already placed in the order
    in_progress = set()                          # courses on the current chain of calls
    def place(c):
        if c in in_progress:
            return False                         # we came back around: a cycle
        if c in done:
            return True
        in_progress.add(c)
        for pre in needs[c]:
            if not place(pre):
                return False
        in_progress.remove(c)
        done.add(c)
        order.append(c)                          # every prerequisite is already in order
        return True
    for c in range(numCourses):
        if not place(c):
            return []
    return order
```

Two sets are needed: `in_progress` detects cycles, and `done` stops finished courses from being re-explored. In Python, the queue version is usually safer, because a long chain of prerequisites can exceed the recursion limit.

### Worked example 2: Union-Find (Redundant Connection, LeetCode 684)

**Problem.** A graph started as a tree (connected, no loops) on nodes 1 to `n`, and then one extra edge was added. Given the edges, return the extra edge. If several answers are possible, return the one that appears last.

```
edges = [[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]
answer: [1, 4]
```

**The idea.** Add the edges one at a time and keep track of which nodes are already connected. The first edge whose two ends are *already* connected creates a loop: that is the extra edge.

**Union-Find** keeps the groups. Each node points to a "parent" node; following parents leads to the group's **root**, which acts as the group's name. Two nodes are in the same group exactly when they have the same root.

- `find(x)`: follow parents from `x` to the root.
- `union(a, b)`: find both roots; if they differ, point one root at the other, merging the groups.

| Edge | Root of each end | Same group? | Action | Groups after |
|---|---|---|---|---|
| [1, 2] | 1, 2 | no | merge | {1, 2} {3} {4} {5} |
| [2, 3] | 1, 3 | no | merge | {1, 2, 3} {4} {5} |
| [3, 4] | 1, 4 | no | merge | {1, 2, 3, 4} {5} |
| [1, 4] | 1, 1 | **yes** | return [1, 4] | |

```python
def findRedundantConnection(edges):
    n = len(edges)
    parent = list(range(n + 1))                  # every node starts as its own group
    size = [1] * (n + 1)
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]        # shortcut: point x at its grandparent
            x = parent[x]
        return x
    def union(a, b):
        ra, rb = find(a), find(b)
        if ra == rb:
            return False                         # already connected: this edge makes a loop
        if size[ra] < size[rb]:
            ra, rb = rb, ra
        parent[rb] = ra                          # attach the smaller group under the larger
        size[ra] += size[rb]
        return True
    for a, b in edges:
        if not union(a, b):
            return [a, b]
```

**Two speed-ups, both needed.** Attaching the smaller group under the larger keeps the parent chains short. The shortcut inside `find` (pointing each node at its grandparent as you walk) flattens them further. With both, each operation is effectively constant time.

### Where else it shows up

- **Course Schedule (207).** *Can all courses be finished?* The same code, returning `len(order) == numCourses`.
- **Alien Dictionary (269).** *You are given words sorted in an unknown alphabet. Return a valid ordering of its letters.* Compare each pair of neighboring words; the first position where they differ gives one fact, "this letter comes before that one". Those facts are prerequisites; topologically sort the letters. Watch for the invalid case where a longer word comes before its own prefix (`"abc"` before `"ab"`).
- **Number of Connected Components in an Undirected Graph (323).** *How many separate groups do the edges form?* Start with `n` groups and subtract 1 for every successful `union`.
- **Graph Valid Tree (261).** *Do the `n` nodes and edges form a tree?* A tree has exactly `n − 1` edges and no loops, so: check the edge count, then check that every `union` succeeds.
- **Min Cost to Connect All Points (1584).** Kruskal's method adds the cheapest connections first, using Union-Find to skip ones that would make a loop. P15.

**Beyond the list:** parallel courses, accounts merge, number of provinces, "satisfiability of equality equations", most stones removed, build systems and spreadsheet recalculation.

### Common mistakes

- **One set instead of two in the DFS version.** Without `done`, finished courses are re-explored and the search can take exponential time. Without `in_progress`, cycles go undetected.
- **Arrows the wrong way.** Decide whether edges point from prerequisite to course or the reverse, and build `unlocks` (or `needs`) to match. Getting it backward produces the reversed order.
- **Union-Find without the speed-ups.** Without them, a chain of parents can grow to length n and each `find` becomes O(n).
- **Undirected cycle checks with DFS.** In an undirected graph, the edge back to the node you just came from is not a cycle; skip it (or use Union-Find, which avoids the issue).

---

## P15. Weighted paths: always extend the cheapest route found so far

**In one sentence.** When connections have different costs and you want the cheapest route, keep a heap of "places I can reach, and what it costs to get there", always settle the cheapest one next, and it is guaranteed to be final (this is Dijkstra's algorithm); change one line and the same loop solves "minimize the worst step" or "connect everything as cheaply as possible".

### Start with a problem

**Network Delay Time (LeetCode 743).** There are `n` computers labeled 1 to `n`. Each entry `[u, v, w]` in `times` means a signal takes `w` time to travel from `u` to `v` (one direction only). A signal is sent from computer `k`. Return how long until every computer has received it, or −1 if some never will.

```
n = 4, k = 1
times = [[1, 2, 4], [1, 3, 1], [3, 2, 1], [2, 4, 1]]
answer: 3
```

```
      4
  1 ─────► 2 ──1──► 4
  │        ▲
  1        1
  ▼        │
  3 ───────┘
```

The direct link 1 → 2 takes 4, but going 1 → 3 → 2 takes only 2. Computer 4 is reached at 2 + 1 = 3, which is the latest arrival.

**The slow way.** Plain BFS (P13) counts *steps*, not time. It would reach computer 2 in one step and wrongly record time 4. A correct brute force tries every route to every computer, which is exponential. A more careful approach ("keep improving every computer's time until nothing changes") works but is O(computers × links).

**Where the time goes.** Those approaches keep updating a computer's time as better routes turn up, and have to revisit everything after each improvement. But some times can be known to be final early. Think about the computer that currently has the *smallest* known arrival time. Any other route to it would have to pass through some computer that is reached no sooner, and then add a non-negative delay. So nothing can beat its current time. It is final.

**The fix.** Keep a heap (P10) of `(arrival time, computer)` for computers you have found a route to.

1. Start with `(0, k)`.
2. Pop the smallest. If that computer is already settled, skip it (an old, slower entry). Otherwise, **settle** it: its time is final.
3. For each link out of it, push `(its time + link delay, neighbor)`.
4. When the heap is empty, every reachable computer is settled. The answer is the latest settled time.

Here is that process on the example:

| Pop | Already settled? | Settle | Push | Heap after |
|---|---|---|---|---|
| (0, 1) | no | 1 at time 0 | (4, 2), (1, 3) | (1, 3), (4, 2) |
| (1, 3) | no | 3 at time 1 | (1 + 1 = 2, 2) | (2, 2), (4, 2) |
| (2, 2) | no | 2 at time 2 | (2 + 1 = 3, 4) | (3, 4), (4, 2) |
| (3, 4) | no | 4 at time 3 | none | (4, 2) |
| (4, 2) | **yes** (settled at 2) | skip | | empty |

All four are settled; the latest time is **3**.

```python
import heapq
from collections import defaultdict

def networkDelayTime(times, n, k):
    links = defaultdict(list)                    # u -> list of (v, delay)
    for u, v, w in times:
        links[u].append((v, w))
    heap = [(0, k)]                              # (arrival time, computer)
    settled = set()
    latest = 0
    while heap:
        t, u = heapq.heappop(heap)
        if u in settled:
            continue                             # an old entry; u was settled sooner
        settled.add(u)                           # the cheapest unsettled entry is final
        latest = t
        for v, w in links[u]:
            if v not in settled:
                heapq.heappush(heap, (t + w, v))
    return latest if len(settled) == n else -1
```

Each link causes at most one push, and each push or pop costs O(log(links)): O(links × log(links)).

**Why keep old entries instead of updating them?** Python's heap has no "decrease this entry" operation. Pushing a new, better entry and skipping the stale one when it surfaces is simpler and just as fast in practice.

### What stays true (the invariant)

**"Every settled computer has its final, cheapest arrival time, and the heap holds a route to every computer that could be settled next."**

This relies on one requirement: **costs never go down as a route gets longer.** With negative delays, a longer route could turn out cheaper after a computer was already settled, and Dijkstra's algorithm gives wrong answers.

### How to recognize it

- Connections have weights (time, cost, distance), and the question is the cheapest or fastest way to reach something.
- "The path whose *worst* single step is smallest" (a bottleneck): same loop, different combining rule.
- "Connect all points with the least total cost": a minimum spanning tree (below).
- "The cheapest route with **at most k stops**": Dijkstra's "settle it once" breaks; use rounds (worked example 2).

### Worked example 2: a limit on steps (Cheapest Flights Within K Stops, LeetCode 787)

**Problem.** `flights[i] = [from, to, price]`. Return the cheapest price from `src` to `dst` using at most `k` stops in between (so at most `k + 1` flights), or −1 if there is no such route.

```
n = 4, src = 0, dst = 3, k = 1
flights = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]]
answer: 700        0 → 1 → 3. The route 0 → 1 → 2 → 3 costs only 400, but needs 2 stops.
```

**Why Dijkstra's algorithm fails.** It would settle city 2 at price 200 (via 0 → 1 → 2) and then find city 3 at 400, not noticing that route used too many stops. Once a city is settled, the costlier-but-shorter route to it is never considered.

**The fix (Bellman-Ford, limited to k + 1 rounds).** Keep the cheapest known price to every city. In each round, try extending every route by exactly one more flight. After round `r`, the prices are the cheapest using at most `r` flights. Run `k + 1` rounds.

The subtle part: each round must extend only the prices *from the end of the previous round*. Otherwise a single round could chain two flights together and quietly exceed the limit. So compute each round from a copy.

| Round | Prices at the start (cities 0 to 3) | Flights that improve something | Prices at the end |
|---|---|---|---|
| 1 | 0, ∞, ∞, ∞ | 0→1: 0 + 100 | 0, 100, ∞, ∞ |
| 2 | 0, 100, ∞, ∞ | 1→2: 100 + 100; 1→3: 100 + 600 | 0, 100, 200, **700** |

Stop after `k + 1 = 2` rounds: the answer is 700. (In round 2, the flight 2→3 does nothing, because at the *start* of round 2 city 2 was still unreachable. Without the copy, it would have used the 200 set earlier in the same round and produced 400, a three-flight route.)

```python
def findCheapestPrice(n, flights, src, dst, k):
    INF = float("inf")
    price = [INF] * n
    price[src] = 0
    for _ in range(k + 1):                       # at most k stops = at most k + 1 flights
        new_price = price.copy()                 # this round only extends last round's prices
        for u, v, p in flights:
            if price[u] != INF and price[u] + p < new_price[v]:
                new_price[v] = price[u] + p
        price = new_price
    return price[dst] if price[dst] != INF else -1
```

### Worked example 3: minimizing the worst step (Swim in Rising Water, LeetCode 778)

**Problem.** `grid[r][c]` is the height of each square in an `n × n` grid. At time `t` the water level is `t`, and you can swim between neighboring squares if both are at most `t`. Starting at the top-left, return the earliest time you can reach the bottom-right.

**The idea.** A route's "cost" is the highest square on it, not the sum. Use the same loop as Network Delay Time, but combine with `max` instead of `+`. The "settle the cheapest" argument still works, because a route's highest point can only stay the same or go up as it gets longer.

```python
import heapq

def swimInWater(grid):
    n = len(grid)
    heap = [(grid[0][0], 0, 0)]                  # (highest square on the route, row, col)
    seen = {(0, 0)}
    while heap:
        t, r, c = heapq.heappop(heap)
        if (r, c) == (n - 1, n - 1):
            return t
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                seen.add((nr, nc))
                heapq.heappush(heap, (max(t, grid[nr][nc]), nr, nc))
```

(Marking squares when they are pushed, rather than when popped, is safe here because a square's cost only depends on the square itself and on `t`, and `t` never decreases from one pop to the next. In ordinary Dijkstra, mark on pop.)

### Worked example 4: connecting everything cheaply (Min Cost to Connect All Points, LeetCode 1584)

**Problem.** Given points on a grid, the cost to connect two points is their Manhattan distance (`|x1 − x2| + |y1 − y2|`). Return the minimum total cost to connect all points, so that every point can reach every other through connections.

This is a **minimum spanning tree**. Prim's method is the Dijkstra loop with one change: push the cost of the *single connection* to a neighbor, not the total route cost, and add up the costs as points are settled.

```python
import heapq

def minCostConnectPoints(points):
    n = len(points)
    heap = [(0, 0)]                              # (cost of the connection that reaches it, point)
    connected = set()
    total = 0
    while len(connected) < n:
        cost, i = heapq.heappop(heap)
        if i in connected:
            continue
        connected.add(i)
        total += cost                            # the cheapest connection into the network so far
        for j in range(n):
            if j not in connected:
                d = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
                heapq.heappush(heap, (d, j))
    return total
```

Kruskal's method is the alternative: sort every possible connection by cost (P9) and add each one unless its two ends are already connected, which Union-Find (P14) answers.

### The same loop, four problems

| You want | What to push for neighbor `v` | The answer |
|---|---|---|
| cheapest total route (Dijkstra) | `cost_so_far + w` | the cost when the target is settled |
| smallest possible worst step | `max(cost_so_far, w)` | the cost when the target is settled |
| cheapest way to connect everything (Prim) | `w` | the sum of the costs as points are settled |
| cheapest with at most k steps | don't use this loop: use k + 1 rounds | |

### Where else it shows up

These four are the whole list in the NeetCode 150: Network Delay Time (743), Cheapest Flights Within K Stops (787), Swim in Rising Water (778), and Min Cost to Connect All Points (1584).

**Beyond the list:** path with minimum effort (a bottleneck), path with maximum probability (multiply, and use a max-heap), number of shortest routes to a destination, connecting cities with minimum cost, and shortest paths between all pairs on small graphs (Floyd-Warshall).

### Common mistakes

- **Negative weights.** Dijkstra's algorithm is wrong with them. Use Bellman-Ford.
- **Extra limits (stops, fuel).** A route that is costlier so far might be the only one within the limit. Use rounds, or make the limit part of the heap entry (Card 36).
- **Not skipping stale entries.** Without `if u in settled: continue`, a node is processed several times and the answer can be wrong.
- **Forgetting the copy in Bellman-Ford.** Without it, one round can use several flights.

---

# MOVE 6 — MANIPULATE IN PLACE
*"The constraint is really about memory or mechanics."*

These two principles are less "insight" and more "fluency". They cover problems where the algorithmic idea is simple but the constraint (O(1) space, no extra data structure, no `+` operator, 32-bit overflow) forces you to operate on the structure you were given. Drill the idioms until they are automatic; they are the times tables of this subject.

---

## P16. Linked-list surgery: a few pointer moves, done in the right order

**In one sentence.** Linked-list problems are solved with a small set of moves: reverse links by saving the next node before overwriting the pointer to it, use two pointers moving at different speeds (or a fixed distance apart) to find positions without knowing the length, and start from a placeholder "dummy" node so the first node needs no special case.

### Linked lists in Python, briefly

A singly linked list is a chain of nodes. Each node holds a value and a pointer, `next`, to the following node; the last node's `next` is `None`. You only get the first node (the **head**). There is no way to jump to position `i` without walking there.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

```
head
 │
 ▼
[1] ──► [2] ──► [3] ──► [4] ──► [5] ──► None
```

### Start with a problem

**Reverse Linked List (LeetCode 206).** Reverse a linked list and return the new head.

```
input:  1 → 2 → 3 → 4 → 5
output: 5 → 4 → 3 → 2 → 1
```

**The slow way.** Copy every value into a Python list, reverse the list, and build a new chain of nodes. It works, but it uses O(n) extra memory, and interviewers expect you to rearrange the existing nodes.

**Where the effort goes.** Reversing means every arrow should point the other way: `2.next` should be `1`, `3.next` should be `2`, and so on. You can flip one arrow at a time while walking along. The danger is that the moment you change `cur.next`, you lose your only way to reach the rest of the list.

**The fix.** Walk along with two pointers: `prev` (the head of the part already reversed) and `cur` (the next node to flip). At each step:

1. **Save** the rest of the list: `nxt = cur.next`.
2. **Flip** the arrow: `cur.next = prev`.
3. **Step forward**: `prev = cur`, then `cur = nxt`.

When `cur` falls off the end, `prev` is the new head.

| Step | `cur` | Saved `nxt` | Reversed part (starting at `prev`) after the step | Rest (starting at `cur`) |
|---|---|---|---|---|
| start | 1 | | *(empty)* | 1 → 2 → 3 → 4 → 5 |
| 1 | 1 | 2 | 1 | 2 → 3 → 4 → 5 |
| 2 | 2 | 3 | 2 → 1 | 3 → 4 → 5 |
| 3 | 3 | 4 | 3 → 2 → 1 | 4 → 5 |
| 4 | 4 | 5 | 4 → 3 → 2 → 1 | 5 |
| 5 | 5 | None | 5 → 4 → 3 → 2 → 1 | *(empty)* |

```python
def reverseList(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next               # save the rest before we lose it
        cur.next = prev              # flip this arrow
        prev = cur                   # the reversed part now starts at cur
        cur = nxt                    # move on to the rest
    return prev
```

One pass, no extra memory: O(n) time, O(1) space.

### What stays true (the invariant)

**"`prev` is the head of the already-reversed part, and `cur` is the head of the part not yet touched."**

Most linked-list bugs come from overwriting a `next` pointer before saving what it pointed to. Say the invariant, and draw the arrows for a list of one or two nodes, before you write the loop.

### How to recognize it

- Any singly linked list problem.
- "The middle", "does it loop", "the k-th node from the end", "where does the loop start": two pointers (below).
- "Reverse" the list, part of it, or every group of k nodes.
- Building a new list, or removing nodes, where the first node might change: a dummy node.
- A list of numbers where each value is used as the index of the next step (`i → nums[i]`): that is a linked list in disguise, and loop detection applies.

### Worked example 2: two speeds (Linked List Cycle, LeetCode 141)

**Problem.** Return whether a linked list contains a cycle (some node's `next` points back to an earlier node).

```
1 → 2 → 3 → 4 → 5
        ▲       │
        └───────┘         answer: True (5 points back to 3)
```

**The slow way** stores every visited node in a set and checks for repeats: O(n) memory.

**The fix.** Send two pointers from the head: `slow` moves one node per step, `fast` moves two. If there is no cycle, `fast` reaches the end. If there is a cycle, both end up going around it, and each step `fast` gains exactly one node on `slow`, so it must eventually land on it.

| Step | `slow` | `fast` |
|---|---|---|
| start | 1 | 1 |
| 1 | 2 | 3 |
| 2 | 3 | 5 |
| 3 | 4 | 4 *(5 → 3 → 4)* → they meet: cycle |

```python
def hasCycle(head):
    slow = fast = head
    while fast and fast.next:            # check fast.next before using fast.next.next
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False
```

**The same trick finds the middle.** When `fast` reaches the end of a list with no cycle, `slow` is halfway: the middle node.

**Finding where the cycle starts** takes one more phase: after they meet, move one pointer back to the head and advance both one step at a time. They meet again exactly at the start of the cycle. (The distance from the head to the cycle's start equals the distance from the meeting point to the cycle's start, going around.) This is used in Find the Duplicate Number, below, and is on Card 36.

### Worked example 3: a fixed gap and a dummy node (Remove Nth Node From End of List, LeetCode 19)

**Problem.** Remove the `n`-th node from the end of the list and return the head.

```
head = 1 → 2 → 3 → 4 → 5,  n = 2
answer: 1 → 2 → 3 → 5
```

**The idea.** To remove a node, you need the node *before* it. Put two pointers `n` nodes apart and move them together; when the front one falls off the end, the back one is right before the node to remove.

**The dummy node.** What if the node to remove is the head itself? Then there is no node before it. Adding a placeholder node in front of the head (`dummy`) means there always is one, and the head needs no special case. At the end, return `dummy.next`.

| Step | `left` | `right` |
|---|---|---|
| start | dummy | 1 |
| move `right` ahead n = 2 times | dummy | 3 |
| move both | 1 | 4 |
| move both | 2 | 5 |
| move both | 3 | None → stop |

`left` is on 3, so remove the node after it (4): `3.next = 5`.

```python
def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)            # a node before the head, so the head can be removed too
    left, right = dummy, head
    for _ in range(n):
        right = right.next               # open a gap of n nodes
    while right:
        left, right = left.next, right.next
    left.next = left.next.next           # skip over the n-th node from the end
    return dummy.next                    # not head: head may have been removed
```

### Where else it shows up

- **Merge Two Sorted Lists (21).** *Merge two sorted lists into one sorted list.* Start from a dummy node; repeatedly attach the smaller of the two front nodes.
  ```python
  def mergeTwoLists(a, b):
      dummy = tail = ListNode()
      while a and b:
          if a.val <= b.val:
              tail.next, a = a, a.next
          else:
              tail.next, b = b, b.next
          tail = tail.next
      tail.next = a or b                   # attach whatever is left
      return dummy.next
  ```
- **Reorder List (143).** *Rearrange `L0 → L1 → ... → Ln` into `L0 → Ln → L1 → Ln−1 → ...`.* All three moves in one problem: find the middle (two speeds), reverse the second half, then weave the two halves together.
  ```python
  def reorderList(head):
      slow, fast = head, head.next
      while fast and fast.next:            # slow stops at the end of the first half
          slow, fast = slow.next, fast.next.next
      second = slow.next
      slow.next = None                     # cut the list in two
      prev = None
      while second:                        # reverse the second half
          nxt = second.next
          second.next = prev
          prev, second = second, nxt
      first, second = head, prev
      while second:                        # weave: one from each half
          n1, n2 = first.next, second.next
          first.next = second
          second.next = n1
          first, second = n1, n2
  ```
- **Copy List with Random Pointer (138).** *Each node also has a `random` pointer to any node (or `None`). Make a deep copy.* First pass: create a copy of every node and store `original → copy` in a dictionary (P1). Second pass: set each copy's `next` and `random` through the dictionary.
- **Add Two Numbers (2).** *Two lists store numbers with the digits in reverse order (`2 → 4 → 3` is 342). Return their sum as a list.* Walk both lists from a dummy node, adding digits with a carry (P17, Card 27).
- **Find the Duplicate Number (287).** *A list of `n + 1` numbers, each between 1 and `n`, has exactly one repeated value. Find it without changing the list and with O(1) extra memory.* Treat each value as a pointer to the next index: `i → nums[i]`. The repeated value is where two arrows point to the same place, which is the start of a cycle. Two speeds, then the second phase.
- **LRU Cache (146).** A dictionary plus a doubly linked list with dummy nodes at both ends. P1 and Card 35.
- **Merge K Sorted Lists (23).** Repeated merges, or a heap of list heads (P10).
- **Reverse Nodes in k-Group (25).** *Reverse every consecutive group of `k` nodes; leave a final short group as is.* Reverse each group with the loop above, then reconnect the group's new first and last nodes to the neighbors around it.
- **Happy Number (202).** *Repeatedly replace a number by the sum of the squares of its digits. Does it reach 1, or loop forever?* The sequence is a linked list in disguise; use two speeds to detect a loop.

**Beyond the list:** palindrome linked list, swap nodes in pairs, rotate a list, odd-even list, remove duplicates from a sorted list, intersection of two lists, sorting a linked list.

### Common mistakes

- **Overwriting `next` before saving it.** Always save first.
- **`fast.next.next` when `fast.next` is `None`.** Check `fast and fast.next` in the loop condition.
- **Returning `head` after the head changed.** With a dummy node, return `dummy.next`.
- **Skipping the tiny cases.** Draw the arrows for an empty list, one node and two nodes before coding; most bugs live there.

---

## P17. Bits, digits, and no extra memory: work with how numbers are written

**In one sentence.** When a problem forbids extra memory or a built-in operator, work with the way numbers are represented: let pairs cancel with XOR, peel off bits one at a time, do arithmetic digit by digit with a carry, and store your notes inside the input itself.

These are closer to facts than to insights. Each one replaces a whole data structure or loop, and each is worth learning like a times table.

### Binary and XOR, briefly

Computers store integers in binary. `6` is `110` (4 + 2), `5` is `101` (4 + 1).

Python's bit operators work on each binary digit (**bit**) separately:

| Operator | Meaning, bit by bit | Example |
|---|---|---|
| `a & b` | 1 only where **both** are 1 | `110 & 101 = 100` (6 & 5 = 4) |
| `a \| b` | 1 where **either** is 1 | `110 \| 101 = 111` (7) |
| `a ^ b` (XOR) | 1 where they **differ** | `110 ^ 101 = 011` (3) |
| `a >> 1` | shift right: drop the last bit | `110 >> 1 = 11` (3) |
| `a << 1` | shift left: append a 0 | `110 << 1 = 1100` (12) |

XOR has three properties that do all the work:

- `x ^ x = 0` (a number cancels itself),
- `x ^ 0 = x`,
- the order doesn't matter: `a ^ b ^ a = b`.

### Start with a problem

**Single Number (LeetCode 136).** Every number in the list appears exactly twice, except one, which appears once. Return that one. Use only O(1) extra memory.

```
nums = [4, 1, 2, 1, 2]
answer: 4
```

**The slow way.** Count each number in a dictionary (P1) and return the one with count 1. That is O(n) time but also O(n) memory, which the problem forbids. Comparing every pair uses no memory but takes O(n²).

**Where the memory goes.** The dictionary remembers every number seen. But we don't need all of that. We only need to know which number has been seen an *odd* number of times. Pairs should simply disappear.

**The fix.** XOR everything together. Every number that appears twice cancels itself out (`x ^ x = 0`), and since order doesn't matter, the pairs don't have to be next to each other. Only the single number is left.

| Step | XOR with | Running result (binary) | Running result |
|---|---|---|---|
| start | | 000 | 0 |
| 1 | 4 (100) | 100 | 4 |
| 2 | 1 (001) | 101 | 5 |
| 3 | 2 (010) | 111 | 7 |
| 4 | 1 (001) | 110 | 6 |
| 5 | 2 (010) | 100 | **4** |

```python
def singleNumber(nums):
    result = 0
    for x in nums:
        result ^= x                  # pairs cancel; only the unpaired number survives
    return result
```

O(n) time, one variable of memory.

### What stays true (the invariant)

**"`result` is the XOR of every number seen so far, which equals the XOR of the numbers seen an odd number of times."**

### How to recognize it

- "Every element appears twice except one", "one number is missing from 0 to n": XOR.
- "Count the 1 bits", "reverse the bits": shifting and masking.
- "Add / multiply numbers given as strings or lists of digits", "plus one", "reverse an integer (watch for overflow)": digit-by-digit arithmetic with a carry.
- "In place" or "O(1) extra space" on a grid: reuse part of the grid itself as scratch space.
- "Add two integers without using `+`": XOR and AND.

### The identities, each with its problem

| Fact | What it gives you | Problem |
|---|---|---|
| `x ^ x = 0`, order doesn't matter | pairs cancel | **Single Number (136)**, above |
| XOR every index 0..n and every value | everything present cancels, the missing number is left | **Missing Number (268).** *A list holds n distinct numbers from 0 to n; which one is missing?* |
| `n & (n − 1)` removes the lowest 1 bit | count 1 bits in one step per 1 bit | **Number of 1 Bits (191).** *Count the 1s in a number's binary form.* |
| `bits(i) = bits(i >> 1) + (i & 1)` | 1-bit counts for every number up to n, in O(n) | **Counting Bits (338).** *Return the count of 1 bits for every number 0..n.* |
| `result = (result << 1) \| (n & 1)`, then `n >>= 1`, 32 times | the bits in reverse order | **Reverse Bits (190).** *Reverse the 32 bits of a number.* |
| `a ^ b` is the sum without carries; `(a & b) << 1` is the carries | addition without `+` | **Sum of Two Integers (371).** *Add two integers without `+` or `−`.* See "Tricks that genuinely must be memorized". |
| `carry, digit = divmod(x + y + carry, 10)` | arithmetic on numbers too big for a type, or stored as digits | **Plus One (66), Add Two Numbers (2), Multiply Strings (43)** |
| check `result > (MAX − d) // 10` **before** `result = result × 10 + d` | overflow detection without a larger type | **Reverse Integer (7).** *Reverse the digits; return 0 if the result doesn't fit in 32 bits.* |
| `x^n = (x^(n/2))²`, times `x` if `n` is odd | powers in O(log n) multiplications | **Pow(x, n) (50)**, below |
| swap across the diagonal, then reverse each row | a 90° rotation without a second grid | **Rotate Image (48)**, below |
| use the first row and column as notes, plus one flag | O(1)-space marking | **Set Matrix Zeroes (73)**, below |

**Counting 1 bits with `n & (n − 1)`**, traced on 12 (`1100`):

| `n` (binary) | `n − 1` | `n & (n − 1)` | Bits counted |
|---|---|---|---|
| 1100 | 1011 | 1000 | 1 |
| 1000 | 0111 | 0000 | 2 → done |

```python
def hammingWeight(n):
    count = 0
    while n:
        n &= n - 1                   # removes the lowest 1 bit
        count += 1
    return count
```

Subtracting 1 turns the lowest 1 bit into 0 and every 0 after it into 1. ANDing with the original clears exactly that lowest 1 bit and leaves the rest alone.

### Worked example 2: digit-by-digit arithmetic (Multiply Strings, LeetCode 43)

**Problem.** Given two non-negative integers as strings, return their product as a string, without converting the whole strings to integers.

```
num1 = "12"    num2 = "34"
answer: "408"
```

**The idea.** Do schoolbook multiplication. The digit at position `i` of `num1` times the digit at position `j` of `num2` contributes to position `i + j + 1` of the result (counting from the left, with room for one extra digit at the front). Add it in, and push any carry one position left.

```python
def multiply(num1, num2):
    if num1 == "0" or num2 == "0":
        return "0"
    result = [0] * (len(num1) + len(num2))       # the product has at most this many digits
    for i in range(len(num1) - 1, -1, -1):
        for j in range(len(num2) - 1, -1, -1):
            result[i + j + 1] += int(num1[i]) * int(num2[j])
            result[i + j] += result[i + j + 1] // 10     # carry into the next position left
            result[i + j + 1] %= 10
    return "".join(map(str, result)).lstrip("0")
```

### Worked example 3: storing notes inside the input (Set Matrix Zeroes, LeetCode 73)

**Problem.** If any cell of a grid is 0, set its whole row and whole column to 0. Do it in place, using O(1) extra memory.

**The slow way** records which rows and columns contain a 0 in two separate lists: O(rows + columns) memory.

**The fix.** Store those notes in the grid's own first row and first column: "column `c` needs zeroing" is written as a 0 in `matrix[0][c]`, and "row `r` needs zeroing" as a 0 in `matrix[r][0]`. The top-left corner would have to mean both "row 0" and "column 0", so give row 0 its own separate flag.

```python
def setZeroes(matrix):
    rows, cols = len(matrix), len(matrix[0])
    row0_has_zero = False
    # 1. Record notes in the first row and column.
    for r in range(rows):
        for c in range(cols):
            if matrix[r][c] == 0:
                matrix[0][c] = 0                 # note: column c must be zeroed
                if r > 0:
                    matrix[r][0] = 0             # note: row r must be zeroed
                else:
                    row0_has_zero = True         # row 0's note needs its own flag
    # 2. Zero the inner cells according to the notes.
    for r in range(1, rows):
        for c in range(1, cols):
            if matrix[0][c] == 0 or matrix[r][0] == 0:
                matrix[r][c] = 0
    # 3. Finally the first column, then the first row (their notes are no longer needed).
    if matrix[0][0] == 0:
        for r in range(rows):
            matrix[r][0] = 0
    if row0_has_zero:
        for c in range(cols):
            matrix[0][c] = 0
```

### Worked example 4: halving the work (Pow(x, n), LeetCode 50)

**Problem.** Compute `x` raised to the power `n` (`n` may be negative) without `**`.

Multiplying `x` by itself `n` times takes `n` steps. Instead, square and halve: `x¹⁰ = (x²)⁵`, and `(x²)⁵ = x² · ((x²)²)²`. Each step halves the exponent.

| Call | Exponent | Result |
|---|---|---|
| power(2, 10) | even | power(4, 5) = 1024 |
| power(4, 5) | odd | 4 × power(16, 2) = 4 × 256 = 1024 |
| power(16, 2) | even | power(256, 1) = 256 |
| power(256, 1) | odd | 256 × power(65536, 0) = 256 |
| power(65536, 0) | zero | 1 |

```python
def myPow(x, n):
    def power(x, n):                             # x ** n for n >= 0
        if n == 0:
            return 1
        half = power(x * x, n // 2)
        return x * half if n % 2 else half
    result = power(x, abs(n))
    return result if n >= 0 else 1 / result
```

### Where else it shows up

- **Rotate Image (48).** *Rotate a square grid 90° clockwise in place.* Swap `matrix[i][j]` with `matrix[j][i]` for every `j > i` (flipping across the diagonal), then reverse each row. `[[1,2,3],[4,5,6],[7,8,9]]` becomes `[[1,4,7],[2,5,8],[3,6,9]]`, then `[[7,4,1],[8,5,2],[9,6,3]]`.
- **Plus One (66).** *A number is given as a list of digits; add one.* Walk from the right, carrying.
- **Spiral Matrix (54).** Four shrinking boundaries. Filed under P5.
- **Happy Number (202).** Digit sums plus loop detection. P16.
- **Encode and Decode Strings (271)** is about a text format, not bits. P18.

**Beyond the list:** power of two (`n > 0 and n & (n − 1) == 0`), Hamming distance (`bin(a ^ b).count("1")`), add binary, add strings, string to integer, "first missing positive" (use the list's own positions as notes), game of life (store the next state in a spare bit), rotating a list by reversing its parts.

### Common mistakes

- **Python integers never overflow.** Problems that assume 32-bit numbers need you to simulate it: mask with `& 0xFFFFFFFF` and convert back to negative where needed.
- **Checking overflow after it happens.** In languages with fixed-size numbers, the check has to come before the multiplication.
- **Overwriting the input when you shouldn't.** Storing notes in the input is only allowed if the problem says "in place" (or you restore it afterwards).
- **Deriving facts under pressure.** `n & (n − 1)` and the diagonal rules for N-Queens are facts; memorize them.

---

# MOVE 0 — REFORMULATE
*"Is there a different way to see this problem that turns it into one I know?"*

This is listed last because it is the hardest to teach and the first thing experts do. Most of the "hard" problems in the 150 are a known principle behind a disguise, and the disguise is removed by one of a small number of re-descriptions.

---

## P18. Reformulate: describe the problem differently until it becomes one you know

**In one sentence.** Before searching for a clever algorithm, try restating the problem: flip the direction, rewrite the equation, choose what happens last instead of first, name the hidden graph, or turn "find the best value" into "is this value good enough?"; most hard problems are an earlier principle wearing a disguise.

### Start with a problem

**Target Sum (LeetCode 494).** Put a `+` or a `−` in front of every number in the list. Count how many ways the resulting expression equals `target`.

```
nums = [1, 1, 1, 1, 1]    target = 3
answer: 5          -1+1+1+1+1, +1-1+1+1+1, +1+1-1+1+1, +1+1+1-1+1, +1+1+1+1-1
```

**The slow way.** Try every assignment of signs with backtracking (P12): two choices per number, so 2ⁿ assignments. With 20 numbers that is about a million; with 40 it is a trillion.

**Where the time goes.** The backtracking explores sign patterns one by one, even though many of them reach the same position with the same running total and therefore have the same future. Memoizing on `(position, running total)` (P3) fixes that. But there is a cleaner way to see the problem.

**The reformulation.** Split the numbers into the ones that get `+` (call their sum `P`) and the ones that get `−` (call their sum `N`). Then:

```
P − N = target        (the expression)
P + N = total         (every number is in one group or the other)
```

Adding the two equations: `2P = total + target`, so **`P = (total + target) / 2`**.

So the question "how many sign patterns hit the target?" is the same as **"how many subsets add up to `P`?"** That is a standard counting knapsack (P3, Card 6). For the example, total = 5 and target = 3, so `P = 4`: count the subsets of five 1s that sum to 4.

Count them with a list `ways[s]` = number of subsets (of the numbers processed so far) that sum to `s`. For each number `x`, every subset that summed to `s − x` can take `x` to reach `s`:

| After processing | `ways[0]` | `ways[1]` | `ways[2]` | `ways[3]` | `ways[4]` |
|---|---|---|---|---|---|
| nothing | 1 | 0 | 0 | 0 | 0 |
| first 1 | 1 | 1 | 0 | 0 | 0 |
| second 1 | 1 | 2 | 1 | 0 | 0 |
| third 1 | 1 | 3 | 3 | 1 | 0 |
| fourth 1 | 1 | 4 | 6 | 4 | 1 |
| fifth 1 | 1 | 5 | 10 | 10 | **5** |

```python
def findTargetSumWays(nums, target):
    total = sum(nums)
    if abs(target) > total or (total + target) % 2:
        return 0                                 # P would be out of range or not a whole number
    P = (total + target) // 2
    ways = [0] * (P + 1)                         # ways[s] = subsets so far that sum to s
    ways[0] = 1                                  # the empty subset
    for x in nums:
        for s in range(P, x - 1, -1):            # downward, so each number is used at most once
            ways[s] += ways[s - x]
    return ways[P]
```

O(n × P) instead of O(2ⁿ).

### What stays true (the invariant)

For the rewritten problem: **"`ways[s]` is the number of subsets of the numbers processed so far that sum to exactly `s`."**

For reformulation in general, the check is: **"Every answer to the new problem corresponds to exactly one answer to the original, and vice versa."** Here, each subset summing to `P` is exactly one sign pattern (its members get `+`, the rest `−`).

### How to recognize it

- The direct approach is exponential or O(n²), and nothing from P1–P17 obviously fits.
- The problem describes a *process* (water flowing, oranges rotting, balloons bursting, cars catching up) rather than a structure.
- A constraint seems to break a standard method: "circular", "in place", "without division", "use each ticket exactly once".
- The list's values are valid indices into the list itself (`nums[i]` between 1 and n).

### The reformulations that recur

Each row is a problem stated in one line, the new way to see it, and the principle that then applies.

| Problem, in one line | See it as ... | Then use |
|---|---|---|
| **Pacific Atlantic (417):** which cells can drain to both oceans? | which cells can each ocean reach walking *uphill*? (search backward from the goal) | P13 |
| **Surrounded Regions (130):** capture regions not connected to the border | which regions *are* connected to the border? (search from the border) | P13 |
| **Walls and Gates (286):** each room's distance to the nearest gate | one search spreading from all gates at once | P13 |
| **Jump Game (55):** can I reach the end? | which positions can reach the end? (scan backward) | P7 |
| **Burst Balloons (312):** best order to burst balloons for coins | which balloon is burst *last* in each range? (below) | P3 |
| **Target Sum (494):** count `±` patterns that hit a target | count subsets summing to `(total + target) / 2` | P3 |
| **Two Sum (1):** find a pair adding to `t` | for each `a`, look up `t − a` | P1 |
| **House Robber II (213):** no two neighbors, houses in a circle | the better of two straight rows (without the first house, without the last) | P3 |
| **Group Anagrams (49):** group words with the same letters | group by a sorted string or letter-count key | P1 |
| **Word Ladder (127):** words one letter apart | words sharing a wildcard pattern like `h*t` | P1 + P13 |
| **Find the Duplicate Number (287):** the repeated value in `[1..n]` | the start of a cycle in the list `i → nums[i]` | P16 |
| **Happy Number (202):** does repeated digit-squaring reach 1? | does this chain loop? | P16 |
| **Longest Increasing Path in a Matrix (329):** longest strictly increasing route | a longest path in a graph with no loops (strict increase rules them out) | P3 + P13 |
| **Search a 2D Matrix (74):** find a value in sorted rows | one long sorted list | P4 |
| **Koko Eating Bananas (875):** the minimum speed that finishes in time | "is speed `k` fast enough?", then binary search | P4 |
| **Swim in Rising Water (778):** the earliest time to cross | "can I cross at time `t`?", then binary search (or the heap in P15) | P4 or P15 |
| **Median of Two Sorted Arrays (4):** the median | how many elements of the shorter list go in the lower half? | P4 |
| **Encode and Decode Strings (271):** join strings so they can be split again | prefix each string with its length (below) | none: a format |
| **Serialize and Deserialize Binary Tree (297):** a tree to text and back | preorder with a marker for every missing child | P11 |
| **Detect Squares (2013):** count squares with a query point as a corner | choosing the diagonal corner fixes the other two corners | P1 |
| **Car Fleet (853):** cars catching up to each other | arrival times, in order of starting position | P6 + P9 |
| **Meeting Rooms II (253):** rooms needed | the most meetings happening at once (+1 / −1 events) | P9 |
| **Valid Parenthesis String (678):** `*` can be `(`, `)` or nothing | track the *range* of possible open counts | P7 |
| **Alien Dictionary (269):** the alphabet behind a sorted word list | "letter before letter" facts from each neighboring pair of words | P14 |
| **Trapping Rain Water (42):** water above each bar | `min(tallest on the left, tallest on the right) − height` | P2 |

### Worked example 2: choose the last step, not the first (Burst Balloons, LeetCode 312)

**Problem.** Balloons in a row have numbers on them. Bursting balloon `i` earns `left × nums[i] × right` coins, where `left` and `right` are the numbers on its current neighbors (a missing neighbor counts as 1). After bursting, its neighbors become adjacent. Return the most coins you can collect by bursting all of them.

```
nums = [3, 1, 5, 8]
answer: 167
```

**Why the obvious approach fails.** Choosing which balloon to burst *first* in a range doesn't split the problem: after it bursts, the balloons on its left and right become neighbors, so the two sides still affect each other.

**The reformulation.** Instead ask: which balloon in the range `(left, right)` is burst **last**? When it is burst, everything else in the range is already gone, so its neighbors are exactly the range's two boundaries, `nums[left]` and `nums[right]`. And the balloons to its left and to its right were burst in two completely separate sub-ranges that never touched. So:

```
best(left, right) = max over the last balloon k between them of
    nums[left] × nums[k] × nums[right] + best(left, k) + best(k, right)
```

This is a DP over ranges (P3). Pad the list with a 1 at each end so the boundaries always exist.

```python
def maxCoins(nums):
    nums = [1] + nums + [1]
    n = len(nums)
    best = {}                                    # best[(l, r)] = coins from bursting everything strictly between l and r
    for width in range(2, n):                    # solve narrow ranges before wide ones
        for l in range(n - width):
            r = l + width
            for k in range(l + 1, r):            # k is the last balloon burst in (l, r)
                coins = nums[l] * nums[k] * nums[r] + best.get((l, k), 0) + best.get((k, r), 0)
                best[(l, r)] = max(best.get((l, r), 0), coins)
    return best.get((0, n - 1), 0)
```

That turns an O(n!) search over bursting orders into O(n³).

### Worked example 3: make the format describe itself (Encode and Decode Strings, LeetCode 271)

**Problem.** Write `encode(list of strings) → one string` and `decode(that string) → the original list`. The strings may contain any characters, including whatever separator you might pick.

**Why a separator fails.** Joining with `","` breaks as soon as a string contains a comma. Any single separator character has the same problem.

**The reformulation.** Instead of marking where each string *ends*, say how *long* it is up front. Write each string as `length#string`. The decoder reads digits up to the `#`, then takes exactly that many characters, whatever they are.

```python
def encode(strs):
    return "".join(f"{len(s)}#{s}" for s in strs)        # ["ab", "#c"] -> "2#ab2##c"

def decode(data):
    result, i = [], 0
    while i < len(data):
        j = data.index("#", i)                   # the # right after the length digits
        length = int(data[i:j])
        result.append(data[j + 1 : j + 1 + length])
        i = j + 1 + length                       # jump past this string, whatever it contains
    return result
```

### Where else it shows up

The problems in the table above, plus the hardest problems in the 150 (Word Search II 212, Reverse Nodes in k-Group 25, N-Queens 51, Minimum Interval to Include Each Query 1851, Reconstruct Itinerary 332, Swim in Rising Water 778), where two or three principles have to be combined. `CONTRASTS.md` Part C walks through those combinations.

**Beyond the list:** any problem whose natural model is a step-by-step simulation. Ask: what number does the simulation end up computing, and can it be computed directly?

### How to practice this move

After solving any problem, write one sentence of the form: *"This was really [principle] once I saw the input as ___."* The sentence is the part that transfers to new problems. The code is not.

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
2. **For each principle, do the worked examples cold.** Read the problem, the slow way and the fix, then close the file and write the code from the "what stays true" sentence. Compare. The code should feel inevitable, not memorized.
3. **Then do the "Where else it shows up" list for that principle in one sitting.** You are training recognition: the same idea behind different stories. Say the "what stays true" sentence before each.
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
