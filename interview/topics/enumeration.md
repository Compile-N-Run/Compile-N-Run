---
title: Enumeration
topic: Enumeration
group: math
description: "Enumeration means trying every candidate answer and checking each one: how to choose what to enumerate, estimate the count, prune early, and recognise when brute force is the intended solution."
---

## What it is

Enumeration is deliberate brute force. You list every candidate (every pair of indices, every subset, every three-digit number, every way to split a string) and test each against the problem's condition, keeping or counting the ones that pass. It is the simplest technique on this site, and it is tagged on more than a hundred company problems because interviewers like it as a warm-up and because it is the correct answer more often than beginners expect.

The craft is not in the loop but in three decisions around it:

1. **What to enumerate.** Enumerating index triples `i < j < k` is O(n^3); enumerating *values* when the values are bounded (digits 0-9, sums up to 1000) can be far cheaper. Pick the smallest space that still contains every answer.
2. **How many candidates there are.** Multiply out the loop bounds before coding. Around 10^7 to 10^8 simple operations fits in a second; 10^9 does not.
3. **Where to prune.** Skip candidates that cannot succeed as early as possible, ideally in the outer loops so whole inner loops disappear.

Enumeration is also the baseline you measure everything else against. When you are stuck on a problem, write the enumeration first; a correct slow solution is worth more than an incorrect fast one, and it often shows you where the redundant work is.

## When to use it

- The constraints are small: `n <= 200` for pairs or triples, `n <= 20` for subsets (2^20 is about a million), values bounded by a few thousand.
- The statement asks to *count* or *list* everything that satisfies a condition, with no obvious structure that would let you skip candidates.
- The candidate space is a fixed, finite set: all three-digit numbers, all 2^k bit patterns, all positions in a small grid, all 26 letters.
- You suspect a cleverer approach exists but cannot find it under time pressure; code the enumeration, state its complexity, and improve the inner loop if there is time.
- The problem is a "find the only one" search where the answer is checkable: enumerate candidates and verify.

## How it works

Enumerating index triples with the template, `count_matching_triples([1, 2, 3, 4, 5, 6], 10)`:

- The outer loops pick `i < j`. For each pair, the pruning line asks whether `nums[i] + nums[j]` already exceeds 10. The pair `(5, 6)` is skipped before the `k` loop starts.
- The inner loop picks `k > j` and tests the condition `nums[i] + nums[j] + nums[k] == 10`.
- Matches: `(1, 3, 6)`, `(1, 4, 5)`, `(2, 3, 5)`. The function returns 3.

Why `j` starts at `i + 1` and `k` at `j + 1`: that enumerates each *set* of three indices once. Starting all loops from 0 would count each triple six times and also allow `i == j`.

Enumerating subsets with a bitmask, `all_subsets(["a", "b", "c"])`: masks run from `0` to `7`. Bit `b` of the mask says whether item `b` is in the subset.

| mask | binary | subset        |
|------|--------|---------------|
| 0    | 000    | `[]`          |
| 1    | 001    | `[a]`         |
| 2    | 010    | `[b]`         |
| 3    | 011    | `[a, b]`      |
| 5    | 101    | `[a, c]`      |
| 7    | 111    | `[a, b, c]`   |

This is the standard way to visit all `2^n` subsets without recursion. For `n <= 20` it is fast and easy to reason about; for larger `n` the problem is not an enumeration problem.

## Template

```python
def count_matching_triples(nums: list[int], target: int) -> int:
    """Try every index triple i < j < k and count the ones that satisfy the condition."""
    n = len(nums)
    count = 0
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] > target:   # pruning: no k can fix this pair, skip it early
                continue
            for k in range(j + 1, n):
                if nums[i] + nums[j] + nums[k] == target:   # the condition to check
                    count += 1
    return count


def all_subsets(items: list) -> list[list]:
    """Enumerate every subset with a bitmask: bit b of mask says whether items[b] is in."""
    result = []
    for mask in range(1 << len(items)):
        result.append([items[b] for b in range(len(items)) if mask >> b & 1])
    return result


if __name__ == "__main__":
    print(count_matching_triples([1, 2, 3, 4, 5, 6], 10))   # 3: (1,3,6) (1,4,5) (2,3,5)
    print(all_subsets(["a", "b", "c"]))                      # 8 subsets, [] first
```

```java
import java.util.ArrayList;
import java.util.List;

public class Template {
    // Try every index triple i < j < k and count the ones that satisfy the condition.
    static int countMatchingTriples(int[] nums, int target) {
        int n = nums.length, count = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] > target) continue;   // pruning: no k can fix this pair
                for (int k = j + 1; k < n; k++) {
                    if (nums[i] + nums[j] + nums[k] == target) count++;   // the condition to check
                }
            }
        }
        return count;
    }

    // Enumerate every subset with a bitmask: bit b of mask says whether items[b] is in.
    static List<List<String>> allSubsets(String[] items) {
        List<List<String>> result = new ArrayList<>();
        for (int mask = 0; mask < (1 << items.length); mask++) {
            List<String> subset = new ArrayList<>();
            for (int b = 0; b < items.length; b++) {
                if ((mask >> b & 1) == 1) subset.add(items[b]);
            }
            result.add(subset);
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(countMatchingTriples(new int[] {1, 2, 3, 4, 5, 6}, 10)); // 3
        System.out.println(allSubsets(new String[] {"a", "b", "c"}));                // 8 subsets, [] first
    }
}
```

```cpp
#include <iostream>
#include <string>
#include <vector>

// Try every index triple i < j < k and count the ones that satisfy the condition.
int countMatchingTriples(const std::vector<int>& nums, int target) {
    int n = nums.size(), count = 0;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] > target) continue;   // pruning: no k can fix this pair
            for (int k = j + 1; k < n; k++) {
                if (nums[i] + nums[j] + nums[k] == target) count++;   // the condition to check
            }
        }
    }
    return count;
}

// Enumerate every subset with a bitmask: bit b of mask says whether items[b] is in.
std::vector<std::vector<std::string>> allSubsets(const std::vector<std::string>& items) {
    std::vector<std::vector<std::string>> result;
    int n = items.size();
    for (int mask = 0; mask < (1 << n); mask++) {
        std::vector<std::string> subset;
        for (int b = 0; b < n; b++) {
            if (mask >> b & 1) subset.push_back(items[b]);
        }
        result.push_back(subset);
    }
    return result;
}

int main() {
    std::cout << countMatchingTriples({1, 2, 3, 4, 5, 6}, 10) << "\n";   // 3
    for (const auto& subset : allSubsets({"a", "b", "c"})) {              // 8 subsets, {} first
        std::cout << "{";
        for (const auto& s : subset) std::cout << s;
        std::cout << "} ";
    }
    std::cout << "\n";
}
```

```javascript
// Try every index triple i < j < k and count the ones that satisfy the condition.
function countMatchingTriples(nums, target) {
  const n = nums.length;
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (nums[i] + nums[j] > target) continue; // pruning: no k can fix this pair
      for (let k = j + 1; k < n; k++) {
        if (nums[i] + nums[j] + nums[k] === target) count++; // the condition to check
      }
    }
  }
  return count;
}

// Enumerate every subset with a bitmask: bit b of mask says whether items[b] is in.
function allSubsets(items) {
  const result = [];
  for (let mask = 0; mask < 1 << items.length; mask++) {
    result.push(items.filter((_, b) => (mask >> b) & 1));
  }
  return result;
}

console.log(countMatchingTriples([1, 2, 3, 4, 5, 6], 10)); // 3
console.log(JSON.stringify(allSubsets(["a", "b", "c"]))); // 8 subsets, [] first
```

```go
package main

import "fmt"

// countMatchingTriples tries every index triple i < j < k and counts the ones that satisfy the condition.
func countMatchingTriples(nums []int, target int) int {
	n, count := len(nums), 0
	for i := 0; i < n; i++ {
		for j := i + 1; j < n; j++ {
			if nums[i]+nums[j] > target { // pruning: no k can fix this pair
				continue
			}
			for k := j + 1; k < n; k++ {
				if nums[i]+nums[j]+nums[k] == target { // the condition to check
					count++
				}
			}
		}
	}
	return count
}

// allSubsets enumerates every subset with a bitmask: bit b of mask says whether items[b] is in.
func allSubsets(items []string) [][]string {
	var result [][]string
	for mask := 0; mask < 1<<len(items); mask++ {
		subset := []string{}
		for b := range items {
			if mask>>b&1 == 1 {
				subset = append(subset, items[b])
			}
		}
		result = append(result, subset)
	}
	return result
}

func main() {
	fmt.Println(countMatchingTriples([]int{1, 2, 3, 4, 5, 6}, 10)) // 3
	fmt.Println(allSubsets([]string{"a", "b", "c"}))              // 8 subsets, [] first
}
```

## Variations

- **Enumerate values, not indices.** Finding 3-Digit Even Numbers: instead of all index triples from the input, loop over the 450 even numbers from 100 to 998 and check whether the digits are available. The count of candidates is fixed and small no matter how big the input is.
- **Enumerate one side, look up the other.** Count Special Quadruplets wants `a + b + c = d`. Enumerate `(a, b)` pairs and keep a hash map of `d - c` values seen for the remaining indices; the innermost loop becomes a lookup. This is the usual step from O(n^3) to O(n^2).
- **Enumerate the answer and verify.** Count Symmetric Integers: loop over every number in the range and test the digit property directly. When the range is at most 10^5 or so, this beats any clever counting.
- **Enumerate structure, then count.** Count Lattice Points Inside a Circle: enumerate every integer point in the bounding box of the circles and check each against all circles.
- **Subsets by bitmask.** Count Number of Maximum Bitwise-OR Subsets with `n <= 16`: `2^16 * 16` is about a million operations.
- **Enumerate split positions.** Ambiguous Coordinates: try every comma position, and for each half every decimal-point position, filtering out invalid forms.

## Common mistakes

- Not computing the candidate count before coding. `n = 1000` with three nested loops is 10^9 operations in the worst case; the interviewer will ask, so have the number ready and know whether it fits.
- Counting the same unordered candidate several times by letting loops overlap (`j` from 0 instead of `i + 1`), or counting ordered pairs when the problem wants unordered ones (or the reverse).
- Pruning with a condition that is not actually safe. `nums[i] + nums[j] > target` only prunes when all values are non-negative; with negatives a later `k` could bring the sum back down.
- Rebuilding something expensive inside the innermost loop (a string, a sorted copy) that could be built once per outer iteration.
- Using `1 << n` with `n >= 31` in a 32-bit integer type; in JavaScript shifts are 32-bit as well.
- Mistaking enumeration for backtracking. Enumeration visits every candidate; backtracking also builds candidates incrementally but abandons partial ones early. If pruning partial candidates is the whole point, see the Backtracking guide.

## Complexity

Time is the number of candidates times the cost of checking one: O(n^2) for pairs, O(n^3) for triples, O(2^n * n) for subsets by bitmask, O(range) for enumerating values. Memory is O(1) unless you store the candidates. The job is to make this product small by shrinking the candidate set (enumerate values instead of indices), cutting the check cost (precompute, hash), or pruning branches.

## Where to start

1. 1534. Count Good Triplets: three nested loops with `n <= 100`; practise ordering the index loops correctly.
2. 1925. Count Square Sum Triples: enumerate `a` and `b`, compute `c` and check it is an integer.
3. 2843. Count Symmetric Integers: loop over the range and test each number.
4. 2094. Finding 3-Digit Even Numbers: enumerate the 450 candidate values instead of the input.
5. 1995. Count Special Quadruplets: write the O(n^4) version, then cut one loop with a hash map.
6. 2044. Count Number of Maximum Bitwise-OR Subsets: enumerate subsets with a bitmask.
7. 816. Ambiguous Coordinates: enumerate split positions with careful validity rules.
8. 204. Count Primes: an enumeration over values that becomes the sieve once you prune multiples.
