---
title: Word Ladder
leetcode: word-ladder
description: "Word Ladder explained: find the shortest chain of one-letter edits between two words with breadth-first search over a word set, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a start word `beginWord`, a target word `endWord` and a list of allowed words `wordList`. All words have the same length and use only lowercase English letters.

A *ladder* is a sequence of words that starts with `beginWord` and ends with `endWord`, where each word differs from the previous one in exactly one letter position, and every word after the first must come from `wordList`. The start word itself does not have to be in the list, but the target does.

Return the number of words in the shortest ladder (counting both `beginWord` and `endWord`), or `0` if no ladder exists. The two words are always different, and the list has no duplicates.

## Examples

- `beginWord = "cat"`, `endWord = "dog"`, `wordList = ["cot", "cog", "dog", "bat"]` → `4`, through `cat → cot → cog → dog`.
- `beginWord = "cold"`, `endWord = "warm"`, `wordList = ["cord", "card", "ward", "warm", "worm"]` → `5`, through `cold → cord → card → ward → warm`.
- `beginWord = "cat"`, `endWord = "dog"`, `wordList = ["cot", "cog", "bat"]` → `0`, because `"dog"` is not in the list, so no ladder can end there.

## Key idea

Think of every word as a point on a map, with a road between two words when they differ in one letter. The question becomes "what is the shortest path from `beginWord` to `endWord`?", and in a map where every road has the same length, breadth-first search (BFS) finds the shortest path: it explores all words one step away, then all words two steps away, and so on, so the first time it reaches `endWord` it has used the fewest steps.

We never build the map explicitly. To find the neighbours of a word, try changing each position to each of the 26 letters and keep the results that are in the word set.

## Approach

1. Put `wordList` in a hash set `words` for O(1) lookups. If `endWord` is not in it, return `0`.
2. Start a queue with `beginWord` and a step counter `steps = 1` (the ladder so far holds one word).
3. Process the queue level by level. For every word in the current level:
   1. For each position `i` and each letter `c` from `a` to `z`, build the word with position `i` replaced by `c`.
   2. If that word is `endWord`, return `steps + 1`.
   3. If it is in `words`, remove it from the set (so it is never visited twice) and add it to the queue.
4. After each level, add 1 to `steps`. If the queue empties, no ladder exists: return `0`.

The naive way to find neighbours compares the current word with every word in the list, which costs O(N · L) per word and O(N² · L) overall. Generating the 26 · L candidate edits is much faster when the list is large.

## Complexity

- **Time:** O(N · L² · 26), where N is the number of words and L their length: each word is dequeued at most once, it has 26 · L candidate edits, and building or hashing each candidate costs O(L).
- **Space:** O(N · L) for the word set and the queue.

## Common mistakes

- Returning the number of *edits* instead of the number of *words*. The ladder `cat → cot` has 2 words.
- Forgetting to mark words as visited. Without removing them from the set, BFS revisits words and can loop for a very long time.
- Marking a word visited when it is taken out of the queue instead of when it is added. That still works but lets the same word enter the queue many times.
- Assuming `beginWord` is in the list, or failing when it is.

## Follow-up questions

- Return every shortest ladder, not just its length (Word Ladder II): keep the parents of each word during BFS, then rebuild the paths.
- Speed it up with bidirectional BFS: grow one frontier from each end and always expand the smaller one, stopping when they meet.

## Related problems

- Word Ladder II
- Minimum Genetic Mutation
- Open the Lock

## Solutions

```python
class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        words = set(wordList)
        if endWord not in words:
            return 0
        queue = deque([beginWord])
        steps = 1
        while queue:
            for _ in range(len(queue)):
                word = queue.popleft()
                for i in range(len(word)):
                    for c in 'abcdefghijklmnopqrstuvwxyz':
                        nxt = word[:i] + c + word[i + 1:]
                        if nxt == endWord:
                            return steps + 1
                        if nxt in words:
                            words.remove(nxt)  # mark as visited
                            queue.append(nxt)
            steps += 1
        return 0
```

```java
class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        Set<String> words = new HashSet<>(wordList);
        if (!words.contains(endWord)) {
            return 0;
        }
        Deque<String> queue = new ArrayDeque<>();
        queue.add(beginWord);
        int steps = 1;
        while (!queue.isEmpty()) {
            for (int size = queue.size(); size > 0; size--) {
                char[] chars = queue.poll().toCharArray();
                for (int i = 0; i < chars.length; i++) {
                    char original = chars[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        chars[i] = c;
                        String next = new String(chars);
                        if (next.equals(endWord)) {
                            return steps + 1;
                        }
                        if (words.remove(next)) { // in the set: mark as visited
                            queue.add(next);
                        }
                    }
                    chars[i] = original;
                }
            }
            steps++;
        }
        return 0;
    }
}
```

```cpp
class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> words(wordList.begin(), wordList.end());
        if (!words.count(endWord)) {
            return 0;
        }
        queue<string> q;
        q.push(beginWord);
        int steps = 1;
        while (!q.empty()) {
            for (int size = q.size(); size > 0; size--) {
                string word = q.front();
                q.pop();
                for (size_t i = 0; i < word.size(); i++) {
                    char original = word[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        word[i] = c;
                        if (word == endWord) {
                            return steps + 1;
                        }
                        if (words.erase(word)) {  // in the set: mark as visited
                            q.push(word);
                        }
                    }
                    word[i] = original;
                }
            }
            steps++;
        }
        return 0;
    }
};
```

```javascript
/**
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @return {number}
 */
var ladderLength = function (beginWord, endWord, wordList) {
  const words = new Set(wordList);
  if (!words.has(endWord)) {
    return 0;
  }
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let level = [beginWord];
  let steps = 1;
  while (level.length) {
    const nextLevel = [];
    for (const word of level) {
      for (let i = 0; i < word.length; i++) {
        for (const c of letters) {
          const next = word.slice(0, i) + c + word.slice(i + 1);
          if (next === endWord) {
            return steps + 1;
          }
          if (words.has(next)) {
            words.delete(next); // mark as visited
            nextLevel.push(next);
          }
        }
      }
    }
    level = nextLevel;
    steps++;
  }
  return 0;
};
```

```go
func ladderLength(beginWord string, endWord string, wordList []string) int {
	words := make(map[string]bool, len(wordList))
	for _, w := range wordList {
		words[w] = true
	}
	if !words[endWord] {
		return 0
	}
	level := []string{beginWord}
	for steps := 1; len(level) > 0; steps++ {
		var nextLevel []string
		for _, word := range level {
			b := []byte(word)
			for i := range b {
				original := b[i]
				for c := byte('a'); c <= 'z'; c++ {
					b[i] = c
					next := string(b)
					if next == endWord {
						return steps + 1
					}
					if words[next] {
						delete(words, next) // mark as visited
						nextLevel = append(nextLevel, next)
					}
				}
				b[i] = original
			}
		}
		level = nextLevel
	}
	return 0
}
```
