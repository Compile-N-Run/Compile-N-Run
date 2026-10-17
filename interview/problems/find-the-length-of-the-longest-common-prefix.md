---
title: Find the Length of the Longest Common Prefix
leetcode: find-the-length-of-the-longest-common-prefix
description: "Find the Length of the Longest Common Prefix explained: store every decimal prefix of the first array's numbers in a hash set, then strip digits off each number of the second array until a stored prefix appears, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given two arrays of positive integers, `arr1` and `arr2`. Write each number in decimal; a **prefix** of a number is any run of its leading digits, so the prefixes of `4512` are `4`, `45`, `451` and `4512`. A **common prefix** of two numbers is a prefix they share.

Return the length (number of digits) of the longest common prefix between any `x` in `arr1` and any `y` in `arr2`. If no pair shares even a first digit, return `0`.

Each array has up to 5 × 10⁴ numbers and every number is at most 10⁸, so a number has at most nine digits.

## Examples

- `arr1 = [1, 10, 100]`, `arr2 = [1000]` → `3`. `100` and `1000` share the prefix `100`.
- `arr1 = [123, 456]`, `arr2 = [1234, 45]` → `3`. `123` and `1234` share `123`; `456` and `45` share only `45`.
- `arr1 = [12]`, `arr2 = [123, 124, 125]` → `2`. Every number in `arr2` starts with `12`.
- `arr1 = [1, 2, 3]`, `arr2 = [4, 4, 4]` → `0`. No first digit matches.
- `arr1 = [100000000]`, `arr2 = [100000000]` → `9`. Identical nine-digit numbers.

## Key idea

Comparing every pair is too slow (2.5 × 10⁹ pairs), but each number only has a handful of prefixes because it has at most nine digits. So record **every prefix of every number in `arr1`** in a hash set. Then a number `y` from `arr2` can test its own prefixes, longest first: `y` itself, then `y` with its last digit removed (`y / 10`), and so on. The first prefix found in the set is the longest common prefix for that `y`. The best over all `y` is the answer.

Integer division by 10 drops the last digit, so prefixes can be generated and compared as integers; no string conversion is needed until you count the digits of the winner.

## Approach

1. Create an empty hash set `prefixes`.
2. For each `x` in `arr1`: while `x > 0`, insert `x` into the set and set `x = x / 10` (integer division).
3. Set `best = 0`.
4. For each `y` in `arr2`: while `y > 0` and `y` is not in the set, set `y = y / 10`. If `y` is still positive, it is the longest shared prefix for this number; update `best` with its digit count.
5. Return `best`.

A trie over the digit strings works equally well (insert `arr1`, walk each `arr2` number down as far as possible); the hash set is the same idea with less code.

## Complexity

- **Time:** O((n + m) · d), where `d ≤ 9` is the maximum number of digits: each number contributes at most `d` inserts or lookups.
- **Space:** O(n · d) for the set of prefixes of `arr1`.

## Common mistakes

- Comparing all pairs with string prefix checks: O(n · m · d) times out at the upper limits.
- Inserting only the full numbers of `arr1`, not their prefixes. Then `100` versus `1000` gives `0` instead of `3`.
- Checking prefixes shortest first and stopping at the first hit, which returns `1` for `100` versus `1000`.
- Returning the longest prefix's value instead of its length.

## Follow-up questions

- *What if the numbers could be much longer (as strings)?* A trie built from `arr1` answers each `arr2` query in O(length) without materialising every prefix as a number.
- *What if you also had to return the pair that achieves the maximum?* Store with each prefix one originating `x` in a map, and record the `y` when `best` improves.
- *Can you cut memory by putting the smaller array in the set?* Yes: common prefixes are symmetric, so swap the arrays if `arr2` is shorter.

## Related problems

- [Longest Common Prefix](/interview/problems/longest-common-prefix/)
- [Implement Trie (Prefix Tree)](/interview/problems/implement-trie-prefix-tree/)
- Longest Common Suffix Queries

## Solutions

```python
class Solution:
    def longestCommonPrefix(self, arr1: List[int], arr2: List[int]) -> int:
        prefixes = set()
        for x in arr1:
            while x:
                prefixes.add(x)
                x //= 10  # drop the last digit
        best = 0
        for y in arr2:
            while y and y not in prefixes:
                y //= 10
            if y:
                best = max(best, len(str(y)))
        return best
```

```java
class Solution {
    public int longestCommonPrefix(int[] arr1, int[] arr2) {
        Set<Integer> prefixes = new HashSet<>();
        for (int x : arr1) {
            for (; x > 0; x /= 10) { // drop the last digit each round
                prefixes.add(x);
            }
        }
        int best = 0;
        for (int y : arr2) {
            while (y > 0 && !prefixes.contains(y)) {
                y /= 10;
            }
            if (y > 0) {
                best = Math.max(best, String.valueOf(y).length());
            }
        }
        return best;
    }
}
```

```cpp
class Solution {
public:
    int longestCommonPrefix(vector<int>& arr1, vector<int>& arr2) {
        unordered_set<int> prefixes;
        for (int x : arr1) {
            for (; x > 0; x /= 10) {  // drop the last digit each round
                prefixes.insert(x);
            }
        }
        int best = 0;
        for (int y : arr2) {
            while (y > 0 && !prefixes.count(y)) {
                y /= 10;
            }
            if (y > 0) {
                best = max(best, (int)to_string(y).size());
            }
        }
        return best;
    }
};
```

```javascript
/**
 * @param {number[]} arr1
 * @param {number[]} arr2
 * @return {number}
 */
var longestCommonPrefix = function (arr1, arr2) {
  const prefixes = new Set();
  for (let x of arr1) {
    while (x > 0) {
      prefixes.add(x);
      x = Math.floor(x / 10); // drop the last digit
    }
  }
  let best = 0;
  for (let y of arr2) {
    while (y > 0 && !prefixes.has(y)) {
      y = Math.floor(y / 10);
    }
    if (y > 0) {
      best = Math.max(best, String(y).length);
    }
  }
  return best;
};
```

```go
import "strconv"

func longestCommonPrefix(arr1 []int, arr2 []int) int {
	prefixes := map[int]bool{}
	for _, x := range arr1 {
		for ; x > 0; x /= 10 { // drop the last digit each round
			prefixes[x] = true
		}
	}
	best := 0
	for _, y := range arr2 {
		for y > 0 && !prefixes[y] {
			y /= 10
		}
		if y > 0 {
			best = max(best, len(strconv.Itoa(y)))
		}
	}
	return best
}
```
