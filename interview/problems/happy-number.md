---
title: Happy Number
leetcode: happy-number
description: "Happy Number explained: repeatedly replace a number by the sum of the squares of its digits and detect whether it reaches 1 or loops, using Floyd's fast and slow pointers, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Start with a positive integer `n` and repeat this step: replace the number by the sum of the squares of its decimal digits. If the sequence eventually reaches `1` (and then stays at 1), `n` is called *happy*. If it never reaches 1, it is stuck in a loop of other numbers forever.

Return `true` if `n` is happy and `false` otherwise. `n` is at least 1 and fits in a signed 32-bit integer.

## Examples

- `n = 7` → `true`: 7 → 49 → 97 → 130 → 10 → 1 (for example 49 → 4² + 9² = 16 + 81 = 97).
- `n = 4` → `false`: 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4, and the loop repeats without ever touching 1.
- `n = 1` → `true`: it is already 1.
- `n = 100` → `true`: 1² + 0² + 0² = 1.

## Key idea

The sequence can only do one of two things: reach 1, or fall into a cycle. It cannot grow forever, because a number with `d` digits maps to at most `81·d`, which is much smaller than the number itself once it has 4 or more digits. So the question is really "does this sequence run into a cycle that does not contain 1?" That is the same question as detecting a cycle in a linked list, where each number "points to" its next number. Floyd's algorithm answers it with two runners: a slow one that takes one step at a time and a fast one that takes two. If there is a loop, the fast runner laps the slow one and they meet. If the sequence reaches 1, it stays at 1 (1 → 1), so they also meet there. Check where they met.

## Approach

1. Write a helper `next(x)` that returns the sum of the squares of the digits of `x` (take `x % 10`, square it, add it, divide `x` by 10, repeat until `x` is 0).
2. Set `slow = n` and `fast = next(n)`.
3. While `fast != 1` and `slow != fast`: move `slow = next(slow)` and `fast = next(next(fast))`.
4. Return `fast == 1`.

A simpler alternative keeps a hash set of every number seen and stops when a number repeats or 1 appears. It is just as fast but uses extra memory for the set; Floyd's method uses O(1) space, which is the usual follow-up.

## Complexity

- **Time:** O(log n). The first step shrinks `n` to a number below about 1000 (a 10-digit number maps to at most 810), and from then on the sequence stays in that small range, so only a bounded number of steps follow. Each step costs O(number of digits).
- **Space:** O(1) with two runners (O(log n) or a small constant-sized set with the hash set version).

## Common mistakes

- Looping until the number repeats without remembering anything: without a set or two runners you never notice the cycle and the loop runs forever.
- Starting `slow` and `fast` at the same value and checking `slow != fast` before moving, so the loop never starts.
- Squaring the whole number instead of each digit, or forgetting that 0 digits contribute 0.

## Follow-up questions

- Can you do it without extra memory? Yes, Floyd's fast and slow pointers (the solution below).
- Is there only one unhappy cycle? In base 10, every unhappy number ends up in the cycle 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4, so checking "did we reach 4?" also works, but it relies on that fact rather than on a general technique.

## Related problems

- Linked List Cycle (the same fast and slow pointer idea on real list nodes)
- Find the Duplicate Number (cycle detection on an implicit sequence)

## Solutions

```python
class Solution:
    def isHappy(self, n: int) -> bool:
        def next_number(x: int) -> int:
            total = 0
            while x:
                x, digit = divmod(x, 10)
                total += digit * digit
            return total

        slow, fast = n, next_number(n)
        while fast != 1 and slow != fast:
            slow = next_number(slow)
            fast = next_number(next_number(fast))
        return fast == 1
```

```java
class Solution {
    public boolean isHappy(int n) {
        int slow = n, fast = next(n);
        while (fast != 1 && slow != fast) {
            slow = next(slow);
            fast = next(next(fast));
        }
        return fast == 1;
    }

    private int next(int x) {
        int total = 0;
        while (x > 0) {
            int digit = x % 10;
            total += digit * digit;
            x /= 10;
        }
        return total;
    }
}
```

```cpp
class Solution {
    int next(int x) {
        int total = 0;
        while (x > 0) {
            int digit = x % 10;
            total += digit * digit;
            x /= 10;
        }
        return total;
    }

public:
    bool isHappy(int n) {
        int slow = n, fast = next(n);
        while (fast != 1 && slow != fast) {
            slow = next(slow);
            fast = next(next(fast));
        }
        return fast == 1;
    }
};
```

```javascript
/**
 * @param {number} n
 * @return {boolean}
 */
var isHappy = function (n) {
  const next = (x) => {
    let total = 0;
    while (x > 0) {
      const digit = x % 10;
      total += digit * digit;
      x = Math.floor(x / 10);
    }
    return total;
  };
  let slow = n, fast = next(n);
  while (fast !== 1 && slow !== fast) {
    slow = next(slow);
    fast = next(next(fast));
  }
  return fast === 1;
};
```

```go
func isHappy(n int) bool {
	next := func(x int) int {
		total := 0
		for x > 0 {
			digit := x % 10
			total += digit * digit
			x /= 10
		}
		return total
	}
	slow, fast := n, next(n)
	for fast != 1 && slow != fast {
		slow = next(slow)
		fast = next(next(fast))
	}
	return fast == 1
}
```
