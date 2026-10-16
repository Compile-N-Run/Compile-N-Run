---
title: Backtracking
topic: Backtracking
group: patterns
description: "Backtracking explained: build a candidate answer one choice at a time, undo a choice as soon as it cannot work, and so enumerate every subset, permutation, combination or placement without writing nested loops."
---

## What it is

Backtracking is a careful way to try every possibility. You build an answer one choice at a time: pick something, go deeper, and if the partial answer is complete you record it. When a choice turns out to be wrong, or there is nothing left to try, you *undo* that choice (step back to where you were) and try the next option. The "step back" is the backtrack.

Think of walking a maze with a piece of chalk. At every fork you mark one path and walk down it. If it dead-ends, you walk back to the fork, rub out the mark, and take the next path. You never redraw the whole map; you just extend and shorten the one path you are on.

In code this is a recursive function that carries the current partial answer (usually a list called `path`). Each call makes one more choice, recurses, then removes that choice before trying the next one. Because the same `path` list is shared and edited in place, the memory used is only as deep as the recursion, even if the total number of answers is huge.

## When to use it

- The question asks for **all** of something: all subsets, all permutations, all combinations that sum to a target, all valid arrangements.
- The answer is built from a **sequence of choices**, and each choice shrinks the remaining options (pick a digit, place a queen, step to a neighbouring cell).
- There is a **constraint you can check early**: as soon as the partial answer breaks a rule (sum too big, letter already used, queen attacked), nothing built on top of it can be valid, so you can stop right there. This early stop is called pruning and is what separates backtracking from plain brute force.
- Input sizes are small (often `n <= 20`). A problem that says "return the number of ways" with `n` in the thousands wants [dynamic programming](/interview/topics/dynamic-programming/) instead.
- You need to search a grid or board for a path that must not revisit cells (mark a cell, explore, unmark).

## How it works

Every backtracking function has the same three beats inside its loop: **choose, explore, un-choose**.

1. **Check for a complete answer.** If `path` is a full solution (right length, reached the target, filled the board), record a *copy* of it and return.
2. **Loop over the available choices.** For each one, first ask whether it could possibly lead to a valid answer. If not, skip it (prune).
3. **Choose** it: append it to `path` (and update any bookkeeping such as a `used` set or a running sum).
4. **Explore**: call the function again to make the next choice.
5. **Un-choose**: remove it from `path` and undo the bookkeeping, so the loop can try the next choice from a clean state.

Let us trace all subsets of `[1, 2, 3]`. The `start` index says which items are still available, so each item is considered at most once and `[1, 2]` and `[2, 1]` do not both appear.

```
backtrack(start=0, path=[])        record []
  choose 1 → backtrack(1, [1])     record [1]
    choose 2 → backtrack(2, [1,2]) record [1,2]
      choose 3 → [1,2,3]           record [1,2,3]; no more items, return
      un-choose 3 → [1,2]
    un-choose 2 → [1]
    choose 3 → backtrack(3, [1,3]) record [1,3]
    un-choose 3 → [1]
  un-choose 1 → []
  choose 2 → backtrack(2, [2])     record [2]
    choose 3 → [2,3]               record [2,3]
  un-choose ...
  choose 3 → [3]                   record [3]
```

Eight subsets, found by one shared list that never holds more than three items. Notice how after exploring `[1, 2, 3]` the code pops 3, then pops 2, and only then can it try `[1, 3]`. That unwinding is the whole trick.

## Template

```python
def solve(items):
    results = []
    path = []

    def backtrack(start):
        # 1. Complete answer? Record a COPY (path keeps changing afterwards).
        results.append(list(path))  # problem-specific: maybe only when len(path) == k
        # 2. Try every remaining choice.
        for i in range(start, len(items)):
            # 3. Prune: skip a choice that can never lead to a valid answer.
            # if not promising(items[i]): continue
            path.append(items[i])  # choose
            backtrack(i + 1)       # explore (i + 1: each item used at most once)
            path.pop()             # un-choose

    backtrack(0)
    return results


if __name__ == "__main__":
    print(solve([1, 2, 3]))
```

```java
import java.util.ArrayList;
import java.util.List;

public class Backtracking {
    static List<List<Integer>> solve(int[] items) {
        List<List<Integer>> results = new ArrayList<>();
        backtrack(items, 0, new ArrayList<>(), results);
        return results;
    }

    static void backtrack(int[] items, int start, List<Integer> path, List<List<Integer>> results) {
        // 1. Complete answer? Record a COPY (path keeps changing afterwards).
        results.add(new ArrayList<>(path)); // problem-specific: maybe only when path.size() == k
        // 2. Try every remaining choice.
        for (int i = start; i < items.length; i++) {
            // 3. Prune: skip a choice that can never lead to a valid answer.
            // if (!promising(items[i])) continue;
            path.add(items[i]);                        // choose
            backtrack(items, i + 1, path, results);    // explore (i + 1: each item used at most once)
            path.remove(path.size() - 1);              // un-choose
        }
    }

    public static void main(String[] args) {
        System.out.println(solve(new int[] {1, 2, 3}));
    }
}
```

```cpp
#include <iostream>
#include <vector>

void backtrack(const std::vector<int>& items, int start, std::vector<int>& path,
               std::vector<std::vector<int>>& results) {
    // 1. Complete answer? Record a COPY (path keeps changing afterwards).
    results.push_back(path);  // problem-specific: maybe only when path.size() == k
    // 2. Try every remaining choice.
    for (int i = start; i < (int)items.size(); i++) {
        // 3. Prune: skip a choice that can never lead to a valid answer.
        // if (!promising(items[i])) continue;
        path.push_back(items[i]);                 // choose
        backtrack(items, i + 1, path, results);   // explore (i + 1: each item used at most once)
        path.pop_back();                          // un-choose
    }
}

std::vector<std::vector<int>> solve(const std::vector<int>& items) {
    std::vector<std::vector<int>> results;
    std::vector<int> path;
    backtrack(items, 0, path, results);
    return results;
}

int main() {
    for (const auto& subset : solve({1, 2, 3})) {
        std::cout << "[";
        for (size_t i = 0; i < subset.size(); i++) std::cout << (i ? ", " : "") << subset[i];
        std::cout << "]\n";
    }
}
```

```javascript
function solve(items) {
  const results = [];
  const path = [];

  function backtrack(start) {
    // 1. Complete answer? Record a COPY (path keeps changing afterwards).
    results.push([...path]); // problem-specific: maybe only when path.length === k
    // 2. Try every remaining choice.
    for (let i = start; i < items.length; i++) {
      // 3. Prune: skip a choice that can never lead to a valid answer.
      // if (!promising(items[i])) continue;
      path.push(items[i]); // choose
      backtrack(i + 1);    // explore (i + 1: each item used at most once)
      path.pop();          // un-choose
    }
  }

  backtrack(0);
  return results;
}

console.log(JSON.stringify(solve([1, 2, 3])));
```

```go
package main

import "fmt"

func solve(items []int) [][]int {
	results := [][]int{}
	path := []int{}

	var backtrack func(start int)
	backtrack = func(start int) {
		// 1. Complete answer? Record a COPY (path keeps changing afterwards).
		results = append(results, append([]int{}, path...)) // problem-specific: maybe only when len(path) == k
		// 2. Try every remaining choice.
		for i := start; i < len(items); i++ {
			// 3. Prune: skip a choice that can never lead to a valid answer.
			// if !promising(items[i]) { continue }
			path = append(path, items[i]) // choose
			backtrack(i + 1)              // explore (i + 1: each item used at most once)
			path = path[:len(path)-1]     // un-choose
		}
	}

	backtrack(0)
	return results
}

func main() {
	fmt.Println(solve([]int{1, 2, 3}))
}
```

## Variations

- **Subsets and combinations** pass a `start` index so each item is considered once and order does not matter. To allow reusing the same item (Combination Sum), recurse with `i` instead of `i + 1`.
- **Permutations** loop over *all* items every time and keep a `used` array (or swap items into place) so each item appears exactly once per answer.
- **Duplicates in the input**: sort first, then skip an item that equals the previous one at the same depth (`i > start && items[i] == items[i - 1]`). Otherwise `[1, 2]` and `[1, 2]` from two equal 2s both show up.
- **Grid search** (Word Search, N-Queens, Sudoku): the "choice" is a cell or a column. Mark the cell as visited before exploring and unmark it afterwards; the board itself is the `path`.
- **Counting instead of listing**: if the problem only wants *how many* answers exist and `n` is large, the same recursion with a cache becomes [memoization](/interview/topics/memoization/).

## Common mistakes

- Appending `path` itself instead of a copy. Every recorded answer then points at the same list, and at the end they are all empty.
- Forgetting the un-choose step, or undoing only part of the bookkeeping (popping from `path` but leaving `used[i] = true`). The second branch then starts from a polluted state.
- Using `i + 1` when the problem allows reuse, or `start` when it wants permutations. Decide up front: does order matter, and can an item repeat?
- Pruning too late. Checking `sum > target` only at the leaves still explores every branch; check it before recursing.
- Modifying a shared variable (like a running sum) without restoring it. If you pass values like `remaining - items[i]` as arguments instead, there is nothing to undo.

## Complexity

Backtracking is exponential by nature because it visits every candidate: O(2^n) partial subsets, O(n!) permutations, O(k^n) for k choices at each of n positions. Copying each recorded answer adds a factor of its length. Pruning cuts the constant enormously in practice but rarely changes the big-O. Space is O(n) for the recursion stack and the current path, plus whatever the output needs. Interviewers know this; what they want to see is that you prune early, avoid duplicates, and can state the bound.

## Where to start

1. 78. Subsets: the purest form of the template, with a `start` index and no pruning.
2. [46. Permutations](/interview/problems/permutations/): swap the `start` index for a `used` array and see why the loop restarts at 0.
3. 77. Combinations: add a "stop when the path has k items" rule, and a prune that gives up when too few items are left.
4. [39. Combination Sum](/interview/problems/combination-sum/): reuse the same item by recursing with `i`, and prune on the running total.
5. [17. Letter Combinations of a Phone Number](/interview/problems/letter-combinations-of-a-phone-number/): one choice per position, with the options coming from a lookup table.
6. [22. Generate Parentheses](/interview/problems/generate-parentheses/): pruning by a counting rule (never close more than you have opened).
7. [79. Word Search](/interview/problems/word-search/): backtracking on a grid, marking and unmarking cells.
8. 51. N-Queens: place one queen per row and reject a column or diagonal already under attack.
