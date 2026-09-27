# Batch D — Graphs, Advanced Graphs (19 problems)

---

### 200 Number of Islands  [Graphs, Medium]
- **Trigger**: 2D grid of 0/1 (or similar), asks to count groups of connected same-valued cells.
- **Brute force -> optimal leap**: don't re-derive reachability for each cell; DFS/BFS-flood-fill from every unvisited land cell once, marking everything reached so it's never explored again — each cell touched exactly once.
- **Core principle(s)**:
  1. Model the grid as an implicit graph (cells = nodes, 4-directional adjacency = edges); traverse it with DFS/BFS instead of building an explicit adjacency structure.
  2. Flood-fill to enumerate connected components: an unvisited start cell means "new component," and the flood-fill from it consumes the whole component in O(size).
- **Invariant / state**: `visit` (or the grid mutated in place) = the set of land cells already attributed to some discovered island.
- **Key code idiom**:
```python
def dfs(r, c):
    if not (0<=r<rows and 0<=c<cols) or grid[r][c]=='0' or (r,c) in visit:
        return
    visit.add((r,c))
    for dr,dc in [(0,1),(0,-1),(1,0),(-1,0)]:
        dfs(r+dr, c+dc)
for r in range(rows):
    for c in range(cols):
        if grid[r][c]=='1' and (r,c) not in visit:
            islands += 1; dfs(r,c)
```
- **Complexity**: O(m·n) time / O(m·n) space.
- **Siblings**: Max Area of Island, Surrounded Regions, Number of Connected Components, LC 733 Flood Fill, LC 1254 Closed Islands.

---

### 133 Clone Graph  [Graphs, Medium]
- **Trigger**: given a reference node inside a graph that may contain cycles; need a full deep copy that preserves structure.
- **Brute force -> optimal leap**: naive recursive copying without bookkeeping infinite-loops on cycles / duplicates nodes; instead, create the clone for a node and record it in a map *before* recursing into its neighbors, so re-encountering the node returns the memoized clone instead of recursing again.
- **Core principle(s)**:
  1. Use a hash map from original-node -> clone as both the "have I visited this" check and the mechanism for building the parallel structure (visited-check doubles as memo).
  2. Model as implicit graph, traverse with DFS.
- **Invariant / state**: `oldToNew[node]` exists iff cloning of `node` has already started; every DFS call either returns the existing clone or creates+registers one first.
- **Key code idiom**:
```python
def dfs(node):
    if node in oldToNew:
        return oldToNew[node]
    copy = Node(node.val)
    oldToNew[node] = copy
    for nei in node.neighbors:
        copy.neighbors.append(dfs(nei))
    return copy
```
- **Complexity**: O(V+E) time / O(V) space.
- **Siblings**: LC 138 Copy List with Random Pointer, any "deep-copy a cyclic structure" problem.

---

### 695 Max Area of Island  [Graphs, Medium]
- **Trigger**: same grid-of-1s setup as Number of Islands, but need the *size* of the largest connected group.
- **Brute force -> optimal leap**: same flood fill, but have DFS return a count (1 + sum of neighbor calls) instead of a boolean, marking visited to avoid double-count.
- **Core principle(s)**: same as #200 — implicit graph + flood fill, generalized so the fill returns an aggregate instead of just marking.
- **Invariant / state**: `dfs(r,c)` returns the area of the island reachable from `(r,c)` restricted to not-yet-visited cells.
- **Key code idiom**:
```python
def dfs(r, c):
    if r<0 or r==ROWS or c<0 or c==COLS or grid[r][c]==0 or (r,c) in visit:
        return 0
    visit.add((r,c))
    return 1 + dfs(r+1,c)+dfs(r-1,c)+dfs(r,c+1)+dfs(r,c-1)
```
- **Complexity**: O(m·n) / O(m·n).
- **Siblings**: Number of Islands, LC 1254 Number of Closed Islands.

---

### 417 Pacific Atlantic Water Flow  [Graphs, Medium]
- **Trigger**: need cells that satisfy reachability to BOTH of two disjoint target sets (the two ocean borders); naive per-cell reachability check is O((mn)²).
- **Brute force -> optimal leap**: reverse the direction of the search — start DFS at the border cells belonging to each ocean and walk "uphill" (`next height >= current`), which is equivalent to "water could flow downhill from `next` into `current`." This finds, in one multi-source pass per ocean, every cell that can reach that ocean.
- **Core principle(s)**:
  1. Invert the traversal frame: instead of testing "can this cell reach the target set," start from the target set and search outward under the reversed edge condition.
  2. Implicit-graph DFS on a grid.
- **Invariant / state**: `pac`/`atl` = cells proven to reach that ocean (monotonic non-decreasing height walk backward from the ocean's border).
- **Key code idiom**:
```python
def dfs(r, c, visit, prevHeight):
    if (r,c) in visit or not (0<=r<ROWS and 0<=c<COLS) or heights[r][c] < prevHeight:
        return
    visit.add((r,c))
    for dr,dc in dirs: dfs(r+dr,c+dc,visit,heights[r][c])
```
- **Complexity**: O(m·n) / O(m·n).
- **Siblings**: Surrounded Regions, Walls and Gates (both "start from the special boundary set").

---

### 130 Surrounded Regions  [Graphs, Medium]
- **Trigger**: "capture" regions of `O` that are NOT connected to the border — a connectivity-to-boundary question.
- **Brute force -> optimal leap**: instead of testing, per region, whether it touches the border, DFS outward from every border `O` directly; whatever is *not* reached that way is capturable.
- **Core principle(s)**: invert traversal frame (start from boundary/target set), implicit-graph flood fill.
- **Invariant / state**: `flag`/marked cells = proven-safe cells (reachable from a border `O`); everything else that's `O` at the end gets flipped to `X`.
- **Key code idiom**:
```python
for r in range(rows):
    for c in range(cols):
        if (r in (0,rows-1) or c in (0,cols-1)) and board[r][c]=='O':
            dfs(r,c)
# then any remaining 'O' not in flag -> 'X'
```
- **Complexity**: O(m·n) / O(m·n).
- **Siblings**: Pacific Atlantic Water Flow, Number of Islands.

---

### 994 Rotting Oranges  [Graphs, Medium]
- **Trigger**: something spreads outward from MULTIPLE simultaneous sources each "tick"; need minutes until fully spread (or -1).
- **Brute force -> optimal leap**: use BFS (not DFS) because the answer needs level-synchronized time; seed the queue with ALL initially-rotten oranges at once ("multi-source BFS") so a single BFS's layer number equals elapsed time for every cell.
- **Core principle(s)**:
  1. Multi-source BFS: seed the frontier with every source simultaneously; BFS layer = time/distance for all of them at once, in one O(V+E) pass instead of one BFS per source.
- **Invariant / state**: everything popped in the same "round" got rotten at the same `time`; `fresh` count strictly decreases until 0 or the queue empties.
- **Key code idiom**:
```python
while fresh > 0 and q:
    for _ in range(len(q)):
        r, c = q.popleft()
        for dr, dc in dirs:
            nr, nc = r+dr, c+dc
            if in_bounds and grid[nr][nc]==1:
                grid[nr][nc] = 2; q.append((nr,nc)); fresh -= 1
    time += 1
```
- **Complexity**: O(m·n) / O(m·n).
- **Siblings**: Walls and Gates, LC 542 01 Matrix, Word Ladder (BFS-layer-as-distance family).

---

### 286 Walls And Gates  [Graphs, Medium]
- **Trigger**: fill each cell with distance to nearest one of several "gate" cells — naive is one BFS per room, O((mn)²).
- **Brute force -> optimal leap**: multi-source BFS starting from ALL gates at once; BFS layer number IS the distance to the *nearest* gate for every room, and each room is visited exactly once.
- **Core principle(s)**: multi-source BFS (same as Rotting Oranges) + invert traversal frame (start from the targets, not from each room).
- **Invariant / state**: `dist` assigned to a cell = the current BFS layer at the moment it's first reached (= shortest distance, since BFS explores nearest-first).
- **Key code idiom**:
```python
for r,c gates: q.append((r,c)); visit.add((r,c))
dist = 0
while q:
    for _ in range(len(q)):
        r,c = q.popleft(); rooms[r][c] = dist
        addRooms(r+1,c); addRooms(r-1,c); addRooms(r,c+1); addRooms(r,c-1)
    dist += 1
```
- **Complexity**: O(m·n) / O(m·n).
- **Siblings**: Rotting Oranges, Pacific Atlantic Water Flow, LC 542 01 Matrix.

---

### 207 Course Schedule  [Graphs, Medium]
- **Trigger**: prerequisites define directed edges between courses; "can all be finished" = "is this directed graph acyclic."
- **Brute force -> optimal leap**: don't try orderings — detect a cycle directly with DFS that tracks the set of nodes on the *current* recursion path; revisiting one of those means a cycle (and thus infeasibility).
- **Core principle(s)**:
  1. Cycle detection in a directed graph = track nodes currently on the DFS call stack ("visiting"/"in-path" set); hitting one of them again is a back-edge = cycle.
- **Invariant / state**: `visiting` = courses on the current DFS path; a course's prereq list is cleared once proven cycle-free (memoization so it's never re-explored).
- **Key code idiom**:
```python
def dfs(crs):
    if crs in visiting: return False
    if preMap[crs] == []: return True
    visiting.add(crs)
    for pre in preMap[crs]:
        if not dfs(pre): return False
    visiting.remove(crs)
    preMap[crs] = []
    return True
```
- **Complexity**: O(V+E) / O(V+E).
- **Siblings**: Course Schedule II, Alien Dictionary, Graph Valid Tree, Redundant Connection. (Alt solution: Kahn's BFS topological sort — peel indegree-0 nodes; if any node never reaches indegree 0, there's a cycle.)

---

### 210 Course Schedule II  [Graphs, Medium]
- **Trigger**: same as Course Schedule but need an actual valid ordering, not just a yes/no.
- **Brute force -> optimal leap**: a valid ordering IS a topological sort — DFS post-order (append a node to the result only after all its prereqs are resolved), reversed at the end; equivalently Kahn's BFS peeling zero-indegree nodes level by level.
- **Core principle(s)**:
  1. Cycle detection via in-path set (same as #207).
  2. Topological sort = DFS post-order reversed, OR Kahn's BFS repeatedly removing indegree-0 nodes — a valid order exists iff the graph is a DAG.
- **Invariant / state**: `cycle` = current DFS path (temporary mark); `visit` = fully resolved nodes, appended to `output` in dependency-respecting (post-)order.
- **Key code idiom**:
```python
def dfs(crs):
    if crs in cycle: return False
    if crs in visit: return True
    cycle.add(crs)
    for pre in prereq[crs]:
        if dfs(pre) == False: return False
    cycle.remove(crs); visit.add(crs); output.append(crs)
    return True
```
- **Complexity**: O(V+E) / O(V+E).
- **Siblings**: Alien Dictionary (identical skeleton), Course Schedule.

---

### 684 Redundant Connection  [Graphs, Medium]
- **Trigger**: edges added one at a time to what starts as a tree; find the single edge that first creates a cycle.
- **Brute force -> optimal leap**: instead of re-running a full connectivity/DFS check after each new edge (O(E·V) total), maintain incremental connectivity with Union-Find; the first edge whose two endpoints already share a root is the answer.
- **Core principle(s)**:
  1. Union-Find (DSU) with path compression + union by rank answers "are u and v already connected" in near-O(1) amortized, and a failed union = the edge closes a cycle.
- **Invariant / state**: `par[]`/`rank[]` encode the current partition of nodes into components; `find(x)` (with path compression) always resolves to the current representative.
- **Key code idiom**:
```python
def find(n):
    while n != par[n]:
        par[n] = par[par[n]]; n = par[n]
    return n
def union(n1, n2):
    p1, p2 = find(n1), find(n2)
    if p1 == p2: return False
    if rank[p1] > rank[p2]: par[p2]=p1; rank[p1]+=rank[p2]
    else: par[p1]=p2; rank[p2]+=rank[p1]
    return True
```
- **Complexity**: ~O(E·α(V)) / O(V).
- **Siblings**: Number of Connected Components, Graph Valid Tree, Min Cost to Connect All Points (Kruskal's), LC 721 Accounts Merge.

---

### 323 Number of Connected Components In An Undirected Graph  [Graphs, Medium]
- **Trigger**: undirected graph given as an edge list; count components.
- **Brute force -> optimal leap**: rather than building an adjacency list and running DFS/BFS per unvisited node, feed edges straight into Union-Find and count distinct roots at the end — no adjacency list needed at all.
- **Core principle(s)**: Union-Find (DSU) for connectivity (same as #684).
- **Invariant / state**: `f[x]` parent pointers define the partition at any point in the edge stream; final answer = number of distinct `findParent(x)` values over all nodes.
- **Key code idiom**:
```python
def findParent(self, x):
    y = self.f.get(x, x)
    if x != y: y = self.f[x] = self.findParent(y)
    return y
def union(self, x, y):
    self.f[self.findParent(x)] = self.findParent(y)
```
- **Complexity**: O((V+E)·α(V)) / O(V).
- **Siblings**: Redundant Connection, Graph Valid Tree, Number of Islands (DFS-based component counting on a grid instead of an edge list).

---

### 261 Graph Valid Tree  [Graphs, Medium]
- **Trigger**: undirected edge list; asks "is this a valid tree" (connected + acyclic).
- **Brute force -> optimal leap**: recognize the tree criterion — connected AND exactly n-1 edges AND acyclic (any two of these plus n-1 edges imply the third). Run a single DFS from node 0 that explicitly skips the edge back to `prev` (since an undirected edge to your own parent isn't a real cycle), then confirm all n nodes were visited.
- **Core principle(s)**:
  1. Tree recognition = connected + exactly n-1 edges + no cycle.
  2. Cycle detection via in-path tracking, adapted for undirected graphs by passing/skipping the parent.
  3. (Alt) Union-Find: if any union ever fails (already same root) that's a cycle; must end with exactly 1 component.
- **Invariant / state**: `visit` = nodes discovered so far in the single DFS; `prev` prevents the trivial "back to parent" edge from registering as a cycle.
- **Key code idiom**:
```python
def dfs(i, prev):
    if i in visit: return False
    visit.add(i)
    for j in adj[i]:
        if j == prev: continue
        if not dfs(j, i): return False
    return True
return dfs(0, -1) and n == len(visit)
```
- **Complexity**: O(V+E) / O(V+E).
- **Siblings**: Redundant Connection, Number of Connected Components, Course Schedule (directed-cycle analog).

---

### 127 Word Ladder  [Graphs, Hard]
- **Trigger**: transform one string to another one character at a time, only through dictionary words; want minimum number of transformations = shortest path in an unweighted implicit graph.
- **Brute force -> optimal leap**: comparing every pair of words for a 1-character difference is O(n²·m). Instead, bucket every word under each of its wildcard patterns (`h*t`, `*ot`, `ho*`); words sharing a pattern are graph neighbors, generated in O(m) per word. Then plain BFS layer = ladder length.
- **Core principle(s)**:
  1. BFS on an unweighted graph gives shortest path in number of edges.
  2. Build the implicit adjacency efficiently (wildcard-pattern buckets) instead of comparing all pairs — same spirit as "invert the frame" from the grid problems: index by a shared signature rather than testing relationships directly.
- **Invariant / state**: `visit` prevents reprocessing a word; `res` = current BFS layer = transformation count so far.
- **Key code idiom**:
```python
for word in wordList:
    for j in range(len(word)):
        nei[word[:j]+"*"+word[j+1:]].append(word)
while q:
    for _ in range(len(q)):
        word = q.popleft()
        if word == endWord: return res
        for j in range(len(word)):
            for neiWord in nei[word[:j]+"*"+word[j+1:]]:
                if neiWord not in visit:
                    visit.add(neiWord); q.append(neiWord)
    res += 1
```
- **Complexity**: O(N·M²) time / O(N·M²) space (N words, length M).
- **Siblings**: Rotting Oranges / Walls and Gates (BFS-layer = distance), LC 752 Open the Lock, LC 126 Word Ladder II.

---

### 332 Reconstruct Itinerary  [Advanced Graphs, Hard]
- **Trigger**: must use every ticket (edge) exactly once and produce the lexicographically smallest valid itinerary — "use every edge exactly once" is the signature of an Eulerian path, distinct from ordinary shortest-path/topological-sort problems.
- **Brute force -> optimal leap**: naive DFS+backtracking over all ticket permutations is exponential. Instead sort each node's destination list, then run DFS that *consumes* (pops) an edge the moment it's traversed (Hierholzer's algorithm), only appending a node to the result once it has no outgoing edges left (post-order); reverse at the end to get the itinerary.
- **Core principle(s)**:
  1. Eulerian path via Hierholzer's algorithm: DFS that removes edges as it uses them and records nodes in post-order, then reverses — guarantees every edge is used exactly once.
  2. Sorting neighbors first turns "smallest lexical order" into "always follow the smallest still-available edge," which DFS respects automatically.
- **Invariant / state**: `adj[node]` always holds only *unused* tickets; `res` accumulates nodes in post-order (a node is only "finished" once none of its tickets remain).
- **Key code idiom**:
```python
def dfs(node):
    while graph[node]:
        dfs(graph[node].pop())
    route.append(node)
dfs("JFK")
return route[::-1]
```
- **Complexity**: O(E log E) (sort) + O(E) traversal / O(E).
- **Siblings**: none within the 150 — outside: Eulerian Circuit / Cracking the Safe (LC 753), Valid Arrangement of Pairs.

---

### 1584 Min Cost to Connect All Points  [Advanced Graphs, Medium]
- **Trigger**: connect all given nodes with minimum total edge weight — classic Minimum Spanning Tree (MST) setup.
- **Brute force -> optimal leap**: don't enumerate spanning trees; grow ONE tree greedily — repeatedly pull the cheapest edge connecting the current tree to any unconnected node (Prim's, via a min-heap frontier), or globally sort all edges and add each one via Union-Find unless it would form a cycle (Kruskal's). Both exploit the MST cut property: the cheapest edge crossing any cut is always safe to include.
- **Core principle(s)**:
  1. MST via greedy edge selection (Prim's heap-frontier growth, or Kruskal's sorted-edges + Union-Find-to-skip-cycles) — same cut-property guarantee either way.
  2. Prim's here is structurally identical to Dijkstra's greedy min-heap expansion, just relaxing by "edge weight" instead of "path-sum-so-far."
- **Invariant / state**: `visit` = nodes already absorbed into the MST; the heap always contains the cheapest known edge from the current tree to some node outside it.
- **Key code idiom**:
```python
minH = [[0, 0]]
while len(visit) < N:
    cost, i = heapq.heappop(minH)
    if i in visit: continue
    res += cost; visit.add(i)
    for neiCost, nei in adj[i]:
        if nei not in visit:
            heapq.heappush(minH, [neiCost, nei])
```
- **Complexity**: O(N² log N) / O(N²) (dense graph via all pairwise Manhattan distances).
- **Siblings**: Redundant Connection / Number of Connected Components (Union-Find half of Kruskal's), Network Delay Time / Swim in Rising Water (Prim's-heap skeleton reused for shortest path instead of MST).

---

### 743 Network Delay Time  [Advanced Graphs, Medium]
- **Trigger**: single-source shortest path over a directed, non-negatively weighted graph; need time to reach (or fail to reach) all nodes.
- **Brute force -> optimal leap**: Dijkstra's algorithm — always expand the frontier node with the currently smallest known cumulative cost via a min-heap; because weights are non-negative, once a node is popped its distance is provably final (can't be beaten later).
- **Core principle(s)**:
  1. Dijkstra's algorithm: greedy min-heap expansion finalizes shortest distances one node at a time.
- **Invariant / state**: once a node enters `visit`, its popped cost `t` is its true shortest distance from the source; heap always holds the best currently-known candidate distance to each frontier node.
- **Key code idiom**:
```python
minHeap = [(0, k)]
while minHeap:
    w1, n1 = heapq.heappop(minHeap)
    if n1 in visit: continue
    visit.add(n1); t = w1
    for n2, w2 in edges[n1]:
        if n2 not in visit:
            heapq.heappush(minHeap, (w1 + w2, n2))
```
- **Complexity**: O(E log V) / O(V+E).
- **Siblings**: Swim in Rising Water (same skeleton, different cost-combine rule), Min Cost to Connect All Points (Prim's = same heap-greedy shape, different objective), Cheapest Flights (constrained variant where plain Dijkstra breaks).

---

### 778 Swim In Rising Water  [Advanced Graphs, Hard]
- **Trigger**: minimize the *maximum* elevation encountered along a path (a "minimax path"), not the sum of edge weights.
- **Brute force -> optimal leap**: recognize this is still Dijkstra's greedy expansion — just replace the relaxation rule "cost + weight" with "max(cost, next-cell-height)." The min-heap still always pops the globally-smallest achievable bottleneck, so greedy expansion remains optimal.
- **Core principle(s)**:
  1. Dijkstra's algorithm generalizes to any path-cost combiner that is monotonic non-decreasing along a path (sum, max, etc.), not just addition.
- **Invariant / state**: a popped heap entry `(t, r, c)` represents the minimum possible "time" (= max height along the best known path) to first reach `(r,c)`; once popped it's final.
- **Key code idiom**:
```python
minH = [[grid[0][0], 0, 0]]
while minH:
    t, r, c = heapq.heappop(minH)
    if (r, c) == (N-1, N-1): return t
    for dr, dc in dirs:
        nr, nc = r+dr, c+dc
        if valid and (nr,nc) not in visit:
            visit.add((nr,nc))
            heapq.heappush(minH, [max(t, grid[nr][nc]), nr, nc])
```
- **Complexity**: O(n² log n) / O(n²).
- **Siblings**: Network Delay Time (identical skeleton), LC 1631 Path With Minimum Effort (outside the 150, near-identical problem).

---

### 269 Alien Dictionary  [Advanced Graphs, Hard]
- **Trigger**: derive a character ordering consistent with a list of words assumed sorted per that alien alphabet — need to build precedence edges then find a valid total order.
- **Brute force -> optimal leap**: don't compare all character pairs; extract exactly ONE edge per adjacent word pair (their first differing character), which is the minimal signal that pins down relative order. Then it's exactly the Course-Schedule-II topological-sort pattern: DFS with an in-path set for cycle detection, appending in post-order and reversing. (Edge case: if a later word is a strict prefix of a shorter earlier word, no valid order exists.)
- **Core principle(s)**:
  1. Topological sort via DFS post-order + in-path cycle detection (identical to #207/#210).
  2. Extract only the minimal edge/signal from each comparison (here: first differing char) instead of exhaustively comparing everything — same idea as Word Ladder's wildcard-pattern trick.
- **Invariant / state**: `visited[char] = True` means "on current DFS path" (cycle check); `False` after being fully resolved and appended to `res` (post-order).
- **Key code idiom**:
```python
for j in range(minLen):
    if w1[j] != w2[j]:
        adj[w1[j]].add(w2[j]); break
def dfs(char):
    if char in visited: return visited[char]
    visited[char] = True
    for nxt in adj[char]:
        if dfs(nxt): return True
    visited[char] = False; res.append(char)
```
- **Complexity**: O(total chars + V + E) / O(V+E).
- **Siblings**: Course Schedule II (identical skeleton), Course Schedule.

---

### 787 Cheapest Flights Within K Stops  [Advanced Graphs, Medium]
- **Trigger**: shortest path but with a hard cap on the number of edges used (`k` stops) — plain Dijkstra can lock in a cheaper-but-longer path too early and thereby miss the constrained optimum, so pure greedy shortest-path is unsafe here.
- **Brute force -> optimal leap**: use Bellman-Ford-style bounded relaxation — relax ALL edges exactly `k+1` times, reading from a snapshot of the *previous* round's prices so a single round can't cascade updates past that round's edge-count budget. (Alt: keep Dijkstra's heap but add "stops remaining" into the state so the heap itself respects the constraint.)
- **Core principle(s)**:
  1. Bellman-Ford / bounded-round edge relaxation: when a hard constraint limits path length (hop count), relax in fixed rounds off a frozen snapshot, rather than letting distances update greedily/unboundedly.
  2. Decision cue: if Dijkstra's core invariant ("once popped, distance is final") is violated by an added constraint, fall back to relaxation-based (Bellman-Ford) or constraint-augmented-state Dijkstra.
- **Invariant / state**: after `i` rounds, `prices[v]` = minimum cost to reach `v` using at most `i` edges; the `tmpPrices` snapshot ensures a round only builds on the *previous* round's confirmed values.
- **Key code idiom**:
```python
prices = [inf]*n; prices[src] = 0
for i in range(k + 1):
    tmp = prices.copy()
    for s, d, p in flights:
        if prices[s] != inf and prices[s] + p < tmp[d]:
            tmp[d] = prices[s] + p
    prices = tmp
```
- **Complexity**: O(k·E) / O(V).
- **Siblings**: Network Delay Time / Swim in Rising Water (contrast: unconstrained -> plain Dijkstra suffices), LC 1786/1928 (probability/fee-constrained shortest path variants).

---

## Batch-level synthesis

### 1. Principle tally
| # | Principle | Problems |
|---|---|---|
| P1 | Model grid/strings as an implicit graph; traverse via DFS/BFS instead of building explicit adjacency | 200, 695, 417, 130, 994, 286, 127, 778 |
| P2 | Flood fill to enumerate/size connected components (unvisited start = new component) | 200, 695 |
| P3 | Multi-source BFS: seed the queue with every source at once; BFS layer = time/distance for all of them in one pass | 994, 286 |
| P4 | Invert the traversal frame: search outward from the boundary/target set instead of testing each cell against it | 417, 130, 286 |
| P5 | Hash map as visited-check + memo simultaneously, while building a parallel structure during traversal | 133 |
| P6 | Directed-cycle detection via an "on-current-recursion-stack" (in-path) set | 207, 210, 261, 269 |
| P7 | Topological sort = DFS post-order reversed, or Kahn's BFS peeling indegree-0 nodes; valid order exists iff DAG | 207 (alt), 210, 269 |
| P8 | Union-Find (DSU) with path compression/union-by-rank for incremental connectivity / cycle detection on an edge stream | 684, 323, 261 (alt), 1584 (Kruskal alt) |
| P9 | Tree recognition = connected + exactly n-1 edges + acyclic | 261 |
| P10 | BFS on an unweighted (implicit) graph = shortest path in edge count; build adjacency via shared signature instead of pairwise comparison | 127 |
| P11 | Eulerian path via Hierholzer's algorithm: consume edges while traversing, emit in post-order, reverse | 332 |
| P12 | Minimum Spanning Tree via greedy edge selection (Prim's heap-frontier or Kruskal's sorted-edges + DSU), cut-property guarantee | 1584 |
| P13 | Dijkstra's algorithm: greedy min-heap expansion finalizes shortest cost per node; generalizes to any monotonic path-cost combiner (sum, max, ...) | 743, 778 |
| P14 | Bellman-Ford / bounded-round edge relaxation when a hop-count or other resource constraint invalidates plain greedy Dijkstra | 787 |

### 2. Candidate MERGES
- **P1 + P2**: "flood fill" is just P1 (implicit-graph DFS/BFS) applied to the specific task of counting/sizing components. Same underlying move.
- **P3 + P4**: multi-source BFS and "invert traversal to start from the boundary/target set" are the same idea — seed the frontier with every special node at once and expand outward — just phrased from two different setups (an actual multi-source race vs. a single conceptual "virtual source"). Could be one principle: "Seed BFS/DFS from all special/boundary nodes simultaneously rather than querying each ordinary node individually."
- **P6 + P7**: cycle detection via in-path set IS the feasibility test that topological sort relies on; in practice they're always used together (DFS with in-path set, emitting post-order = topo sort + cycle check in one traversal). Treat as a single principle with two "modes" (yes/no vs. produce-the-order).
- **P8 + P9**: P9 (tree = n-1 edges + connected + acyclic) is a *fact* you verify using either P6 (parent-skip DFS) or P8 (DSU) — not an independent mechanism. Fold P9 into "apply P6 or P8 with the extra edge-count check."
- **P12 vs. P8/P13**: MST is arguably not a new mechanism but a recombination — Kruskal's = P8 (DSU) applied to a globally sorted edge list; Prim's = P13's (Dijkstra) heap-frontier machinery applied with "min edge weight" instead of "min path-sum-so-far." Worth stating explicitly: MST is "Dijkstra's greedy frontier, or Union-Find's cycle-avoidance, retargeted at a different objective."
- **P13 + P14**: both are "single-source shortest path" family; P14 only exists because an extra constraint (hop cap) breaks Dijkstra's finalize-on-pop invariant. Best framed as one principle ("shortest path") with a decision-cue branch: unconstrained/monotonic-cost -> Dijkstra; constrained by edge count -> Bellman-Ford bounded relaxation (or augment Dijkstra's state with remaining budget).

Net effect: the 14 tallied principles collapse to roughly **5-6 core ideas**: (a) implicit-graph traversal + flood fill, (b) multi-source/boundary-seeded BFS, (c) topological ordering via in-path DFS or Kahn's BFS, (d) Union-Find for streaming connectivity, (e) single-source shortest path (Dijkstra, generalized combiner, and its Bellman-Ford fallback under constraints), (f) MST as a retargeting of (d)/(e)'s machinery.

### 3. Genuinely one-off tricks
- **Word Ladder's wildcard-pattern bucketing** (`h*t` etc.) — a clever but fairly specific trick for building implicit adjacency cheaply; the general lesson ("index by shared signature instead of comparing all pairs") transfers, but the exact wildcard mechanic should just be memorized.
- **Reconstruct Itinerary / Hierholzer's algorithm** — Eulerian-path DFS-with-edge-consumption doesn't recur elsewhere in this batch or the wider 150; treat as a memorized special algorithm for "use every edge exactly once."
- **Alien Dictionary's prefix edge case** (a later word that's a strict prefix of an earlier, longer word is immediately invalid) — a correctness gotcha specific to this problem's string semantics, not a transferable principle.
- **Cheapest Flights' snapshot-per-round trick** (`tmpPrices = prices.copy()`) — the mechanical detail of why you must not mutate `prices` in place during a round is worth memorizing precisely, even though the surrounding idea (bounded relaxation) is general.

### 4. Decision cues
| If you see... | Think... |
|---|---|
| Grid of cells with adjacency (4-dir), asked to count/size/label connected groups | Implicit graph + DFS/BFS flood fill (P1/P2) |
| Something spreads from several places at once, need "time until X" or "distance to nearest Y" | Multi-source BFS — seed queue with all sources/targets before starting (P3/P4) |
| "Reachable from BOTH of two sets" / "not connected to the border" | Invert direction: search outward from each special set instead of inward from every cell (P4) |
| Need a deep copy of a graph/structure that may have cycles | Hash map old->new as visited-check + memo (P5) |
| Directed edges = dependencies ("a before b"); asked "can finish" or "give an order" | DFS with in-path set = cycle check; post-order reversed = topological sort; or Kahn's BFS indegree-0 peeling (P6/P7) |
| Undirected edges, streaming, asked "is there a cycle / how many components / is it a tree" | Union-Find (DSU) with path compression + rank; tree ⇔ n-1 edges & no cycle (P8/P9) |
| Strings that differ by one character / transform step by step, want min steps | BFS on implicit graph = shortest path in edge count (P10); build adjacency by shared signature |
| Must use every edge/ticket exactly once | Eulerian path -> Hierholzer's algorithm (P11) |
| Connect all nodes with minimum total edge cost | MST -> Prim's (heap) or Kruskal's (sorted edges + DSU) (P12) |
| Weighted shortest path, non-negative weights, no extra constraints | Dijkstra's (min-heap greedy expansion) — cost combiner can be sum, max, etc. (P13) |
| Weighted shortest path but with a cap on number of edges/stops | Bellman-Ford bounded-round relaxation, or Dijkstra with budget baked into state (P14) |
