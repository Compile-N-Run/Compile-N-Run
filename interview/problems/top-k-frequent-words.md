---
title: Top K Frequent Words
leetcode: top-k-frequent-words
description: "Top K Frequent Words explained: return the k most common words, most frequent first and alphabetical on ties, by counting with a hash map and keeping a min-heap of size k, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array of lowercase words and an integer `k`. Return the `k` words that occur most often, ordered from most to least frequent. When two words occur the same number of times, the one that comes first alphabetically comes first in the answer.

`k` is always between 1 and the number of distinct words, so there are always enough words to return. Unlike many "top k" problems, the **order of the output matters** here.

## Examples

- `words = ["pear", "apple", "pear", "fig", "apple", "pear"]`, `k = 2` → `["pear", "apple"]`. "pear" appears 3 times, "apple" 2, "fig" 1.
- `words = ["b", "a", "b", "a"]`, `k = 2` → `["a", "b"]`. Both appear twice, so alphabetical order decides.
- `words = ["dog", "cat", "dog", "cat", "bird", "bird", "ant"]`, `k = 3` → `["bird", "cat", "dog"]`. Three words tie at 2; "ant" (1) is left out.
- `words = ["solo"]`, `k = 1` → `["solo"]`.

## Key idea

Count every word with a hash map, then pick the best `k` entries. Sorting all distinct words by `(count descending, word ascending)` works in O(n log n), but we can do better when `k` is small: keep a **min-heap of size `k`** whose top is the *weakest* word seen so far (lowest count; on a tie, the alphabetically later word). Push each distinct word; whenever the heap grows past `k`, pop the top, throwing away the weakest candidate. After all words have been offered, the heap holds exactly the `k` winners. Popping them yields weakest first, so reverse the result.

The trick is getting the comparison right: a word is *weaker* than another if its count is lower, **or** the counts are equal and it comes later alphabetically. That is the exact opposite of the output order, which is what a min-heap needs.

## Approach

1. Build `count`, a map from word to how many times it appears.
2. Create a heap ordered by "weaker first": lower count on top; for equal counts, the alphabetically larger word on top.
3. For each distinct word, push it into the heap. If the heap now holds more than `k` words, pop once.
4. Pop all `k` words into a list; they come out weakest first. Reverse the list and return it.

The all-sort alternative (sort the distinct words with the comparator `count desc, word asc` and take the first `k`) is shorter and fine in an interview if you mention that the heap version improves the `log` factor from `n` to `k`.

## Complexity

- **Time:** O(n log k) where `n` is the number of words: counting is O(n), and each of the at most `n` distinct words costs O(log k) heap work (string comparisons add a factor of the word length).
- **Space:** O(n) for the count map, plus O(k) for the heap.

## Common mistakes

- Using the output order (most frequent first) as the heap order. A min-heap must have the *weakest* candidate on top so that popping discards it, not the best one.
- Breaking ties the wrong way round in the heap: for equal counts the alphabetically *later* word must be popped first.
- Forgetting to reverse after popping, which returns the answer weakest first.
- In Python, putting `(-count, word)` tuples in the heap and popping `k` times is correct but it is a heap of size `n`, so it is the O(n log n) version. For the O(n log k) version the heap must stay at size `k`.

## Follow-up questions

- Can you do it in O(n log k) time and O(n) extra space? (That is the heap solution here; interviewers who see the sort version usually ask this.)
- What if the words arrive as a stream and you need the current top `k` at any time? (Keep the counts in a map and recompute the heap on demand, or maintain a balanced tree keyed by `(count, word)` and update it on every arrival.)
- How would you find the top `k` words in a file far larger than memory? (Hash each word to one of many files so equal words land together, count per file, then merge the per-file top `k` lists.)

## Related problems

- [Top K Frequent Elements](/interview/problems/top-k-frequent-elements/)
- [Kth Largest Element in an Array](/interview/problems/kth-largest-element-in-an-array/)
- Sort Characters By Frequency

## Solutions

```python
class Entry:
    """Heap item that puts the weakest word on top: lowest count, then alphabetically later."""

    def __init__(self, word: str, count: int):
        self.word, self.count = word, count

    def __lt__(self, other: 'Entry') -> bool:
        if self.count != other.count:
            return self.count < other.count
        return self.word > other.word


class Solution:
    def topKFrequent(self, words: List[str], k: int) -> List[str]:
        count = Counter(words)
        heap = []
        for word, c in count.items():
            heapq.heappush(heap, Entry(word, c))
            if len(heap) > k:
                heapq.heappop(heap)  # discard the weakest candidate
        result = [heapq.heappop(heap).word for _ in range(len(heap))]
        return result[::-1]  # popped weakest first
```

```java
class Solution {
    public List<String> topKFrequent(String[] words, int k) {
        Map<String, Integer> count = new HashMap<>();
        for (String word : words) {
            count.merge(word, 1, Integer::sum);
        }
        // Weakest word on top: lowest count, then alphabetically later.
        PriorityQueue<String> heap = new PriorityQueue<>((a, b) ->
            !count.get(a).equals(count.get(b)) ? count.get(a) - count.get(b) : b.compareTo(a));
        for (String word : count.keySet()) {
            heap.offer(word);
            if (heap.size() > k) {
                heap.poll(); // discard the weakest candidate
            }
        }
        LinkedList<String> result = new LinkedList<>();
        while (!heap.isEmpty()) {
            result.addFirst(heap.poll()); // popped weakest first
        }
        return result;
    }
}
```

```cpp
class Solution {
public:
    vector<string> topKFrequent(vector<string>& words, int k) {
        unordered_map<string, int> count;
        for (const string& word : words) {
            count[word]++;
        }
        // Weakest word on top: lowest count, then alphabetically later.
        auto stronger = [](const pair<int, string>& a, const pair<int, string>& b) {
            return a.first > b.first || (a.first == b.first && a.second < b.second);
        };
        priority_queue<pair<int, string>, vector<pair<int, string>>, decltype(stronger)> heap(stronger);
        for (const auto& [word, c] : count) {
            heap.push({c, word});
            if ((int)heap.size() > k) {
                heap.pop();  // discard the weakest candidate
            }
        }
        vector<string> result(heap.size());
        for (int i = (int)heap.size() - 1; i >= 0; i--) {  // popped weakest first
            result[i] = heap.top().second;
            heap.pop();
        }
        return result;
    }
};
```

```javascript
/**
 * @param {string[]} words
 * @param {number} k
 * @return {string[]}
 */
var topKFrequent = function (words, k) {
  const count = new Map();
  for (const word of words) {
    count.set(word, (count.get(word) || 0) + 1);
  }
  // Weakest word on top: lowest count, then alphabetically later.
  const weaker = (a, b) => (count.get(a) !== count.get(b) ? count.get(a) < count.get(b) : a > b);
  const heap = [];
  const push = (word) => {
    heap.push(word);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!weaker(heap[i], heap[parent])) break;
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        let best = i;
        for (const child of [2 * i + 1, 2 * i + 2]) {
          if (child < heap.length && weaker(heap[child], heap[best])) best = child;
        }
        if (best === i) break;
        [heap[i], heap[best]] = [heap[best], heap[i]];
        i = best;
      }
    }
    return top;
  };

  for (const word of count.keys()) {
    push(word);
    if (heap.length > k) {
      pop(); // discard the weakest candidate
    }
  }
  const result = [];
  while (heap.length > 0) {
    result.push(pop()); // popped weakest first
  }
  return result.reverse();
};
```

```go
import (
	"container/heap"
)

type wordEntry struct {
	word  string
	count int
}

// wordHeap puts the weakest word on top: lowest count, then alphabetically later.
type wordHeap []wordEntry

func (h wordHeap) Len() int { return len(h) }
func (h wordHeap) Less(i, j int) bool {
	if h[i].count != h[j].count {
		return h[i].count < h[j].count
	}
	return h[i].word > h[j].word
}
func (h wordHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *wordHeap) Push(x interface{}) { *h = append(*h, x.(wordEntry)) }
func (h *wordHeap) Pop() interface{} {
	old := *h
	item := old[len(old)-1]
	*h = old[:len(old)-1]
	return item
}

func topKFrequent(words []string, k int) []string {
	count := make(map[string]int)
	for _, word := range words {
		count[word]++
	}
	h := &wordHeap{}
	for word, c := range count {
		heap.Push(h, wordEntry{word, c})
		if h.Len() > k {
			heap.Pop(h) // discard the weakest candidate
		}
	}
	result := make([]string, h.Len())
	for i := len(result) - 1; i >= 0; i-- { // popped weakest first
		result[i] = heap.Pop(h).(wordEntry).word
	}
	return result
}
```
