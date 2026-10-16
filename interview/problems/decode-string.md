---
title: Decode String
leetcode: decode-string
description: "Decode String explained: expand nested k[...] repetition patterns into the full string with two stacks in a single left-to-right scan, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an encoded string `s`. The encoding uses the pattern `k[text]`, which stands for `text` written `k` times in a row. `k` is a positive whole number (it can have more than one digit) and `text` can itself contain more encoded patterns, nested to any depth. Letters outside any brackets are copied as they are.

Return the fully decoded string.

You can rely on the input being well formed: brackets are balanced, every `[` is directly preceded by its repeat count, digits only ever appear as repeat counts, and the letters are lowercase English letters. The decoded result is guaranteed to be reasonably short (at most around a hundred thousand characters).

## Examples

- `s = "2[ab]c"` → `"ababc"`. `ab` twice, then the plain `c`.
- `s = "3[x2[y]]"` → `"xyyxyyxyy"`. The inner `2[y]` becomes `yy`, so the outer part repeats `xyy` three times.
- `s = "a10[b]"` → `"abbbbbbbbbb"`. The count `10` has two digits.
- `s = "pq"` → `"pq"`. No brackets: nothing to expand.

## Key idea

Nested brackets mean we have to finish the innermost piece before we can repeat the piece around it, which is exactly what a stack is for. Scan the string once and keep a "current" string being built. When a `[` opens, save the current string and the repeat count on stacks and start a fresh current string for the inside. When the matching `]` closes, the current string is the finished inside: repeat it, and glue it onto the string we saved before the bracket.

## Approach

1. Keep `current = ""`, `num = 0`, a stack `counts` of repeat counts and a stack `prefixes` of saved strings.
2. Read the characters of `s` from left to right:
   - **Digit:** `num = num * 10 + digit`. This builds multi-digit counts like `10` or `300`.
   - **`[`:** push `num` onto `counts` and `current` onto `prefixes`, then reset `num = 0` and `current = ""`.
   - **`]`:** pop `k` from `counts` and `prefix` from `prefixes`; set `current = prefix + current` repeated `k` times.
   - **Letter:** append it to `current`.
3. After the scan, `current` is the decoded string.

Tracing `3[x2[y]]`: at the first `[` we save (`3`, `""`); at the second `[` we save (`2`, `"x"`); `current` becomes `"y"`. The first `]` gives `"x" + "yy" = "xyy"`; the second `]` gives `"" + "xyyxyyxyy"`.

A recursive parser that returns at each `]` works just as well; the explicit stacks are the same thing without recursion.

## Complexity

- **Time:** O(L + D · N), where L is the length of `s`, N the length of the decoded output and D the bracket nesting depth. Each character of the input is read once, and each output character is copied once per bracket level it sits inside (it is rebuilt when each enclosing `]` closes). For typical inputs D is small, so this is close to linear in the output.
- **Space:** O(N) for the strings being built, plus stacks as deep as the nesting.

## Common mistakes

- Reading only one digit for the count, so `10[b]` turns into `0[b]` after a stray `1`.
- Forgetting to reset `num` after pushing it at `[`, so the next count is glued onto the previous one.
- Repeating the prefix along with the inside: it is `prefix + inside * k`, not `(prefix + inside) * k`.
- Building strings with repeated `+=` in a loop in Java or Go for big outputs; use a `StringBuilder` / `strings.Builder` or `strings.Repeat`.

## Follow-up questions

- Solve it recursively. (A function decodes until it meets `]` and returns the string plus the position it stopped at.)
- What if the input could be malformed? (Validate brackets and counts as you scan and report errors instead of crashing.)

## Related problems

- Valid Parentheses
- Basic Calculator
- Number of Atoms

## Solutions

```python
class Solution:
    def decodeString(self, s: str) -> str:
        counts, prefixes = [], []
        current, num = [], 0  # current is a list of pieces, joined when needed
        for ch in s:
            if ch.isdigit():
                num = num * 10 + int(ch)
            elif ch == '[':
                counts.append(num)
                prefixes.append(current)
                current, num = [], 0
            elif ch == ']':
                inner = ''.join(current) * counts.pop()
                current = prefixes.pop()
                current.append(inner)
            else:
                current.append(ch)
        return ''.join(current)
```

```java
class Solution {
    public String decodeString(String s) {
        Deque<Integer> counts = new ArrayDeque<>();
        Deque<StringBuilder> prefixes = new ArrayDeque<>();
        StringBuilder current = new StringBuilder();
        int num = 0;
        for (char ch : s.toCharArray()) {
            if (Character.isDigit(ch)) {
                num = num * 10 + (ch - '0');
            } else if (ch == '[') {
                counts.push(num);
                prefixes.push(current);
                current = new StringBuilder();
                num = 0;
            } else if (ch == ']') {
                String inner = current.toString().repeat(counts.pop());
                current = prefixes.pop().append(inner);
            } else {
                current.append(ch);
            }
        }
        return current.toString();
    }
}
```

```cpp
class Solution {
public:
    string decodeString(string s) {
        vector<int> counts;
        vector<string> prefixes;
        string current;
        int num = 0;
        for (char ch : s) {
            if (isdigit(ch)) {
                num = num * 10 + (ch - '0');
            } else if (ch == '[') {
                counts.push_back(num);
                prefixes.push_back(move(current));
                current.clear();
                num = 0;
            } else if (ch == ']') {
                string prefix = move(prefixes.back());
                prefixes.pop_back();
                int k = counts.back();
                counts.pop_back();
                prefix.reserve(prefix.size() + current.size() * k);
                for (int i = 0; i < k; i++) {
                    prefix += current;
                }
                current = move(prefix);
            } else {
                current += ch;
            }
        }
        return current;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {string}
 */
var decodeString = function (s) {
  const counts = [], prefixes = [];
  let current = "", num = 0;
  for (const ch of s) {
    if (ch >= "0" && ch <= "9") {
      num = num * 10 + Number(ch);
    } else if (ch === "[") {
      counts.push(num);
      prefixes.push(current);
      current = "";
      num = 0;
    } else if (ch === "]") {
      current = prefixes.pop() + current.repeat(counts.pop());
    } else {
      current += ch;
    }
  }
  return current;
};
```

```go
import "strings"

func decodeString(s string) string {
	counts := []int{}
	prefixes := []string{}
	current := ""
	num := 0
	for _, ch := range s {
		switch {
		case ch >= '0' && ch <= '9':
			num = num*10 + int(ch-'0')
		case ch == '[':
			counts = append(counts, num)
			prefixes = append(prefixes, current)
			current, num = "", 0
		case ch == ']':
			k := counts[len(counts)-1]
			counts = counts[:len(counts)-1]
			prefix := prefixes[len(prefixes)-1]
			prefixes = prefixes[:len(prefixes)-1]
			current = prefix + strings.Repeat(current, k)
		default:
			current += string(ch)
		}
	}
	return current
}
```
