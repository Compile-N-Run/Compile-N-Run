---
title: Evaluate Reverse Polish Notation
leetcode: evaluate-reverse-polish-notation
description: "Evaluate Reverse Polish Notation explained: compute a postfix expression with one stack, applying each operator to the two most recent values and truncating division toward zero, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an arithmetic expression in **Reverse Polish Notation** (postfix) as an array of string tokens. Each token is either an integer (possibly negative, like `"-4"`) or one of the four operators `+`, `-`, `*`, `/`. In postfix notation an operator comes *after* its two operands, so `["3", "4", "+"]` means `3 + 4` and no parentheses are ever needed.

Evaluate the expression and return its value as an integer. Division between two integers **truncates toward zero** (`7 / 2 = 3`, `-7 / 2 = -3`), there is never a division by zero, the expression is always valid, and every intermediate value fits in a 32-bit signed integer.

## Examples

- `["3", "4", "+", "2", "*"]` → `14`. First `3 + 4 = 7`, then `7 * 2 = 14`; in infix this is `(3 + 4) * 2`.
- `["10", "3", "/"]` → `3`. Integer division drops the remainder.
- `["-7", "2", "/"]` → `-3`, not `-4`: truncation goes toward zero, while floor division would go down.
- `["2", "3", "4", "*", "+", "5", "-"]` → `9`. `3 * 4 = 12`, `2 + 12 = 14`, `14 - 5 = 9`.
- `["5"]` → `5`. A lone number is a complete expression.

## Key idea

Postfix notation is exactly the order in which a stack machine works. Read the tokens left to right: a number is a value you do not know what to do with yet, so push it; an operator always applies to the **two most recently produced values**, which are the top two items of the stack. Pop them, compute, and push the result back as a new value. When the tokens run out, the stack holds exactly one number: the answer.

## Approach

1. Create an empty stack of integers.
2. For each token:
   1. If it is an operator, pop `b` (the top) and then `a`. Compute `a op b` (the order matters for `-` and `/`) and push the result.
   2. Otherwise parse it as an integer and push it.
3. Return the single remaining value.

Division must truncate toward zero. Java, C++ and Go's integer `/` already does that. Python's `//` floors (so `-7 // 2 == -4`), so use `int(a / b)`; in JavaScript `/` gives a float, so use `Math.trunc(a / b)`.

There is no faster alternative: every token must be read once. The point of the problem is recognising the stack and getting the operand order and the division right.

## Complexity

- **Time:** O(n). Each token is pushed and popped at most once.
- **Space:** O(n) for the stack in the worst case (an expression like `1 2 3 ... + + +` pushes everything before any operator arrives).

## Common mistakes

- Popping in the wrong order: the first value popped is the **right** operand. `["6", "3", "-"]` is `6 - 3`, not `3 - 6`.
- Flooring instead of truncating in Python (`//`) or JavaScript (`Math.floor`); both give `-4` for `-7 / 2`.
- Testing for a negative number by checking whether the token starts with `-`. The token `"-"` is the operator; `"-4"` is a number. Compare against the whole operator string instead.
- Forgetting to push the result back, so the next operator sees the wrong operands.

## Follow-up questions

- How would you convert an infix expression (with parentheses and precedence) to this postfix form? (The shunting-yard algorithm, which is the basis of Basic Calculator.)
- What should happen with malformed input (too few operands, leftover values)? LeetCode guarantees validity, but an interviewer may ask you to detect it: an operator with fewer than two values on the stack, or more than one value at the end, means the expression is invalid.

## Related problems

- [Basic Calculator](/interview/problems/basic-calculator/)
- [Basic Calculator II](/interview/problems/basic-calculator-ii/)
- [Valid Parentheses](/interview/problems/valid-parentheses/)
- [Min Stack](/interview/problems/min-stack/)

## Solutions

```python
class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        stack = []
        for token in tokens:
            if token in ('+', '-', '*', '/'):
                b, a = stack.pop(), stack.pop()  # the top is the right operand
                if token == '+':
                    stack.append(a + b)
                elif token == '-':
                    stack.append(a - b)
                elif token == '*':
                    stack.append(a * b)
                else:
                    stack.append(int(a / b))  # truncate toward zero; // would floor
            else:
                stack.append(int(token))
        return stack[0]
```

```java
class Solution {
    public int evalRPN(String[] tokens) {
        Deque<Integer> stack = new ArrayDeque<>();
        for (String token : tokens) {
            switch (token) {
                case "+": stack.push(stack.pop() + stack.pop()); break;
                case "*": stack.push(stack.pop() * stack.pop()); break;
                case "-": { int b = stack.pop(), a = stack.pop(); stack.push(a - b); break; }
                case "/": { int b = stack.pop(), a = stack.pop(); stack.push(a / b); break; } // truncates toward zero
                default: stack.push(Integer.parseInt(token));
            }
        }
        return stack.pop();
    }
}
```

```cpp
class Solution {
public:
    int evalRPN(vector<string>& tokens) {
        vector<int> stack;
        for (const string& token : tokens) {
            if (token == "+" || token == "-" || token == "*" || token == "/") {
                int b = stack.back(); stack.pop_back();  // the top is the right operand
                int a = stack.back(); stack.pop_back();
                if (token == "+") stack.push_back(a + b);
                else if (token == "-") stack.push_back(a - b);
                else if (token == "*") stack.push_back(a * b);
                else stack.push_back(a / b);  // C++ integer division truncates toward zero
            } else {
                stack.push_back(stoi(token));
            }
        }
        return stack.back();
    }
};
```

```javascript
/**
 * @param {string[]} tokens
 * @return {number}
 */
var evalRPN = function (tokens) {
  const stack = [];
  for (const token of tokens) {
    if (token === '+' || token === '-' || token === '*' || token === '/') {
      const b = stack.pop(), a = stack.pop(); // the top is the right operand
      if (token === '+') stack.push(a + b);
      else if (token === '-') stack.push(a - b);
      else if (token === '*') stack.push(a * b);
      else stack.push(Math.trunc(a / b)); // truncate toward zero; Math.floor would be wrong for negatives
    } else {
      stack.push(parseInt(token, 10));
    }
  }
  return stack[0];
};
```

```go
import "strconv"

func evalRPN(tokens []string) int {
	stack := []int{}
	for _, token := range tokens {
		switch token {
		case "+", "-", "*", "/":
			b, a := stack[len(stack)-1], stack[len(stack)-2] // the top is the right operand
			stack = stack[:len(stack)-2]
			switch token {
			case "+":
				stack = append(stack, a+b)
			case "-":
				stack = append(stack, a-b)
			case "*":
				stack = append(stack, a*b)
			default:
				stack = append(stack, a/b) // Go integer division truncates toward zero
			}
		default:
			n, _ := strconv.Atoi(token)
			stack = append(stack, n)
		}
	}
	return stack[0]
}
```
