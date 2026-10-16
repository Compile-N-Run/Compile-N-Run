---
title: Remove All Adjacent Duplicates in String II
leetcode: remove-all-adjacent-duplicates-in-string-ii
description: "Remove All Adjacent Duplicates in String II explained: repeatedly delete every run of k equal adjacent letters until none is left, in one pass with a stack of (letter, count) pairs, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` of lowercase letters and an integer `k >= 2`. A "k-duplicate removal" picks `k` equal letters standing next to each other and deletes them, so the pieces on either side join up. Keep performing removals until none is possible, and return the final string. The answer does not depend on the order in which removals are made, so it is unique.

Note that joining can create new runs: after deleting a run, the letters that were on its two sides may now form a run of their own.

## Examples

- `s = "abbbacd", k = 3` → `"aacd"`. Removing `bbb` brings the two `a`s together, but a run of 2 is shorter than `k`, so they stay.
- `s = "abbbaac", k = 3` → `"c"`. Removing `bbb` leaves `"aaac"`, and now `aaa` is a run of 3, which disappears too: a chain reaction.
- `s = "aabbccbba", k = 2` → `"a"`. `aa`, then `cc`, then `bb` (the two pairs merge after `cc` is gone), then the other `bb`.
- `s = "xyz", k = 2` → `"xyz"`. No two adjacent letters are equal.
- `s = "aaaa", k = 3` → `"a"`. One run of three is removed; the fourth `a` stays.

## Key idea

Scanning left to right, the only thing we need to know about the text written so far is the current run at its end: which letter it is and how long it is. A stack of `(letter, count)` pairs stores exactly that, with each entry summarising one maximal run of equal letters. When the next letter equals the top letter, bump its count; if the count reaches `k`, pop the entry, which is the removal. Because the stack then exposes the previous run again, chain reactions happen automatically when later letters match it.

## Approach

1. Keep a stack of pairs `(letter, count)`.
2. For each character `c` of `s`:
   1. If the stack is non-empty and its top letter is `c`, increment the top count. If that count becomes `k`, pop the entry.
   2. Otherwise push `(c, 1)`.
3. After the scan, rebuild the string by writing each stack entry's letter `count` times.

The naive method repeatedly searches the string for a run of `k` and deletes it; each round costs O(n) and there can be O(n / k) rounds, so it is O(n² / k). The stack does everything in one pass.

## Complexity

- **Time:** O(n). Every character is pushed or counted once, and each pop removes an entry that was pushed once.
- **Space:** O(n) for the stack in the worst case (no removals at all).

## Common mistakes

- Storing single characters on the stack and counting the top run on every step, which is O(k) per character.
- Checking for a run only when the *next* letter differs, so a run that ends exactly at the end of the string is never removed.
- Forgetting that after popping, the new top may be the same letter as what comes next (`"abbbaac"`); the per-character comparison with the current top handles this naturally.
- Mixing up the count: comparing `count == k` *before* incrementing for the new letter.

## Follow-up questions

- What changes for `k = 2`? (It is Remove All Adjacent Duplicates in String; a plain character stack suffices.)
- Can you do it in place in a character array? (Yes: write letters into the array at a write index and keep a parallel array of counts; on reaching `k`, move the write index back by `k`.)
- How would you report *how many* removals happened? (Count the pops.)

## Related problems

- [Decode String](/interview/problems/decode-string/) (a stack that collapses nested structure)
- [Valid Parentheses](/interview/problems/valid-parentheses/)
- [Asteroid Collision](/interview/problems/asteroid-collision/) (collisions resolved with a stack)
- Remove All Adjacent Duplicates In String

## Solutions

```python
class Solution:
    def removeDuplicates(self, s: str, k: int) -> str:
        stack = []  # [letter, count] for each maximal run written so far
        for c in s:
            if stack and stack[-1][0] == c:
                stack[-1][1] += 1
                if stack[-1][1] == k:
                    stack.pop()  # a full run of k vanishes
            else:
                stack.append([c, 1])
        return ''.join(c * n for c, n in stack)
```

```java
class Solution {
    public String removeDuplicates(String s, int k) {
        Deque<int[]> stack = new ArrayDeque<>(); // {letter, count} for each maximal run written so far
        for (char c : s.toCharArray()) {
            if (!stack.isEmpty() && stack.peek()[0] == c) {
                if (++stack.peek()[1] == k) stack.pop(); // a full run of k vanishes
            } else {
                stack.push(new int[] {c, 1});
            }
        }
        StringBuilder out = new StringBuilder();
        for (Iterator<int[]> it = stack.descendingIterator(); it.hasNext();) {
            int[] run = it.next();
            for (int i = 0; i < run[1]; i++) out.append((char) run[0]);
        }
        return out.toString();
    }
}
```

```cpp
class Solution {
public:
    string removeDuplicates(string s, int k) {
        vector<pair<char, int>> stack;  // (letter, count) for each maximal run written so far
        for (char c : s) {
            if (!stack.empty() && stack.back().first == c) {
                if (++stack.back().second == k) stack.pop_back();  // a full run of k vanishes
            } else {
                stack.push_back({c, 1});
            }
        }
        string out;
        for (const auto& [letter, count] : stack) out.append(count, letter);
        return out;
    }
};
```

```javascript
/**
 * @param {string} s
 * @param {number} k
 * @return {string}
 */
var removeDuplicates = function (s, k) {
  const stack = []; // [letter, count] for each maximal run written so far
  for (const c of s) {
    const top = stack[stack.length - 1];
    if (top && top[0] === c) {
      top[1]++;
      if (top[1] === k) stack.pop(); // a full run of k vanishes
    } else {
      stack.push([c, 1]);
    }
  }
  return stack.map(([letter, count]) => letter.repeat(count)).join('');
};
```

```go
type run struct {
	letter byte
	count  int
}

func removeDuplicates(s string, k int) string {
	stack := []run{} // one entry per maximal run written so far
	for i := 0; i < len(s); i++ {
		c := s[i]
		if n := len(stack); n > 0 && stack[n-1].letter == c {
			stack[n-1].count++
			if stack[n-1].count == k { // a full run of k vanishes
				stack = stack[:n-1]
			}
		} else {
			stack = append(stack, run{c, 1})
		}
	}
	out := make([]byte, 0, len(s))
	for _, r := range stack {
		for j := 0; j < r.count; j++ {
			out = append(out, r.letter)
		}
	}
	return string(out)
}
```
