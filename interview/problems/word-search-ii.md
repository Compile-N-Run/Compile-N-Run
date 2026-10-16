---
title: Word Search II
leetcode: word-search-ii
description: "Word Search II explained: find every dictionary word that can be traced through adjacent cells of a letter grid by walking the grid once with a trie and pruning matched branches, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a grid of lowercase letters (at most 12 × 12) and a list of distinct words (up to 30,000, each at most 10 letters). A word can be *traced* on the grid if you can spell it by starting at some cell and moving to a horizontally or vertically adjacent cell for each following letter, never using the same cell twice within that word. Different words may share cells.

Return every word from the list that can be traced. Any order is acceptable; each word appears at most once in the output even if it can be traced in several places.

## Examples

- Grid `["cat", "ore", "dog"]`, words `["care", "tar", "code", "god", "cac"]` → `["care", "tar", "god"]`. `care` runs c→a→r→e, `god` runs g→o→d along the bottom row backwards; `code` would need a second `o` next to `c`, and `cac` would reuse the `c`.
- Grid `["ab", "dc"]`, words `["ab", "abc", "abcd", "abcda"]` → `["ab", "abc", "abcd"]`. The first three are prefixes of one path around the square; `abcda` would need to come back to the used `a`.
- Grid `["a"]`, words `["a", "b", "aa"]` → `["a"]`. A one-cell grid can only spell one-letter words.
- Grid `["xyz", "qrs"]`, words `["hello"]` → `[]`.

## Key idea

Running the single-word search (Word Search) once per word is far too slow for 30,000 words: every word re-explores the same grid paths. Instead, put all the words into a **trie** (prefix tree) and explore the grid *once*. Walking from a cell, follow the trie at the same time as the grid: if the letters seen so far are not a prefix of any word, the trie has no matching child and the walk stops immediately. When the walk reaches a trie node that ends a word, record that word.

Two refinements keep it fast on big inputs: after a word is found, clear its marker so it is not reported again, and when a trie branch has no words left below it, delete it from its parent. The trie shrinks as words are found, and walks are cut off ever earlier.

## Approach

1. Build a trie: each node has a map (or 26-slot array) of children and a `word` field that holds the complete word at nodes where a word ends, else empty. Insert every word.
2. For every cell `(r, c)` of the grid, call `dfs(r, c, root)`.
3. `dfs(r, c, parent)`:
   1. Let `ch` be the letter at `(r, c)`. If `parent` has no child for `ch`, return: no word continues this way.
   2. Move to that child `node`. If `node.word` is set, add it to the result and clear `node.word`, so it is reported once.
   3. Mark the cell as in use (overwrite it with `'#'`), recurse into the four neighbours that are inside the grid, then restore the letter.
   4. **Prune:** if `node` now has no children (and its word has been collected), remove it from `parent`. Future walks will not waste time on that branch.
4. Return the collected words.

The brute force, "for each word run Word Search", is O(W · R · C · 4^L) for `W` words of length `L`; the trie makes the grid walk independent of `W` and the pruning makes it shrink as the search succeeds.

## Complexity

- **Time:** O(R · C · 4 · 3^(L−1)) in the worst case for the grid walk (first step has four directions, later steps at most three), plus O(total letters) to build the trie. In practice the trie cuts off most walks after a letter or two.
- **Space:** O(total letters in the word list) for the trie, plus O(L) recursion depth.

## Common mistakes

- Searching each word separately, which times out on the large tests.
- Returning duplicates when a word can be traced from several starting cells. Clearing `node.word` (or using a result set) fixes it.
- Forgetting to restore the cell letter after the recursion, so later walks see `'#'` and fail.
- Skipping the pruning step. The solution is still correct but can be an order of magnitude slower on grids full of repeated letters.
- Checking the trie only at the end of the walk instead of at every step, which loses the whole benefit of the prefix cut-off.

## Follow-up questions

- Why a trie instead of a hash set of all prefixes? (A prefix set also works for the cut-off, but it stores every prefix of every word and cannot prune matched branches as cheaply.)
- How would you also return the path of cells for each found word? (Carry the current path in the recursion and copy it when a word ends.)
- What if letters could be reused within a word, or moves could be diagonal? (Drop the in-use mark, or add four more directions; the trie part does not change.)

## Related problems

- [Word Search](/interview/problems/word-search/)
- [Word Break](/interview/problems/word-break/)
- [Number of Islands](/interview/problems/number-of-islands/) (the same grid walk without a dictionary)
- Implement Trie (Prefix Tree)
- Design Add and Search Words Data Structure

## Solutions

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.word = None  # the full word that ends here, if any


class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        root = TrieNode()
        for word in words:
            node = root
            for ch in word:
                node = node.children.setdefault(ch, TrieNode())
            node.word = word

        rows, cols, found = len(board), len(board[0]), []

        def dfs(r: int, c: int, parent: TrieNode) -> None:
            ch = board[r][c]
            node = parent.children.get(ch)
            if node is None:
                return  # no word continues with this letter
            if node.word is not None:
                found.append(node.word)
                node.word = None  # report each word once
            board[r][c] = '#'  # mark as in use on this path
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols:
                    dfs(nr, nc, node)
            board[r][c] = ch
            if not node.children:
                del parent.children[ch]  # prune: nothing left below this node

        for r in range(rows):
            for c in range(cols):
                dfs(r, c, root)
        return found
```

```java
class Solution {
    private static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        int childCount = 0;
        String word; // the full word that ends here, if any
    }

    private final List<String> found = new ArrayList<>();
    private char[][] board;

    public List<String> findWords(char[][] board, String[] words) {
        TrieNode root = new TrieNode();
        for (String word : words) {
            TrieNode node = root;
            for (char ch : word.toCharArray()) {
                int i = ch - 'a';
                if (node.children[i] == null) {
                    node.children[i] = new TrieNode();
                    node.childCount++;
                }
                node = node.children[i];
            }
            node.word = word;
        }
        this.board = board;
        for (int r = 0; r < board.length; r++) {
            for (int c = 0; c < board[0].length; c++) {
                dfs(r, c, root);
            }
        }
        return found;
    }

    private void dfs(int r, int c, TrieNode parent) {
        char ch = board[r][c];
        if (ch == '#' || parent.children[ch - 'a'] == null) {
            return; // cell in use, or no word continues with this letter
        }
        TrieNode node = parent.children[ch - 'a'];
        if (node.word != null) {
            found.add(node.word);
            node.word = null; // report each word once
        }
        board[r][c] = '#'; // mark as in use on this path
        if (r + 1 < board.length) dfs(r + 1, c, node);
        if (r > 0) dfs(r - 1, c, node);
        if (c + 1 < board[0].length) dfs(r, c + 1, node);
        if (c > 0) dfs(r, c - 1, node);
        board[r][c] = ch;
        if (node.childCount == 0) { // prune: nothing left below this node
            parent.children[ch - 'a'] = null;
            parent.childCount--;
        }
    }
}
```

```cpp
class Solution {
    struct TrieNode {
        TrieNode* children[26] = {};
        int childCount = 0;
        string word;  // the full word that ends here, if any
        bool hasWord = false;
    };

public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        TrieNode* root = new TrieNode();
        for (const string& word : words) {
            TrieNode* node = root;
            for (char ch : word) {
                if (!node->children[ch - 'a']) {
                    node->children[ch - 'a'] = new TrieNode();
                    node->childCount++;
                }
                node = node->children[ch - 'a'];
            }
            node->word = word;
            node->hasWord = true;
        }
        vector<string> found;
        for (int r = 0; r < (int)board.size(); r++) {
            for (int c = 0; c < (int)board[0].size(); c++) {
                dfs(board, r, c, root, found);
            }
        }
        return found;
    }

private:
    void dfs(vector<vector<char>>& board, int r, int c, TrieNode* parent, vector<string>& found) {
        char ch = board[r][c];
        if (ch == '#' || !parent->children[ch - 'a']) return;  // cell in use, or no word continues with this letter
        TrieNode* node = parent->children[ch - 'a'];
        if (node->hasWord) {
            found.push_back(node->word);
            node->hasWord = false;  // report each word once
        }
        board[r][c] = '#';  // mark as in use on this path
        if (r + 1 < (int)board.size()) dfs(board, r + 1, c, node, found);
        if (r > 0) dfs(board, r - 1, c, node, found);
        if (c + 1 < (int)board[0].size()) dfs(board, r, c + 1, node, found);
        if (c > 0) dfs(board, r, c - 1, node, found);
        board[r][c] = ch;
        if (node->childCount == 0) {  // prune: nothing left below this node
            delete node;
            parent->children[ch - 'a'] = nullptr;
            parent->childCount--;
        }
    }
};
```

```javascript
/**
 * @param {character[][]} board
 * @param {string[]} words
 * @return {string[]}
 */
var findWords = function (board, words) {
  const root = { children: new Map(), word: null };
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), word: null });
      node = node.children.get(ch);
    }
    node.word = word; // the full word that ends here
  }

  const rows = board.length;
  const cols = board[0].length;
  const found = [];
  const dfs = (r, c, parent) => {
    const ch = board[r][c];
    const node = parent.children.get(ch);
    if (!node) return; // cell in use ('#'), or no word continues with this letter
    if (node.word !== null) {
      found.push(node.word);
      node.word = null; // report each word once
    }
    board[r][c] = '#'; // mark as in use on this path
    if (r + 1 < rows) dfs(r + 1, c, node);
    if (r > 0) dfs(r - 1, c, node);
    if (c + 1 < cols) dfs(r, c + 1, node);
    if (c > 0) dfs(r, c - 1, node);
    board[r][c] = ch;
    if (node.children.size === 0) parent.children.delete(ch); // prune: nothing left below this node
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dfs(r, c, root);
    }
  }
  return found;
};
```

```go
type trieNode struct {
	children   [26]*trieNode
	childCount int
	word       string // the full word that ends here, if any
	hasWord    bool
}

func findWords(board [][]byte, words []string) []string {
	root := &trieNode{}
	for _, word := range words {
		node := root
		for i := 0; i < len(word); i++ {
			ch := word[i] - 'a'
			if node.children[ch] == nil {
				node.children[ch] = &trieNode{}
				node.childCount++
			}
			node = node.children[ch]
		}
		node.word = word
		node.hasWord = true
	}

	rows, cols := len(board), len(board[0])
	found := []string{}
	var dfs func(r, c int, parent *trieNode)
	dfs = func(r, c int, parent *trieNode) {
		ch := board[r][c]
		if ch == '#' || parent.children[ch-'a'] == nil {
			return // cell in use, or no word continues with this letter
		}
		node := parent.children[ch-'a']
		if node.hasWord {
			found = append(found, node.word)
			node.hasWord = false // report each word once
		}
		board[r][c] = '#' // mark as in use on this path
		if r+1 < rows {
			dfs(r+1, c, node)
		}
		if r > 0 {
			dfs(r-1, c, node)
		}
		if c+1 < cols {
			dfs(r, c+1, node)
		}
		if c > 0 {
			dfs(r, c-1, node)
		}
		board[r][c] = ch
		if node.childCount == 0 { // prune: nothing left below this node
			parent.children[ch-'a'] = nil
			parent.childCount--
		}
	}

	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			dfs(r, c, root)
		}
	}
	return found
}
```
