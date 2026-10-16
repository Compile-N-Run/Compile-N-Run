---
title: Remove K Digits
leetcode: remove-k-digits
description: "Remove K Digits explained: delete k digits from a number string to leave the smallest possible value, using a greedy monotonic stack that drops every digit larger than the one after it, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a non-negative integer as a string `num` (no sign, no leading zeros except for the number `"0"` itself) and an integer `k` with `0 <= k <= len(num)`. Delete exactly `k` digits so that the remaining digits, read in their original order, form the smallest possible number. Return that number as a string without leading zeros; if nothing remains, return `"0"`.

## Examples

- `num = "5329174", k = 3` → `"2174"`. Drop the `5`, then the `3`, then the `9`; every other choice leaves a larger number.
- `num = "20300", k = 1` → `"300"`. Removing the `2` leaves `"0300"`, which is `300` after stripping the leading zeros.
- `num = "12345", k = 2` → `"123"`. The digits already increase, so the best move is to drop the largest digits at the end.
- `num = "7", k = 1` → `"0"`. Removing everything leaves the empty string, which we report as `"0"`.

## Key idea

The leftmost digit matters most, so we want the smallest possible digit as early as possible. Scanning left to right, whenever a digit is **smaller than the one before it**, deleting that previous larger digit is always a good move: the smaller digit moves into a more significant position and nothing to its left changes. Doing this greedily, keeping a stack of digits that never decreases from bottom to top (a monotonic stack), produces the optimal answer. If we reach the end with deletions left over, the stack is non-decreasing, so the best remaining choice is to cut digits off its end.

## Approach

1. Create an empty stack of digits.
2. For each digit `d` of `num`: while `k > 0` and the stack is non-empty and its top is greater than `d`, pop the top and decrement `k`. Then push `d`.
3. If `k` is still positive after the scan, pop `k` more digits from the top (the stack is non-decreasing, so these are the largest).
4. Join the stack into a string, strip leading zeros, and return `"0"` if the result is empty.

Trying every combination of `k` deletions is exponential. A greedy rule that keeps a stack lets each digit be pushed and popped at most once.

## Complexity

- **Time:** O(n). Each digit enters and leaves the stack at most once, regardless of how many pops the inner loop performs in total.
- **Space:** O(n) for the stack and the output.

## Common mistakes

- Only popping once per incoming digit. A small digit may need to evict several larger ones (`"9871", k = 3` must pop `9`, `8` and `7`).
- Forgetting the leftover `k` after the scan, for example with an already sorted input like `"12345"`.
- Popping when the top is *equal* to the new digit. That wastes a deletion that could remove a larger digit later: for `"112", k = 1` the answer is `"11"`, which requires keeping both `1`s.
- Returning `""` or `"00"` instead of `"0"` when every digit is removed or only zeros remain.
- Stripping leading zeros before the final cut, or not at all.

## Follow-up questions

- How would you *maximise* the number instead? (Pop while the top is smaller than the incoming digit.)
- What if you must remove digits to leave exactly `m` digits forming the smallest number? (Identical: `k = n - m`.)
- Can the same stack idea build the largest number from two arrays? (Create Maximum Number combines it with a merge.)

## Related problems

- [Daily Temperatures](/interview/problems/daily-temperatures/) (monotonic stack)
- [Largest Rectangle in Histogram](/interview/problems/largest-rectangle-in-histogram/) (monotonic stack)
- Remove Duplicate Letters
- Create Maximum Number
- Monotone Increasing Digits

## Solutions

```python
class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        stack = []
        for d in num:
            while k > 0 and stack and stack[-1] > d:  # a smaller digit arrives: drop the larger one before it
                stack.pop()
                k -= 1
            stack.append(d)
        if k > 0:  # the stack never decreases now, so the largest digits are at the end
            stack = stack[:-k]
        return ''.join(stack).lstrip('0') or '0'
```

```java
class Solution {
    public String removeKdigits(String num, int k) {
        StringBuilder stack = new StringBuilder();
        for (char d : num.toCharArray()) {
            // A smaller digit arrives: drop the larger ones before it.
            while (k > 0 && stack.length() > 0 && stack.charAt(stack.length() - 1) > d) {
                stack.setLength(stack.length() - 1);
                k--;
            }
            stack.append(d);
        }
        stack.setLength(stack.length() - k); // the stack never decreases now, so the largest digits are at the end
        int start = 0;
        while (start < stack.length() && stack.charAt(start) == '0') start++;
        return start == stack.length() ? "0" : stack.substring(start);
    }
}
```

```cpp
class Solution {
public:
    string removeKdigits(string num, int k) {
        string stack;
        for (char d : num) {
            // A smaller digit arrives: drop the larger ones before it.
            while (k > 0 && !stack.empty() && stack.back() > d) {
                stack.pop_back();
                k--;
            }
            stack.push_back(d);
        }
        stack.resize(stack.size() - k);  // the stack never decreases now, so the largest digits are at the end
        size_t start = stack.find_first_not_of('0');
        return start == string::npos ? "0" : stack.substr(start);
    }
};
```

```javascript
/**
 * @param {string} num
 * @param {number} k
 * @return {string}
 */
var removeKdigits = function (num, k) {
  const stack = [];
  for (const d of num) {
    // A smaller digit arrives: drop the larger ones before it.
    while (k > 0 && stack.length > 0 && stack[stack.length - 1] > d) {
      stack.pop();
      k--;
    }
    stack.push(d);
  }
  stack.length -= k; // the stack never decreases now, so the largest digits are at the end
  const result = stack.join('').replace(/^0+/, '');
  return result === '' ? '0' : result;
};
```

```go
import "strings"

func removeKdigits(num string, k int) string {
	stack := make([]byte, 0, len(num))
	for i := 0; i < len(num); i++ {
		d := num[i]
		// A smaller digit arrives: drop the larger ones before it.
		for k > 0 && len(stack) > 0 && stack[len(stack)-1] > d {
			stack = stack[:len(stack)-1]
			k--
		}
		stack = append(stack, d)
	}
	stack = stack[:len(stack)-k] // the stack never decreases now, so the largest digits are at the end
	result := strings.TrimLeft(string(stack), "0")
	if result == "" {
		return "0"
	}
	return result
}
```
