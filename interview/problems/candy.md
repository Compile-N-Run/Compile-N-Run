---
title: Candy
leetcode: candy
description: "Candy explained: hand out the fewest candies so that every child with a higher rating than a neighbour gets more than that neighbour, using two greedy passes, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Children stand in a row, and `ratings[i]` is the rating of the `i`-th child. You hand out candies under two rules:

- every child gets at least one candy;
- a child with a **higher** rating than a direct neighbour must get **more** candies than that neighbour.

Children with equal ratings have no constraint between them. Return the smallest total number of candies that satisfies both rules. The row has at least one child, and the answer always exists.

## Examples

- `[1, 3, 2]` → `4`. Give `1, 2, 1`: the middle child beats both neighbours and gets more than each.
- `[2, 2, 2]` → `3`. Equal ratings impose nothing, so one candy each is enough.
- `[5, 4, 3, 2]` → `10`. Ratings fall all the way, so the candies must be `4, 3, 2, 1`.
- `[1, 2, 2, 1]` → `6`. Give `1, 2, 2, 1`: the second child beats the first, the third beats the fourth, and the two equal children are free of each other.
- `[7]` → `1`. A single child gets one candy.

## Key idea

Each rule only looks at one neighbour, so handle the two directions separately. A left-to-right pass makes sure every child who beats their *left* neighbour has more candy than that neighbour: whenever `ratings[i] > ratings[i-1]`, give child `i` one more than child `i-1`. A right-to-left pass does the same for the *right* neighbour. When the two passes disagree, taking the larger of the two values keeps both rules true, because raising a child's count never breaks a "more than" relation they already satisfy. Starting every child at 1 and only ever adding the minimum needed makes the total minimal.

## Approach

1. Create `candies` with one candy per child.
2. Left-to-right: for `i` from 1 to `n-1`, if `ratings[i] > ratings[i-1]`, set `candies[i] = candies[i-1] + 1`.
3. Right-to-left: for `i` from `n-2` down to 0, if `ratings[i] > ratings[i+1]`, set `candies[i] = max(candies[i], candies[i+1] + 1)`. The `max` keeps the value from the first pass when it is already large enough.
4. Return the sum of `candies`.

A brute force that repeatedly scans the row and bumps any child who violates a rule until nothing changes works but can take O(n²) time on a long descending slope. The two passes do the same work in a single sweep per direction.

## Complexity

- **Time:** O(n). Two passes over the ratings plus one sum.
- **Space:** O(n) for the `candies` array. (A one-pass O(1) solution exists that counts the lengths of rising and falling runs, but it is harder to get right in an interview.)

## Common mistakes

- Writing `candies[i] = candies[i+1] + 1` in the second pass without the `max`. On `[1, 2, 3, 1]` that would drop the third child from 3 to 2, breaking the rule against the second child.
- Giving more candy to a child whose rating *equals* a neighbour's. Equal ratings have no constraint; adding candy there only inflates the total.
- Trying to settle everything in one left-to-right pass. A descending run is only discovered when it ends, so the earlier children must be revisited from the right.
- Forgetting the single-child case, where both loops do nothing and the answer is 1.

## Follow-up questions

- *Can you do it in O(1) extra space?* Yes: walk once, tracking the current rising run and the current falling run; a peak shared by both runs gets the larger of the two lengths. Being able to explain why the two-pass version is correct is usually what the interviewer wants first.
- *What if the children stood in a circle?* The first and last children become neighbours. Rotate so the lowest-rated child is first, then the two passes work unchanged.

## Related problems

- [Trapping Rain Water](/interview/problems/trapping-rain-water/): another array problem where a left pass and a right pass combine into the answer.
- [Gas Station](/interview/problems/gas-station/): a greedy argument over a row of values.
- [Product of Array Except Self](/interview/problems/product-of-array-except-self/): prefix and suffix passes over the same array.

## Solutions

```python
class Solution:
    def candy(self, ratings: List[int]) -> int:
        n = len(ratings)
        candies = [1] * n
        for i in range(1, n):  # satisfy "more than the left neighbour"
            if ratings[i] > ratings[i - 1]:
                candies[i] = candies[i - 1] + 1
        for i in range(n - 2, -1, -1):  # satisfy "more than the right neighbour"
            if ratings[i] > ratings[i + 1]:
                candies[i] = max(candies[i], candies[i + 1] + 1)
        return sum(candies)
```

```java
class Solution {
    public int candy(int[] ratings) {
        int n = ratings.length;
        int[] candies = new int[n];
        Arrays.fill(candies, 1);
        for (int i = 1; i < n; i++) { // satisfy "more than the left neighbour"
            if (ratings[i] > ratings[i - 1]) {
                candies[i] = candies[i - 1] + 1;
            }
        }
        for (int i = n - 2; i >= 0; i--) { // satisfy "more than the right neighbour"
            if (ratings[i] > ratings[i + 1]) {
                candies[i] = Math.max(candies[i], candies[i + 1] + 1);
            }
        }
        int total = 0;
        for (int c : candies) {
            total += c;
        }
        return total;
    }
}
```

```cpp
class Solution {
public:
    int candy(vector<int>& ratings) {
        int n = ratings.size();
        vector<int> candies(n, 1);
        for (int i = 1; i < n; i++) {  // satisfy "more than the left neighbour"
            if (ratings[i] > ratings[i - 1]) {
                candies[i] = candies[i - 1] + 1;
            }
        }
        for (int i = n - 2; i >= 0; i--) {  // satisfy "more than the right neighbour"
            if (ratings[i] > ratings[i + 1]) {
                candies[i] = max(candies[i], candies[i + 1] + 1);
            }
        }
        return accumulate(candies.begin(), candies.end(), 0);
    }
};
```

```javascript
/**
 * @param {number[]} ratings
 * @return {number}
 */
var candy = function (ratings) {
  const n = ratings.length;
  const candies = new Array(n).fill(1);
  for (let i = 1; i < n; i++) {
    // satisfy "more than the left neighbour"
    if (ratings[i] > ratings[i - 1]) {
      candies[i] = candies[i - 1] + 1;
    }
  }
  for (let i = n - 2; i >= 0; i--) {
    // satisfy "more than the right neighbour"
    if (ratings[i] > ratings[i + 1]) {
      candies[i] = Math.max(candies[i], candies[i + 1] + 1);
    }
  }
  return candies.reduce((sum, c) => sum + c, 0);
};
```

```go
func candy(ratings []int) int {
	n := len(ratings)
	candies := make([]int, n)
	for i := range candies {
		candies[i] = 1
	}
	for i := 1; i < n; i++ { // satisfy "more than the left neighbour"
		if ratings[i] > ratings[i-1] {
			candies[i] = candies[i-1] + 1
		}
	}
	for i := n - 2; i >= 0; i-- { // satisfy "more than the right neighbour"
		if ratings[i] > ratings[i+1] {
			candies[i] = max(candies[i], candies[i+1]+1)
		}
	}
	total := 0
	for _, c := range candies {
		total += c
	}
	return total
}
```
