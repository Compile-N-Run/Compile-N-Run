---
title: Sliding Window
topic: Sliding Window
group: patterns
description: "Sliding Window explained: keep a running summary of a contiguous stretch of an array or string and move its two edges forward so every subarray question costs one pass instead of a nested loop."
---

## What it is

A sliding window is a contiguous stretch of an array or string, marked by a `left` and a `right` index, that you push forward through the data. Instead of recomputing something for every possible subarray from scratch, you keep a small summary of what is inside the window (a sum, a count of each character, the number of distinct values) and update it as one element enters on the right and one leaves on the left.

Think of looking at a long street through a cardboard frame. You slide the frame along; you do not re-count every house each time, you just add the house that came into view and subtract the house that went out of it. That is the whole idea, and it is what turns "check every subarray" from O(n²) or O(n³) into O(n).

Sliding window is really a special case of two pointers where the two indices both move right and the part between them is what matters.

## When to use it

- The problem talks about a **subarray** or **substring**: contiguous elements, not a subsequence where you can skip.
- You are asked for the **longest**, **shortest**, or the **count** of such stretches that satisfy a rule, or the best value over every stretch of a **fixed size k**.
- The rule can be checked from a running summary: a sum, "at most k distinct characters", "contains every letter of t", "no repeated character".
- Adding an element never makes a bad window good again, or removing an element never makes a good window bad (the rule is *monotonic*). For example, a window whose sum is already over the limit only gets worse as it grows. When the rule is not monotonic, such as "sum equals exactly k" with negative numbers, reach for a prefix sum with a hash map instead.

## How it works

Take the variable-size version: longest subarray of non-negative numbers whose sum is at most `limit`.

1. Start with an empty window: `left = 0`, `sum = 0`.
2. For each `right` from 0 to n - 1, add `nums[right]` to the sum. The window now includes the new element.
3. While the window breaks the rule (`sum > limit`), remove `nums[left]` from the sum and move `left` one step right. The window shrinks from the left until it is valid again.
4. Now the window `[left, right]` is the longest valid window that ends at `right`. Record its length if it beats the best so far.
5. Return the best length after the loop.

Trace it on `nums = [2, 1, 3, 4, 1, 2]`, `limit = 6`:

| right | added | sum before shrink | shrink | window | length |
| --- | --- | --- | --- | --- | --- |
| 0 | 2 | 2 | - | [0, 0] | 1 |
| 1 | 1 | 3 | - | [0, 1] | 2 |
| 2 | 3 | 6 | - | [0, 2] | 3 |
| 3 | 4 | 10 | drop 2, 1, 3 -> sum 4 | [3, 3] | 1 |
| 4 | 1 | 5 | - | [3, 4] | 2 |
| 5 | 2 | 7 | drop 4 -> sum 3 | [4, 5] | 2 |

The best is 3, the window `[2, 1, 3]`. Notice that `left` only ever moves right. Each element enters the window once and leaves at most once, which is why the total work is linear.

## Template

The skeleton below finds the longest window whose sum stays at or under a limit. The three marked spots (what to add, when the window is invalid, what to remove) are the parts you change for a new problem.

```python
def longest_window(nums, limit):
    """Length of the longest contiguous run of non-negative nums whose sum is at most limit."""
    best = 0
    window_sum = 0  # problem-specific: the summary of what is inside the window
    left = 0
    for right in range(len(nums)):
        window_sum += nums[right]  # bring nums[right] into the window
        while window_sum > limit:  # shrink while the window breaks the rule
            window_sum -= nums[left]  # push nums[left] out of the window
            left += 1
        best = max(best, right - left + 1)  # window [left, right] is valid here
    return best


print(longest_window([2, 1, 3, 4, 1, 2], 6))  # 3
print(longest_window([5, 5, 5], 4))  # 0
```

```java
public class SlidingWindow {
    // Length of the longest contiguous run of non-negative nums whose sum is at most limit.
    static int longestWindow(int[] nums, int limit) {
        int best = 0;
        int windowSum = 0; // problem-specific: the summary of what is inside the window
        int left = 0;
        for (int right = 0; right < nums.length; right++) {
            windowSum += nums[right];      // bring nums[right] into the window
            while (windowSum > limit) {    // shrink while the window breaks the rule
                windowSum -= nums[left];   // push nums[left] out of the window
                left++;
            }
            best = Math.max(best, right - left + 1); // window [left, right] is valid here
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(longestWindow(new int[] {2, 1, 3, 4, 1, 2}, 6)); // 3
        System.out.println(longestWindow(new int[] {5, 5, 5}, 4));          // 0
    }
}
```

```cpp
#include <algorithm>
#include <iostream>
#include <vector>

// Length of the longest contiguous run of non-negative nums whose sum is at most limit.
int longestWindow(const std::vector<int>& nums, int limit) {
    int best = 0;
    long long windowSum = 0;  // problem-specific: the summary of what is inside the window
    int left = 0;
    for (int right = 0; right < (int)nums.size(); right++) {
        windowSum += nums[right];      // bring nums[right] into the window
        while (windowSum > limit) {    // shrink while the window breaks the rule
            windowSum -= nums[left];   // push nums[left] out of the window
            left++;
        }
        best = std::max(best, right - left + 1);  // window [left, right] is valid here
    }
    return best;
}

int main() {
    std::cout << longestWindow({2, 1, 3, 4, 1, 2}, 6) << "\n";  // 3
    std::cout << longestWindow({5, 5, 5}, 4) << "\n";           // 0
    return 0;
}
```

```javascript
// Length of the longest contiguous run of non-negative nums whose sum is at most limit.
function longestWindow(nums, limit) {
  let best = 0;
  let windowSum = 0; // problem-specific: the summary of what is inside the window
  let left = 0;
  for (let right = 0; right < nums.length; right++) {
    windowSum += nums[right]; // bring nums[right] into the window
    while (windowSum > limit) {
      // shrink while the window breaks the rule
      windowSum -= nums[left]; // push nums[left] out of the window
      left++;
    }
    best = Math.max(best, right - left + 1); // window [left, right] is valid here
  }
  return best;
}

console.log(longestWindow([2, 1, 3, 4, 1, 2], 6)); // 3
console.log(longestWindow([5, 5, 5], 4)); // 0
```

```go
package main

import "fmt"

// longestWindow returns the length of the longest contiguous run of non-negative nums
// whose sum is at most limit.
func longestWindow(nums []int, limit int) int {
	best := 0
	windowSum := 0 // problem-specific: the summary of what is inside the window
	left := 0
	for right := 0; right < len(nums); right++ {
		windowSum += nums[right] // bring nums[right] into the window
		for windowSum > limit {  // shrink while the window breaks the rule
			windowSum -= nums[left] // push nums[left] out of the window
			left++
		}
		if right-left+1 > best { // window [left, right] is valid here
			best = right - left + 1
		}
	}
	return best
}

func main() {
	fmt.Println(longestWindow([]int{2, 1, 3, 4, 1, 2}, 6)) // 3
	fmt.Println(longestWindow([]int{5, 5, 5}, 4))          // 0
}
```

## Variations

- **Fixed size k.** The window always holds exactly k elements. Add `nums[right]`, and once `right >= k - 1` also remove `nums[right - k + 1]` after recording the answer. No `while` loop is needed. Maximum Average Subarray and "find all anagrams" are this shape.
- **Longest valid window.** The template above: grow with `right`, shrink while invalid, record after shrinking.
- **Shortest valid window.** Flip it: grow with `right`, then `while` the window *is* valid, record its length and shrink from the left. Minimum Size Subarray Sum and Minimum Window Substring work this way.
- **Counting valid windows.** When every sub-window of a valid window is also valid (as with "product less than k" on positive numbers), the number of valid windows ending at `right` is `right - left + 1`, so add that to a running total.
- **Window with a frequency map.** For strings, the summary is usually an array of 26 counts or a hash map, plus a counter of "how many requirements are currently met", so the validity check stays O(1).
- **Monotonic deque.** When the question is the max or min of each window, keep a deque of candidate indices in decreasing (or increasing) order. See Sliding Window Maximum.

## Common mistakes

- Recording the answer **before** shrinking in the longest-window version, so an invalid window counts.
- Using `if` instead of `while` to shrink. One removed element may not be enough.
- Shrinking by resetting `left = right` or clearing the summary. That throws away valid work and can break correctness; move `left` one step at a time and update the summary for each step.
- Forgetting to update the summary when an element leaves. The counts in a frequency map must go down as well as up.
- Applying the pattern to a rule that is not monotonic. "Sum equals k" with negative numbers can become true again after growing, so the shrink condition is wrong; use prefix sums there.
- Off-by-one in the fixed-size version: the first full window ends at index `k - 1`, and the element leaving is `right - k + 1`, not `right - k`.

## Complexity

**O(n) time** because `right` moves n times and `left` moves at most n times in total, and each move does O(1) work (or O(alphabet) when you scan a small frequency array). **Space** is O(1) for sums and counts, or O(k) for a frequency map over k distinct values.

## Where to start

1. 643. Maximum Average Subarray I: the fixed-size window with nothing but a running sum.
2. 209. Minimum Size Subarray Sum: the shortest-valid-window shape on positive numbers.
3. [3. Longest Substring Without Repeating Characters](/interview/problems/longest-substring-without-repeating-characters/): longest valid window with a set or last-seen map as the summary.
4. 1004. Max Consecutive Ones III: the "at most k bad elements" rule, which many harder problems reduce to.
5. 424. Longest Repeating Character Replacement: a window with a frequency map where the validity check uses the most common letter.
6. [713. Subarray Product Less Than K](/interview/problems/subarray-product-less-than-k/): counting windows with the `right - left + 1` trick.
7. [76. Minimum Window Substring](/interview/problems/minimum-window-substring/): shortest valid window with a "requirements met" counter.
8. [239. Sliding Window Maximum](/interview/problems/sliding-window-maximum/): the fixed-size window paired with a monotonic deque.
