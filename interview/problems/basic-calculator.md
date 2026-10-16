---
title: Basic Calculator
leetcode: basic-calculator
description: "Basic Calculator explained: evaluate an expression with + - parentheses and spaces in one pass by tracking the current sign and pushing the running total on every opening bracket, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` holding an arithmetic expression and must return its value as an integer. The expression contains:

- non-negative whole numbers (possibly several digits long),
- the operators `+` and `-`, where `-` may also be a unary minus, as in `-(2+3)`,
- round brackets `(` and `)`, nested to any depth,
- any number of spaces, anywhere.

There is no multiplication or division. The expression is always valid, every intermediate value fits in a signed 32-bit integer, and you may not call a built-in evaluator such as `eval`. The string has at least one character and can be up to 300,000 characters long.

## Examples

- `s = "12 - 5 + 3"` → `10`. Plain left-to-right arithmetic; spaces are ignored.
- `s = "2-(5-6)"` → `3`. The bracket evaluates to `-1`, and subtracting it adds one.
- `s = "(1+(4+5+2)-3)+(6+8)"` → `23`. Inner brackets first: `(1 + 11 - 3) + 14`.
- `s = "-(2+3)"` → `-5`. A leading minus negates the whole bracket.
- `s = "1-(2-(3-(4-5)))"` → `3`. Each level flips the sign of everything inside it.

## Key idea

With only `+` and `-`, every number in the expression ends up either added or subtracted from the total; brackets only decide *which*. So keep a running `result` and a `sign` (`+1` or `-1`) for the number being read. A `(` does not change the arithmetic, it just starts a fresh sub-total, so **push** the current `result` and `sign` on a stack and start over at zero. A `)` finishes that sub-total: pop the saved sign and result, and fold the bracket's value in as `result = saved_result + saved_sign × bracket_value`. Because the sign of a bracket is applied when it closes, nested minus signs combine correctly without any lookahead.

## Approach

1. Keep `result = 0`, `sign = 1`, `num = 0` and an empty stack.
2. Walk the string one character at a time:
   - **digit:** `num = num * 10 + digit` (numbers can span several characters).
   - **`+` or `-`:** the number before it is complete, so add `sign * num` to `result`, reset `num = 0`, and set `sign` to `+1` or `-1`.
   - **`(`:** push `result` and `sign`, then reset `result = 0` and `sign = 1` for the inside.
   - **`)`:** add `sign * num` to `result` and reset `num = 0`; pop the saved `sign` and `result`; set `result = saved_result + saved_sign * result`.
   - **space:** skip.
3. After the loop add the last pending `sign * num` and return `result`.

A general alternative converts the expression to postfix (shunting-yard) and evaluates it with a stack. That handles any operator set but is far more code than this problem needs.

## Complexity

- **Time:** O(n), where `n` is the length of `s`: each character is handled once with constant work.
- **Space:** O(n) in the worst case for the stack, which grows by one entry per unclosed `(`.

## Common mistakes

- Treating `-` only as a binary operator. `-(2+3)` and `(-1)` start with a minus and no left operand; the sign-tracking approach handles both because `sign` starts at `+1` and a `-` simply flips it.
- Forgetting to flush the pending number when a `)` or the end of the string arrives. Only operators and brackets end a number, so a number can be left in `num` if you do not check.
- Pushing only the result and not the sign, which breaks `2-(5-6)`: the bracket's value must be *subtracted*.
- Resetting `sign` at `)` or forgetting to reset it at `(`, so the first number inside a bracket inherits the wrong sign.
- Building the number with `int(s[i])` on each digit instead of accumulating, which fails on multi-digit numbers.

## Follow-up questions

- *Add `*` and `/`.* Precedence breaks the "every number is added or subtracted" rule; handle `*` and `/` by combining with the previous term first (see Basic Calculator II), or write a small recursive-descent parser.
- *Add exponentiation or unary plus.* A recursive-descent parser with one function per precedence level is the clean, general answer.
- *What about overflow?* The constraints promise 32-bit safety, but in Java, C++ or JavaScript you can accumulate in a 64-bit type to be safe.

## Related problems

- [Basic Calculator II](/interview/problems/basic-calculator-ii/)
- [Valid Parentheses](/interview/problems/valid-parentheses/)
- [Decode String](/interview/problems/decode-string/)
- [Simplify Path](/interview/problems/simplify-path/)
- Basic Calculator III
- Evaluate Reverse Polish Notation

## Solutions

```python
class Solution:
    def calculate(self, s: str) -> int:
        result, sign, num = 0, 1, 0
        stack = []  # (result, sign) saved at each '('
        for c in s:
            if c.isdigit():
                num = num * 10 + int(c)
            elif c in '+-':
                result += sign * num
                num = 0
                sign = 1 if c == '+' else -1
            elif c == '(':
                stack.append((result, sign))
                result, sign = 0, 1
            elif c == ')':
                result += sign * num
                num = 0
                saved_result, saved_sign = stack.pop()
                result = saved_result + saved_sign * result  # the bracket's value takes the sign before it
        return result + sign * num
```

```java
class Solution {
    public int calculate(String s) {
        int result = 0, sign = 1, num = 0;
        Deque<int[]> stack = new ArrayDeque<>(); // {result, sign} saved at each '('
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) {
                num = num * 10 + (c - '0');
            } else if (c == '+' || c == '-') {
                result += sign * num;
                num = 0;
                sign = c == '+' ? 1 : -1;
            } else if (c == '(') {
                stack.push(new int[] {result, sign});
                result = 0;
                sign = 1;
            } else if (c == ')') {
                result += sign * num;
                num = 0;
                int[] saved = stack.pop();
                result = saved[0] + saved[1] * result; // the bracket's value takes the sign before it
            }
        }
        return result + sign * num;
    }
}
```

```cpp
class Solution {
public:
    int calculate(string s) {
        int result = 0, sign = 1, num = 0;
        vector<pair<int, int>> stack;  // {result, sign} saved at each '('
        for (char c : s) {
            if (isdigit(c)) {
                num = num * 10 + (c - '0');
            } else if (c == '+' || c == '-') {
                result += sign * num;
                num = 0;
                sign = c == '+' ? 1 : -1;
            } else if (c == '(') {
                stack.push_back({result, sign});
                result = 0;
                sign = 1;
            } else if (c == ')') {
                result += sign * num;
                num = 0;
                auto [savedResult, savedSign] = stack.back();
                stack.pop_back();
                result = savedResult + savedSign * result;  // the bracket's value takes the sign before it
            }
        }
        return result + sign * num;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {number}
 */
var calculate = function (s) {
  let result = 0;
  let sign = 1;
  let num = 0;
  const stack = []; // [result, sign] saved at each '('
  for (const c of s) {
    if (c >= '0' && c <= '9') {
      num = num * 10 + (c.charCodeAt(0) - 48);
    } else if (c === '+' || c === '-') {
      result += sign * num;
      num = 0;
      sign = c === '+' ? 1 : -1;
    } else if (c === '(') {
      stack.push([result, sign]);
      result = 0;
      sign = 1;
    } else if (c === ')') {
      result += sign * num;
      num = 0;
      const [savedResult, savedSign] = stack.pop();
      result = savedResult + savedSign * result; // the bracket's value takes the sign before it
    }
  }
  return result + sign * num;
};
```

```go
func calculate(s string) int {
	result, sign, num := 0, 1, 0
	var stack [][2]int // {result, sign} saved at each '('
	for i := 0; i < len(s); i++ {
		c := s[i]
		switch {
		case c >= '0' && c <= '9':
			num = num*10 + int(c-'0')
		case c == '+' || c == '-':
			result += sign * num
			num = 0
			if c == '+' {
				sign = 1
			} else {
				sign = -1
			}
		case c == '(':
			stack = append(stack, [2]int{result, sign})
			result, sign = 0, 1
		case c == ')':
			result += sign * num
			num = 0
			saved := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			result = saved[0] + saved[1]*result // the bracket's value takes the sign before it
		}
	}
	return result + sign*num
}
```
