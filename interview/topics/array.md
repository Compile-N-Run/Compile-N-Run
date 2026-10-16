---
title: Array
topic: Array
group: structures
description: "Arrays in coding interviews: contiguous storage with O(1) index access, the single-pass and write-index patterns that solve most array problems, and where to start practising."
---

## What it is

An array is a block of elements stored side by side in memory, so the element at position `i` can be read or written in constant time. That is the whole structure; what makes the tag worth a guide is the set of habits that turn "it is just an array" into a clean solution.

The problems tagged Array rarely ask you to use an array. You already have one. They ask you to find something in it (a pair, a subarray, a missing value), to rearrange it (sort, rotate, partition), or to rewrite it in place without a second array. Almost every efficient answer comes from the same three moves:

1. **A single pass with running state.** Walk once from left to right and keep a few variables (a sum, a best-so-far, a last-seen index) instead of re-scanning.
2. **Index arithmetic.** Positions carry information. `i` and `n - 1 - i` mirror each other, `(i + k) % n` rotates, and an element whose value is in `0..n-1` can be used as an index into the array itself.
3. **A write pointer.** When you must keep some elements and drop others in place, one index reads ahead and one index marks where the next kept element goes.

Multi-dimensional arrays (grids, matrices) are arrays of arrays with the same ideas applied to rows and columns.

## When to use it

- The input is a list of numbers and the question is about a value, pair, or range inside it: "find the maximum", "find two that add to", "longest run of".
- The statement says "in place", "O(1) extra space", or "modify the input". That is a hint that index tricks or a write pointer are expected.
- Elements are bounded by the array's length (`1 <= nums[i] <= n`). You can then mark visits by negating or swapping values instead of using a hash set.
- You are asked for all subarrays or contiguous ranges. Contiguous usually means a prefix sum, a sliding window, or a running best, not nested loops.
- The array is sorted or "rotated sorted". Sortedness almost always buys a binary search or a two-pointer sweep.
- A matrix must be traversed in a pattern (spiral, diagonal) or transformed (rotate, transpose). Write the index mapping down before coding.

## How it works

Take the write-pointer move, because it is the one beginners find least natural. The task: remove every zero from an array in place, keeping the order of the other numbers, and return how many numbers remain.

Keep two indices. `read` visits every element in order. `write` is the position where the next kept element belongs; it only advances when we keep something. Because `write <= read` at all times, writing at `write` never overwrites an element we have not read yet.

Trace it on `[0, 3, 0, 5, 7]`:

| read | value | keep? | action | array after | write |
|---|---|---|---|---|---|
| 0 | 0 | no | skip | `[0, 3, 0, 5, 7]` | 0 |
| 1 | 3 | yes | `a[0] = 3` | `[3, 3, 0, 5, 7]` | 1 |
| 2 | 0 | no | skip | `[3, 3, 0, 5, 7]` | 1 |
| 3 | 5 | yes | `a[1] = 5` | `[3, 5, 0, 5, 7]` | 2 |
| 4 | 7 | yes | `a[2] = 7` | `[3, 5, 7, 5, 7]` | 3 |

The first `write` elements, `[3, 5, 7]`, are the answer, and `write = 3` is the new length. Whatever is left after position `write` is garbage that the caller ignores (or that you clear in a second loop if the problem wants zeros moved to the end).

The same two-index shape, with a different "keep?" rule, removes duplicates from a sorted array (keep when the value differs from the last written one), filters by any predicate, or compacts a string. The single-pass move is the same loop with the write pointer replaced by state variables: for the best stock profit you carry the lowest price so far and the best profit so far; for the maximum subarray you carry the best sum ending here.

## Template

The skeleton below is the write-pointer loop with the keep rule left as a comment. The surrounding `main` just shows it running.

```python
def compact(nums):
    """Keep the elements that pass the rule, in order, in place.
    Returns the new length; nums[:length] is the result."""
    write = 0
    for read in range(len(nums)):
        value = nums[read]
        # problem-specific: decide whether to keep this element.
        # Running state (last kept value, a sum, a best-so-far) goes here.
        keep = value != 0
        if keep:
            nums[write] = value
            write += 1
    # optional second pass: fill nums[write:] with a filler value
    return write


if __name__ == "__main__":
    data = [0, 3, 0, 5, 7]
    n = compact(data)
    print(data[:n])  # [3, 5, 7]
```

```java
import java.util.Arrays;

public class Main {
    /** Keeps the elements that pass the rule, in order, in place. Returns the new length. */
    static int compact(int[] nums) {
        int write = 0;
        for (int read = 0; read < nums.length; read++) {
            int value = nums[read];
            // problem-specific: decide whether to keep this element.
            // Running state (last kept value, a sum, a best-so-far) goes here.
            boolean keep = value != 0;
            if (keep) {
                nums[write++] = value;
            }
        }
        // optional second pass: fill nums[write..] with a filler value
        return write;
    }

    public static void main(String[] args) {
        int[] data = {0, 3, 0, 5, 7};
        int n = compact(data);
        System.out.println(Arrays.toString(Arrays.copyOf(data, n))); // [3, 5, 7]
    }
}
```

```cpp
#include <iostream>
#include <vector>

// Keeps the elements that pass the rule, in order, in place. Returns the new length.
int compact(std::vector<int>& nums) {
    int write = 0;
    for (int read = 0; read < (int)nums.size(); read++) {
        int value = nums[read];
        // problem-specific: decide whether to keep this element.
        // Running state (last kept value, a sum, a best-so-far) goes here.
        bool keep = value != 0;
        if (keep) {
            nums[write++] = value;
        }
    }
    // optional second pass: fill nums[write..] with a filler value
    return write;
}

int main() {
    std::vector<int> data = {0, 3, 0, 5, 7};
    int n = compact(data);
    for (int i = 0; i < n; i++) std::cout << data[i] << ' ';  // 3 5 7
    std::cout << '\n';
}
```

```javascript
// Keeps the elements that pass the rule, in order, in place. Returns the new length.
function compact(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    const value = nums[read];
    // problem-specific: decide whether to keep this element.
    // Running state (last kept value, a sum, a best-so-far) goes here.
    const keep = value !== 0;
    if (keep) {
      nums[write++] = value;
    }
  }
  // optional second pass: fill nums[write..] with a filler value
  return write;
}

const data = [0, 3, 0, 5, 7];
const n = compact(data);
console.log(data.slice(0, n)); // [3, 5, 7]
```

```go
package main

import "fmt"

// compact keeps the elements that pass the rule, in order, in place. It returns the new length.
func compact(nums []int) int {
	write := 0
	for read := 0; read < len(nums); read++ {
		value := nums[read]
		// problem-specific: decide whether to keep this element.
		// Running state (last kept value, a sum, a best-so-far) goes here.
		keep := value != 0
		if keep {
			nums[write] = value
			write++
		}
	}
	// optional second pass: fill nums[write:] with a filler value
	return write
}

func main() {
	data := []int{0, 3, 0, 5, 7}
	n := compact(data)
	fmt.Println(data[:n]) // [3 5 7]
}
```

## Variations

- **Running state instead of a write pointer.** Best-so-far problems (stock profit, maximum subarray) keep one or two numbers and update them per element.
- **Prefix sums.** Precompute `prefix[i] = sum of nums[0..i-1]` once; any range sum becomes `prefix[r+1] - prefix[l]`. Products work the same way with a left pass and a right pass.
- **Cyclic marking.** When values are in `1..n`, use `nums[abs(v) - 1]` as a slot and flip its sign to record "seen". This gives O(1) extra space for missing or duplicate number problems.
- **Two pointers from both ends** for sorted arrays, and **sliding window** for contiguous ranges, each have their own guide; both are array techniques at heart.
- **Matrix walks.** Keep four bounds (top, bottom, left, right) for a spiral; swap `a[i][j]` with `a[j][i]` then reverse rows for a rotation.

## Common mistakes

- Off-by-one on the last element or the empty array. Test `[]`, `[x]`, and the two-element case by hand.
- Reading past the write pointer's territory. The write index must never get ahead of the read index.
- Modifying the array while iterating over it with a for-each loop (Python `for x in nums` while deleting). Use indices when you mutate.
- Forgetting that negative numbers break "product" or "max" intuition: a very negative running product becomes the largest after one more negative factor.
- Sorting and then reporting indices from the sorted order instead of the original.

## Complexity

Index access is O(1). A single pass is O(n) time, which is the floor for anything that must look at every element. Sorting first costs O(n log n). Extra space is the thing interviewers watch: the write-pointer and running-state patterns use O(1), prefix sums use O(n), and nested loops over all pairs or all subarrays are O(n²), which is usually the brute force you mention and then improve.

## Where to start

1. [1. Two Sum](/interview/problems/two-sum/) — the first array problem everyone meets; the hash map version is the O(n) baseline.
2. [121. Best Time to Buy and Sell Stock](/interview/problems/best-time-to-buy-and-sell-stock/) — a single pass carrying "lowest so far" and "best so far".
3. [283. Move Zeroes](/interview/problems/move-zeroes/) — the write-pointer loop from this guide, almost verbatim.
4. [26. Remove Duplicates from Sorted Array](/interview/problems/remove-duplicates-from-sorted-array/) — the same loop with a different keep rule.
5. [53. Maximum Subarray](/interview/problems/maximum-subarray/) — running state with a reset; the gateway to dynamic programming on arrays.
6. [238. Product of Array Except Self](/interview/problems/product-of-array-except-self/) — a left pass and a right pass instead of division.
7. [189. Rotate Array](/interview/problems/rotate-array/) — index arithmetic and the three-reversal trick for O(1) space.
8. [41. First Missing Positive](/interview/problems/first-missing-positive/) — cyclic marking: use the array itself as the hash set.
