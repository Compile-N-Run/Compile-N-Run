---
title: Alien Dictionary
leetcode: alien-dictionary
description: "Alien Dictionary explained: recover the letter order of an unknown alphabet from a sorted list of words by turning each adjacent pair into a graph edge and running a topological sort (Kahn's algorithm), with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

An alien language uses the same lowercase letters as English, but its alphabet is in an unknown order. You are given a list of words that is sorted according to that alphabet (the way a dictionary is sorted), using the usual rule that a word comes before any longer word it is a prefix of. Reconstruct an order of the letters that is consistent with the list and return it as a string containing every letter that appears in the words exactly once.

If the list contradicts itself (no alphabet could produce that ordering), return the empty string. If several alphabets are consistent, any one of them is accepted. This is a LeetCode Premium problem, but it is asked often enough to be worth knowing.

## Examples

- `["ba", "bc", "ac", "cab"]` → `"bac"`. `ba < bc` tells us `a < c`; `bc < ac` tells us `b < a`. Chaining them gives `b, a, c`.
- `["zy", "zx"]` → `"zyx"`. The first difference is at the second letter, so `y < x`; `z` has no constraint and may go anywhere (`"yxz"` and `"yzx"` are also correct).
- `["ab", "abc"]` → `"abc"` or any other order of `a, b, c`. A prefix comes first, which is consistent, and it gives no information about the letters.
- `["abc", "ab"]` → `""`. A word before its own prefix is impossible.
- `["q", "w", "q"]` → `""`. `q < w` and `w < q` form a cycle.

## Key idea

Only the first position where two *adjacent* words differ carries information: if `word[i]` and `word[i + 1]` first differ at characters `a` and `b`, then `a` comes before `b` in the alien alphabet, and the rest of the two words says nothing. Comparing non-adjacent words adds nothing, because sorting is transitive. Each such fact is an edge `a → b` in a directed graph on the letters. An alphabet consistent with all facts is exactly a **topological order** of that graph, and a cycle means no alphabet exists. Kahn's algorithm (repeatedly removing a node with no incoming edges) produces the order and detects cycles at the same time.

## Approach

1. Collect every letter that appears in any word; each is a node with in-degree 0 to start with.
2. For each adjacent pair `(w1, w2)`:
   1. Walk both words until the first differing position. Add an edge `w1[k] → w2[k]` (only once, so the in-degree is not counted twice) and stop.
   2. If no position differs and `w1` is longer than `w2`, the input is invalid: return `""`.
3. Put every node with in-degree 0 into a queue.
4. While the queue is not empty: pop a letter, append it to the answer, and decrement the in-degree of each neighbour; any neighbour that reaches 0 joins the queue.
5. If the answer contains fewer letters than the graph has nodes, a cycle kept some letters stuck with a positive in-degree: return `""`. Otherwise return the answer.

A depth-first search with "visiting / visited" colours also works (post-order reversed gives the order, a back edge means a cycle); Kahn's version is usually easier to get right under interview pressure.

## Complexity

- **Time:** O(C) where `C` is the total number of characters in all words. Each adjacent pair is scanned once, and the topological sort is linear in the graph, which has at most 26 nodes and at most one edge per pair of words.
- **Space:** O(1) in practice, since there are at most 26 letters and 26 × 26 possible edges, or O(V + E) in general.

## Common mistakes

- Missing the prefix rule: `["abc", "ab"]` must return `""`, but a loop that only looks for a differing character finds none and reports success.
- Adding the same edge twice (two different pairs may yield `a → b`) and incrementing the in-degree twice; the node then never reaches 0 and the result is wrongly reported as a cycle. Store edges in a set, or check before adding.
- Forgetting letters that appear in only one word or only inside otherwise identical words: they have no edges but still belong in the output.
- Comparing every pair of words instead of adjacent ones. It is not wrong, but it is O(n²) and adds only redundant edges.
- Returning the partial order when a cycle is detected instead of `""`.

## Follow-up questions

- How would you make the answer deterministic, say the lexicographically smallest valid order? (Replace the queue with a min-heap.)
- Given the recovered alphabet, how do you check whether another list of words is sorted? (Verifying an Alien Dictionary: map letters to ranks and compare adjacent words.)
- What changes if the alphabet is much larger than 26 symbols? (Use hash maps instead of fixed arrays; the algorithm is unchanged.)

## Related problems

- [Course Schedule](/interview/problems/course-schedule/) (cycle detection with the same topological sort)
- [Course Schedule II](/interview/problems/course-schedule-ii/) (returns the order itself)
- Verifying an Alien Dictionary
- Sequence Reconstruction

## Solutions

```python
class Solution:
    def alienOrder(self, words: List[str]) -> str:
        graph = {c: set() for word in words for c in word}
        indegree = {c: 0 for c in graph}
        for w1, w2 in zip(words, words[1:]):
            for a, b in zip(w1, w2):
                if a != b:
                    if b not in graph[a]:  # add each edge only once
                        graph[a].add(b)
                        indegree[b] += 1
                    break
            else:  # no differing character: w1 is a prefix of w2 or equal to it
                if len(w1) > len(w2):
                    return ''
        queue = deque(c for c in graph if indegree[c] == 0)
        order = []
        while queue:
            c = queue.popleft()
            order.append(c)
            for nxt in graph[c]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)
        return ''.join(order) if len(order) == len(graph) else ''
```

```java
class Solution {
    public String alienOrder(String[] words) {
        boolean[] present = new boolean[26];
        boolean[][] edge = new boolean[26][26];
        int[] indegree = new int[26];
        for (String word : words) {
            for (char c : word.toCharArray()) present[c - 'a'] = true;
        }
        for (int i = 0; i + 1 < words.length; i++) {
            String w1 = words[i], w2 = words[i + 1];
            int k = 0, len = Math.min(w1.length(), w2.length());
            while (k < len && w1.charAt(k) == w2.charAt(k)) k++;
            if (k == len) {
                if (w1.length() > w2.length()) return ""; // a word before its own prefix
                continue;
            }
            int a = w1.charAt(k) - 'a', b = w2.charAt(k) - 'a';
            if (!edge[a][b]) { // add each edge only once
                edge[a][b] = true;
                indegree[b]++;
            }
        }
        Deque<Integer> queue = new ArrayDeque<>();
        int letters = 0;
        for (int c = 0; c < 26; c++) {
            if (present[c]) {
                letters++;
                if (indegree[c] == 0) queue.add(c);
            }
        }
        StringBuilder order = new StringBuilder();
        while (!queue.isEmpty()) {
            int c = queue.poll();
            order.append((char) ('a' + c));
            for (int nxt = 0; nxt < 26; nxt++) {
                if (edge[c][nxt] && --indegree[nxt] == 0) queue.add(nxt);
            }
        }
        return order.length() == letters ? order.toString() : "";
    }
}
```

```cpp
class Solution {
public:
    string alienOrder(vector<string>& words) {
        bool present[26] = {}, edge[26][26] = {};
        int indegree[26] = {};
        for (const string& word : words) {
            for (char c : word) present[c - 'a'] = true;
        }
        for (size_t i = 0; i + 1 < words.size(); i++) {
            const string &w1 = words[i], &w2 = words[i + 1];
            size_t k = 0, len = min(w1.size(), w2.size());
            while (k < len && w1[k] == w2[k]) k++;
            if (k == len) {
                if (w1.size() > w2.size()) return "";  // a word before its own prefix
                continue;
            }
            int a = w1[k] - 'a', b = w2[k] - 'a';
            if (!edge[a][b]) {  // add each edge only once
                edge[a][b] = true;
                indegree[b]++;
            }
        }
        queue<int> q;
        int letters = 0;
        for (int c = 0; c < 26; c++) {
            if (present[c]) {
                letters++;
                if (indegree[c] == 0) q.push(c);
            }
        }
        string order;
        while (!q.empty()) {
            int c = q.front();
            q.pop();
            order += char('a' + c);
            for (int nxt = 0; nxt < 26; nxt++) {
                if (edge[c][nxt] && --indegree[nxt] == 0) q.push(nxt);
            }
        }
        return (int)order.size() == letters ? order : "";
    }
};
```

```javascript
/**
 * @param {string[]} words
 * @return {string}
 */
var alienOrder = function (words) {
  const graph = new Map();
  const indegree = new Map();
  for (const word of words) {
    for (const c of word) {
      if (!graph.has(c)) {
        graph.set(c, new Set());
        indegree.set(c, 0);
      }
    }
  }
  for (let i = 0; i + 1 < words.length; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    const len = Math.min(w1.length, w2.length);
    let k = 0;
    while (k < len && w1[k] === w2[k]) k++;
    if (k === len) {
      if (w1.length > w2.length) return ''; // a word before its own prefix
      continue;
    }
    const a = w1[k];
    const b = w2[k];
    if (!graph.get(a).has(b)) {
      // add each edge only once
      graph.get(a).add(b);
      indegree.set(b, indegree.get(b) + 1);
    }
  }
  const queue = [];
  for (const [c, deg] of indegree) {
    if (deg === 0) queue.push(c);
  }
  let order = '';
  for (let head = 0; head < queue.length; head++) {
    const c = queue[head];
    order += c;
    for (const nxt of graph.get(c)) {
      indegree.set(nxt, indegree.get(nxt) - 1);
      if (indegree.get(nxt) === 0) queue.push(nxt);
    }
  }
  return order.length === graph.size ? order : '';
};
```

```go
func alienOrder(words []string) string {
	var present [26]bool
	var edge [26][26]bool
	var indegree [26]int
	for _, word := range words {
		for i := 0; i < len(word); i++ {
			present[word[i]-'a'] = true
		}
	}
	for i := 0; i+1 < len(words); i++ {
		w1, w2 := words[i], words[i+1]
		k, n := 0, min(len(w1), len(w2))
		for k < n && w1[k] == w2[k] {
			k++
		}
		if k == n {
			if len(w1) > len(w2) { // a word before its own prefix
				return ""
			}
			continue
		}
		a, b := w1[k]-'a', w2[k]-'a'
		if !edge[a][b] { // add each edge only once
			edge[a][b] = true
			indegree[b]++
		}
	}
	queue, letters := []int{}, 0
	for c := 0; c < 26; c++ {
		if present[c] {
			letters++
			if indegree[c] == 0 {
				queue = append(queue, c)
			}
		}
	}
	order := make([]byte, 0, letters)
	for len(queue) > 0 {
		c := queue[0]
		queue = queue[1:]
		order = append(order, byte('a'+c))
		for nxt := 0; nxt < 26; nxt++ {
			if edge[c][nxt] {
				indegree[nxt]--
				if indegree[nxt] == 0 {
					queue = append(queue, nxt)
				}
			}
		}
	}
	if len(order) != letters {
		return ""
	}
	return string(order)
}
```
