---
title: Recursion
topic: Recursion
group: patterns
description: "Recursion solves a problem by solving a smaller copy of the same problem: how to find the base case, trust the recursive call, combine results, and avoid the stack and repeated-work traps."
---

## What it is

A recursive function calls itself on a smaller version of its input. Reversing a string is "reverse everything after the first character, then put the first character at the end". Reversing a linked list is "reverse the rest, then hook the head on at the tail". Counting ways to climb `n` stairs is "the ways to climb `n-1` plus the ways to climb `n-2`". Each definition has the same two parts:

- a **base case**, an input so small the answer is immediate (empty string, one node, zero stairs);
- a **recursive case**, which shrinks the input, calls the function on the smaller input, and **combines** that result with the piece it set aside.

The mental move that beginners find hardest is to *trust the call*. When writing `reverse(s)`, assume `reverse(s[1:])` already works perfectly and ask only "what do I do with its result?". You do not trace into it. Correctness follows by induction: the base case is right, and if the function is right for smaller inputs it is right for this one.

Recursion is the foundation under several other techniques on this site. Depth-first search, backtracking, divide and conquer, and top-down dynamic programming (memoization) are all recursion with a particular shape. This guide covers the plain form and the habits that carry over to the others.

## When to use it

- The data is recursively shaped: linked lists (a node and the rest of the list), trees (a root and two subtrees), nested strings (`3[a2[c]]`), expressions with parentheses.
- The problem statement defines the answer in terms of smaller instances: "`f(n)` equals ... of `f(n-1)`", "a string is a palindrome if its ends match and the inside is a palindrome".
- The problem is a search over choices where you want to undo a choice easily (backtracking): the call stack remembers where you were.
- An iterative version would need an explicit stack to remember pending work (parsing nested input, tree traversals), and the recursion is clearer.
- You can halve the input (Pow(x, n), binary search, merge sort): recursion with depth O(log n) is the natural fit.

The opposite signal: a loop over a simple sequence with no nesting and no backtracking does not need recursion, and in Python or JavaScript a depth of 10^5 or more will overflow the stack, so linked lists of that length are better reversed iteratively.

## How it works

Trace `reverse("abc")` from the template. The recursive case is `reverse(s[1:]) + s[0]`:

```
reverse("abc")
  = reverse("bc") + "a"
  = (reverse("c") + "b") + "a"
  = ("c" + "b") + "a"          <- reverse("c") hits the base case
  = "cba"
```

Each call does one unit of work (set aside the first character) and delegates the rest. The calls nest three deep, and the results are combined on the way back out: the deepest call returns first.

Now `count_ways(4)`, ways to climb 4 stairs taking 1 or 2 steps at a time, with the base case "0 or 1 stairs has exactly one way":

```
count_ways(4) = count_ways(3) + count_ways(2)
count_ways(3) = count_ways(2) + count_ways(1) = 2 + 1 = 3
count_ways(2) = count_ways(1) + count_ways(0) = 1 + 1 = 2
count_ways(4) = 3 + 2 = 5
```

Notice that `count_ways(2)` is computed twice. For `n = 40` the naive version makes over a billion calls, because each call branches into two and the same small inputs are recomputed enormously often. The fix is **memoization**: store each result in a map keyed by the input, and return the stored value when the same input comes back. With the memo, every distinct input is computed once, so `count_ways(80)` takes 80 steps instead of 10^16. This is the bridge from recursion to dynamic programming: a memoized recursion *is* top-down DP.

## Template

```python
import sys

sys.setrecursionlimit(10_000)   # Python's default (1000) is too low for deep recursion


def reverse(s: str) -> str:
    """Linear recursion: one smaller call per step."""
    if len(s) <= 1:                   # base case: nothing left to do
        return s
    return reverse(s[1:]) + s[0]      # solve the smaller problem, then combine


def count_ways(n: int, memo: dict | None = None) -> int:
    """Branching recursion with memoization: ways to climb n stairs taking 1 or 2 steps."""
    if memo is None:
        memo = {}
    if n <= 1:                        # base cases
        return 1
    if n in memo:                     # already computed: reuse it
        return memo[n]
    memo[n] = count_ways(n - 1, memo) + count_ways(n - 2, memo)   # two smaller problems, combined
    return memo[n]


if __name__ == "__main__":
    print(reverse("recursion"))   # noisrucer
    print(count_ways(10))         # 89
    print(count_ways(80))         # 37889062373143906, instant thanks to the memo
```

```java
import java.util.HashMap;
import java.util.Map;

public class Template {
    // Linear recursion: one smaller call per step.
    static String reverse(String s) {
        if (s.length() <= 1) return s;                    // base case: nothing left to do
        return reverse(s.substring(1)) + s.charAt(0);     // solve the smaller problem, then combine
    }

    // Branching recursion with memoization: ways to climb n stairs taking 1 or 2 steps.
    static long countWays(int n, Map<Integer, Long> memo) {
        if (n <= 1) return 1;                              // base cases
        if (memo.containsKey(n)) return memo.get(n);       // already computed: reuse it
        long ways = countWays(n - 1, memo) + countWays(n - 2, memo);   // two smaller problems, combined
        memo.put(n, ways);
        return ways;
    }

    public static void main(String[] args) {
        System.out.println(reverse("recursion"));                 // noisrucer
        System.out.println(countWays(10, new HashMap<>()));       // 89
        System.out.println(countWays(80, new HashMap<>()));       // 37889062373143906
    }
}
```

```cpp
#include <iostream>
#include <string>
#include <unordered_map>

// Linear recursion: one smaller call per step.
std::string reverse(const std::string& s) {
    if (s.size() <= 1) return s;                   // base case: nothing left to do
    return reverse(s.substr(1)) + s[0];            // solve the smaller problem, then combine
}

// Branching recursion with memoization: ways to climb n stairs taking 1 or 2 steps.
long long countWays(int n, std::unordered_map<int, long long>& memo) {
    if (n <= 1) return 1;                          // base cases
    auto it = memo.find(n);
    if (it != memo.end()) return it->second;       // already computed: reuse it
    long long ways = countWays(n - 1, memo) + countWays(n - 2, memo);   // two smaller problems, combined
    memo[n] = ways;
    return ways;
}

int main() {
    std::cout << reverse("recursion") << "\n";     // noisrucer
    std::unordered_map<int, long long> memo;
    std::cout << countWays(10, memo) << "\n";      // 89
    std::cout << countWays(80, memo) << "\n";      // 37889062373143906
}
```

```javascript
// Linear recursion: one smaller call per step.
function reverse(s) {
  if (s.length <= 1) return s; // base case: nothing left to do
  return reverse(s.slice(1)) + s[0]; // solve the smaller problem, then combine
}

// Branching recursion with memoization: ways to climb n stairs taking 1 or 2 steps.
// BigInt because the answer passes 2^53 around n = 78.
function countWays(n, memo = new Map()) {
  if (n <= 1) return 1n; // base cases
  if (memo.has(n)) return memo.get(n); // already computed: reuse it
  const ways = countWays(n - 1, memo) + countWays(n - 2, memo); // two smaller problems, combined
  memo.set(n, ways);
  return ways;
}

console.log(reverse("recursion")); // noisrucer
console.log(countWays(10).toString()); // 89
console.log(countWays(80).toString()); // 37889062373143906
```

```go
package main

import "fmt"

// reverse is linear recursion: one smaller call per step.
func reverse(s string) string {
	if len(s) <= 1 { // base case: nothing left to do
		return s
	}
	return reverse(s[1:]) + s[:1] // solve the smaller problem, then combine
}

// countWays is branching recursion with memoization: ways to climb n stairs taking 1 or 2 steps.
func countWays(n int, memo map[int]int64) int64 {
	if n <= 1 { // base cases
		return 1
	}
	if v, ok := memo[n]; ok { // already computed: reuse it
		return v
	}
	ways := countWays(n-1, memo) + countWays(n-2, memo) // two smaller problems, combined
	memo[n] = ways
	return ways
}

func main() {
	fmt.Println(reverse("recursion"))             // noisrucer
	fmt.Println(countWays(10, map[int]int64{}))   // 89
	fmt.Println(countWays(80, map[int]int64{}))   // 37889062373143906
}
```

## Variations

- **Linear recursion on lists.** `reverse(head)`: if `head` or `head.next` is null return `head`; otherwise `newHead = reverse(head.next)`, then `head.next.next = head; head.next = null`. Merge Two Sorted Lists picks the smaller head and recurses on the rest. Swap Nodes in Pairs and Reverse Nodes in k-Group recurse on the list after each chunk.
- **Halving.** Pow(x, n): `half = pow(x, n/2)`, answer is `half * half`, times `x` once more when `n` is odd. Depth O(log n). K-th Symbol in Grammar: the k-th symbol in row `n` is determined by the `(k+1)/2`-th symbol in row `n-1`.
- **Recursive descent parsing.** Decode String, Basic Calculator, Different Ways to Add Parentheses: a function parses one level of nesting and calls itself when it meets an opening bracket; the index moves forward through a shared position variable or is returned alongside the value.
- **Two-way recursion with an index.** Regular Expression Matching: `match(i, j)` depends on `match(i+1, j+1)` and `match(i, j+2)`; add a memo keyed on `(i, j)` and it becomes DP.
- **Converting to iteration.** Any recursion can be run with an explicit stack of pending frames. Do this when depth could reach 10^5 in Python or JavaScript, or when the interviewer asks for O(1) extra space on a linked list.

## Common mistakes

- No base case, or a base case that some input skips (recursing on `n - 2` with a base case only at `n == 0` never stops for odd `n`). Write the base cases first, and make sure every path reaches one.
- Forgetting to return the result of the recursive call. `reverse(s[1:])` on its own line computes the answer and throws it away.
- Exponential blow-up from recomputing the same subproblems. If the function branches and the inputs repeat, memoize.
- Stack overflow. Python's default limit is about 1000 frames and JavaScript's a few thousand; Java and C++ manage around 10^4 to 10^5 depending on frame size, Go grows its stack and is rarely a problem. Know the limit of your language before choosing recursion on a long list.
- Mutating shared state (a global list, a visited set) without undoing it on the way back, which breaks backtracking. Either copy, or undo after the call.
- Making the input smaller in the wrong way: `s[1:]` copies the string on every call, O(n) per level and O(n^2) total. Pass an index instead of a slice when the input is big.

## Complexity

Time is the number of calls times the work per call outside the recursion. Linear recursion makes O(n) calls; halving recursion O(log n); branching recursion without memoization can be O(2^n), with memoization O(number of distinct inputs). Space is at least the maximum depth of the call stack, which is also O(n), O(log n) or O(depth) respectively, plus the memo table. State the stack cost in interviews; it is the part people forget.

## Where to start

1. 509. Fibonacci Number: write it naively, watch it crawl at `n = 40`, then add the memo.
2. [206. Reverse Linked List](/interview/problems/reverse-linked-list/): the classic one-line recursive body that most people get wrong the first time.
3. [21. Merge Two Sorted Lists](/interview/problems/merge-two-sorted-lists/): pick a head, recurse on the rest.
4. 24. Swap Nodes in Pairs: recurse on the list after each pair.
5. [50. Pow(x, n)](/interview/problems/powx-n/): halving with the odd/even and negative-exponent details.
6. [394. Decode String](/interview/problems/decode-string/): recursive descent over nested brackets.
7. 779. K-th Symbol in Grammar: find the relation to the previous row and trust it.
8. [25. Reverse Nodes in k-Group](/interview/problems/reverse-nodes-in-k-group/): reverse one chunk, recurse on the remainder, link them.
