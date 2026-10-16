---
title: Generate Parentheses
leetcode: generate-parentheses
description: "Generate Parentheses explained: list every balanced string of n pairs of brackets with backtracking that tracks open and close counts, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Given a positive integer `n`, return every string made of exactly `n` opening brackets `(` and `n` closing brackets `)` that is *well formed*: reading from left to right, every `)` closes an earlier unmatched `(`, and nothing is left open at the end.

Each valid string must appear exactly once. The order of the strings in the result does not matter. `n` is small (at most 8 on LeetCode), because the number of answers grows very quickly.

## Examples

- `n = 1` → `["()"]`. One pair can only be arranged one way.
- `n = 2` → `["(())", "()()"]`. Arrangements such as `")()("` or `"))(("` use the same brackets but are not well formed.
- `n = 3` → `["((()))", "(()())", "(())()", "()(())", "()()()"]`, five strings in total.

## Key idea

Build the string one character at a time and only make moves that can still lead to a valid answer. Two counters decide what is allowed:

- You may add `(` while you have used fewer than `n` of them.
- You may add `)` only while there are more `(` than `)` so far, so there is something to close.

When the string reaches length `2n`, it is guaranteed to be valid. This is *backtracking*: explore a choice, undo it, try the other one. Because invalid prefixes are never built, no work is wasted on strings that would be thrown away.

## Approach

1. Write a recursive helper `build(current, open, close)` where `open` and `close` count the brackets placed so far.
2. If `current` has length `2n`, add it to the result and return.
3. If `open < n`, recurse with `current + "("` and `open + 1`.
4. If `close < open`, recurse with `current + ")"` and `close + 1`.
5. Start with `build("", 0, 0)` and return the result.

The brute force generates all `2^(2n)` strings of brackets and keeps the balanced ones. That checks far more strings than there are answers: for `n = 8` it is 65,536 strings for only 1,430 answers.

## Complexity

- **Time:** O(4^n / √n). The number of answers is the n-th Catalan number, about 4^n / (n√n), and each answer costs O(n) to build and copy.
- **Space:** O(n) for the recursion and the string being built, not counting the output.

## Common mistakes

- Allowing `)` whenever `close < n`. That produces strings like `")("` that start by closing nothing. The condition must be `close < open`.
- Copying the whole string on every step in a language with mutable buffers, then forgetting to remove the last character when backtracking.
- Generating every arrangement and filtering afterwards, which is exponentially slower.

## Follow-up questions

- How many valid strings are there for a given `n`? The Catalan number C(n) = (2n)! / ((n + 1)! n!), which you can also compute with dynamic programming.
- Check whether a given string with several bracket types is valid (Valid Parentheses).

## Related problems

- Valid Parentheses
- Letter Combinations of a Phone Number
- Remove Invalid Parentheses

## Solutions

```python
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        result = []

        def build(current: List[str], open_count: int, close_count: int) -> None:
            if len(current) == 2 * n:
                result.append(''.join(current))
                return
            if open_count < n:
                current.append('(')
                build(current, open_count + 1, close_count)
                current.pop()
            if close_count < open_count:
                current.append(')')
                build(current, open_count, close_count + 1)
                current.pop()

        build([], 0, 0)
        return result
```

```java
class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> result = new ArrayList<>();
        build(new StringBuilder(), 0, 0, n, result);
        return result;
    }

    private void build(StringBuilder current, int open, int close, int n, List<String> result) {
        if (current.length() == 2 * n) {
            result.add(current.toString());
            return;
        }
        if (open < n) {
            current.append('(');
            build(current, open + 1, close, n, result);
            current.deleteCharAt(current.length() - 1);
        }
        if (close < open) {
            current.append(')');
            build(current, open, close + 1, n, result);
            current.deleteCharAt(current.length() - 1);
        }
    }
}
```

```cpp
class Solution {
public:
    vector<string> generateParenthesis(int n) {
        vector<string> result;
        string current;
        build(current, 0, 0, n, result);
        return result;
    }

private:
    void build(string& current, int open, int close, int n, vector<string>& result) {
        if ((int)current.size() == 2 * n) {
            result.push_back(current);
            return;
        }
        if (open < n) {
            current.push_back('(');
            build(current, open + 1, close, n, result);
            current.pop_back();
        }
        if (close < open) {
            current.push_back(')');
            build(current, open, close + 1, n, result);
            current.pop_back();
        }
    }
};
```

```javascript
/**
 * @param {number} n
 * @return {string[]}
 */
var generateParenthesis = function (n) {
  const result = [];
  const current = [];
  const build = (open, close) => {
    if (current.length === 2 * n) {
      result.push(current.join(''));
      return;
    }
    if (open < n) {
      current.push('(');
      build(open + 1, close);
      current.pop();
    }
    if (close < open) {
      current.push(')');
      build(open, close + 1);
      current.pop();
    }
  };
  build(0, 0);
  return result;
};
```

```go
func generateParenthesis(n int) []string {
	result := []string{}
	current := make([]byte, 0, 2*n)
	var build func(open, close int)
	build = func(open, close int) {
		if len(current) == 2*n {
			result = append(result, string(current))
			return
		}
		if open < n {
			current = append(current, '(')
			build(open+1, close)
			current = current[:len(current)-1]
		}
		if close < open {
			current = append(current, ')')
			build(open, close+1)
			current = current[:len(current)-1]
		}
	}
	build(0, 0)
	return result
}
```
