---
title: Basic Calculator II
leetcode: basic-calculator-ii
description: "Basic Calculator II explained: evaluate a string with + - * / and spaces, giving * and / priority, in one pass with a stack of terms, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` holding an arithmetic expression and must return its value as an integer. The expression contains:

- non-negative whole numbers (possibly several digits long),
- the operators `+`, `-`, `*` and `/`,
- any number of spaces, anywhere.

There are no parentheses and no unary minus. Normal precedence applies: `*` and `/` are done before `+` and `-`, and operators of the same level go left to right. Division is integer division that **drops the fractional part** (rounds toward zero), so `7 / 2` is `3`.

The expression is always valid, and the result and every intermediate value fit in a signed 32-bit integer. You may not use a built-in evaluator such as `eval`.

## Examples

- `s = "3+4*2"` → `11`. The multiplication happens first: `3 + 8`.
- `s = " 20 / 3 - 1 "` → `5`. `20 / 3` is `6` after dropping the fraction, then `6 - 1`. Spaces are ignored.
- `s = "8-6/4*3"` → `5`. `6 / 4 = 1`, then `1 * 3 = 3`, then `8 - 3`.
- `s = "42"` → `42`. A single number is its own value.

## Key idea

An expression without parentheses is a sum of **terms**, where each term is a run of numbers joined by `*` and `/`: `8 - 6/4*3` is `(+8) + (-(6/4*3))`. So read the string left to right and keep a stack of finished-or-growing terms:

- after a `+`, the next number starts a new term `+num`,
- after a `-`, it starts a new term `-num`,
- after a `*` or `/`, it does not start a term; it combines with the term on top of the stack.

At the end, the answer is the sum of the stack.

## Approach

1. Keep `num = 0` (the number being read), `op = '+'` (the operator *before* that number) and an empty stack.
2. Walk through the string with index `i`. If `s[i]` is a digit, set `num = num * 10 + digit`.
3. If `s[i]` is an operator, or `i` is the last index, the current number is complete. Apply the previous operator `op`:
   - `+`: push `num`.
   - `-`: push `-num`.
   - `*`: replace the top with `top * num`.
   - `/`: replace the top with `top / num`, truncated toward zero.

   Then set `op = s[i]` and `num = 0`.
4. Spaces are simply skipped (but the last-index check must still run if the string ends with spaces, which is why the check is "is this the last index", not "is this the last digit").
5. Return the sum of the stack.

The stack can be replaced by two variables, the running total of finished terms and the current term, which brings space down to O(1). The stack version is easier to explain first.

## Complexity

- **Time:** O(n), where n is the length of `s`: each character is processed once.
- **Space:** O(n) for the stack in the worst case (an expression like `1+1+1+...`). The two-variable version uses O(1).

## Common mistakes

- Dividing with floor division. A term can be negative (`3-5/2` puts `-5` on the stack before dividing), and `-5 / 2` must give `-2`, not `-3`. Python's `//` and JavaScript's `Math.floor` round down, so they get this wrong.
- Forgetting the last number. It has no operator after it, so it must be flushed when the loop reaches the final character.
- Treating each digit as a separate number instead of building multi-digit numbers.
- Applying the operator just read instead of the one before the number.

## Follow-up questions

- Add parentheses (Basic Calculator / Basic Calculator III). (Recurse on each parenthesised part, or push the current state onto a stack when you see `(` and pop it at `)`.)
- Support unary minus such as `-3*-2`. (Treat a `-` at the start or right after another operator as the sign of the next number.)
- Do it in O(1) extra space. (Keep `total` and `last` instead of the stack: `+`/`-` add `last` into `total` and start a new `last`; `*`/`/` update `last`.)

## Related problems

- Basic Calculator and Basic Calculator III: the same task with parentheses.
- Evaluate Reverse Polish Notation: a stack-based evaluator where precedence is already resolved.
- [Decode String](/interview/problems/decode-string/): another one-pass string parse with a stack.

## Solutions

```python
class Solution:
    def calculate(self, s: str) -> int:
        stack = []
        num, op = 0, "+"
        for i, ch in enumerate(s):
            if ch.isdigit():
                num = num * 10 + int(ch)
            if ch in "+-*/" or i == len(s) - 1:
                if op == "+":
                    stack.append(num)
                elif op == "-":
                    stack.append(-num)
                elif op == "*":
                    stack.append(stack.pop() * num)
                else:
                    top = stack.pop()
                    q = abs(top) // num  # truncate toward zero, not floor
                    stack.append(-q if top < 0 else q)
                op, num = ch, 0
        return sum(stack)
```

```java
class Solution {
    public int calculate(String s) {
        Deque<Integer> stack = new ArrayDeque<>();
        int num = 0;
        char op = '+';
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (Character.isDigit(ch)) {
                num = num * 10 + (ch - '0');
            }
            if ((ch != ' ' && !Character.isDigit(ch)) || i == s.length() - 1) {
                switch (op) {
                    case '+': stack.push(num); break;
                    case '-': stack.push(-num); break;
                    case '*': stack.push(stack.pop() * num); break;
                    default: stack.push(stack.pop() / num); // Java's / truncates toward zero
                }
                op = ch;
                num = 0;
            }
        }
        int total = 0;
        for (int term : stack) total += term;
        return total;
    }
}
```

```cpp
class Solution {
public:
    int calculate(string s) {
        vector<int> stack;
        int num = 0;
        char op = '+';
        for (size_t i = 0; i < s.size(); i++) {
            char ch = s[i];
            if (isdigit(ch)) {
                num = num * 10 + (ch - '0');
            }
            if ((ch != ' ' && !isdigit(ch)) || i == s.size() - 1) {
                if (op == '+') {
                    stack.push_back(num);
                } else if (op == '-') {
                    stack.push_back(-num);
                } else if (op == '*') {
                    stack.back() *= num;
                } else {
                    stack.back() /= num;  // C++'s / truncates toward zero
                }
                op = ch;
                num = 0;
            }
        }
        int total = 0;
        for (int term : stack) total += term;
        return total;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {number}
 */
var calculate = function (s) {
  const stack = [];
  let num = 0;
  let op = "+";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch >= "0" && ch <= "9") {
      num = num * 10 + (ch.charCodeAt(0) - 48);
    }
    if ("+-*/".includes(ch) || i === s.length - 1) {
      if (op === "+") {
        stack.push(num);
      } else if (op === "-") {
        stack.push(-num);
      } else if (op === "*") {
        stack.push(stack.pop() * num);
      } else {
        stack.push(Math.trunc(stack.pop() / num)); // truncate toward zero, not floor
      }
      op = ch;
      num = 0;
    }
  }
  return stack.reduce((a, b) => a + b, 0);
};
```

```go
func calculate(s string) int {
	stack := []int{}
	num := 0
	op := byte('+')
	for i := 0; i < len(s); i++ {
		ch := s[i]
		if ch >= '0' && ch <= '9' {
			num = num*10 + int(ch-'0')
		}
		if (ch != ' ' && (ch < '0' || ch > '9')) || i == len(s)-1 {
			top := len(stack) - 1
			switch op {
			case '+':
				stack = append(stack, num)
			case '-':
				stack = append(stack, -num)
			case '*':
				stack[top] *= num
			case '/':
				stack[top] /= num // Go's / truncates toward zero
			}
			op = ch
			num = 0
		}
	}
	total := 0
	for _, term := range stack {
		total += term
	}
	return total
}
```
