---
title: Daily Temperatures
leetcode: daily-temperatures
description: "Daily Temperatures explained: for each day, count the days until a warmer one using a monotonic stack in O(n) time, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `temperatures`, where `temperatures[i]` is the temperature on day `i`. For every day, find how many days you have to wait until a day that is **strictly warmer**. If no warmer day comes later, the answer for that day is `0`.

Return an array `answer` of the same length, where `answer[i]` is that waiting time for day `i`. The input has at least one day.

## Examples

- `temperatures = [70, 68, 69, 72, 71]` → `[3, 1, 1, 0, 0]`. Day 0 (70) waits until day 3 (72); day 1 (68) is beaten by day 2 (69) the very next day; nothing after 72 or 71 is warmer.
- `temperatures = [50, 50, 50]` → `[0, 0, 0]`. An equal temperature is not warmer.
- `temperatures = [30, 40, 50]` → `[1, 1, 0]`. Each day is beaten by the next one.
- `temperatures = [80, 60, 70, 90]` → `[3, 1, 1, 0]`. Day 0 must wait for the 90, even though 60 and 70 come first.

## Key idea

Walk through the days from left to right and keep a stack of the days that are **still waiting** for a warmer day. Their temperatures are always in decreasing order from the bottom to the top of the stack: if a warmer day had come after one of them, it would already have been answered and removed.

When a new day arrives, it is the answer for every waiting day on top of the stack that is colder than it. Pop those days, record `today - thatDay` for each, then push today, which now waits too. A stack whose values stay sorted like this is called a *monotonic stack*.

## Approach

1. Create `answer` filled with zeros and an empty stack of indexes.
2. For each day `i`:
   1. While the stack is not empty and `temperatures[i] > temperatures[top]`: pop `top` and set `answer[top] = i - top`.
   2. Push `i`.
3. Days still on the stack at the end never saw a warmer day; their answer stays `0`.

The brute force scans forward from every day until it finds a warmer one. For a long run of falling temperatures that is O(n²).

## Complexity

- **Time:** O(n). Every index is pushed once and popped at most once, so the inner loop runs at most `n` times in total.
- **Space:** O(n) for the stack (a strictly falling sequence keeps every day on it).

## Common mistakes

- Pushing temperatures instead of indexes. You need the index to compute the distance.
- Popping on `>=`: an equal temperature is not warmer, so those days must keep waiting.
- Thinking the nested `while` makes it O(n²). Count pushes and pops instead of loop iterations.

## Follow-up questions

- *Can you do it without a stack?* Go from right to left and, for each day, jump forward using answers already computed (`j += answer[j]`) until a warmer day is found. It is also O(n) amortised and uses O(1) extra space.
- *What about the next warmer day in a circular week?* Run the loop over the array twice (indexes modulo `n`), as in Next Greater Element II.

## Related problems

- Next Greater Element I and II: the same monotonic stack, returning values instead of distances.
- [Largest Rectangle in Histogram](/interview/problems/largest-rectangle-in-histogram/): a monotonic stack that finds the nearest smaller bar on each side.
- [Trapping Rain Water](/interview/problems/trapping-rain-water/): can also be solved with a monotonic stack.
- [Sliding Window Maximum](/interview/problems/sliding-window-maximum/): a monotonic deque instead of a stack.

## Solutions

```python
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        answer = [0] * len(temperatures)
        waiting = []  # indexes of days without a warmer day yet; temperatures decrease toward the top
        for i, t in enumerate(temperatures):
            while waiting and t > temperatures[waiting[-1]]:
                j = waiting.pop()
                answer[j] = i - j
            waiting.append(i)
        return answer
```

```java
class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] answer = new int[n];
        int[] waiting = new int[n]; // array used as a stack of indexes
        int top = 0;
        for (int i = 0; i < n; i++) {
            while (top > 0 && temperatures[i] > temperatures[waiting[top - 1]]) {
                int j = waiting[--top];
                answer[j] = i - j;
            }
            waiting[top++] = i;
        }
        return answer;
    }
}
```

```cpp
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> answer(n, 0);
        vector<int> waiting;  // indexes of days without a warmer day yet
        for (int i = 0; i < n; i++) {
            while (!waiting.empty() && temperatures[i] > temperatures[waiting.back()]) {
                answer[waiting.back()] = i - waiting.back();
                waiting.pop_back();
            }
            waiting.push_back(i);
        }
        return answer;
    }
};
```

```javascript
/**
 * @param {number[]} temperatures
 * @return {number[]}
 */
var dailyTemperatures = function (temperatures) {
  const answer = new Array(temperatures.length).fill(0);
  const waiting = []; // indexes of days without a warmer day yet
  for (let i = 0; i < temperatures.length; i++) {
    while (waiting.length && temperatures[i] > temperatures[waiting[waiting.length - 1]]) {
      const j = waiting.pop();
      answer[j] = i - j;
    }
    waiting.push(i);
  }
  return answer;
};
```

```go
func dailyTemperatures(temperatures []int) []int {
	answer := make([]int, len(temperatures))
	waiting := []int{} // indexes of days without a warmer day yet
	for i, t := range temperatures {
		for len(waiting) > 0 && t > temperatures[waiting[len(waiting)-1]] {
			j := waiting[len(waiting)-1]
			waiting = waiting[:len(waiting)-1]
			answer[j] = i - j
		}
		waiting = append(waiting, i)
	}
	return answer
}
```
