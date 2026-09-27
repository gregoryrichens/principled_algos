# Batch B Notes — Binary Search, Linked List, Heap / Priority Queue, Intervals

## 704 Binary Search  [Binary Search, Easy]
- **Trigger**: array is sorted; asked to find a single target's index (or "not found").
- **Brute force -> optimal leap**: instead of scanning linearly (O(n)), use the sorted invariant to eliminate half the remaining candidates with one comparison.
- **Core principle(s)**:
  - Sorted/monotonic input lets you discard half the search space each step (binary search invariant).
- **Invariant / state**: the answer, if it exists, always lies in `nums[l..r]`.
- **Key code idiom**:
```python
l, r = 0, len(nums) - 1
while l <= r:
    m = l + (r - l) // 2
    if nums[m] > target: r = m - 1
    elif nums[m] < target: l = m + 1
    else: return m
return -1
```
- **Complexity**: O(log n) time, O(1) space.
- **Siblings**: 74, 153, 33, 981 (this batch); LC 35 Search Insert Position, LC 34 Find First/Last Position.

## 74 Search a 2D Matrix  [Binary Search, Medium]
- **Trigger**: matrix sorted row-major (rows sorted, first element of each row > last of previous) — effectively one big sorted sequence.
- **Brute force -> optimal leap**: O(m·n) linear scan → notice the whole matrix is isomorphic to a single sorted 1D array (or: binary search rows first, then binary search the found row), turning it into two nested applications of #704.
- **Core principle(s)**:
  - Sorted/monotonic input lets you discard half the search space each step (binary search invariant).
  - Map a multi-dimensional sorted structure onto a 1D index space (`mid // cols`, `mid % cols`) to reuse plain binary search.
- **Invariant / state**: target, if present, lies within `matrix[top..bot]` rows, then within the found row's `[l..r]` columns.
- **Key code idiom**:
```python
left, right = 0, rows * cols - 1
while left <= right:
    mid = (left + right) // 2
    num = matrix[mid // cols][mid % cols]
    if num == target: return True
    elif num < target: left = mid + 1
    else: right = mid - 1
```
- **Complexity**: O(log(m·n)) time, O(1) space.
- **Siblings**: 704 (this batch); LC 240 Search a 2D Matrix II (monotonic staircase, different technique).

## 875 Koko Eating Bananas  [Binary Search, Medium]
- **Trigger**: "find minimum/maximum value such that a check(value) succeeds" + check(value) is monotonic (if speed k works, every speed > k also works).
- **Brute force -> optimal leap**: try every speed 1..max(piles) linearly (O(n·m)) → binary search directly over the *answer* (the eating speed), not over an array index, using feasibility as the comparator.
- **Core principle(s)**:
  - Binary search over the answer/value space: when "can we succeed with candidate value v" is monotonic, binary-search v instead of scanning it.
- **Invariant / state**: `res` = smallest speed confirmed feasible so far; search range `[l, r]` brackets the true minimum feasible speed.
- **Key code idiom**:
```python
l, r = 1, max(piles)
while l <= r:
    k = (l + r) // 2
    hours = sum(math.ceil(p / k) for p in piles)
    if hours <= h: r = k - 1   # feasible, try smaller k
    else: l = k + 1
return l
```
- **Complexity**: O(n log m) time (m = max pile), O(1) space.
- **Siblings**: 4 (this batch, partition search is a cousin); LC 1011 Capacity To Ship Packages, LC 1231 Divide Chocolate, LC 410 Split Array Largest Sum.

## 153 Find Minimum in Rotated Sorted Array  [Binary Search, Medium]
- **Trigger**: array is sorted but rotated at an unknown pivot; asked for the minimum (the pivot element).
- **Brute force -> optimal leap**: O(n) linear scan for the minimum → binary search using the fact that comparing `nums[mid]` to an endpoint tells you which side is "still sorted" and which side contains the rotation point.
- **Core principle(s)**:
  - Rotated sorted array: comparing mid against an endpoint reveals which half is properly sorted; the discontinuity (and thus the answer) is always in the other half.
- **Invariant / state**: the minimum element always lies in `nums[l..r]`.
- **Key code idiom**:
```python
l, r = 0, len(nums) - 1
while l < r:
    mid = l + (r - l) // 2
    if nums[mid] > nums[r]: l = mid + 1   # min is to the right
    else: r = mid                         # min is mid or to the left
return nums[l]
```
- **Complexity**: O(log n) time, O(1) space.
- **Siblings**: 33 (this batch, same rotation trick); LC 154 Find Minimum in Rotated Sorted Array II (duplicates).

## 33 Search in Rotated Sorted Array  [Binary Search, Medium]
- **Trigger**: rotated sorted array; asked to find a specific target's index.
- **Brute force -> optimal leap**: O(n) scan → determine which half (`[l,mid]` or `[mid,r]`) is sorted via `nums[l] <= nums[mid]`, then check if target lies within that sorted half's value range to pick a direction, same as #153 but extended to targeted search.
- **Core principle(s)**:
  - Rotated sorted array: comparing mid against an endpoint reveals which half is properly sorted; use that half's known value range to decide where the target can be.
- **Invariant / state**: target, if present, lies within `nums[l..r]`.
- **Key code idiom**:
```python
while l <= r:
    mid = (l + r) // 2
    if target == nums[mid]: return mid
    if nums[l] <= nums[mid]:          # left half sorted
        if nums[l] <= target < nums[mid]: r = mid - 1
        else: l = mid + 1
    else:                              # right half sorted
        if nums[mid] < target <= nums[r]: l = mid + 1
        else: r = mid - 1
```
- **Complexity**: O(log n) time, O(1) space.
- **Siblings**: 153 (this batch); LC 81 Search in Rotated Sorted Array II (duplicates).

## 981 Time Based Key-Value Store  [Binary Search, Medium]
- **Trigger**: need "value as of time T" queries; values for a key arrive with strictly increasing timestamps (naturally sorted).
- **Brute force -> optimal leap**: linear scan through a key's history each `get()` (O(n)) → binary search for the largest timestamp ≤ T (predecessor search) since the per-key list is already sorted by timestamp.
- **Core principle(s)**:
  - Sorted/monotonic input lets you discard half the search space each step (binary search invariant), here to find a floor/predecessor rather than an exact match.
  - Trade space for time: a hash map from key → its own sorted list turns a global search into a per-key binary search.
- **Invariant / state**: `res` holds the best (latest) timestamp ≤ target found so far; search narrows `[l,r]` over the key's value list.
- **Key code idiom**:
```python
values = self.keyStore.get(key, [])
l, r, res = 0, len(values) - 1, ""
while l <= r:
    m = (l + r) // 2
    if values[m][1] <= timestamp:
        res = values[m][0]; l = m + 1
    else:
        r = m - 1
return res
```
- **Complexity**: O(1) set, O(log n) get; O(n) total space.
- **Siblings**: 704 (this batch, floor-search variant); LC 1146 Snapshot Array, LC 1352-style versioned lookups.

## 4 Median of Two Sorted Arrays  [Binary Search, Hard]
- **Trigger**: two sorted arrays, need a global order-statistic (median) without fully merging.
- **Brute force -> optimal leap**: merge both arrays O(n+m) → binary search over *how many elements to take from the smaller array* (the partition point), because "is this partition valid" is monotonic, letting the correct partition be found in log time.
- **Core principle(s)**:
  - Binary search over the answer/value space: search over the partition index (an abstract "answer") using a monotonic validity check, exactly like searching over Koko's speed.
- **Invariant / state**: partition `(i in A, j in B)` with `i+j == half` is valid when `Aleft <= Bright and Bleft <= Aright`.
- **Key code idiom**:
```python
while True:
    i = (l + r) // 2
    j = half - i - 2
    Aleft = A[i] if i >= 0 else float("-inf")
    Aright = A[i+1] if i+1 < len(A) else float("inf")
    Bleft = B[j] if j >= 0 else float("-inf")
    Bright = B[j+1] if j+1 < len(B) else float("inf")
    if Aleft <= Bright and Bleft <= Aright:
        return ...  # median from these four values
    elif Aleft > Bright: r = i - 1
    else: l = i + 1
```
- **Complexity**: O(log(min(n, m))) time, O(1) space.
- **Siblings**: 875 (this batch, same "binary search the answer" family); LC 719 Kth Smallest Pair Distance, LC 378 Kth Smallest in Sorted Matrix.

## 206 Reverse Linked List  [Linked List, Easy]
- **Trigger**: asked to reverse a singly linked list in place.
- **Brute force -> optimal leap**: copy values to an array, reverse, rebuild the list (O(n) extra space) → rewire `.next` pointers directly while walking once, caching the "next" node before you overwrite it.
- **Core principle(s)**:
  - In-place pointer rewiring: cache the next pointer before overwriting `curr.next`, so you never lose access to the rest of the list.
- **Invariant / state**: `prev` is always the correctly-reversed list built so far; `curr` is the next unprocessed original node.
- **Key code idiom**:
```python
prev, curr = None, head
while curr:
    temp = curr.next
    curr.next = prev
    prev = curr
    curr = temp
return prev
```
- **Complexity**: O(n) time, O(1) space.
- **Siblings**: 143, 25 (this batch, reuse reversal as a sub-step); LC 92 Reverse Linked List II, LC 234 Palindrome Linked List.

## 21 Merge Two Sorted Lists  [Linked List, Easy]
- **Trigger**: two sorted lists must be combined into one sorted list.
- **Brute force -> optimal leap**: dump both into an array, sort, rebuild (O((n+m) log(n+m))) → since both are already sorted, walk both with one pointer each and always attach the smaller head (O(n+m)).
- **Core principle(s)**:
  - Sorted/monotonic input lets you avoid re-sorting: a single synchronized pass over two sorted sequences produces a sorted merge (two-pointer merge).
  - A dummy head node removes special-casing of "what is the first node" when building a new list.
- **Invariant / state**: everything attached to `dummy` so far is sorted and ≤ both remaining heads.
- **Key code idiom**:
```python
dummy = node = ListNode()
while list1 and list2:
    if list1.val < list2.val:
        node.next, list1 = list1, list1.next
    else:
        node.next, list2 = list2, list2.next
    node = node.next
node.next = list1 or list2
return dummy.next
```
- **Complexity**: O(n + m) time, O(1) space (iterative).
- **Siblings**: 23 (this batch, generalizes to k lists); LC 88 Merge Sorted Array.

## 143 Reorder List  [Linked List, Medium]
- **Trigger**: need to interleave a list with its own reverse (L0,Ln,L1,Ln-1,...) without extra array storage.
- **Brute force -> optimal leap**: copy to array, reorder by index, rebuild (O(n) space) → find the middle with fast/slow pointers, reverse the second half in place, then splice the two halves together alternately.
- **Core principle(s)**:
  - Fast/slow (two-speed) pointers locate the middle of a list in one pass without knowing its length in advance.
  - In-place pointer rewiring: reverse the second half using the same cache-next-before-overwrite technique as #206.
- **Invariant / state**: `slow` ends at the middle; after reversal `prev` is the reversed second half's head; during merge, nodes are spliced one-from-each-half at a time.
- **Key code idiom**:
```python
slow, fast = head, head.next
while fast and fast.next:
    slow, fast = slow.next, fast.next.next
second = slow.next; slow.next = None
prev = None
while second:
    tmp = second.next; second.next = prev; prev = second; second = tmp
first, second = head, prev
while second:
    t1, t2 = first.next, second.next
    first.next, second.next = second, t1
    first, second = t1, t2
```
- **Complexity**: O(n) time, O(1) space.
- **Siblings**: 206 (reversal sub-step), 19 (fast/slow), 141/287 (fast/slow family) — all this batch; LC 234 Palindrome Linked List.

## 19 Remove Nth Node From End of List  [Linked List, Medium]
- **Trigger**: need the node "n from the end" in a singly linked list, ideally in one pass.
- **Brute force -> optimal leap**: two passes — count length N, then walk to node `N-n` → keep a fixed gap of `n` between a lead pointer and a trail pointer so when the leader hits the end, the trailer is exactly at the removal point, in one pass.
- **Core principle(s)**:
  - Fast/slow (two-speed) pointers: maintaining a fixed offset between two pointers converts a "distance from the end" query into a single left-to-right pass.
  - A dummy head node removes special-casing of "what if we remove the actual head."
- **Invariant / state**: `right` is always exactly `n` nodes ahead of `left`.
- **Key code idiom**:
```python
dummy = ListNode(0, head)
left = dummy; right = head
for _ in range(n): right = right.next
while right:
    left, right = left.next, right.next
left.next = left.next.next
return dummy.next
```
- **Complexity**: O(n) time, O(1) space.
- **Siblings**: 143, 141, 287 (fast/slow family, this batch); LC 876 Middle of the Linked List.

## 138 Copy List with Random Pointer  [Linked List, Medium]
- **Trigger**: deep-copy a structure where nodes reference other nodes (here via `random`) that may not have been created yet when you visit the current node.
- **Brute force -> optimal leap**: can't build `random` pointers in a single forward pass because the target copy might not exist yet → make one pass to create all copies and remember old→new via a hash map, then a second pass to wire `next`/`random` using that map.
- **Core principle(s)**:
  - Trade space for time: a hash map from old node identity → new node identity resolves forward/self references when deep-copying a graph-like structure in two passes.
- **Invariant / state**: `oldToCopy` is a complete bijection between every original node (plus `None`) and its clone before any pointer-wiring happens.
- **Key code idiom**:
```python
oldToCopy = {None: None}
cur = head
while cur:
    oldToCopy[cur] = Node(cur.val); cur = cur.next
cur = head
while cur:
    copy = oldToCopy[cur]
    copy.next = oldToCopy[cur.next]
    copy.random = oldToCopy[cur.random]
    cur = cur.next
return oldToCopy[head]
```
- **Complexity**: O(n) time, O(n) space.
- **Siblings**: LC 133 Clone Graph, LC 1490 Clone N-ary Tree (same old→new map pattern).

## 2 Add Two Numbers  [Linked List, Medium]
- **Trigger**: two numbers stored as linked lists in reverse digit order; need their sum as a list.
- **Brute force -> optimal leap**: convert both lists to integers, add, convert back (fails for arbitrarily large numbers / awkward) → simulate grade-school column addition directly on the lists, carrying a `carry` variable forward.
- **Core principle(s)**:
  - Simulate the elementary algorithm (digit-by-digit addition) directly on the data structure, threading a small piece of state (`carry`) across iterations.
  - A dummy head node removes special-casing of the first produced digit.
- **Invariant / state**: `carry` holds the overflow from the previous digit; loop continues while either list has nodes or a carry remains.
- **Key code idiom**:
```python
dummy = cur = ListNode()
carry = 0
while l1 or l2 or carry:
    v1 = l1.val if l1 else 0
    v2 = l2.val if l2 else 0
    val = v1 + v2 + carry
    carry, val = val // 10, val % 10
    cur.next = ListNode(val); cur = cur.next
    l1 = l1.next if l1 else None
    l2 = l2.next if l2 else None
return dummy.next
```
- **Complexity**: O(max(n, m)) time, O(max(n, m)) space (output).
- **Siblings**: LC 415 Add Strings, LC 43 Multiply Strings (same carry-simulation idea).

## 141 Linked List Cycle  [Linked List, Easy]
- **Trigger**: need to detect whether a linked list loops back on itself, ideally O(1) space.
- **Brute force -> optimal leap**: hash set of visited nodes (O(n) space) → run two pointers at different speeds (1 step / 2 steps); if a cycle exists they must eventually collide because the gap between them shrinks by 1 each iteration inside the loop.
- **Core principle(s)**:
  - Fast/slow (two-speed) pointers detect cycles: within a loop the gap between the two pointers strictly decreases each step, guaranteeing a meeting.
- **Invariant / state**: `fast` is always exactly `2×steps` from start, `slow` exactly `steps`; if a cycle exists, `fast - slow` (mod cycle length) shrinks toward 0.
- **Key code idiom**:
```python
slow, fast = head, head
while fast and fast.next:
    slow, fast = slow.next, fast.next.next
    if slow == fast: return True
return False
```
- **Complexity**: O(n) time, O(1) space.
- **Siblings**: 287 (this batch, identical algorithm on an array); LC 142 Linked List Cycle II, LC 202 Happy Number.

## 287 Find the Duplicate Number  [Linked List, Medium]
- **Trigger**: array of n+1 values in [1,n] guaranteed to contain a duplicate — but framed as "no extra space, don't modify array," which rules out hashing/sorting.
- **Brute force -> optimal leap**: hash set to detect a repeat (O(n) space) → observe that `i -> nums[i]` defines a functional graph (implicit linked list) with a guaranteed cycle whose entry point is the duplicate; reuse Floyd's cycle detection (#141) verbatim.
- **Core principle(s)**:
  - Fast/slow (two-speed) pointers detect cycles and, with a second phase, locate the cycle's entry point.
  - Recognize an implicit graph/linked-list structure hiding inside array-indexing rules, so a known list algorithm becomes applicable.
- **Invariant / state**: phase 1 finds *a* meeting point inside the cycle; phase 2 exploits that distance-from-start to cycle-entrance equals distance-from-meeting-point to cycle-entrance (standard Floyd property).
- **Key code idiom**:
```python
slow, fast = 0, 0
while True:
    slow, fast = nums[slow], nums[nums[fast]]
    if slow == fast: break
slow2 = 0
while True:
    slow, slow2 = nums[slow], nums[slow2]
    if slow == slow2: return slow
```
- **Complexity**: O(n) time, O(1) space.
- **Siblings**: 141 (this batch, same algorithm); LC 142 Linked List Cycle II.

## 146 LRU Cache  [Linked List, Medium]
- **Trigger**: need O(1) get/put on a fixed-capacity cache with eviction of the least-recently-used entry.
- **Brute force -> optimal leap**: array/list of (key,val) reordered on every access (O(n) per op) → pair a hash map (O(1) lookup) with a doubly linked list (O(1) unlink/relink) so both "find by key" and "move to most-recent end / evict least-recent end" are O(1).
- **Core principle(s)**:
  - Combine a hash map (O(1) lookup) with a doubly linked list (O(1) reorder/delete) to get an O(1) ordered structure.
- **Invariant / state**: the doubly linked list is ordered from least-recently-used (`left` side) to most-recently-used (`right` side); `cache` always maps key → its current node in that list.
- **Key code idiom**:
```python
def get(self, key):
    if key in self.cache:
        self.remove(self.cache[key]); self.insert(self.cache[key])
        return self.cache[key].val
    return -1

def put(self, key, value):
    if key in self.cache: self.remove(self.cache[key])
    self.cache[key] = Node(key, value); self.insert(self.cache[key])
    if len(self.cache) > self.cap:
        lru = self.left.next; self.remove(lru); del self.cache[lru.key]
```
- **Complexity**: O(1) per operation, O(capacity) space.
- **Siblings**: LC 460 LFU Cache (same hashmap + ordered-structure idea, ordered by frequency then recency); 355 Design Twitter (heap-based ordering variant, this batch).

## 23 Merge K Sorted Lists  [Linked List, Hard]
- **Trigger**: generalization of "merge two sorted lists" to k lists.
- **Brute force -> optimal leap**: dump all nodes into an array, sort (O(N log N)) → repeatedly apply the pairwise merge from #21, halving the number of lists each round (like merge sort's combine step), or equivalently keep the current head of every list in a heap and always pop the global smallest.
- **Core principle(s)**:
  - K-way merge: repeatedly/simultaneously combine several already-sorted sequences by only ever looking at their current fronts (heap or divide-and-conquer pairwise merge), never re-sorting the whole thing.
- **Invariant / state**: after each round, every list in the working set is fully sorted and the number of lists halves; equivalently (heap variant) the heap always holds exactly one still-unconsumed node per non-exhausted list, so its min is the global next output.
- **Key code idiom**:
```python
while len(lists) > 1:
    merged = []
    for i in range(0, len(lists), 2):
        l1 = lists[i]
        l2 = lists[i + 1] if i + 1 < len(lists) else None
        merged.append(self.mergeList(l1, l2))
    lists = merged
return lists[0]
```
- **Complexity**: O(N log k) time (N = total nodes, k = number of lists), O(1) extra space beyond output.
- **Siblings**: 21 (base case, this batch), 355 Design Twitter (heap k-way merge, this batch); LC 373 Find K Pairs with Smallest Sums.

## 25 Reverse Nodes in K Group  [Linked List, Hard]
- **Trigger**: reverse a linked list in fixed-size chunks of k, leaving a final partial chunk untouched.
- **Brute force -> optimal leap**: copy to array, reverse each chunk, rebuild (O(n) space) → reuse the in-place reversal from #206 on each k-sized segment, carefully re-linking the previous group's tail to the new group head and tracking where the next group starts.
- **Core principle(s)**:
  - In-place pointer rewiring: reverse each segment using the cache-next-before-overwrite technique, generalized from a whole list (#206) to a bounded window.
  - A dummy head node removes special-casing of the very first group.
- **Invariant / state**: `groupPrev` always points to the node immediately before the current (already-processed) group; each iteration must first check that a full group of k nodes exists before reversing it.
- **Key code idiom**:
```python
while True:
    kth = self.getKth(groupPrev, k)
    if not kth: break
    groupNext = kth.next
    prev, curr = kth.next, groupPrev.next
    while curr != groupNext:
        tmp = curr.next; curr.next = prev; prev = curr; curr = tmp
    tmp = groupPrev.next
    groupPrev.next = kth
    groupPrev = tmp
return dummy.next
```
- **Complexity**: O(n) time, O(1) space.
- **Siblings**: 206 (this batch, base reversal); LC 24 Swap Nodes in Pairs (k=2 special case).

## 703 Kth Largest Element in a Stream  [Heap / Priority Queue, Easy]
- **Trigger**: need the k-th largest value repeatedly as new values stream in.
- **Brute force -> optimal leap**: re-sort all seen values on every `add()` (O(n log n) each) → keep only the k largest values ever seen in a min-heap of bounded size k; its root (the smallest of the k largest) *is* the k-th largest.
- **Core principle(s)**:
  - Bounded heap of size k: keep only the k best-so-far candidates; the heap's root is exactly the k-th best (min-heap root = k-th largest, max-heap root = k-th smallest).
- **Invariant / state**: `minHeap` always contains exactly the k largest elements seen so far (or fewer, before k elements arrive); its root is the current k-th largest.
- **Key code idiom**:
```python
def add(self, val):
    heapq.heappush(self.minHeap, val)
    if len(self.minHeap) > self.k:
        heapq.heappop(self.minHeap)
    return self.minHeap[0]
```
- **Complexity**: O(log k) per add, O(k) space.
- **Siblings**: 973, 215 (this batch, identical bounded-heap idea); LC 347 Top K Frequent Elements.

## 1046 Last Stone Weight  [Heap / Priority Queue, Easy]
- **Trigger**: repeatedly need the current maximum (or two maxima) from a shrinking/changing collection.
- **Brute force -> optimal leap**: re-sort the array every round to find the two largest (O(n² log n) overall) → put everything in a max-heap once; each round is just two O(log n) pops and one O(log n) push.
- **Core principle(s)**:
  - Heap as a priority-ordered "always give me the current max/min" oracle, avoiding a full re-sort after every mutation.
- **Invariant / state**: heap always holds the current multiset of stone weights (negated for Python's min-heap-as-max-heap trick).
- **Key code idiom**:
```python
stones = [-s for s in stones]
heapq.heapify(stones)
while len(stones) > 1:
    first, second = heapq.heappop(stones), heapq.heappop(stones)
    if second > first:
        heapq.heappush(stones, first - second)
```
- **Complexity**: O(n log n) time, O(n) space.
- **Siblings**: 621 Task Scheduler, 295 Find Median from Data Stream (this batch, same "heap as live max/min oracle" idea).

## 973 K Closest Points to Origin  [Heap / Priority Queue, Medium]
- **Trigger**: need the k "best" (here: closest) items out of n by some derived key, k typically ≪ n.
- **Brute force -> optimal leap**: sort all n points by distance, take first k (O(n log n)) → keep a bounded structure of size k (either a max-heap you evict the farthest from, or — as in the canonical solution — heapify all and pop k times) so you never fully sort the untaken elements.
- **Core principle(s)**:
  - Bounded heap of size k: keep only the k best-so-far candidates by a derived key (distance), same mechanism as #703.
- **Invariant / state**: the heap orders candidates by the derived key (squared distance), so popping/peeking always exposes the current best/worst of the retained set.
- **Key code idiom**:
```python
minHeap = [(x*x + y*y, x, y) for x, y in points]
heapq.heapify(minHeap)
res = []
for _ in range(k):
    _, x, y = heapq.heappop(minHeap)
    res.append((x, y))
```
- **Complexity**: O(n log k) time (bounded-heap variant) / O(n + k log n) (heapify-all variant), O(k) space.
- **Siblings**: 703, 215 (this batch); LC 347 Top K Frequent Elements, LC 692 Top K Frequent Words.

## 215 Kth Largest Element in an Array  [Heap / Priority Queue, Medium]
- **Trigger**: need the k-th largest of a static array — classic "order statistic" ask.
- **Brute force -> optimal leap**: full sort O(n log n) → bounded min-heap of size k (same as #703) gives O(n log k); or partition-based quickselect gives expected O(n) by only ever recursing into the side that must contain the answer.
- **Core principle(s)**:
  - Bounded heap of size k: keep only the k largest seen so far; root is the k-th largest.
  - (Quickselect variant) Use partitioning to discard the side of the array that cannot contain the k-th order statistic — a discrete analogue of binary search's "eliminate half."
- **Invariant / state**: min-heap variant: heap holds exactly the k largest elements processed so far.
- **Key code idiom**:
```python
heapify(nums)
while len(nums) > k:
    heappop(nums)
return nums[0]
```
- **Complexity**: O(n log k) time (heap) / O(n) average (quickselect), O(k) / O(n) space respectively.
- **Siblings**: 703, 973 (this batch); LC 347 Top K Frequent Elements, LC 973 (quickselect family).

## 621 Task Scheduler  [Heap / Priority Queue, Medium]
- **Trigger**: schedule discrete tasks with a per-type cooldown, minimizing total time — "always do the most-backlogged thing next, but respect a delay."
- **Brute force -> optimal leap**: try all orderings / simulate naively → greedily always run the currently most-frequent remaining task (fetched via max-heap in O(log 26)), and hold just-run tasks in a cooldown queue until their `n`-step delay expires before they're eligible again.
- **Core principle(s)**:
  - Heap as a priority-ordered "always give me the current max" oracle to implement a greedy "do the most-constrained thing first" strategy.
  - Model a delay/cooldown constraint with an auxiliary queue holding (item, time-it-becomes-eligible-again) pairs.
- **Invariant / state**: `maxHeap` holds remaining counts of tasks currently eligible to run; `q` holds tasks on cooldown paired with the time they re-enter the heap.
- **Key code idiom**:
```python
while maxHeap or q:
    time += 1
    if maxHeap:
        cnt = 1 + heapq.heappop(maxHeap)
        if cnt: q.append([cnt, time + n])
    else:
        time = q[0][1]
    if q and q[0][1] == time:
        heapq.heappush(maxHeap, q.popleft()[0])
```
- **Complexity**: O(m) time (m = number of tasks; heap bounded by 26), O(1) space.
- **Siblings**: 1046, 295 (this batch, heap-as-oracle); LC 358 Rearrange String k Distance Apart.

## 355 Design Twitter  [Heap / Priority Queue, Medium]
- **Trigger**: need the top-10 most recent items merged from several already-individually-sorted-by-time lists (one per followee).
- **Brute force -> optimal leap**: collect every followee's every tweet, sort by time, take top 10 (O(T log T)) → this is k-way merge (same shape as merging k sorted lists): push each followee's most recent tweet into a heap, pop the global max, then push that followee's next-most-recent tweet, repeat 10 times.
- **Core principle(s)**:
  - K-way merge: pull the current best among k sorted sequences off a heap, push that sequence's next element back — reuse rather than re-derive.
  - Trade space for time: hash maps (`tweetMap`, `followMap`) give O(1) access to each user's own sorted tweet list and follow-set.
- **Invariant / state**: heap holds at most one "current" (count, tweetId, followeeId, nextIndex) tuple per followee, always the most-recent tweet from that followee not yet emitted.
- **Key code idiom**:
```python
minHeap = []
for followeeId in self.followMap[userId]:
    if followeeId in self.tweetMap:
        idx = len(self.tweetMap[followeeId]) - 1
        count, tid = self.tweetMap[followeeId][idx]
        heapq.heappush(minHeap, [count, tid, followeeId, idx - 1])
while minHeap and len(res) < 10:
    count, tid, fid, idx = heapq.heappop(minHeap)
    res.append(tid)
    if idx >= 0:
        heapq.heappush(minHeap, [*self.tweetMap[fid][idx], fid, idx - 1])
```
- **Complexity**: O(f log f) per feed call (f = followees), O(1)/O(1)/O(1) for post/follow/unfollow; O(u + t) space.
- **Siblings**: 23 Merge K Sorted Lists (this batch, identical k-way merge pattern).

## 295 Find Median from Data Stream  [Heap / Priority Queue, Hard]
- **Trigger**: need the running median of a stream, with fast inserts and fast median queries.
- **Brute force -> optimal leap**: insert into a sorted array each time (O(n) insert) or sort on every query (O(n log n)) → split the data into a max-heap (lower half) and a min-heap (upper half), rebalanced to differ in size by at most 1, so the median is always at one/both roots in O(1).
- **Core principle(s)**:
  - Two heaps split at the median (or other balance point), kept size-balanced, give O(log n) insert and O(1) query of the split point.
- **Invariant / state**: every element in `small` (max-heap) ≤ every element in `large` (min-heap); `len(small)` and `len(large)` differ by at most 1.
- **Key code idiom**:
```python
def addNum(self, num):
    if self.large and num > self.large[0]:
        heapq.heappush(self.large, num)
    else:
        heapq.heappush(self.small, -num)
    if len(self.small) > len(self.large) + 1:
        heapq.heappush(self.large, -heapq.heappop(self.small))
    if len(self.large) > len(self.small) + 1:
        heapq.heappush(self.small, -heapq.heappop(self.large))
```
- **Complexity**: O(log n) per addNum, O(1) per findMedian, O(n) space.
- **Siblings**: 1046, 621 (this batch, heap-as-oracle family); LC 480 Sliding Window Median.

## 57 Insert Interval  [Intervals, Medium]
- **Trigger**: intervals already sorted & non-overlapping; a new interval must be merged in while preserving that invariant.
- **Brute force -> optimal leap**: append then re-sort-and-merge everything (O(n log n)) → since the list is already sorted, one linear pass suffices: copy untouched intervals before the overlap region, absorb all overlapping intervals into a growing `newInterval`, then copy the rest.
- **Core principle(s)**:
  - Sort/already-sorted + single linear pass: because intervals are ordered by start, overlap can only ever be checked against the most recently seen interval — no need to look back further.
- **Invariant / state**: `newInterval` always represents the union of the new interval with every overlapping interval merged in so far.
- **Key code idiom**:
```python
for i in range(len(intervals)):
    if newInterval[1] < intervals[i][0]:
        return res + [newInterval] + intervals[i:]
    elif newInterval[0] > intervals[i][1]:
        res.append(intervals[i])
    else:
        newInterval = [min(newInterval[0], intervals[i][0]),
                       max(newInterval[1], intervals[i][1])]
res.append(newInterval)
```
- **Complexity**: O(n) time, O(n) space.
- **Siblings**: 56 (this batch, same merge logic without the "insert" framing).

## 56 Merge Intervals  [Intervals, Medium]
- **Trigger**: arbitrary-order intervals; merge all that overlap.
- **Brute force -> optimal leap**: pairwise compare all intervals (O(n²)) → sort by start (O(n log n)) so overlap can only occur between adjacent intervals in the sorted order, then one linear pass merges them.
- **Core principle(s)**:
  - Sort/already-sorted + single linear pass: sorting by start reduces "does this overlap any other interval" to "does this overlap the immediately preceding one."
- **Invariant / state**: `output[-1]` is always the fully-merged version of every interval processed so far that touches it.
- **Key code idiom**:
```python
intervals.sort(key=lambda pair: pair[0])
output = [intervals[0]]
for start, end in intervals:
    if start <= output[-1][1]:
        output[-1][1] = max(output[-1][1], end)
    else:
        output.append([start, end])
```
- **Complexity**: O(n log n) time, O(n) space.
- **Siblings**: 57 (this batch); LC 435, 252, 253 (this batch, all share "sort by start, single pass").

## 435 Non-overlapping Intervals  [Intervals, Medium]
- **Trigger**: minimize removals so remaining intervals are pairwise non-overlapping — an implicit "maximize kept non-overlapping intervals" optimization.
- **Brute force -> optimal leap**: try all subsets / recursive exploration (exponential) → classic activity-selection greedy: sort by end time and always keep the interval that finishes earliest among overlapping candidates, since finishing earliest never hurts future choices.
- **Core principle(s)**:
  - Interval greedy selection: sort by end time and always retain the earliest-finishing interval when a conflict occurs, to leave maximum room for the rest — locally optimal choice is also globally optimal here because "ends sooner" dominates.
- **Invariant / state**: `prevEnd` = end time of the last interval kept (not removed) so far.
- **Key code idiom**:
```python
intervals.sort()          # by start, but comparison below is what matters
prevEnd = intervals[0][1]
for start, end in intervals[1:]:
    if start >= prevEnd:
        prevEnd = end
    else:
        res += 1
        prevEnd = min(end, prevEnd)
```
- **Complexity**: O(n log n) time, O(1) extra space.
- **Siblings**: LC 435-family classics — LC 1288 Remove Covered Intervals, LC 452 Minimum Number of Arrows to Burst Balloons (identical greedy).

## 252 Meeting Rooms  [Intervals, Easy]
- **Trigger**: can one person attend every meeting — i.e., do any two intervals overlap at all.
- **Brute force -> optimal leap**: compare every pair (O(n²)) → sort by start so overlap can only happen between adjacent intervals, then a single pass checks each adjacent pair.
- **Core principle(s)**:
  - Sort/already-sorted + single linear pass: after sorting by start, only adjacent-interval comparisons are needed to detect any overlap.
- **Invariant / state**: intervals `0..i-1` (sorted) have already been confirmed pairwise non-overlapping.
- **Key code idiom**:
```python
intervals.sort(key=lambda i: i[0])
for i in range(1, len(intervals)):
    if intervals[i-1][1] > intervals[i][0]:
        return False
return True
```
- **Complexity**: O(n log n) time, O(1) extra space.
- **Siblings**: 56, 253 (this batch); LC 435.

## 253 Meeting Rooms II  [Intervals, Medium]
- **Trigger**: need the maximum number of *simultaneously* overlapping intervals (min rooms needed), not just whether any overlap exists.
- **Brute force -> optimal leap**: check every time point (or every pair) for overlap count (O(n²)) → sweep-line: turn each interval into a `+1` event at its start and a `-1` event at its end, sort all events by time, and scan while tracking a running counter — its running maximum is the answer.
- **Core principle(s)**:
  - Sweep-line / event counting: convert intervals into start(+1)/end(-1) events, sort by time, and track a running counter to find the maximum (or required) concurrent count.
- **Invariant / state**: `count` = number of meetings currently in progress at the current scanned time point; `max_count` = running maximum of `count`.
- **Key code idiom**:
```python
events = [(s, 1) for s, e in intervals] + [(e, -1) for s, e in intervals]
events.sort()
count = max_count = 0
for _, delta in events:
    count += delta
    max_count = max(max_count, count)
return max_count
```
- **Complexity**: O(n log n) time, O(n) space.
- **Siblings**: 252 (this batch, degenerate case: answer > 1 means overlap exists); LC 1094 Car Pooling, LC 253's heap-based variant (min-heap of end times) is the same idea with a different bookkeeping structure.

## 1851 Minimum Interval to Include Each Query  [Intervals, Hard]
- **Trigger**: many point queries against many intervals, each query needs the smallest interval that contains it — an offline batch query problem.
- **Brute force -> optimal leap**: for each query, scan all intervals (O(n·q)) → sort both intervals and queries by position; sweep queries in increasing order, lazily adding intervals whose start has become ≤ the query into a min-heap keyed by interval size, and lazily evicting intervals whose end has already passed the query — the heap top is always the smallest still-valid interval.
- **Core principle(s)**:
  - Sweep-line / event counting, generalized: process sorted queries left to right, and maintain a heap of "currently active" candidates, adding newly-eligible ones and evicting now-invalid ones as the sweep pointer advances.
  - Bounded/priority heap ordered by the actual answer metric (interval size) rather than by position, so the best *currently valid* candidate is always at the root.
- **Invariant / state**: at the moment query `q` is processed, `minHeap` contains exactly the intervals with `start <= q`, ordered by `(size, end)`, after evicting any whose `end < q`.
- **Key code idiom**:
```python
intervals.sort()
for q in sorted(queries):
    while i < len(intervals) and intervals[i][0] <= q:
        l, r = intervals[i]
        heapq.heappush(minHeap, (r - l + 1, r))
        i += 1
    while minHeap and minHeap[0][1] < q:
        heapq.heappop(minHeap)
    res[q] = minHeap[0][0] if minHeap else -1
```
- **Complexity**: O((n + q) log n) time, O(n + q) space.
- **Siblings**: 253 (this batch, sweep-line kin); LC 435/1288 (interval greedy kin); LC 759 Employee Free Time.

---

# Batch-level synthesis

## 1. Principle tally

| # | Principle (canonical wording) | Problems |
|---|---|---|
| P1 | Sorted/monotonic input lets you discard half the search space each step (binary search invariant) | 704, 74, 981 |
| P2 | Binary search over the answer/value space when a feasibility/validity check is monotonic in the candidate answer | 875, 4 |
| P3 | Rotated sorted array: compare mid to an endpoint to find which half is properly sorted, then decide direction from that | 153, 33 |
| P4 | In-place pointer rewiring: cache `next` before overwriting it to reverse/relink a list without extra space | 206, 143, 25 |
| P5 | Fast/slow (two-speed) pointers: find the middle, detect a cycle, or hold a fixed gap from the end, in one pass | 143, 19, 141, 287 |
| P6 | Dummy head node removes special-casing of the first/head element when building or splicing a list | 21, 19, 2, 25 |
| P7 | Trade space for time: hash map from old identity → new identity resolves forward references (two-pass deep copy) | 138, 355 (followMap/tweetMap) |
| P8 | Combine a hash map (O(1) lookup) with a doubly linked list (O(1) reorder/delete) for O(1) ordered access | 146 |
| P9 | Simulate the elementary/manual algorithm directly on the structure, threading small state (carry) across steps | 2 |
| P10 | Bounded heap of size k: retain only the k best-so-far candidates; the root is the k-th best | 703, 973, 215 |
| P11 | Heap as an "always give me current max/min" live oracle, avoiding re-sorting after each mutation | 1046, 621, 295 |
| P12 | K-way merge: pull the next-best among k sorted sequences off a heap (or pairwise-combine), push its successor back | 23, 355 |
| P13 | Two heaps split at a balance point (median), kept size-balanced, for O(log n) insert / O(1) query of the split | 295 |
| P14 | Sort by start + single linear pass: after sorting, overlap can only involve the immediately preceding interval | 57, 56, 252 |
| P15 | Sweep-line / event counting: convert intervals to +1/−1 (or add/evict) events, sort, scan a running counter for max concurrency | 253, 1851 |
| P16 | Interval greedy selection: sort by end time, always keep the earliest-finishing interval on conflict | 435 |

(21 Merge Two Sorted Lists also instantiates P6 and the two-pointer-merge idea generalized by P12.)

## 2. Candidate MERGES
- **P1 + P3 → one principle**: "rotated sorted array" search is just binary search (P1) where the monotonic comparator is "which half is properly ordered" instead of "target vs mid." Could fold P3 into P1 as a sub-case.
- **P1 + P2 → one principle**: both are "exploit monotonicity to eliminate half the search space"; P2 merely searches over an abstract answer axis instead of an array index. Given the project's own example merge ("two pointers on sorted array" + "binary search" = "exploit monotonicity"), P1/P2/P3 are arguably ONE principle: *"monotonicity lets you binary-search — over indices, over rotated halves, or over answer values."*
- **P10 + P11 → related but distinct**: P10 (bounded heap of size k) and P11 (heap as live max/min oracle) are both "heap maintains a priority-ordered view so you avoid re-sorting," differing only in whether the heap is capped at k or grows unbounded. Could merge into: *"Use a heap wherever you repeatedly need the current max/min/kth-extreme of a changing collection."*
- **P4 + P9**: both are "manipulate the data structure's pointers/state directly instead of converting to array" — arguably the same "operate in place on the native structure" idea, though P9 is about carrying arithmetic state (carry) while P4 is pure pointer surgery. Borderline merge.
- **P12 (k-way merge) is itself a specialization of P10/P11**: a k-way merge heap is a bounded heap holding "current front of each sequence" — could be seen as a special case of "heap tracks the best-so-far among competing streams."
- **P14 (sort+linear pass for intervals) and P1 (binary search discard-half)** are both "sorted order removes the need to compare against everything — only the neighbor/boundary matters." Same family as the brief's own worked example.
- **P6 (dummy head) and P7/P8 (hash map for O(1) resolution)** are NOT the same idea — P6 is a coding convenience to avoid `if not head` branches; P7/P8 solve genuine complexity problems. Do not merge these.

Overall recommendation: the batch's ~16 principles compress to roughly 6 "deep" ideas:
1. Monotonicity → binary search (over index, rotated half, or answer value) [P1+P2+P3].
2. Two-pointer/two-speed traversal for structural facts about a list (middle, cycle, k-from-end) [P5].
3. Pointer surgery in place (reversal / relinking / carried arithmetic state) [P4+P9].
4. Hash map trades space for O(1) identity/order lookups (deep copy, LRU, floor search) [P7+P8, and arguably P1's 981].
5. Heap as a live "current extreme(s)" oracle — bounded-by-k, unbounded, k-way-merge, or split-at-median are all flavors of this [P10+P11+P12+P13].
6. Sorting first turns an O(n²)/global interval-comparison problem into a local single-pass or sweep-line problem [P14+P15+P16].

## 3. Genuinely one-off tricks (don't generalize well)
- **4 Median of Two Sorted Arrays**: the exact four-way partition boundary conditions (`Aleft/Aright/Bleft/Bright` with ±infinity sentinels) are fiddly and specific to this problem; the "binary search the answer" umbrella generalizes, but the partition arithmetic itself should just be memorized.
- **287 Find the Duplicate Number**: recognizing that array-indexing (`i -> nums[i]`) forms an implicit linked list is a clever, non-obvious reframing specific to "array of indices" problems; it's a great trick but not something you'd derive from first principles without having seen it.
- **621 Task Scheduler**: the closed-form greedy formula `max((maxCount-1)*(n+1) + numTasksWithMaxCount, len(tasks))` (seen in alt solution) is a clean O(1)-per-task-type shortcut that bypasses simulation entirely — elegant but specific to this exact "identical cooldown for all task types" setup.
- **981 Time Based Key Value Store**: nothing tricky algorithmically (plain floor-search), but the modeling choice ("append-only per-key list is automatically sorted, so no need to re-sort") is a small one-off observation worth flagging.
- **1046 Last Stone Weight** `_heapify_max`/private CPython API variant: a one-off "did you know Python secretly has this" fact, not a transferable idea.

## 4. Decision cues
| If you see in the problem... | Think... |
|---|---|
| Sorted array, need index/position of a value | Binary search (P1) |
| "Find min/max X such that condition(X) holds" and condition is monotonic in X | Binary search over the answer (P2) |
| Sorted array but "rotated" / has one discontinuity | Binary search using "which half is still sorted" (P3) |
| Need the middle, a cycle, or "kth from the end" of a linked list, O(1) space required | Fast/slow two-pointer (P5) |
| Reverse or relink nodes of a list in place | Cache `next`, then rewire (P4) |
| Need to deep-copy a structure with references to sibling/other nodes | Two-pass + hash map old→new (P7) |
| Need O(1) get AND O(1) reorder/evict by recency (or similar order) | Hash map + doubly linked list (P8) |
| Need the k largest/smallest/closest of a stream or array, k ≪ n | Bounded heap of size k (P10) |
| Repeatedly need "current max/min" as a collection mutates | Heap as live oracle (P11) |
| Merging several already-sorted sequences, want the global order (or top items) | K-way merge via heap (P12) |
| Need a running median / balance point that updates online | Two heaps, size-balanced (P13) |
| Intervals; "can one pass through," "merge overlaps," "insert into sorted list" | Sort by start + single linear pass (P14) |
| Intervals; "how many rooms/resources needed at peak," "max concurrent" | Sweep-line events (+1/−1) (P15) |
| Intervals; "remove minimum to make non-overlapping," "max non-overlapping subset" | Sort by end + greedy earliest-finish keep (P16) |
