# Batch C — Trees, Tries, Backtracking (27 problems)

---

### 226 Invert Binary Tree  [Trees, Easy]
- **Trigger**: "invert/mirror a tree" — a structural transform that must be applied to every node.
- **Brute force -> optimal leap**: There is no real brute force; the leap is recognizing the transform is *local* (swap two pointers) and *recursive* (do it everywhere via traversal) — no auxiliary structure needed.
- **Core principle(s)**:
  - Recursion mirrors the tree's own recursive definition: process the node, then recurse into (now-invariant) children.
- **Invariant / state**: after `invertTree(node)` returns, the subtree rooted at `node` is fully inverted.
- **Key code idiom**:
```python
def invertTree(self, root):
    if not root: return None
    root.left, root.right = root.right, root.left
    self.invertTree(root.left)
    self.invertTree(root.right)
    return root
```
- **Complexity**: O(n) time, O(h) space (recursion stack).
- **Sibling problems**: Symmetric Tree (LC101), any "apply transform to every node" tree problem.

---

### 104 Maximum Depth of Binary Tree  [Trees, Easy]
- **Trigger**: "depth/height" of a tree.
- **Brute force -> optimal leap**: Depth is defined recursively (1 + max of children's depths); no need to enumerate paths — let each subtree report its own answer upward.
- **Core principle(s)**:
  - Bottom-up recursive combine ("tree DP"): solve on left/right subtrees first, then combine their results at the current node.
- **Invariant / state**: return value of the recursive call = the answer (depth) for the subtree rooted there.
- **Key code idiom**:
```python
def maxDepth(self, root):
    if not root: return 0
    return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))
```
- **Complexity**: O(n) time, O(h) space (also solvable iteratively with BFS in O(n)/O(n)).
- **Sibling problems**: Minimum Depth of Binary Tree, Balanced Binary Tree (110), Diameter (543).

---

### 543 Diameter of Binary Tree  [Trees, Easy]
- **Trigger**: "longest path between any two nodes" — path need not pass through the root.
- **Brute force -> optimal leap**: Naive = for every node compute height(left)+height(right), an O(n^2) re-traversal. Optimal = compute height via one post-order pass and update a global/`nonlocal` best diameter *during* that same pass — one traversal does double duty.
- **Core principle(s)**:
  - Bottom-up recursive combine (post-order returns height).
  - Piggyback a global-optimum update onto a traversal you already need, instead of a separate O(n) pass per node.
- **Invariant / state**: `res` = max(left+right) seen so far across all nodes visited; function returns height of subtree.
- **Key code idiom**:
```python
def dfs(node):
    nonlocal res
    if not node: return 0
    left, right = dfs(node.left), dfs(node.right)
    res = max(res, left + right)
    return 1 + max(left, right)
```
- **Complexity**: O(n) time, O(h) space.
- **Sibling problems**: Balanced Binary Tree (110), Binary Tree Maximum Path Sum (124).

---

### 110 Balanced Binary Tree  [Trees, Easy]
- **Trigger**: property ("balanced") depends on heights of *every* subtree, not just the root's.
- **Brute force -> optimal leap**: Naive recomputes height per node -> O(n^2). Optimal fuses the height computation and the balance check into a single post-order traversal, short-circuiting/propagating a "not balanced" signal upward.
- **Core principle(s)**:
  - Piggyback a global-optimum/validity update onto a required bottom-up height traversal (same as 543).
- **Invariant / state**: DFS returns `[isBalanced, height]` for the subtree; a subtree is balanced iff both children are balanced and `|leftHeight-rightHeight| <= 1`.
- **Key code idiom**:
```python
def dfs(root):
    if not root: return [True, 0]
    left, right = dfs(root.left), dfs(root.right)
    balanced = left[0] and right[0] and abs(left[1]-right[1]) <= 1
    return [balanced, 1 + max(left[1], right[1])]
```
- **Complexity**: O(n) time, O(h) space.
- **Sibling problems**: Diameter (543), Max Path Sum (124).

---

### 100 Same Tree  [Trees, Easy]
- **Trigger**: compare two trees for identical structure + values.
- **Brute force -> optimal leap**: N/A — the leap is traversing *both* trees in lockstep rather than serializing and comparing.
- **Core principle(s)**:
  - Recursion mirrors tree structure, applied to two structures simultaneously.
- **Invariant / state**: at each recursive step, both current nodes must match in existence and value.
- **Key code idiom**:
```python
def isSameTree(self, p, q):
    if not p and not q: return True
    if p and q and p.val == q.val:
        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)
    return False
```
- **Complexity**: O(n) time, O(h) space.
- **Sibling problems**: Subtree of Another Tree (572), Symmetric Tree (LC101).

---

### 572 Subtree of Another Tree  [Trees, Easy]
- **Trigger**: "is X a subtree anywhere in Y" — a whole-structure match nested inside a search.
- **Brute force -> optimal leap**: The naive check-every-node-with-full-comparison is already what's needed; the insight is decomposing into two recursions: an *outer* traversal that visits every node of `root`, and an *inner* subroutine (`isSameTree`) reused unchanged at each visited node.
- **Core principle(s)**:
  - Reuse a simpler whole-structure recursive check as a subroutine invoked at every node of an outer traversal.
  - Recursion mirrors tree structure (outer traversal: try here, or recurse left/right).
- **Invariant / state**: `isSubtree(root, subRoot)` is true iff `isSameTree(root, subRoot)` or true for either child.
- **Key code idiom**:
```python
def isSubtree(self, root, subRoot):
    if not subRoot: return True
    if not root: return False
    if self.isSameTree(root, subRoot): return True
    return self.isSubtree(root.left, subRoot) or self.isSubtree(root.right, subRoot)
```
- **Complexity**: O(m*n) time (m,n = node counts), O(m+n) space; can be optimized with serialization/hashing.
- **Sibling problems**: Same Tree (100).

---

### 235 Lowest Common Ancestor of a BST  [Trees, Medium]
- **Trigger**: BST (sorted-by-position tree) + "find ancestor common to two nodes."
- **Brute force -> optimal leap**: Generic-tree LCA needs O(n) (visit every node, return up). BST ordering lets you decide, in O(1) per node, whether to go left, right, or stop — no need to visit both subtrees.
- **Core principle(s)**:
  - Exploit a sorted/ordering invariant to eliminate one entire subtree at each step (binary-search-style pruning) instead of exploring both branches.
- **Invariant / state**: current `root` is guaranteed to be an ancestor of both `p` and `q`; loop stops at the first node where their paths diverge.
- **Key code idiom**:
```python
while True:
    if root.val < p.val and root.val < q.val: root = root.right
    elif root.val > p.val and root.val > q.val: root = root.left
    else: return root
```
- **Complexity**: O(h) time, O(1) space (iterative).
- **Sibling problems**: LCA of Binary Tree (generic, LC236), Binary Search (704), any BST-ordering exploit.

---

### 102 Binary Tree Level Order Traversal  [Trees, Medium]
- **Trigger**: results grouped "by level"/"by distance from root."
- **Brute force -> optimal leap**: DFS with depth tracking works but BFS naturally visits level-by-level; snapshot the queue's length before iterating so children added during the loop don't leak into the current level.
- **Core principle(s)**:
  - Level-by-level BFS: process nodes in batches using a queue-length snapshot to separate layers.
- **Invariant / state**: at the top of each `while` iteration, `q` contains exactly the nodes of one level.
- **Key code idiom**:
```python
while q:
    val = []
    for i in range(len(q)):
        node = q.popleft()
        val.append(node.val)
        if node.left: q.append(node.left)
        if node.right: q.append(node.right)
    res.append(val)
```
- **Complexity**: O(n) time, O(n) space.
- **Sibling problems**: Binary Tree Right Side View (199), Rotting Oranges, any grid/graph BFS-by-level.

---

### 199 Binary Tree Right Side View  [Trees, Medium]
- **Trigger**: "what's visible from the side" per level -> the last node processed at each level.
- **Brute force -> optimal leap**: Same BFS-by-level machinery as 102; just keep the last node seen in each level's loop instead of collecting all of them.
- **Core principle(s)**:
  - Level-by-level BFS via queue-length snapshot (same as 102).
- **Invariant / state**: `rightSide` = last non-null node dequeued in the current level's inner loop.
- **Key code idiom**:
```python
for i in range(qLen):
    node = q.popleft()
    if node:
        rightSide = node
        q.append(node.left); q.append(node.right)
if rightSide: res.append(rightSide.val)
```
- **Complexity**: O(n) time, O(n) space.
- **Sibling problems**: Level Order Traversal (102).

---

### 1448 Count Good Nodes In Binary Tree  [Trees, Medium]
- **Trigger**: a node's property depends on the *path from the root to it* (here: max value seen so far).
- **Brute force -> optimal leap**: Naive re-walks root-to-node path for every node -> O(n^2). Optimal threads the running max down through recursion parameters during a single DFS.
- **Core principle(s)**:
  - Top-down state threading: pass ancestor/path context down as an extra recursion parameter instead of recomputing it.
- **Invariant / state**: `maxVal` passed into `dfs(node, maxVal)` = max value on the path from root to `node`'s parent.
- **Key code idiom**:
```python
def dfs(node, maxVal):
    if not node: return 0
    res = 1 if node.val >= maxVal else 0
    maxVal = max(maxVal, node.val)
    return res + dfs(node.left, maxVal) + dfs(node.right, maxVal)
```
- **Complexity**: O(n) time, O(h) space.
- **Sibling problems**: Validate BST (98) — also threads bounds down.

---

### 98 Validate Binary Search Tree  [Trees, Medium]
- **Trigger**: check a *global* ordering property, not just "child < parent" locally.
- **Brute force -> optimal leap**: Naive checks the whole left/right subtree per node -> O(n^2). Optimal passes down a tightening `(low, high)` valid-range instead of re-scanning subtrees.
- **Core principle(s)**:
  - Top-down state threading: pass ancestor-derived constraints (bounds) down as recursion parameters (same principle as 1448).
- **Invariant / state**: every node's value must lie strictly within `(left, right)`, the bound inherited from ancestors.
- **Key code idiom**:
```python
def valid(node, left, right):
    if not node: return True
    if not (left < node.val < right): return False
    return valid(node.left, left, node.val) and valid(node.right, node.val, right)
```
- **Complexity**: O(n) time, O(h) space.
- **Sibling problems**: Count Good Nodes (1448), Kth Smallest in BST (230).

---

### 230 Kth Smallest Element In a BST  [Trees, Medium]
- **Trigger**: "kth smallest" + BST.
- **Brute force -> optimal leap**: Naive collects+sorts all values -> O(n log n). Optimal exploits that BST in-order traversal already yields ascending order, and stops as soon as the kth element is reached (no full traversal needed).
- **Core principle(s)**:
  - Exploit a structural invariant (BST in-order = sorted) instead of generic sort.
  - Early-exit a traversal once the answer is found (avoid full O(n) work when possible).
- **Invariant / state**: iterative in-order stack yields nodes in ascending value order; decrement `k` per visit.
- **Key code idiom**:
```python
while stack or curr:
    while curr:
        stack.append(curr); curr = curr.left
    curr = stack.pop()
    k -= 1
    if k == 0: return curr.val
    curr = curr.right
```
- **Complexity**: O(h+k) time, O(h) space.
- **Sibling problems**: Validate BST (98), Binary Search Tree Iterator (LC173).

---

### 105 Construct Binary Tree from Preorder and Inorder Traversal  [Trees, Medium]
- **Trigger**: two traversal orders given, reconstruct the tree.
- **Brute force -> optimal leap**: Preorder's first element is always the current subtree's root; find that value's index in inorder (naive linear search -> O(n) per call, O(n^2) total) to split inorder into left/right ranges — replace the linear search with a precomputed hash map for O(1) lookup.
- **Core principle(s)**:
  - Recursion mirrors structure: use one traversal's property (preorder root-first) to split the other traversal (inorder) into left/right subtree ranges.
  - Trade space for time: hash map turns repeated O(n) index lookups into O(1).
- **Invariant / state**: `preorder[0]` is root of current range; `inorder[:mid]` / `inorder[mid+1:]` are exactly the left/right subtree's inorder sequences.
- **Key code idiom**:
```python
root = TreeNode(preorder[0])
mid = inorder.index(preorder[0])   # O(1) with a val->index hashmap
root.left = self.buildTree(preorder[1:mid+1], inorder[:mid])
root.right = self.buildTree(preorder[mid+1:], inorder[mid+1:])
```
- **Complexity**: O(n) time with hashmap (O(n^2) with `.index` on lists/slicing), O(n) space.
- **Sibling problems**: Serialize/Deserialize (297), any "traversal reconstruction" problem.

---

### 124 Binary Tree Maximum Path Sum  [Trees, Hard]
- **Trigger**: "path" that may bend at any node and go through at most one turn — a global optimum over all possible paths.
- **Brute force -> optimal leap**: Checking every pair of nodes is O(n^2). Optimal computes, per node in one post-order pass, the best "extend up to parent" value (one branch only, clipped at 0 to drop negative contributions) while separately updating a global best that allows using both branches (the "through this node" case).
- **Core principle(s)**:
  - Bottom-up recursive combine + piggyback a global-optimum update onto that traversal (same principle family as 543/110).
  - Clip negative contributions to zero — a subtree only helps if it improves the sum.
- **Invariant / state**: `dfs(node)` returns max path sum extendable upward through `node` using only one child branch; `res[0]` tracks the best "through-node" (both branches) sum seen.
- **Key code idiom**:
```python
def dfs(root):
    if not root: return 0
    leftMax  = max(dfs(root.left), 0)
    rightMax = max(dfs(root.right), 0)
    res[0] = max(res[0], root.val + leftMax + rightMax)
    return root.val + max(leftMax, rightMax)
```
- **Complexity**: O(n) time, O(h) space.
- **Sibling problems**: Diameter of Binary Tree (543), Balanced Binary Tree (110).

---

### 297 Serialize and Deserialize Binary Tree  [Trees, Hard]
- **Trigger**: must reconstruct the *exact* tree shape (including which children are missing), not just its values.
- **Brute force -> optimal leap**: A plain traversal string loses null-child information, making deserialization ambiguous. Fix: emit an explicit sentinel ("N") for every null child during a preorder DFS, so the string encodes structure, not just values.
- **Core principle(s)**:
  - Explicit sentinel/null markers make a traversal serialization unambiguous and reversible.
  - Recursion mirrors structure: deserialize with the same traversal order (preorder) used to serialize, consuming from a shared mutable sequence.
- **Invariant / state**: the deserializer consumes tokens in exactly the order the serializer produced them (a shared cursor/list front).
- **Key code idiom**:
```python
def dfs(node):
    if not node: res.append("N"); return
    res.append(str(node.val)); dfs(node.left); dfs(node.right)
# deserialize:
def dfs():
    val = vals.pop(0)
    if val == "N": return None
    node = TreeNode(int(val)); node.left = dfs(); node.right = dfs()
    return node
```
- **Complexity**: O(n) time, O(n) space.
- **Sibling problems**: Construct Binary Tree from Preorder/Inorder (105), Encode and Decode Strings (LC271, same "add explicit delimiters/markers" idea).

---

### 208 Implement Trie (Prefix Tree)  [Tries, Medium]
- **Trigger**: repeated prefix/word queries over a growing set of strings.
- **Brute force -> optimal leap**: Storing words in a list/set means prefix queries cost O(total chars) each. A trie factors shared prefixes into shared tree paths, so insert/search/prefix-check cost O(word length) regardless of how many words are stored.
- **Core principle(s)**:
  - Trie: factor shared prefixes into a shared tree keyed by character for O(L) operations independent of dictionary size.
- **Invariant / state**: a path from the root spelling word `w` ends at a node with `end=True` iff `w` was inserted; any prefix of an inserted word corresponds to a reachable node.
- **Key code idiom**:
```python
def insert(self, word):
    curr = self.root
    for c in word:
        i = ord(c) - ord('a')
        if curr.children[i] is None: curr.children[i] = TrieNode()
        curr = curr.children[i]
    curr.end = True
```
- **Complexity**: O(L) time per op, O(total chars inserted) space.
- **Sibling problems**: Design Add and Search Words (211), Word Search II (212).

---

### 211 Design Add and Search Words Data Structure  [Tries, Medium]
- **Trigger**: trie-style storage + a wildcard (`.`) that can match any character during search.
- **Brute force -> optimal leap**: Naive scans every stored word against the pattern (O(n * L)). Optimal keeps the trie but branches the DFS over *all* children whenever a wildcard is hit, instead of following one fixed edge.
- **Core principle(s)**:
  - Trie for shared-prefix storage (same as 208).
  - When a choice point (wildcard) appears, branch DFS over all possibilities at that point instead of committing to one path.
- **Invariant / state**: `dfs(j, node)` = "can the suffix `word[j:]` be matched starting from trie node `node`."
- **Key code idiom**:
```python
def dfs(j, cur):
    for i in range(j, len(word)):
        c = word[i]
        if c == '.':
            return any(dfs(i+1, ch) for ch in cur.children.values())
        if c not in cur.children: return False
        cur = cur.children[c]
    return cur.word
```
- **Complexity**: O(26^d * L) worst case (d = number of dots), O(total chars) space.
- **Sibling problems**: Implement Trie (208), Word Search II (212).

---

### 212 Word Search II  [Tries, Hard]
- **Trigger**: search a grid for *many* target words at once (vs. Word Search's single word).
- **Brute force -> optimal leap**: Running independent backtracking DFS per word re-walks shared prefixes repeatedly. Optimal builds one trie of all words, then does a single grid-wide DFS following trie edges — a mismatch or an exhausted branch (ref count 0) prunes immediately, and found words are removed from the trie to prevent re-adding/re-searching.
- **Core principle(s)**:
  - Trie: share prefix work across many target strings in one traversal (same as 208/211).
  - Backtracking over a grid: mark cell visited, recurse in 4 directions, unmark on the way back (same undo pattern as Word Search 79).
  - Prune the decision tree with a cheap check (trie-prefix miss / refs<1) before recursing further, rather than exploring then discarding.
- **Invariant / state**: `visit` set = cells used on the current DFS path; `node.refs` = count of remaining words passing through this trie node (used to prune dead branches after a word is consumed).
- **Key code idiom**:
```python
def dfs(r, c, node, word):
    if not in_bounds or board[r][c] not in node.children or node.children[board[r][c]].refs < 1 or (r,c) in visit:
        return
    visit.add((r, c))
    node = node.children[board[r][c]]; word += board[r][c]
    if node.isWord:
        node.isWord = False; res.add(word); root.removeWord(word)
    dfs(r+1,c,node,word); dfs(r-1,c,node,word); dfs(r,c+1,node,word); dfs(r,c-1,node,word)
    visit.remove((r, c))
```
- **Complexity**: O(rows*cols*4*3^(L-1) + total word chars) time, O(total word chars) space.
- **Sibling problems**: Word Search (79), Implement Trie (208), Design Add and Search Words (211).

---

### 78 Subsets  [Backtracking, Medium]
- **Trigger**: "all subsets" of a set of unique elements.
- **Brute force -> optimal leap**: N/A (inherently exponential output) — the leap is framing generation as a binary decision tree (include/exclude each element) walked via backtracking, rather than iteratively building up a powerset list.
- **Core principle(s)**:
  - Backtracking: walk the implicit decision tree (include/exclude), mutate shared state (append), recurse, then undo the mutation (pop) before trying the sibling branch.
- **Invariant / state**: `subset` always equals the partial choice made along the current root-to-node path in the decision tree.
- **Key code idiom**:
```python
def dfs(i):
    if i >= len(nums):
        res.append(subset.copy()); return
    subset.append(nums[i]); dfs(i + 1); subset.pop()
    dfs(i + 1)
```
- **Complexity**: O(n * 2^n) time, O(n) space (excl. output).
- **Sibling problems**: Subsets II (90), Combination Sum (39), Permutations (46).

---

### 39 Combination Sum  [Backtracking, Medium]
- **Trigger**: "count/list ways to reach a target sum" with unlimited reuse of each element.
- **Brute force -> optimal leap**: Same include/exclude decision tree as Subsets, but (a) allow re-choosing the same index (unbounded reuse) and (b) prune a branch the moment the running sum exceeds target, instead of building the full tree and filtering afterward.
- **Core principle(s)**:
  - Backtracking decision tree (include current index again, or move on).
  - Prune the decision tree early with a cheap feasibility check (running sum > target) rather than generating everything and filtering after.
- **Invariant / state**: `total` = sum of elements currently in `cur`; recursion stops (success or prune) once `total >= target`.
- **Key code idiom**:
```python
def dfs(i, cur, total):
    if total == target: res.append(cur.copy()); return
    if i >= len(candidates) or total > target: return
    cur.append(candidates[i]); dfs(i, cur, total + candidates[i]); cur.pop()
    dfs(i + 1, cur, total)
```
- **Complexity**: O(2^(t/m)) time, O(t/m) space.
- **Sibling problems**: Combination Sum II (40), Subsets (78).

---

### 46 Permutations  [Backtracking, Medium]
- **Trigger**: "all orderings" — order matters and every element used exactly once.
- **Brute force -> optimal leap**: The leap is choosing, at each recursive level, any *remaining* (not-yet-used) element rather than fixing left-to-right order — the classic backtracking "try / recurse / undo" loop over choices.
- **Core principle(s)**:
  - Backtracking: at each step try every remaining choice, recurse, then restore state (put the choice back) to try the next one.
- **Invariant / state**: at recursion depth `d`, the elements not yet placed are exactly those available to choose from next.
- **Key code idiom**:
```python
for i in range(len(nums)):
    n = nums.pop(0)
    perms = self.permute(nums)          # permute the rest
    for perm in perms: perm.append(n)
    res.extend(perms)
    nums.append(n)                       # undo: restore n
```
- **Complexity**: O(n * n!) time, O(n) extra space (excl. output).
- **Sibling problems**: Subsets (78), Permutations II (LC47), N-Queens (51, placing one item per row is a permutation-like choice).

---

### 90 Subsets II  [Backtracking, Medium]
- **Trigger**: "all subsets" but input has duplicate elements and output subsets must be unique.
- **Brute force -> optimal leap**: Naive dedup with a hash set of subsets costs extra O(2^n) space/time. Optimal sorts the array first, so duplicate values are adjacent, then skips over them at the same recursion depth (only the "exclude" branch skips duplicates) so identical subsets are never generated in the first place.
- **Core principle(s)**:
  - Backtracking decision tree (include/exclude), same as Subsets (78).
  - Sort input then skip adjacent duplicates at the same recursion depth to avoid emitting duplicate branches instead of dedup-after-the-fact.
- **Invariant / state**: within one call, once `nums[i]` has been explored via "exclude," any subsequent equal value is skipped so the same subset isn't produced twice.
- **Key code idiom**:
```python
subset.append(nums[i]); backtrack(i + 1, subset); subset.pop()
while i + 1 < len(nums) and nums[i] == nums[i + 1]:
    i += 1
backtrack(i + 1, subset)
```
- **Complexity**: O(n * 2^n) time, O(n) space (excl. output).
- **Sibling problems**: Subsets (78), Combination Sum II (40), Permutations II (LC47).

---

### 40 Combination Sum II  [Backtracking, Medium]
- **Trigger**: combination-sum-style problem, but each element usable at most once *and* input has duplicates (no duplicate combinations allowed).
- **Brute force -> optimal leap**: Same as 90 — sort first, then at each recursion level skip over repeated values (`candidates[i] == prev`) so duplicate combinations are never constructed, combined with the running-sum prune from 39.
- **Core principle(s)**:
  - Backtracking decision tree with "use index i once, move to i+1."
  - Sort + skip adjacent duplicates at the same recursion depth (same as 90).
  - Prune early via running-sum bound (same as 39).
- **Invariant / state**: `prev` tracks the last value tried at the current recursion depth so duplicates are skipped there (but still reused at deeper depths).
- **Key code idiom**:
```python
prev = -1
for i in range(pos, len(candidates)):
    if candidates[i] == prev: continue
    cur.append(candidates[i])
    backtrack(cur, i + 1, target - candidates[i])
    cur.pop()
    prev = candidates[i]
```
- **Complexity**: O(n * 2^n) time, O(n) space (excl. output).
- **Sibling problems**: Combination Sum (39), Subsets II (90).

---

### 79 Word Search  [Backtracking, Medium]
- **Trigger**: find one target string as a connected path in a grid.
- **Brute force -> optimal leap**: The leap is backtracking DFS from every start cell with a "path" visited-set that is added to before recursing and removed after (so cells can be reused by *other* paths, just not the current one).
- **Core principle(s)**:
  - Backtracking: mutate shared state (mark visited), recurse into neighbors, undo the mutation on the way back.
  - Trade space for time: a hash set gives O(1) "is this cell on my current path" checks.
- **Invariant / state**: `path` = exactly the cells used by the in-progress attempt to match `word[0..i)`.
- **Key code idiom**:
```python
def dfs(r, c, i):
    if i == len(word): return True
    if out_of_bounds or word[i] != board[r][c] or (r, c) in path: return False
    path.add((r, c))
    res = dfs(r+1,c,i+1) or dfs(r-1,c,i+1) or dfs(r,c+1,i+1) or dfs(r,c-1,i+1)
    path.remove((r, c))
    return res
```
- **Complexity**: O(rows*cols*4^L) time, O(L) space.
- **Sibling problems**: Word Search II (212), N-Queens (51, same mark/unmark backtracking).

---

### 131 Palindrome Partitioning  [Backtracking, Medium]
- **Trigger**: "all ways to partition a string" subject to a per-piece constraint.
- **Brute force -> optimal leap**: The decision tree is "where does the next partition end" (try every substring start `i` to `j`); prune a branch immediately if the candidate substring isn't a palindrome, instead of generating all 2^n partitions and filtering.
- **Core principle(s)**:
  - Backtracking decision tree over partition points; append chosen substring, recurse from the next index, pop on the way back.
  - Prune early with a cheap check (palindrome test) before recursing, rather than generating then filtering.
- **Invariant / state**: `part` = the substrings chosen so far, whose concatenation equals `s[0:i]`.
- **Key code idiom**:
```python
def dfs(i):
    if i >= len(s): res.append(part.copy()); return
    for j in range(i, len(s)):
        if self.isPali(s, i, j):
            part.append(s[i:j+1]); dfs(j + 1); part.pop()
```
- **Complexity**: O(n * 2^n) time, O(n) space (excl. output).
- **Sibling problems**: Subsets (78) (same "choose partition/element" decision-tree shape), Combination Sum (39).

---

### 17 Letter Combinations of a Phone Number  [Backtracking, Medium]
- **Trigger**: generate the Cartesian product of independent choice sets, one per position.
- **Brute force -> optimal leap**: N/A (output is inherently the full Cartesian product) — the leap is backtracking one digit at a time instead of nested loops of variable depth.
- **Core principle(s)**:
  - Backtracking decision tree: at each position choose one of k options (from a lookup map), recurse to the next position, base case when the string reaches full length.
- **Invariant / state**: `curStr` length == number of digits processed so far.
- **Key code idiom**:
```python
def backtrack(i, curStr):
    if len(curStr) == len(digits): res.append(curStr); return
    for c in digitToChar[digits[i]]:
        backtrack(i + 1, curStr + c)
```
- **Complexity**: O(n * 4^n) time, O(n) space (excl. output).
- **Sibling problems**: Subsets (78), Permutations (46), Combinations (LC77).

---

### 51 N-Queens  [Backtracking, Hard]
- **Trigger**: place n items one per row/column under pairwise conflict constraints — classic constraint satisfaction.
- **Brute force -> optimal leap**: Checking "is this cell attacked" by rescanning the board each time is O(n) per check. Optimal maintains three sets (`col`, `posDiag` = r+c, `negDiag` = r-c) for O(1) conflict checks, combined with row-by-row backtracking that places a queen, recurses, then removes it.
- **Core principle(s)**:
  - Backtracking: choose a column for the current row, recurse to the next row, undo (remove queen + set entries) before trying the next column.
  - Trade space for time: track "used columns/diagonals" as sets for O(1) conflict checks instead of rescanning the board.
  - Prune the decision tree immediately when a placement conflicts, rather than placing then validating afterward.
- **Invariant / state**: `col`/`posDiag`/`negDiag` always reflect exactly the queens placed on the current partial board (rows `0..r-1`).
- **Key code idiom**:
```python
for c in range(n):
    if c in col or (r+c) in posDiag or (r-c) in negDiag: continue
    col.add(c); posDiag.add(r+c); negDiag.add(r-c); board[r][c] = "Q"
    backtrack(r + 1)
    col.remove(c); posDiag.remove(r+c); negDiag.remove(r-c); board[r][c] = "."
```
- **Complexity**: O(n!) time, O(n^2) space.
- **Sibling problems**: Word Search (79) (same mark/backtrack/unmark shape), Permutations (46) (one-choice-per-position, no reuse).

---

## Batch-level synthesis

### 1. Principle tally

1. **Bottom-up recursive combine ("tree DP")** — solve on left/right subtrees first, then combine results at the node (optionally piggybacking a global-best update onto the same traversal instead of a second O(n) pass): **100, 104, 105, 110, 124, 226, 543, 572**
2. **Top-down state threading** — pass ancestor/path-derived context (running max, valid-range bounds) down as extra recursion parameters instead of recomputing it per node: **98, 1448**
3. **Exploit sorted/ordering invariant to eliminate one whole branch per step** (binary-search-style pruning) instead of exploring both sides: **235**
4. **In-order traversal of a BST yields sorted order for free** — exploit structure instead of sorting: **230**
5. **Level-by-level BFS via queue-length snapshot** to separate layers of a tree/graph: **102, 199**
6. **Trade space for time: hash map / set / array gives O(1) lookup or membership** instead of an O(n) scan repeated in a loop or recursion (index lookup, path/visited cells, used columns & diagonals, trie ref-counts): **79, 105, 51, 212**
7. **Trie: factor shared prefixes into one tree keyed by character** so insert/search/prefix-check cost O(L), independent of how many strings are stored: **208, 211, 212**
8. **Explicit sentinel/null markers make a traversal serialization unambiguous and reversible**: **297**
9. **Backtracking**: walk the implicit decision tree (include/exclude an element, choose 1-of-k, place/skip), mutate shared state, recurse, then undo the mutation before trying the sibling branch: **17, 39, 40, 46, 51, 78, 79, 90, 131, 212**
10. **Prune the decision tree early with a cheap feasibility check** before recursing further, instead of generating everything and filtering afterward (running-sum bound, palindrome check, trie-prefix/ref-count miss, column/diagonal conflict): **39, 40, 51, 131, 212**
11. **Sort input, then skip adjacent duplicates at the same recursion depth** to avoid ever emitting a duplicate branch: **40, 90**

### 2. Candidate MERGES

- **#1 (bottom-up combine) and #2 (top-down threading)** are two faces of the same coin — "augment a tree recursion with extra information carried along the traversal" — differing only in whether that information flows up (post-order synthesis: heights, diameters, path sums) or down (pre-order/inherited context: bounds, running max). Worth stating as one umbrella principle ("recursion threads extra state through the tree, either accumulated on the way up or inherited on the way down") with two named variants.
- **#9 (backtracking core loop) and #10 (early pruning)** are really the same principle at different granularity: pruning is just adding a feasibility check inside the same try/recurse/undo loop before the recursive call. Recommend folding #10 into #9 as a qualifier ("...and prune a branch immediately with a local feasibility check rather than always recursing to the base case").
- **#6 (hash/set for O(1) lookup) and #9 (backtracking's mark/undo state)** overlap where the "state" backtracking mutates and restores *is* a set used for O(1) membership (Word Search's `path`, N-Queens' `col`/diagonals, Word Search II's trie `refs`). These aren't independent ideas in this batch — the O(1)-membership trick is simply what backtracking's shared mutable state is usually implemented with.
- **#3 (BST ordering elimination)** is a special case of the general "monotonic structure lets you discard part of the search space" principle that shows up as two-pointer/binary-search elimination in array/string batches — flag for cross-batch merge.
- **#5 (level-order BFS)** is generic graph BFS, not tree-specific — flag for cross-batch merge with the Graphs batch's BFS principle.
- **#6's hashmap-for-index-lookup half (problem 105)** is the same "trade space for time with a hash structure" principle that will recur in Arrays & Hashing batches — flag for cross-batch merge.

### 3. Genuinely one-off tricks
- **124 / 543 / 110**: clip a subtree's contribution to 0 (or track validity as part of the returned tuple) so a "bad" branch can't drag down the parent's computation — a specific numerical trick, not a generally reusable pattern beyond "post-order combine problems with a possible negative/invalid contribution."
- **79 Word Search**: reversing the search word when the last letter is rarer than the first (a TLE-avoidance micro-optimization) — memorize, don't generalize.
- **212 Word Search II**: removing a found word from the trie (`removeWord`) so it isn't re-added and so ref-counts enable pruning dead subtrees — a clever but fairly specific optimization tied to this exact trie+grid combination.
- **51 N-Queens**: encoding diagonals as `r+c` (anti-diagonal) and `r-c` (main diagonal) constants — a specific bit of coordinate-geometry, worth memorizing as a reusable trick for *any* diagonal-conflict grid problem, but it's a one-off formula rather than a generalizable "principle."

### 4. Decision cues

| If you see... | Think... |
|---|---|
| A property defined per-node in terms of its children (height, diameter, balance, path sum) | Post-order DFS: compute children's answers first, combine at the node; use a `nonlocal`/list side-channel if you also need a running global best |
| A property defined per-node in terms of its ancestors/path-so-far (max on path, valid range) | Pre-order DFS: pass the accumulated context down as an extra recursion argument |
| "BST" mentioned explicitly | Ordering lets you go left/right/stop in O(1) (LCA) or get sorted order via in-order traversal (kth smallest, validate) — you rarely need to visit both subtrees |
| "By level" / "per row of the tree" / "side view" | BFS with a queue-length snapshot per iteration |
| Need to reconstruct exact structure (not just values) from a traversal / string | Add explicit null/sentinel markers so the encoding is unambiguous |
| Repeated prefix queries over many strings / "search a dictionary of words" | Trie — factor shared prefixes so lookups cost O(word length) |
| "All subsets / combinations / permutations / partitions / placements" | Backtracking: decision tree + mutate/recurse/undo; add a feasibility check before recursing whenever possible (sum bound, palindrome, conflict set) to prune |
| Duplicates in input but output must have no duplicate subsets/combinations | Sort first, then skip adjacent equal values at the same recursion depth |
| Grid path search (single word or many words) | Backtracking DFS with a visited set marked/unmarked around the recursive call; use a trie instead of per-word DFS when searching many words at once |
