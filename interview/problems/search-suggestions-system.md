---
title: Search Suggestions System
leetcode: search-suggestions-system
description: "Search Suggestions System explained: return the three alphabetically smallest products matching each prefix of a search word by sorting once and binary searching per prefix, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a list of distinct product names (`products`, lowercase letters) and a word the user types (`searchWord`). After **each** character is typed, the system should suggest at most three products that start with what has been typed so far; when more than three match, pick the three that come first in dictionary order.

Return a list with one entry per typed character: the first entry holds the suggestions after the first letter, the second after the first two letters, and so on. An entry is an empty list when nothing matches that prefix. There are at most 1000 products and the strings are short (at most 3000 characters in total).

## Examples

- `products = ["banana", "band", "bandana", "bandit", "bank"]`, `searchWord = "band"` →
  `[["banana", "band", "bandana"], ["banana", "band", "bandana"], ["banana", "band", "bandana"], ["band", "bandana", "bandit"]]`.
  All five products start with `b`, `ba` and `ban`, so the three smallest are shown; after `band`, `banana` and `bank` drop out.
- `products = ["apple", "apply", "ape"]`, `searchWord = "apex"` → `[["ape", "apple", "apply"], ["ape", "apple", "apply"], ["ape"], []]`. Once `apex` has no match, the list is empty.
- `products = ["cat"]`, `searchWord = "dog"` → `[[], [], []]`.
- `products = ["code", "coder", "codes", "coding"]`, `searchWord = "code"` → `[["code", "coder", "codes"], ["code", "coder", "codes"], ["code", "coder", "codes"], ["code", "coder", "codes"]]`. A product equal to the prefix counts as starting with it.

## Key idea

Sort the products once. In a sorted list, every product sharing a prefix sits in one **contiguous block**, and the three lexicographically smallest of them are simply the first three of that block. So for each prefix, binary search for the first product that is not smaller than the prefix (a *lower bound*), then look at the next three positions and keep those that really start with the prefix.

## Approach

1. Sort `products`.
2. Start with an empty prefix. For each character of `searchWord`:
   1. Append the character to the prefix.
   2. Binary search for `start`, the index of the first product `>= prefix`.
   3. Collect `products[start]`, `products[start + 1]`, `products[start + 2]` as long as the index is in range and the product starts with the prefix.
   4. Append the collected list to the result.
3. Return the result.

Two alternatives are worth knowing. A **trie** stores every product by character; walk down it with the typed letters and do a small depth-first search for the first three words under each node (O(total characters) to build, cheap per query, and the natural answer when products change often). A **shrinking window** approach keeps two pointers on the sorted list and moves them inwards for each new character, since the block for `prefix + c` lies inside the block for `prefix`.

## Complexity

- **Time:** O(n log n · L) to sort `n` products of length up to `L`, plus O(m log n · L) for the `m` binary searches, each comparison costing up to O(L). Collecting at most three products per prefix is O(m · L).
- **Space:** O(1) beyond the sorted list and the output (the sort may be in place).

## Common mistakes

- Taking the first three products at or after the lower bound *without* checking that they start with the prefix. After `"apex"`, the lower bound points at `"apple"`, which does not match.
- Searching for the prefix with an exact-match binary search. The prefix is usually not itself a product; you need the insertion point (lower bound).
- Comparing only the first `len(prefix)` characters when sorting. Sort by the full string; the three suggestions must be the smallest complete names.
- Forgetting that the result must have exactly `len(searchWord)` entries, including empty lists once no product matches.

## Follow-up questions

- *What if products are added and removed all the time?* Use a trie (or a balanced ordered set) so that updates do not require re-sorting.
- *What if you must return the three most popular rather than the smallest?* Store a popularity score in each trie node, or keep the top three per node pre-computed.
- *What if the search word has millions of prefixes queried concurrently?* Cache the answer per prefix; the trie is a natural cache keyed by path.

## Related problems

- [Implement Trie (Prefix Tree)](/interview/problems/implement-trie-prefix-tree/)
- [Longest Common Prefix](/interview/problems/longest-common-prefix/)
- [Word Search II](/interview/problems/word-search-ii/)
- Design Search Autocomplete System
- Top K Frequent Words

## Solutions

```python
class Solution:
    def suggestedProducts(self, products: List[str], searchWord: str) -> List[List[str]]:
        products.sort()
        result, prefix = [], ''
        for ch in searchWord:
            prefix += ch
            start = bisect.bisect_left(products, prefix)  # first product >= prefix
            suggestions = [p for p in products[start:start + 3] if p.startswith(prefix)]
            result.append(suggestions)
        return result
```

```java
class Solution {
    public List<List<String>> suggestedProducts(String[] products, String searchWord) {
        Arrays.sort(products);
        List<List<String>> result = new ArrayList<>();
        String prefix = "";
        for (char ch : searchWord.toCharArray()) {
            prefix += ch;
            int start = lowerBound(products, prefix);
            List<String> suggestions = new ArrayList<>();
            for (int i = start; i < Math.min(start + 3, products.length); i++) {
                if (products[i].startsWith(prefix)) suggestions.add(products[i]);
            }
            result.add(suggestions);
        }
        return result;
    }

    // Index of the first product >= prefix (products.length when there is none).
    private int lowerBound(String[] products, String prefix) {
        int lo = 0, hi = products.length;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (products[mid].compareTo(prefix) < 0) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
}
```

```cpp
class Solution {
public:
    vector<vector<string>> suggestedProducts(vector<string>& products, string searchWord) {
        sort(products.begin(), products.end());
        vector<vector<string>> result;
        string prefix;
        for (char ch : searchWord) {
            prefix += ch;
            auto start = lower_bound(products.begin(), products.end(), prefix);  // first product >= prefix
            vector<string> suggestions;
            for (auto it = start; it != products.end() && it - start < 3; ++it) {
                if (it->compare(0, prefix.size(), prefix) == 0) suggestions.push_back(*it);
            }
            result.push_back(suggestions);
        }
        return result;
    }
};
```

```javascript
/**
 * @param {string[]} products
 * @param {string} searchWord
 * @return {string[][]}
 */
var suggestedProducts = function (products, searchWord) {
  products.sort();
  const result = [];
  let prefix = '';
  for (const ch of searchWord) {
    prefix += ch;
    // lower bound: first product >= prefix
    let lo = 0;
    let hi = products.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (products[mid] < prefix) lo = mid + 1;
      else hi = mid;
    }
    const suggestions = [];
    for (let i = lo; i < Math.min(lo + 3, products.length); i++) {
      if (products[i].startsWith(prefix)) suggestions.push(products[i]);
    }
    result.push(suggestions);
  }
  return result;
};
```

```go
import (
	"sort"
	"strings"
)

func suggestedProducts(products []string, searchWord string) [][]string {
	sort.Strings(products)
	result := [][]string{}
	prefix := ""
	for _, ch := range searchWord {
		prefix += string(ch)
		start := sort.SearchStrings(products, prefix) // first product >= prefix
		suggestions := []string{}
		for i := start; i < len(products) && i < start+3; i++ {
			if strings.HasPrefix(products[i], prefix) {
				suggestions = append(suggestions, products[i])
			}
		}
		result = append(result, suggestions)
	}
	return result
}
```
