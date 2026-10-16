---
title: Largest Number
leetcode: largest-number
description: "Largest Number explained: arrange non-negative integers into the biggest possible number by sorting them with the custom rule 'a before b if ab > ba', with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `nums` of non-negative integers (each at most 10⁹, up to 100 of them). Arrange all of them in some order and concatenate their decimal digits to form one number. Return the largest number you can form this way, **as a string**, because it can be far too long for any integer type.

If every element is `0`, the answer is the single string `"0"`, not a run of zeros.

## Examples

- `[5, 50, 56]` → `"56550"`. Of the six orders, `56 | 5 | 50` is the largest; note that `5` comes before `50` even though 5 < 50.
- `[8, 89, 898]` → `"898988"`. The order is `89 | 898 | 8`.
- `[12, 121]` → `"12121"`. Both orders give the same string, so either is fine.
- `[0, 0, 0]` → `"0"`. Concatenating would give `"000"`, which must be collapsed to a single zero.

## Key idea

Comparing two numbers by their value is the wrong rule: `5` should come before `50` because `"550"` beats `"505"`. The right question for any pair `a`, `b` is "which of the two concatenations, `a+b` or `b+a`, is bigger as a string?" Sorting with that pairwise rule puts every number where it should be. This works because the rule is consistent (transitive) when all strings are compared as `a+b` versus `b+a`: it is equivalent to comparing the infinite repetitions `aaaa…` and `bbbb…`, which is an ordinary string order.

## Approach

1. Convert every number to its decimal string.
2. Sort the strings with a custom comparator: `a` goes before `b` when `a + b > b + a` (string comparison; since both concatenations have the same length, lexicographic order equals numeric order).
3. Join the sorted strings.
4. If the result starts with `'0'`, every element was `0` (the largest element sorts first, and only zeros can lose to a zero), so return `"0"`. Otherwise return the joined string.

The brute force tries all `n!` orders, which is hopeless beyond a dozen elements. A plain descending numeric sort is fast but wrong, as `[5, 50]` shows.

## Complexity

- **Time:** O(n log n · L), where `L` is the number of digits per element (at most 10): the sort does O(n log n) comparisons, each concatenating and comparing strings of length about `2L`.
- **Space:** O(n · L) for the string copies and the result.

## Common mistakes

- Sorting by numeric value, or sorting the strings lexicographically (`"5" < "50"`), both of which put `50` before `5`.
- Comparing `a` and `b` by their first character or by padding to equal length; only the `a+b` versus `b+a` test is correct.
- Forgetting the all-zero case and returning `"00"` instead of `"0"`.
- Building the result as an integer type, which overflows: 100 ten-digit numbers make a 1000-digit answer.
- In languages that need a comparator returning an integer, returning `true`/`false` or forgetting the equal case, which breaks the sort's contract.

## Follow-up questions

- Why is the comparator transitive? (Sketch: `ab > ba` is equivalent to `a / (10^len(a) - 1) > b / (10^len(b) - 1)`, i.e. comparing `a` and `b` scaled to the same infinite repeating decimal.)
- How would you form the *smallest* number instead? (Reverse the comparator; still collapse leading zeros carefully.)
- What if you can use each number at most once but do not have to use all of them? (Take all non-zero numbers; adding digits never makes a positive number smaller.)

## Related problems

- [Group Anagrams](/interview/problems/group-anagrams/) (another problem solved by choosing the right sort key)
- Remove K Digits
- Minimum Number of Operations to Make Array Sorted

## Solutions

```python
class Solution:
    def largestNumber(self, nums: List[int]) -> str:
        def compare(a: str, b: str) -> int:
            if a + b > b + a:
                return -1  # a should come first
            if a + b < b + a:
                return 1
            return 0

        parts = sorted(map(str, nums), key=functools.cmp_to_key(compare))
        result = ''.join(parts)
        return '0' if result[0] == '0' else result  # all zeros collapse to "0"
```

```java
class Solution {
    public String largestNumber(int[] nums) {
        String[] parts = new String[nums.length];
        for (int i = 0; i < nums.length; i++) {
            parts[i] = String.valueOf(nums[i]);
        }
        Arrays.sort(parts, (a, b) -> (b + a).compareTo(a + b)); // a first when a+b > b+a
        if (parts[0].equals("0")) {
            return "0"; // the largest element is 0, so all of them are
        }
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            sb.append(p);
        }
        return sb.toString();
    }
}
```

```cpp
class Solution {
public:
    string largestNumber(vector<int>& nums) {
        vector<string> parts;
        for (int x : nums) parts.push_back(to_string(x));
        sort(parts.begin(), parts.end(), [](const string& a, const string& b) {
            return a + b > b + a;  // a first when a+b > b+a
        });
        if (parts[0] == "0") return "0";  // the largest element is 0, so all of them are
        string result;
        for (const string& p : parts) result += p;
        return result;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {string}
 */
var largestNumber = function (nums) {
  const parts = nums.map(String);
  parts.sort((a, b) => {
    const ab = a + b;
    const ba = b + a;
    if (ab > ba) return -1; // a first when a+b > b+a
    if (ab < ba) return 1;
    return 0;
  });
  if (parts[0] === '0') return '0'; // the largest element is 0, so all of them are
  return parts.join('');
};
```

```go
import (
	"sort"
	"strconv"
	"strings"
)

func largestNumber(nums []int) string {
	parts := make([]string, len(nums))
	for i, x := range nums {
		parts[i] = strconv.Itoa(x)
	}
	sort.Slice(parts, func(i, j int) bool {
		return parts[i]+parts[j] > parts[j]+parts[i] // a first when a+b > b+a
	})
	if parts[0] == "0" {
		return "0" // the largest element is 0, so all of them are
	}
	return strings.Join(parts, "")
}
```
