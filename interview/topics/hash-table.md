---
title: Hash Table
topic: Hash Table
group: structures
description: "Hash tables in coding interviews: O(1) lookup by key, the three jobs they do (seen, count, group), the one-pass check-then-insert pattern, and which problems to practise first."
---

## What it is

A hash table stores key-value pairs and finds a key in constant time on average. It hashes the key to a bucket number, looks in that bucket, and compares. Every language ships one: `dict` and `set` in Python, `HashMap` and `HashSet` in Java, `unordered_map` and `unordered_set` in C++, `Map` and `Set` in JavaScript, `map` in Go.

In interviews the hash table is the tool that turns "for each element, search the rest" (O(n²)) into "for each element, look it up" (O(n)). Nearly every use falls into one of three jobs:

- **Seen.** A set of things already visited: duplicates, cycles, the complement of a target sum.
- **Count.** A map from value to how many times it appears: majority element, anagram checks, top-k frequent.
- **Group or index.** A map from a key you compute (a sorted word, a remainder, a prefix sum) to the elements that share it, or to the position where it was first seen.

The trick in most problems is not the table itself but choosing the key.

## When to use it

- The brute force has a nested loop that searches for a partner: "two numbers that add to k", "a word seen before", "the earlier index with the same prefix sum". Store partners in a table as you go.
- The statement says "count", "frequency", "most common", "unique", "distinct", or "duplicate".
- You must group items by some property (anagram class, length, remainder) and the property can be written as one hashable value.
- You need O(1) lookup in a design problem (caches, rate limiters, key-value stores). Pair the map with a list, linked list or heap for the ordering part.
- The input is a stream and you cannot sort it.
- Values are sparse or unbounded, so an array indexed by value would be enormous. When values are small and dense (`0..n` or 26 letters), an array is a cheaper hash table.

## How it works

Take the complement lookup, the shape behind Two Sum and many others. Given `nums` and a `target`, find two positions whose values add to `target`.

Keep a map from value to index. For each element `x` at position `i`, compute `need = target - x`. If `need` is already in the map, the pair is `(map[need], i)`. Otherwise store `x -> i` and continue. The order matters: look up first, insert second, so an element never pairs with itself.

Trace it on `nums = [4, 9, 2, 7]`, `target = 11`:

| i | x | need | in map? | map after |
|---|---|---|---|---|
| 0 | 4 | 7 | no | {4: 0} |
| 1 | 9 | 2 | no | {4: 0, 9: 1} |
| 2 | 2 | 9 | yes, at 1 | answer (1, 2) |

Each element causes one lookup and at most one insert, so the whole pass is O(n). The same one-pass shape, with a different key, solves "count subarrays with sum k" (key = running prefix sum, value = how many times that prefix has occurred) and "longest substring without repeats" (key = character, value = last index).

For the count job, make one pass adding one per key, then read the counts: a majority element has count greater than n/2, an anagram has the same counts as its partner, and the top-k frequent values come from sorting the entries or bucketing them by count.

## Template

The skeleton is the check-then-insert loop. The `main` runs the complement example.

```python
def find_pair(nums, target):
    """Return the indices of two elements that add to target, or None."""
    seen = {}                       # key -> first index where it appeared
    for i, x in enumerate(nums):
        need = target - x           # problem-specific: the key we hope to find
        if need in seen:            # look up before inserting
            return (seen[need], i)
        seen[x] = i                 # problem-specific: what to store for x
    return None


if __name__ == "__main__":
    print(find_pair([4, 9, 2, 7], 11))  # (1, 2)
```

```java
import java.util.HashMap;
import java.util.Map;

public class Main {
    /** Returns the indices of two elements that add to target, or null. */
    static int[] findPair(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();   // key -> first index where it appeared
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];                 // problem-specific: the key we hope to find
            if (seen.containsKey(need)) {                // look up before inserting
                return new int[] {seen.get(need), i};
            }
            seen.put(nums[i], i);                        // problem-specific: what to store
        }
        return null;
    }

    public static void main(String[] args) {
        int[] pair = findPair(new int[] {4, 9, 2, 7}, 11);
        System.out.println(pair[0] + " " + pair[1]); // 1 2
    }
}
```

```cpp
#include <iostream>
#include <unordered_map>
#include <utility>
#include <vector>

// Returns the indices of two elements that add to target, or {-1, -1}.
std::pair<int, int> findPair(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;   // key -> first index where it appeared
    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];     // problem-specific: the key we hope to find
        auto it = seen.find(need);       // look up before inserting
        if (it != seen.end()) {
            return {it->second, i};
        }
        seen[nums[i]] = i;               // problem-specific: what to store
    }
    return {-1, -1};
}

int main() {
    auto p = findPair({4, 9, 2, 7}, 11);
    std::cout << p.first << ' ' << p.second << '\n';  // 1 2
}
```

```javascript
// Returns the indices of two elements that add to target, or null.
function findPair(nums, target) {
  const seen = new Map();            // key -> first index where it appeared
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];   // problem-specific: the key we hope to find
    if (seen.has(need)) {            // look up before inserting
      return [seen.get(need), i];
    }
    seen.set(nums[i], i);            // problem-specific: what to store
  }
  return null;
}

console.log(findPair([4, 9, 2, 7], 11)); // [ 1, 2 ]
```

```go
package main

import "fmt"

// findPair returns the indices of two elements that add to target, or -1, -1.
func findPair(nums []int, target int) (int, int) {
	seen := make(map[int]int) // key -> first index where it appeared
	for i, x := range nums {
		need := target - x // problem-specific: the key we hope to find
		if j, ok := seen[need]; ok { // look up before inserting
			return j, i
		}
		seen[x] = i // problem-specific: what to store
	}
	return -1, -1
}

func main() {
	fmt.Println(findPair([]int{4, 9, 2, 7}, 11)) // 1 2
}
```

## Variations

- **Set instead of map** when you only need membership: duplicates, cycle detection by node identity, "have I been here".
- **Counting map** (`Counter` in Python, `getOrDefault(k, 0) + 1` in Java, `m[k]++` in C++ and Go) for frequencies. Decrement as a window slides.
- **Prefix-sum map**: key is the running sum, value is its count (how many subarrays sum to k) or its first index (longest subarray summing to k).
- **Canonical key**: sort the string, or pack its 26 counts, so every anagram maps to one key.
- **Map plus another structure**: a doubly linked list for an LRU cache, an array for O(1) random pick, a heap for frequencies that change.
- **Array as a hash table** when keys are small integers or letters: faster, less memory, no hashing.

## Common mistakes

- Inserting before looking up, so an element pairs with itself (`target = 8`, `x = 4`).
- Using a mutable object as a key (a Python list, a JavaScript array). Convert to a tuple or a string.
- Expecting iteration order to mean something. Python dicts preserve insertion order; Java `HashMap`, C++ `unordered_map` and Go maps do not.
- Floating-point keys. `0.1 + 0.2` is not `0.3`; hash integers or scaled values instead.
- Forgetting that lookup is O(1) *on average*. Adversarial inputs or terrible hash functions degrade it; mention this if asked about worst case.
- Building a map when a 26-element array would do, or the other way round: an array indexed by a value up to 10⁹.

## Complexity

Insert, lookup and delete are O(1) average and O(n) worst case; the table holds O(n) entries. A pass that does one lookup per element is O(n) time and O(n) space. That extra space is the trade: a two-pointer sweep over a sorted array uses O(1) space but needs the sort or the sorted input.

## Where to start

1. [1. Two Sum](/interview/problems/two-sum/) — the complement lookup from this guide.
2. [217. Contains Duplicate](/interview/problems/contains-duplicate/) — the seen set in its purest form.
3. [242. Valid Anagram](/interview/problems/valid-anagram/) — counting, and when an array beats a map.
4. [49. Group Anagrams](/interview/problems/group-anagrams/) — choosing a canonical key.
5. [347. Top K Frequent Elements](/interview/problems/top-k-frequent-elements/) — a counting map followed by a heap or bucket sort.
6. [560. Subarray Sum Equals K](/interview/problems/subarray-sum-equals-k/) — the prefix-sum map; the "need" is `running - k`.
7. [128. Longest Consecutive Sequence](/interview/problems/longest-consecutive-sequence/) — a set used to start runs only at their left end.
8. [146. LRU Cache](/interview/problems/lru-cache/) — a map pointing into a linked list; the classic design question.
