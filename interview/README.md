# Interview questions

Source for the site's Interview category (`/interview/`). `hugo/scripts/interview.py` turns this folder into pages
at build time; `hugo/scripts/check_interview.py` validates every write-up and runs every solution.

```
interview/
  data/leetcode-companies.json   company → problems snapshot (hugo/scripts/import_leetcode.py)
  problems/<slug>.md             one write-up per LeetCode problem
  tests/<slug>/                  test.py, Main.java, test.cpp, test.js, test.go
  tests/_prelude/                ListNode, TreeNode and test helpers for each language
```

## Rules

- **One file per problem.** The file name is the LeetCode slug (`https://leetcode.com/problems/<slug>/`). Never add a
  second file for a problem that already has one, even if several companies ask it; company pages link to the same
  write-up. The checker rejects duplicates (same slug or same title).
- **Our own words.** Never copy LeetCode's statement, examples or constraints text. Describe the task in plain
  language and invent new examples. Check the original so nothing is lost (return format, edge cases, guarantees).
- **Tested code.** Every solution must pass its tests in all five languages before it is committed.

## Write-up format

```markdown
---
title: Two Sum            # exactly LeetCode's title (the checker compares it with the data snapshot)
leetcode: two-sum         # must equal the file name
description: "One sentence for search results: what the problem is and the technique, with the five languages."
---

## Problem            what to compute, inputs and output, guarantees (own words)
## Examples           2-4 own examples as a bullet list: input → output, with a short reason
## Key idea           the insight in a short paragraph, written for a beginner
## Approach           numbered steps; mention the brute force and why it is too slow when useful
## Complexity         **Time:** and **Space:** with one-line justifications
## Common mistakes    optional bullet list
## Follow-up questions   optional (what interviewers ask next)
## Related problems   optional; link written ones as [Title](/interview/problems/<slug>/), others as plain text
## Solutions          exactly five fenced blocks, in this order: python, java, cpp, javascript, go
```

Solutions use LeetCode's signatures (`class Solution` in Python/Java/C++, a `var name = function` in JavaScript, a
plain `func` in Go) so readers can paste them into LeetCode. Keep them idiomatic and commented only where a line is
not obvious. Use the same approach in every language.

What the checker adds around each block:

| Language | Wrapped with | Notes |
|---|---|---|
| Python | `tests/_prelude/prelude.py` (`typing`, `collections`, `heapq`, …, `ListNode`, `TreeNode`) | no imports needed for those |
| Java | `import java.util.*;` + `ListNode.java`, `TreeNode.java` | add other imports at the top of the block |
| C++ | `prelude.hpp` (`<bits/stdc++.h>`, `using namespace std`, `ListNode`, `TreeNode`) | |
| JavaScript | `prelude.js` (`ListNode`, `TreeNode` constructors) | |
| Go | `package main` + `prelude.go` (`ListNode`, `TreeNode`) | start the block with `import (...)` if needed |

Design problems (for example LRU Cache) define the class LeetCode asks for (`class LRUCache` / `function LRUCache` /
`type LRUCache struct` with `Constructor`) instead of `Solution`.

## Tests

Each language's test file calls the solution on at least 6 cases: the examples from the write-up, edge cases (empty or
single element, duplicates, negatives, limits) and one larger case. It must exit non-zero on a wrong answer.

| File | Runs as | Helpers |
|---|---|---|
| `test.py` | `from solution import *` then plain code | `check(actual, expected, label)`, `build_list`, `list_values`, `build_tree` |
| `test.js` | appended after the solution | `check(actual, expected, label)`, `buildList`, `listValues`, `buildTree` |
| `test.cpp` | appended after the solution; defines `main()` returning `failures ? 1 : 0` | `check(a, b, label)`, `buildList`, `listValues`, `buildTree` (`NUL` = missing child) |
| `test.go` | `package main` with `func main()`; `os.Exit(1)` on failure | `buildList`, `listValues`, `buildTree` (`NUL`) |
| `Main.java` | `class Main` with `main`, ends with `Check.done()` | `Check.eq`, `Check.list`, `Check.values`, `Check.tree` |

**Problem-specific types.** If LeetCode provides a type only for this problem (for example `Node` with a `random`
pointer), put it in the test folder: `prelude.py`, `prelude.js`, `prelude.hpp` and `prelude.go` are inserted before the
solution, and any extra `*.java` file (e.g. `Node.java`) is compiled with it. Never add such types to `_prelude/`, where
names like `Node` would clash between problems.

When several answers are valid (any order, any valid index pair), normalise before comparing (sort, or verify the
property instead of the exact value).

```bash
python3 hugo/scripts/check_interview.py two-sum      # one problem
python3 hugo/scripts/check_interview.py              # everything (CI runs this)
```

## Updating the company data

```bash
git clone --depth 1 https://github.com/liquidslr/leetcode-company-wise-problems /tmp/lc
python3 hugo/scripts/import_leetcode.py /tmp/lc
```

The source repository has no license; we keep only factual fields (title, difficulty, topics, link, per-company
frequency) and credit it on every page.
