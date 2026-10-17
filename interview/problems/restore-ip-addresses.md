---
title: Restore IP Addresses
leetcode: restore-ip-addresses
description: "Restore IP Addresses explained: list every way to insert three dots into a digit string so that it becomes a valid IPv4 address, using backtracking with pruning, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` of digits only. Return every valid IPv4 address that can be formed by inserting exactly three dots into `s`, using all of its characters without reordering or dropping any. The addresses may be returned in any order.

A valid IPv4 address has four parts separated by dots, each an integer from `0` to `255` written without leading zeros (`"0"` is fine, `"01"` and `"00"` are not). The string has at most 20 characters, so there is nothing to restore when it is shorter than 4 or longer than 12 digits.

## Examples

- `s = "19216811"` → `["1.92.168.11", "19.2.168.11", "19.21.68.11", "19.216.8.11", "19.216.81.1", "192.1.68.11", "192.16.8.11", "192.16.81.1", "192.168.1.1"]`.
- `s = "1020304"` → `["10.20.30.4", "10.203.0.4", "102.0.30.4"]`. The `0` can only be a part on its own, never the start of a longer part.
- `s = "0000"` → `["0.0.0.0"]`.
- `s = "256256256256"` → `[]`. Each part would have to be three digits, and 256 is out of range.
- `s = "123"` → `[]`. Too short for four parts.

## Key idea

An address is four decisions in a row: how long is the first part (1, 2 or 3 digits), then the second, then the third, and the fourth part is whatever remains. Backtracking tries every length for the current part, keeps it only if it is a valid number, and recurses on the rest. There are at most 3³ = 27 ways to cut the first three parts, so the search is tiny; pruning (abandon a branch as soon as a part is invalid or the leftover cannot fill the remaining parts) keeps it fast on inputs such as 20 identical digits.

## Approach

1. Define `backtrack(start, parts)`, where `parts` holds the parts chosen so far.
2. If `parts` has four entries: if `start` is the end of the string, join the parts with dots and add the address; return either way.
3. Otherwise, for `length` in `1..3`:
   1. Stop if `start + length` goes past the end of `s`.
   2. Let `piece = s[start : start + length]`. Skip it if it has a leading zero and is longer than one digit, or if its value is greater than 255.
   3. Push `piece`, recurse with `start + length`, then pop it.
4. Optional pruning: the characters left must fit the parts left, i.e. between `partsLeft` and `3 · partsLeft`. Return early when they do not.
5. Start with `backtrack(0, [])` and return the collected addresses.

Three nested loops over the dot positions is the same algorithm written out by hand; backtracking generalises to `k` parts and is easier to keep correct.

## Complexity

- **Time:** O(1) in practice: at most 27 ways to place the three dots, each checked in constant time (the string has at most 12 usable digits). Written as a function of the length `n`, it is O(3^4 · n) for building the strings.
- **Space:** O(1) beyond the output, which holds at most 27 addresses; the recursion depth is at most 4.

## Common mistakes

- Accepting parts with leading zeros such as `"01"` or `"00"`. Only a single `"0"` is allowed.
- Forgetting the upper bound: `"300"` has three digits but is not a valid part.
- Checking the string length only at the end instead of pruning, which still passes but makes the search explore useless branches.
- Converting to an integer before checking the length, so `"0255"` becomes 255 and is wrongly accepted.

## Follow-up questions

- Validate a given IP address string (IPv4 or IPv6) instead of generating them. (Validate IP Address: split on the separator and check each part's format.)
- Restore an address from a string that already contains some dots, or generalise to `k` parts with a different range. (The same backtracking with `k` parts and a parameterised validity check.)

## Related problems

- [Word Break II](/interview/problems/word-break-ii/)
- [Generate Parentheses](/interview/problems/generate-parentheses/)
- [Letter Combinations of a Phone Number](/interview/problems/letter-combinations-of-a-phone-number/)
- Validate IP Address
- Palindrome Partitioning

## Solutions

```python
class Solution:
    def restoreIpAddresses(self, s: str) -> List[str]:
        result = []
        parts = []

        def valid(piece: str) -> bool:
            return (len(piece) == 1 or piece[0] != '0') and int(piece) <= 255

        def backtrack(start: int) -> None:
            remaining = 4 - len(parts)
            if remaining == 0:
                if start == len(s):
                    result.append('.'.join(parts))
                return
            if not remaining <= len(s) - start <= 3 * remaining:  # the leftover cannot fill the remaining parts
                return
            for length in range(1, 4):
                piece = s[start:start + length]
                if len(piece) < length or not valid(piece):
                    continue
                parts.append(piece)
                backtrack(start + length)
                parts.pop()

        backtrack(0)
        return result
```

```java
class Solution {
    private final List<String> result = new ArrayList<>();
    private final Deque<String> parts = new ArrayDeque<>();
    private String s;

    public List<String> restoreIpAddresses(String s) {
        this.s = s;
        backtrack(0);
        return result;
    }

    private void backtrack(int start) {
        int remaining = 4 - parts.size(), left = s.length() - start;
        if (remaining == 0) {
            if (left == 0) result.add(String.join(".", parts));
            return;
        }
        if (left < remaining || left > 3 * remaining) return; // the leftover cannot fill the remaining parts
        for (int length = 1; length <= 3 && start + length <= s.length(); length++) {
            String piece = s.substring(start, start + length);
            if ((length > 1 && piece.charAt(0) == '0') || Integer.parseInt(piece) > 255) continue;
            parts.addLast(piece);
            backtrack(start + length);
            parts.removeLast();
        }
    }
}
```

```cpp
class Solution {
public:
    vector<string> restoreIpAddresses(string s) {
        vector<string> result, parts;
        function<void(int)> backtrack = [&](int start) {
            int remaining = 4 - (int)parts.size(), left = (int)s.size() - start;
            if (remaining == 0) {
                if (left == 0) result.push_back(parts[0] + "." + parts[1] + "." + parts[2] + "." + parts[3]);
                return;
            }
            if (left < remaining || left > 3 * remaining) return;  // the leftover cannot fill the remaining parts
            for (int length = 1; length <= 3 && start + length <= (int)s.size(); length++) {
                string piece = s.substr(start, length);
                if ((length > 1 && piece[0] == '0') || stoi(piece) > 255) continue;
                parts.push_back(piece);
                backtrack(start + length);
                parts.pop_back();
            }
        };
        backtrack(0);
        return result;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {string[]}
 */
var restoreIpAddresses = function (s) {
  const result = [], parts = [];
  const backtrack = (start) => {
    const remaining = 4 - parts.length, left = s.length - start;
    if (remaining === 0) {
      if (left === 0) result.push(parts.join('.'));
      return;
    }
    if (left < remaining || left > 3 * remaining) return; // the leftover cannot fill the remaining parts
    for (let length = 1; length <= 3 && start + length <= s.length; length++) {
      const piece = s.slice(start, start + length);
      if ((length > 1 && piece[0] === '0') || Number(piece) > 255) continue;
      parts.push(piece);
      backtrack(start + length);
      parts.pop();
    }
  };
  backtrack(0);
  return result;
};
```

```go
import (
	"strconv"
	"strings"
)

func restoreIpAddresses(s string) []string {
	result := []string{}
	parts := []string{}
	var backtrack func(start int)
	backtrack = func(start int) {
		remaining, left := 4-len(parts), len(s)-start
		if remaining == 0 {
			if left == 0 {
				result = append(result, strings.Join(parts, "."))
			}
			return
		}
		if left < remaining || left > 3*remaining { // the leftover cannot fill the remaining parts
			return
		}
		for length := 1; length <= 3 && start+length <= len(s); length++ {
			piece := s[start : start+length]
			if value, _ := strconv.Atoi(piece); (length > 1 && piece[0] == '0') || value > 255 {
				continue
			}
			parts = append(parts, piece)
			backtrack(start + length)
			parts = parts[:len(parts)-1]
		}
	}
	backtrack(0)
	return result
}
```
