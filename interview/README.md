# Interview questions

Source for the site's Interview category (`/interview/`). `hugo/scripts/interview.py` turns this folder into pages
at build time; `hugo/scripts/check_interview.py` validates every write-up and runs every solution.

```
interview/
  data/leetcode-companies.json   company → problems snapshot (hugo/scripts/import_leetcode.py)
  problems/<slug>.md             one write-up per LeetCode problem
  tests/<slug>/                  test.py, Main.java, test.cpp, test.js, test.go
  tests/_prelude/                ListNode, TreeNode and test helpers for each language
  topics/<topic-slug>.md         one guide per LeetCode topic tag (Sliding Window, Heap, ...)
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

## Topic guides

`/interview/topics/` groups every company-tagged problem by its LeetCode topic tags (Two Pointers, Sliding Window,
Heap, Stack, ...). Each topic gets a page with its problems sorted by how often companies ask them; a guide in
`topics/<topic-slug>.md` adds the lesson above that list so readers learn the technique first, then practice.
Topics without a guide still get a page with just the list.

The file name is the topic's slug: lower-case, accents removed, apostrophes dropped, every other run of
non-alphanumerics becomes one `-` (`Heap (Priority Queue)` → `heap-priority-queue`, `Dijkstra's Algorithm` →
`dijkstras-algorithm`, `Knuth–Morris–Pratt Algorithm` → `knuth-morris-pratt-algorithm`). The checker rejects a guide
whose `topic` is not a tag in the data or whose file name is not that tag's slug.

```markdown
---
title: Sliding Window          # display name; normally the tag itself
topic: Sliding Window          # the exact LeetCode tag (see the Topics column of any problem table)
group: patterns                # patterns | structures | graphs | math  (section on /interview/topics/)
description: "One sentence for the topic card and search results: what the technique is and when it applies."
---

## What it is          the idea in plain words, for someone meeting it for the first time
## When to use it      the signals in a problem statement that point to this technique (bullet list)
## How it works        the mechanics step by step, with one small worked example traced by hand
## Template            exactly five fenced blocks in order python, java, cpp, javascript, go: a generic,
                       complete, compilable skeleton of the technique with comments where the problem-specific
                       parts go (a function, not a class Solution; it must compile and run as written)
## Variations          optional: the common sub-patterns (fixed vs. variable window, ...)
## Common mistakes     optional bullet list
## Complexity          optional: what the technique usually costs and why
## Where to start      an ordered list of 5-8 problems to practice in, easiest first, one line each on what it
                       teaches; link written ones as [N. Title](/interview/problems/<slug>/), name the others
                       in plain text (the full list follows the guide automatically, so do not repeat it)
```

Guides use the same voice as the write-ups: our own words, no copied text, examples of our own. Verify every
template block compiles and runs (`python3`, `node`, `g++ -std=c++17`, `go run`, `javac`) before committing;
the checker validates the structure (`python3 hugo/scripts/check_interview.py --no-run` covers guides too) but
does not execute templates.

## Problem numbers and the full catalog

`data/leetcode-problems.json` is a snapshot of LeetCode's public problem list (number, title, slug, difficulty,
Premium flag) from `hugo/scripts/import_leetcode_problems.py`. It is the universe for `/interview/problems/`; the
company lists are a subset of it, and every write-up must be in it. Page titles are "`<number>. <title>`"
(the write-up's own `title` stays LeetCode's title). Readers mark problems as solved from a problem page or any
table; the mark is a learning-store practice record on `/interview/problems/<slug>/`, so it syncs and backs up with
the rest of their learning.

## The editor on problem pages

Each problem page shows the write-up on the left and an editor on the right (`hugo/assets/js/interview-workspace.js`).
The editor starts from a stub that `hugo/scripts/interview_stubs.py` derives from the solution at build time (the
class and the public method signatures the tests call, bodies removed), so write solutions in LeetCode's shape:
`class Solution` / the design class in Python, Java and C++; `var name = function (...)` and `Name.prototype.method`
in JavaScript; `func name(...)` / `type Name struct` + `Constructor` in Go. Python and JavaScript run in the browser
(Pyodide and a Worker, via `runner.js`) against `tests/<slug>/test.py` and `test.js`: the page redefines
`check(actual, expected, label)` to record every call, then shows each check with its expected and actual value,
the program's stdout and any error. So those two test files must report through `check` (one call per case, with
a label that names the input) and use only the prelude helpers; all five test files are shipped to the page, so
keep them free of anything that should not be public. Java, C++ and Go can be written in the editor and pasted into LeetCode.

## Updating the company data

```bash
git clone --depth 1 https://github.com/liquidslr/leetcode-company-wise-problems /tmp/lc
python3 hugo/scripts/import_leetcode_problems.py          # LeetCode's problem list (numbers, premium flags)
python3 hugo/scripts/import_leetcode.py /tmp/lc
python3 hugo/scripts/fetch_company_logos.py   # logos for new companies (add their domain first)
```

Company logos live in `static/img/companies/<slug>.png` (64×64, committed) and are downloaded once by
`fetch_company_logos.py` from the domains in `data/company-domains.json`. A `null` domain shows a coloured initial
instead; use it for ambiguous names or when the fetched icon is wrong. Check new logos by eye before committing.

The source repository has no license; we keep only factual fields (title, difficulty, topics, link, per-company
frequency) and credit it on every page.
