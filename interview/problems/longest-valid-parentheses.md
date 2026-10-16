---
title: Longest Valid Parentheses
leetcode: longest-valid-parentheses
description: "Longest Valid Parentheses explained: find the length of the longest well-formed run of brackets in one pass with a stack of indexes, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` made only of the characters `'('` and `')'`. The string may be empty.

Return the length of the longest **substring** (a contiguous run of characters) that is a well-formed parentheses sequence: every `'('` is closed by a later `')'`, every `')'` closes an earlier `'('`, and pairs nest properly. If there is no such substring, return `0`.

## Examples

- `s = "())((())"` → `4`. The run `"(())"` at the end is well-formed. The `"()"` at the start is cut off from it by the unmatched `')'` at index 2.
- `s = "(()()"` → `4`. The first `'('` never closes, but `"()()"` after it is well-formed.
- `s = "()(())"` → `6`. Two valid groups side by side join into one valid run.
- `s = ")("` → `0`. Nothing can be matched.

## Key idea

Scan left to right and push the **index** of every `'('` on a stack. When a `')'` arrives and the stack holds an open bracket, they match, and the valid run ending here starts right after whatever index is now on top of the stack.

To make that work, the bottom of the stack always holds a *boundary*: the index just before the current valid stretch could start. It begins as `-1` (before the string). A `')'` with nothing to match is a wall no valid run can cross, so its index becomes the new boundary. The length of the run ending at `i` is then simply `i - stack.top`.

## Approach

1. Create a stack containing `-1` and set `best = 0`.
2. For each index `i`:
   1. If `s[i] == '('`, push `i`.
   2. Otherwise pop once (this removes the matching `'('`, or the boundary if there was nothing to match).
      - If the stack is now empty, this `')'` was unmatched: push `i` as the new boundary.
      - Otherwise the run from `stack.top + 1` to `i` is valid: update `best = max(best, i - stack.top)`.
3. Return `best`.

The brute force checks every even-length substring with a balance counter, which takes O(n³) time (or O(n²) with care). The stack needs only one pass.

## Complexity

- **Time:** O(n). Each index is pushed and popped at most once.
- **Space:** O(n) for the stack in the worst case, for example a string of only `'('`.

## Common mistakes

- Counting matched pairs over the whole string. `"()(()"` has two matched pairs but its longest valid run is only `2`, because the unmatched `'('` in the middle splits them.
- Pushing characters instead of indexes. You need positions to measure lengths.
- Forgetting the initial `-1` boundary, which makes a run starting at index 0 (like `"()"`) impossible to measure.
- Measuring the length as `i - poppedIndex + 1`. That only covers the innermost pair; `"()()"` would give 2 instead of 4. Measure from the new top of the stack instead.

## Follow-up questions

- *Can you do it in O(1) extra space?* Scan left to right counting `open` and `close`: when they are equal, record `2 * close`; when `close > open`, reset both to zero. Then do the same scan right to left with the roles swapped, which catches cases like `"(()"` that the first scan misses.
- *How would a dynamic programming solution look?* Let `dp[i]` be the length of the longest valid run ending at `i`; for a `')'` it builds on `dp[i - 1]` and the run before the matching `'('`.

## Related problems

- [Valid Parentheses](/interview/problems/valid-parentheses/): check whether a whole string of brackets is well-formed.
- [Generate Parentheses](/interview/problems/generate-parentheses/): build every well-formed string of a given size.
- Minimum Remove to Make Valid Parentheses

## Solutions

```python
class Solution:
    def longestValidParentheses(self, s: str) -> int:
        stack = [-1]  # bottom of the stack: index just before the current valid run
        best = 0
        for i, ch in enumerate(s):
            if ch == '(':
                stack.append(i)
            else:
                stack.pop()
                if not stack:
                    stack.append(i)  # unmatched ')' becomes the new boundary
                else:
                    best = max(best, i - stack[-1])
        return best
```

```java
class Solution {
    public int longestValidParentheses(String s) {
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(-1); // bottom of the stack: index just before the current valid run
        int best = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') {
                stack.push(i);
            } else {
                stack.pop();
                if (stack.isEmpty()) {
                    stack.push(i); // unmatched ')' becomes the new boundary
                } else {
                    best = Math.max(best, i - stack.peek());
                }
            }
        }
        return best;
    }
}
```

```cpp
class Solution {
public:
    int longestValidParentheses(string s) {
        vector<int> stack = {-1};  // bottom of the stack: index just before the current valid run
        int best = 0;
        for (int i = 0; i < (int)s.size(); i++) {
            if (s[i] == '(') {
                stack.push_back(i);
            } else {
                stack.pop_back();
                if (stack.empty()) {
                    stack.push_back(i);  // unmatched ')' becomes the new boundary
                } else {
                    best = max(best, i - stack.back());
                }
            }
        }
        return best;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {number}
 */
var longestValidParentheses = function (s) {
  const stack = [-1]; // bottom of the stack: index just before the current valid run
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else {
      stack.pop();
      if (stack.length === 0) {
        stack.push(i); // unmatched ')' becomes the new boundary
      } else {
        best = Math.max(best, i - stack[stack.length - 1]);
      }
    }
  }
  return best;
};
```

```go
func longestValidParentheses(s string) int {
	stack := []int{-1} // bottom of the stack: index just before the current valid run
	best := 0
	for i := 0; i < len(s); i++ {
		if s[i] == '(' {
			stack = append(stack, i)
			continue
		}
		stack = stack[:len(stack)-1]
		if len(stack) == 0 {
			stack = append(stack, i) // unmatched ')' becomes the new boundary
		} else if i-stack[len(stack)-1] > best {
			best = i - stack[len(stack)-1]
		}
	}
	return best
}
```
