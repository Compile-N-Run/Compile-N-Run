---
title: Prefix Sum
topic: Prefix Sum
group: patterns
description: "Prefix Sum explained: precompute running totals once so any subarray sum is a subtraction, and pair it with a hash map to count subarrays with a given sum in one pass."
---

## What it is

A prefix sum array stores, at position `i`, the total of everything before it: `prefix[i] = nums[0] + nums[1] + ... + nums[i - 1]`, with `prefix[0] = 0`. Build it once in one pass, and from then on the sum of any stretch `nums[l..r]` is a single subtraction, `prefix[r + 1] - prefix[l]`, because the elements before `l` appear in both totals and cancel out.

That is the whole trick, and it is surprisingly powerful. Any question that would otherwise add up the same elements over and over (range sums, averages, "does this subarray balance", "how many subarrays add up to k") becomes a question about pairs of prefix values. The same idea works with products, XOR, counts of a particular character, or anything else that can be "undone" by subtraction.

## When to use it

- The problem asks for the **sum of a range** many times on an array that does not change, or wants you to compare sums of different ranges (left part vs right part, pivot index).
- The problem asks **how many subarrays** have sum equal to k, divisible by k, or with some property you can express as "prefix at r minus prefix at l equals something".
- The array may contain **negative numbers**, so a sliding window will not work because growing the window does not move the sum in one direction.
- A 2D grid asks for sums of rectangles (2D prefix sums).
- You need to apply many **range updates** ("add 5 to everything between l and r") and then read the final array once: the difference array is the same idea run backwards.

## How it works

Start with the plain version on `nums = [3, -1, 4, 2]`.

1. Create `prefix` with one more slot than `nums` and set `prefix[0] = 0`.
2. For each `i`, set `prefix[i + 1] = prefix[i] + nums[i]`. Here that gives `prefix = [0, 3, 2, 6, 8]`.
3. To get the sum of `nums[1..2]` (that is, `-1 + 4 = 3`), compute `prefix[3] - prefix[1] = 6 - 3 = 3`.
4. The sum of the whole array is `prefix[4] - prefix[0] = 8`. The extra leading zero is what makes ranges that start at 0 need no special case.

Now the counting version, which is the one that comes up most in interviews: how many subarrays of `nums` sum to exactly `k`? A subarray `[l..r]` sums to k when `prefix[r + 1] - prefix[l] == k`, in other words when `prefix[l] == prefix[r + 1] - k`. So walk left to right, and at each new prefix value `p` ask: how many earlier prefix values equal `p - k`? A hash map from prefix value to how often it has appeared answers that in O(1). Seed it with `{0: 1}` for the empty prefix.

Trace with `nums = [1, 2, 1, 2]`, `k = 3`:

| element | running prefix | looking for (prefix - k) | times seen | count so far | map after |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 | -2 | 0 | 0 | {0:1, 1:1} |
| 2 | 3 | 0 | 1 | 1 | {0:1, 1:1, 3:1} |
| 1 | 4 | 1 | 1 | 2 | {..., 4:1} |
| 2 | 6 | 3 | 1 | 3 | {..., 6:1} |

The three subarrays are `[1, 2]`, `[2, 1]` and `[1, 2]` again at the end. The running total means you never need the full prefix array in this version.

## Template

The skeleton below builds the prefix array and answers a batch of inclusive range-sum queries. The hash-map counting version is described above and in the Variations.

```python
def range_sums(nums, queries):
    """For each inclusive (l, r) pair, the sum of nums[l..r]. O(n) setup, O(1) per query."""
    prefix = [0] * (len(nums) + 1)  # prefix[i] = nums[0] + ... + nums[i - 1]
    for i, x in enumerate(nums):
        prefix[i + 1] = prefix[i] + x  # problem-specific: + could be *, ^, or a count
    return [prefix[r + 1] - prefix[l] for l, r in queries]


print(range_sums([3, -1, 4, 2], [(1, 2), (0, 3), (3, 3)]))  # [3, 8, 2]
```

```java
import java.util.Arrays;

public class PrefixSum {
    // For each inclusive {l, r} pair, the sum of nums[l..r]. O(n) setup, O(1) per query.
    static long[] rangeSums(int[] nums, int[][] queries) {
        long[] prefix = new long[nums.length + 1]; // prefix[i] = nums[0] + ... + nums[i - 1]
        for (int i = 0; i < nums.length; i++) {
            prefix[i + 1] = prefix[i] + nums[i];    // problem-specific: + could be *, ^, or a count
        }
        long[] answers = new long[queries.length];
        for (int q = 0; q < queries.length; q++) {
            int l = queries[q][0], r = queries[q][1];
            answers[q] = prefix[r + 1] - prefix[l];
        }
        return answers;
    }

    public static void main(String[] args) {
        int[][] queries = {{1, 2}, {0, 3}, {3, 3}};
        System.out.println(Arrays.toString(rangeSums(new int[] {3, -1, 4, 2}, queries))); // [3, 8, 2]
    }
}
```

```cpp
#include <iostream>
#include <utility>
#include <vector>

// For each inclusive (l, r) pair, the sum of nums[l..r]. O(n) setup, O(1) per query.
std::vector<long long> rangeSums(const std::vector<int>& nums,
                                 const std::vector<std::pair<int, int>>& queries) {
    std::vector<long long> prefix(nums.size() + 1, 0);  // prefix[i] = nums[0] + ... + nums[i - 1]
    for (size_t i = 0; i < nums.size(); i++) {
        prefix[i + 1] = prefix[i] + nums[i];  // problem-specific: + could be *, ^, or a count
    }
    std::vector<long long> answers;
    for (const auto& q : queries) {
        answers.push_back(prefix[q.second + 1] - prefix[q.first]);
    }
    return answers;
}

int main() {
    std::vector<long long> out = rangeSums({3, -1, 4, 2}, {{1, 2}, {0, 3}, {3, 3}});
    for (long long v : out) std::cout << v << " ";  // 3 8 2
    std::cout << "\n";
    return 0;
}
```

```javascript
// For each inclusive [l, r] pair, the sum of nums[l..r]. O(n) setup, O(1) per query.
function rangeSums(nums, queries) {
  const prefix = new Array(nums.length + 1).fill(0); // prefix[i] = nums[0] + ... + nums[i - 1]
  for (let i = 0; i < nums.length; i++) {
    prefix[i + 1] = prefix[i] + nums[i]; // problem-specific: + could be *, ^, or a count
  }
  return queries.map(([l, r]) => prefix[r + 1] - prefix[l]);
}

console.log(rangeSums([3, -1, 4, 2], [[1, 2], [0, 3], [3, 3]])); // [ 3, 8, 2 ]
```

```go
package main

import "fmt"

// rangeSums returns, for each inclusive [l, r] pair, the sum of nums[l..r].
// O(n) setup, O(1) per query.
func rangeSums(nums []int, queries [][2]int) []int {
	prefix := make([]int, len(nums)+1) // prefix[i] = nums[0] + ... + nums[i-1]
	for i, x := range nums {
		prefix[i+1] = prefix[i] + x // problem-specific: + could be *, ^, or a count
	}
	answers := make([]int, 0, len(queries))
	for _, q := range queries {
		l, r := q[0], q[1]
		answers = append(answers, prefix[r+1]-prefix[l])
	}
	return answers
}

func main() {
	fmt.Println(rangeSums([]int{3, -1, 4, 2}, [][2]int{{1, 2}, {0, 3}, {3, 3}})) // [3 8 2]
}
```

## Variations

- **Prefix sum with a hash map.** Count or find subarrays whose sum is exactly k: keep a running total and a map from prefix value to count, and for each new total add `map[total - k]` to the answer. Subarray Sum Equals K is the model problem.
- **Modular prefix.** "Sum divisible by k" means two prefix values with the same remainder mod k, so store remainders in the map (and fix negative remainders in languages where `%` can be negative).
- **Encoded conditions.** "Equal numbers of 0s and 1s" becomes "sum is zero" once you treat 0 as -1. "More vowels than consonants" and similar balance questions work the same way.
- **Prefix from both sides.** Product of Array Except Self and Pivot Index combine a left prefix with a right suffix, often without storing the second array.
- **Difference array.** To add v to every element in `[l, r]`, do `diff[l] += v` and `diff[r + 1] -= v`; after all updates, a prefix sum of `diff` gives the final array. Car Pooling and Corporate Flight Bookings are this.
- **2D prefix sums.** `P[i][j]` is the sum of the rectangle from the top-left corner to `(i - 1, j - 1)`; a rectangle sum takes four lookups with inclusion-exclusion.
- **Prefix plus binary search.** When the prefix array is increasing (all values positive), binary search on it answers "first index where the running total reaches x", as in Random Pick with Weight.

## Common mistakes

- Off-by-one between `prefix[r]` and `prefix[r + 1]`. With the leading zero, the sum of `nums[l..r]` is always `prefix[r + 1] - prefix[l]`.
- Forgetting to seed the hash map with `{0: 1}`, which misses every subarray that starts at index 0.
- Updating the map **before** looking up `total - k` when `k == 0`, which counts the empty subarray.
- Using a sliding window on an array with negative numbers. The window's shrink rule depends on sums moving in one direction; prefix sums do not.
- Overflow in Java, C++ or Go when the array is long and values are large: use a 64-bit type for the prefix.
- Negative remainders in the modular version: `((x % k) + k) % k` keeps them in `[0, k)`.

## Complexity

Building the prefix array is **O(n) time and O(n) space**; each range query is then **O(1)**. The hash-map counting version is O(n) time and O(n) space in the worst case for the map. 2D prefix sums cost O(rows × cols) to build and O(1) per rectangle.

## Where to start

1. 303. Range Sum Query - Immutable: build the prefix array once and answer queries with a subtraction.
2. 724. Find Pivot Index: compare a left prefix with the total minus it, no second array needed.
3. [238. Product of Array Except Self](/interview/problems/product-of-array-except-self/): the same two-sided idea with products instead of sums.
4. [560. Subarray Sum Equals K](/interview/problems/subarray-sum-equals-k/): the prefix-plus-hash-map pattern, which is the one to really learn.
5. 525. Contiguous Array: encode 0 as -1 and the problem becomes "longest subarray with sum zero".
6. 523. Continuous Subarray Sum: remainders instead of sums, with the usual edge cases around k.
7. 1094. Car Pooling: the difference array for range updates.
8. [528. Random Pick with Weight](/interview/problems/random-pick-with-weight/): a prefix array combined with binary search.
