---
title: Subarray Sum Equals K
leetcode: subarray-sum-equals-k
description: "Subarray Sum Equals K explained: count the contiguous subarrays whose sum is exactly k in one pass using prefix sums and a hash map of counts, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array of integers `nums` and an integer `k`. Count how many **subarrays** have a sum of exactly `k`. A subarray is a non-empty run of consecutive elements; two subarrays are different if they start or end at different positions, even when they contain the same values.

The array has at least one element. Elements can be negative, zero or positive, and `k` can be any integer, including zero or a negative number.

## Examples

- `nums = [1, 2, 3]`, `k = 3` → `2`. The subarrays `[1, 2]` and `[3]`.
- `nums = [1, 1, 1, 1]`, `k = 2` → `3`. The pair starting at index 0, at index 1 and at index 2.
- `nums = [2, -2, 2, -2]`, `k = 0` → `4`. Positions 0..1, 1..2, 2..3 and the whole array 0..3.
- `nums = [5]`, `k = 5` → `1`. The single element.

## Key idea

Let `prefix[j]` be the sum of the first `j` elements (`prefix[0] = 0`). The sum of the subarray from index `i` to `j - 1` is `prefix[j] - prefix[i]`. So a subarray ending at the current position sums to `k` exactly when some *earlier* prefix sum equals `current - k`.

That turns the question into counting: walk the array keeping a running sum, and keep a hash map from "prefix sum value" to "how many times it has appeared so far". At each step, the number of good subarrays ending here is simply `count[running - k]`. This is the same "look for the complement in a hash map" trick as Two Sum, applied to prefix sums.

## Approach

1. Create a map `count` with `count[0] = 1`. That entry stands for the empty prefix, so subarrays starting at index 0 are counted.
2. Set `running = 0` and `answer = 0`.
3. For each value `x` in `nums`:
   1. `running += x`.
   2. Add `count[running - k]` (0 if missing) to `answer`.
   3. Increase `count[running]` by one.
4. Return `answer`.

Look up before you insert, for the same reason as in Two Sum: when `k = 0`, inserting first would match the current prefix with itself and count an empty subarray.

The brute force tries every start and extends to every end while keeping a running sum, which is O(n²). The sliding window technique that works for "positive numbers only" does not work here, because negative numbers mean that growing the window can make the sum smaller.

## Complexity

- **Time:** O(n). One pass, with an O(1) average hash map lookup and update per element.
- **Space:** O(n). In the worst case every prefix sum is different and gets its own map entry.

## Common mistakes

- Forgetting `count[0] = 1`, which misses every subarray that starts at index 0 (for example `[5]` with `k = 5` would return 0).
- Using a two-pointer sliding window. It assumes sums only grow as the window grows, which fails with negative numbers or zeros.
- Storing a set of prefix sums instead of counts. The same prefix sum can appear several times (for example with zeros in the array), and each occurrence starts a different subarray.
- Updating the map before the lookup, which counts the empty subarray when `k = 0`.

## Follow-up questions

- Return the length of the longest subarray with sum `k`. (Store the first index of each prefix sum instead of a count.)
- Count subarrays whose sum is divisible by `k`. (Use prefix sums modulo `k` as keys.)
- What if all numbers are positive? (A sliding window then works in O(1) extra space.)

## Related problems

- Two Sum
- Continuous Subarray Sum
- Subarray Sums Divisible by K
- Binary Subarrays With Sum

## Solutions

```python
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        count = defaultdict(int)
        count[0] = 1  # the empty prefix
        running = answer = 0
        for x in nums:
            running += x
            answer += count[running - k]
            count[running] += 1
        return answer
```

```java
class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        count.put(0, 1); // the empty prefix
        int running = 0, answer = 0;
        for (int x : nums) {
            running += x;
            answer += count.getOrDefault(running - k, 0);
            count.merge(running, 1, Integer::sum);
        }
        return answer;
    }
}
```

```cpp
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        count[0] = 1;  // the empty prefix
        int running = 0, answer = 0;
        for (int x : nums) {
            running += x;
            auto it = count.find(running - k);
            if (it != count.end()) {
                answer += it->second;
            }
            count[running]++;
        }
        return answer;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var subarraySum = function (nums, k) {
  const count = new Map([[0, 1]]); // the empty prefix
  let running = 0, answer = 0;
  for (const x of nums) {
    running += x;
    answer += count.get(running - k) || 0;
    count.set(running, (count.get(running) || 0) + 1);
  }
  return answer;
};
```

```go
func subarraySum(nums []int, k int) int {
	count := map[int]int{0: 1} // the empty prefix
	running, answer := 0, 0
	for _, x := range nums {
		running += x
		answer += count[running-k]
		count[running]++
	}
	return answer
}
```
