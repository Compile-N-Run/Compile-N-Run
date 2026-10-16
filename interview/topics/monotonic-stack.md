---
title: Monotonic Stack
topic: Monotonic Stack
group: structures
description: "The monotonic stack explained: a stack kept in sorted order that answers 'next greater' and 'previous smaller' questions for every element in one O(n) pass, with a template and practice order."
---

## What it is

A monotonic stack is an ordinary stack with one extra rule: its contents are always kept in sorted order, either increasing or decreasing from bottom to top. Before pushing a new element, you pop everything that would break the order. Those pops are not waste. Each popped element has just learned something: the new element is the first one to its right that is bigger (or smaller) than it.

That is the whole purpose. In one left-to-right pass the structure answers, for every element, "where is the next element to the right that beats me?" and, as a side effect, "where is the nearest element to the left that beats me?" (it is whatever sits on top after the pops). Doing the same with a nested loop costs O(n²); the stack does it in O(n).

The elements you push are normally *indices*, not values, so that the answer can be a distance (days until a warmer day) or a width (how far a histogram bar extends).

## When to use it

- The statement asks about the *next* or *previous* greater, smaller, warmer, taller, cheaper element for every position.
- You need, for each element, the span of the subarray in which it is the maximum or minimum (sum of subarray minimums, largest rectangle in a histogram, maximal rectangle).
- "How many days until", "how many elements can see", "stock span", "visible buildings looking in one direction".
- Removing digits or letters to make the smallest result while keeping relative order (remove k digits, smallest subsequence): pop while the top is bigger than the new item and you still have removals left.
- Water trapped between bars, car fleets, and other problems where an element's fate depends only on the nearest bigger thing on each side.

A signal that it is *not* the tool: the question involves a sliding window of fixed size, where the structure you want is the monotonic deque (a queue that also pops from the front).

## How it works

Find, for each element, the index of the next greater element to its right, or -1 if none. Keep a stack of indices whose values are strictly decreasing from bottom to top. For each new index `i`, while the stack is non-empty and `nums[top] < nums[i]`, pop `top` and record `answer[top] = i`. Then push `i`.

Trace it on `nums = [5, 2, 7, 3, 1]`:

| i | nums[i] | pops (index: value) | answers set | stack after (indices) |
|---|---|---|---|---|
| 0 | 5 | none | | `[0]` |
| 1 | 2 | none (5 > 2) | | `[0, 1]` |
| 2 | 7 | 1: 2, then 0: 5 | `ans[1] = 2`, `ans[0] = 2` | `[2]` |
| 3 | 3 | none (7 > 3) | | `[2, 3]` |
| 4 | 1 | none | | `[2, 3, 4]` |

Whatever remains on the stack at the end never found a greater element, so `ans = [2, 2, -1, -1, -1]`. Notice that the stack always reads as decreasing values (`7, 3, 1`): that invariant is what guarantees the first element that pops you is the nearest one that beats you.

Switch the comparison to `nums[top] > nums[i]` and you get the next *smaller* element with an increasing stack. Read the top of the stack just before pushing `i` and you get the *previous* greater (or smaller) element for free. Both halves together describe, for each element, the widest subarray where it is the maximum (or minimum). That is the step that turns a histogram into its largest rectangle: a bar's rectangle spans from the previous shorter bar to the next shorter bar.

## Template

The skeleton below fills `next greater` for every index. The comparison and the two places that record answers are the parts that change from problem to problem.

```python
def next_greater(nums):
    """For each i, the index of the first j > i with nums[j] > nums[i], or -1."""
    n = len(nums)
    answer = [-1] * n
    stack = []                               # indices; values strictly decreasing bottom to top
    for i in range(n):
        while stack and nums[stack[-1]] < nums[i]:   # problem-specific comparison (< for next greater)
            j = stack.pop()
            answer[j] = i                    # nums[i] is the first to the right that beats nums[j]
        # here stack[-1] (if any) is the previous greater-or-equal element of i
        stack.append(i)
    return answer


if __name__ == "__main__":
    print(next_greater([5, 2, 7, 3, 1]))  # [2, 2, -1, -1, -1]
```

```java
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class Main {
    /** For each i, the index of the first j > i with nums[j] > nums[i], or -1. */
    static int[] nextGreater(int[] nums) {
        int n = nums.length;
        int[] answer = new int[n];
        Arrays.fill(answer, -1);
        Deque<Integer> stack = new ArrayDeque<>();   // indices; values strictly decreasing bottom to top
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {  // problem-specific comparison
                int j = stack.pop();
                answer[j] = i;               // nums[i] is the first to the right that beats nums[j]
            }
            // here stack.peek() (if any) is the previous greater-or-equal element of i
            stack.push(i);
        }
        return answer;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(nextGreater(new int[] {5, 2, 7, 3, 1}))); // [2, 2, -1, -1, -1]
    }
}
```

```cpp
#include <iostream>
#include <vector>

// For each i, the index of the first j > i with nums[j] > nums[i], or -1.
std::vector<int> nextGreater(const std::vector<int>& nums) {
    int n = nums.size();
    std::vector<int> answer(n, -1);
    std::vector<int> stack;                  // indices; values strictly decreasing bottom to top
    for (int i = 0; i < n; i++) {
        while (!stack.empty() && nums[stack.back()] < nums[i]) {   // problem-specific comparison
            int j = stack.back();
            stack.pop_back();
            answer[j] = i;                   // nums[i] is the first to the right that beats nums[j]
        }
        // here stack.back() (if any) is the previous greater-or-equal element of i
        stack.push_back(i);
    }
    return answer;
}

int main() {
    for (int x : nextGreater({5, 2, 7, 3, 1})) std::cout << x << ' ';  // 2 2 -1 -1 -1
    std::cout << '\n';
}
```

```javascript
// For each i, the index of the first j > i with nums[j] > nums[i], or -1.
function nextGreater(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(-1);
  const stack = [];                          // indices; values strictly decreasing bottom to top
  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) { // problem-specific comparison
      const j = stack.pop();
      answer[j] = i;                         // nums[i] is the first to the right that beats nums[j]
    }
    // here stack[stack.length - 1] (if any) is the previous greater-or-equal element of i
    stack.push(i);
  }
  return answer;
}

console.log(nextGreater([5, 2, 7, 3, 1])); // [ 2, 2, -1, -1, -1 ]
```

```go
package main

import "fmt"

// nextGreater returns, for each i, the index of the first j > i with nums[j] > nums[i], or -1.
func nextGreater(nums []int) []int {
	n := len(nums)
	answer := make([]int, n)
	for i := range answer {
		answer[i] = -1
	}
	stack := []int{} // indices; values strictly decreasing bottom to top
	for i := 0; i < n; i++ {
		for len(stack) > 0 && nums[stack[len(stack)-1]] < nums[i] { // problem-specific comparison
			j := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			answer[j] = i // nums[i] is the first to the right that beats nums[j]
		}
		// here stack[len(stack)-1] (if any) is the previous greater-or-equal element of i
		stack = append(stack, i)
	}
	return answer
}

func main() {
	fmt.Println(nextGreater([]int{5, 2, 7, 3, 1})) // [2 2 -1 -1 -1]
}
```

## Variations

- **Four flavours.** Next greater (decreasing stack, pop while `top < cur`), next smaller (increasing stack, pop while `top > cur`), and the previous versions read from the top before pushing. Decide whether equal values pop or stay; that choice fixes which side of a run of duplicates "owns" the subarray.
- **Circular arrays.** Run the loop over `2n` indices, using `i % n`, and only push during the first `n`. Next Greater Element II is the standard example.
- **Both sides at once.** Record `left[j] = stack top after popping` and `right[j] = i` when `j` is popped. Then `right[j] - left[j] - 1` is the width of the window where `nums[j]` is the extreme value.
- **Sentinel at the end.** Append a value smaller (or larger) than everything so the loop flushes the stack and you do not need a separate cleanup pass.
- **Greedy removal.** With a budget of `k` deletions, pop while the top is worse than the new item and `k > 0`, then push. Trim any leftover budget from the end.
- **Stock span and online versions.** The stream arrives one value at a time; the stack persists across calls and each call pops the prices that the new price dominates.

## Common mistakes

- Pushing values instead of indices and then being unable to compute a distance or a width.
- Getting the comparison backwards and keeping an increasing stack when you wanted next greater. Write the invariant ("values decrease from bottom to top") as a comment and check it on a three-element example.
- Mishandling equal values. For "next *strictly* greater" use `<`; for sums of subarray minimums you must break ties consistently or you count some subarrays twice.
- Forgetting the elements left on the stack at the end. They have no answer (-1), or in histogram problems they extend to the right edge.
- Thinking the `while` loop makes it O(n²). Each index is pushed once and popped at most once, so the total work is O(n).

## Complexity

O(n) time: every index enters the stack once and leaves at most once, regardless of how many pops a single step performs. O(n) space for the stack and the answer array. This is what makes the technique worth learning: the natural nested loop is O(n²) and fails the large tests.

## Where to start

1. 496. Next Greater Element I — the template on a small array, then look the answers up for a subset.
2. [739. Daily Temperatures](/interview/problems/daily-temperatures/) — the template with indices; the answer is a distance.
3. 901. Online Stock Span — the same stack kept alive between calls.
4. 503. Next Greater Element II — the circular trick with `2n` iterations.
5. [42. Trapping Rain Water](/interview/problems/trapping-rain-water/) — pop a bar, and the new bar plus the stack top bound the water above it.
6. 907. Sum of Subarray Minimums — previous smaller and next smaller together; careful with ties.
7. [84. Largest Rectangle in Histogram](/interview/problems/largest-rectangle-in-histogram/) — the canonical hard problem; a sentinel bar of height 0 flushes the stack.
8. 402. Remove K Digits — greedy removal with a budget.
