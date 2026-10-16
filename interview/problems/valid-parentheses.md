---
title: Valid Parentheses
leetcode: valid-parentheses
description: "Valid Parentheses explained: check that every bracket in a string is closed by the right type in the right order using a stack, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a non-empty string `s` made only of the six bracket characters `(`, `)`, `[`, `]`, `{` and `}`. Return `true` if the brackets are balanced and `false` otherwise.

Balanced means:

- every opening bracket is closed by a closing bracket of the **same type**,
- brackets are closed in the **reverse order** they were opened (the most recently opened one must close first), and
- every closing bracket has a matching opening bracket before it.

## Examples

- `"([]{})"` → `true`. The `[]` and `{}` pairs close inside the outer `()`.
- `"([)]"` → `false`. The `[` was opened last, so it must close before the `)`.
- `"(("` → `false`. Two brackets are opened and never closed.
- `"}"` → `false`. A closing bracket with nothing to match.

## Key idea

The bracket that must close next is always the one that was opened most recently. "Most recent first" is exactly what a **stack** gives you: push each opening bracket, and when a closing bracket arrives, it must match the bracket on top of the stack, which you then pop. At the end, the stack must be empty, otherwise some brackets were never closed.

## Approach

1. Make a lookup from each closing bracket to its opening partner: `)` → `(`, `]` → `[`, `}` → `{`.
2. Create an empty stack.
3. For each character `c` in `s`:
   1. If `c` is an opening bracket, push it.
   2. If `c` is a closing bracket, the stack must be non-empty and its top must be the partner of `c`. If not, return `false`. If it matches, pop.
4. After the loop, return `true` only if the stack is empty.

Counting brackets of each type is not enough: `"([)]"` has one of each pair but is still invalid, because counting ignores order.

## Complexity

- **Time:** O(n). Each character is pushed and popped at most once.
- **Space:** O(n) for the stack in the worst case (for example, a string of only opening brackets).

## Common mistakes

- Reading the top of an empty stack when the string starts with a closing bracket. Check for emptiness first.
- Returning `true` at the end without checking that the stack is empty, which accepts strings like `"(("`.
- Using one counter per bracket type, which cannot detect wrong nesting like `"([)]"`.

## Follow-up questions

- If the string had only one bracket type, how could you do it in O(1) space? (Keep a counter and fail if it ever goes negative.)
- How would you find the length of the longest valid substring? (Longest Valid Parentheses.)
- How would you generate all balanced strings of `n` pairs? (Generate Parentheses.)

## Related problems

- Generate Parentheses
- Longest Valid Parentheses
- Minimum Remove to Make Valid Parentheses

## Solutions

```python
class Solution:
    def isValid(self, s: str) -> bool:
        partner = {')': '(', ']': '[', '}': '{'}
        stack = []
        for c in s:
            if c in partner:
                if not stack or stack[-1] != partner[c]:
                    return False
                stack.pop()
            else:
                stack.append(c)
        return not stack
```

```java
class Solution {
    public boolean isValid(String s) {
        Map<Character, Character> partner = Map.of(')', '(', ']', '[', '}', '{');
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (partner.containsKey(c)) {
                // equals(), not !=: both sides are Character objects
                if (stack.isEmpty() || !stack.peek().equals(partner.get(c))) {
                    return false;
                }
                stack.pop();
            } else {
                stack.push(c);
            }
        }
        return stack.isEmpty();
    }
}
```

```cpp
class Solution {
public:
    bool isValid(string s) {
        unordered_map<char, char> partner = {{')', '('}, {']', '['}, {'}', '{'}};
        vector<char> stack;
        for (char c : s) {
            if (partner.count(c)) {
                if (stack.empty() || stack.back() != partner[c]) {
                    return false;
                }
                stack.pop_back();
            } else {
                stack.push_back(c);
            }
        }
        return stack.empty();
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function (s) {
  const partner = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const c of s) {
    if (c in partner) {
      if (stack.length === 0 || stack[stack.length - 1] !== partner[c]) {
        return false;
      }
      stack.pop();
    } else {
      stack.push(c);
    }
  }
  return stack.length === 0;
};
```

```go
func isValid(s string) bool {
	partner := map[byte]byte{')': '(', ']': '[', '}': '{'}
	stack := []byte{}
	for i := 0; i < len(s); i++ {
		c := s[i]
		if open, ok := partner[c]; ok {
			if len(stack) == 0 || stack[len(stack)-1] != open {
				return false
			}
			stack = stack[:len(stack)-1]
		} else {
			stack = append(stack, c)
		}
	}
	return len(stack) == 0
}
```
