---
title: Word Search
leetcode: word-search
description: "Word Search explained: decide whether a word can be traced through neighbouring cells of a letter grid without reusing a cell, using depth-first search with backtracking, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a grid of letters `board` (`m` rows and `n` columns, both at least 1) and a string `word`. Return `true` if `word` can be spelled by a path through the grid, and `false` otherwise.

The path starts at any cell and moves one step at a time to a cell directly above, below, left or right (not diagonally). Each cell can be used at most once in the same path. Letters are case-sensitive, and the word has at least one character.

In Java the board is a `char[][]`, in C++ a `vector<vector<char>>`, in Go a `[][]byte`, and in Python and JavaScript a list of rows where each entry is a one-character string.

## Examples

Using this board:

```
C A T
O R E
D O G
```

- `word = "CARE"` → `true`: C (top left), A to its right, R below the A, E to the right of the R.
- `word = "DOGE"` → `true`: along the bottom row, then up from G to E.
- `word = "CODE"` → `false`. C, O, D can be found going down the left column, but no E touches that D.
- `word = "CAC"` → `false`. There is only one C, and a cell cannot be used twice.

## Key idea

Try every cell as a starting point and walk outwards with **depth-first search**: if the current cell matches the next letter, try to finish the rest of the word from each of its four neighbours. To stop the path from reusing a cell, mark it as "in use" before exploring further and restore it when you return. This undo step is called **backtracking**: a dead end leaves the grid exactly as it was, so other paths can still use those cells.

## Approach

1. Write a recursive helper `dfs(r, c, k)` that answers "can `word[k:]` be spelled starting at cell `(r, c)`?":
   1. If `k == len(word)`, every letter has been matched: return `true`.
   2. If `(r, c)` is outside the grid, or `board[r][c] != word[k]`, return `false`. (A cell that is in use holds a marker such as `#`, which never matches a letter.)
   3. Save the letter, overwrite the cell with `#`, and call `dfs` on the four neighbours with `k + 1`.
   4. Put the letter back and return whether any neighbour succeeded.
2. Call `dfs(r, c, 0)` for every cell and return `true` as soon as one call succeeds; otherwise return `false`.

Overwriting the cell in the board itself saves a separate `visited` grid. A separate boolean grid works just as well if you prefer not to touch the input.

## Complexity

- **Time:** O(m · n · 3^L), where L is the length of the word. Each of the m · n starting cells can launch a search whose branches multiply by at most 3 per letter (4 neighbours minus the cell you came from).
- **Space:** O(L) for the recursion stack; the marking is done in place.

## Common mistakes

- Forgetting to restore the cell after exploring it. A failed path then blocks cells that a later path needs.
- Marking cells as visited for the whole search instead of only for the current path.
- Checking `k == len(word)` *after* the bounds check: a word that ends on the grid's edge is then rejected when the search steps outside.
- Stopping after the first start cell whose letter matches. Other cells with the same letter may lead to the answer.

## Follow-up questions

- How can you prune the search? (Return `false` early if the board has fewer copies of some letter than the word needs; or reverse the word when its last letter is rarer than its first, so the search starts from fewer cells.)
- What if you must find many words in the same board? (Word Search II: put all words in a trie and search once.)

## Related problems

- Word Search II
- Number of Islands
- Surrounded Regions

## Solutions

```python
class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        rows, cols = len(board), len(board[0])

        def dfs(r: int, c: int, k: int) -> bool:
            if k == len(word):
                return True
            if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != word[k]:
                return False
            letter, board[r][c] = board[r][c], '#'  # mark as in use on this path
            found = dfs(r + 1, c, k + 1) or dfs(r - 1, c, k + 1) or dfs(r, c + 1, k + 1) or dfs(r, c - 1, k + 1)
            board[r][c] = letter  # backtrack
            return found

        return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))
```

```java
class Solution {
    public boolean exist(char[][] board, String word) {
        for (int r = 0; r < board.length; r++) {
            for (int c = 0; c < board[0].length; c++) {
                if (dfs(board, word, r, c, 0)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean dfs(char[][] board, String word, int r, int c, int k) {
        if (k == word.length()) {
            return true;
        }
        if (r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] != word.charAt(k)) {
            return false;
        }
        char letter = board[r][c];
        board[r][c] = '#'; // mark as in use on this path
        boolean found = dfs(board, word, r + 1, c, k + 1) || dfs(board, word, r - 1, c, k + 1)
            || dfs(board, word, r, c + 1, k + 1) || dfs(board, word, r, c - 1, k + 1);
        board[r][c] = letter; // backtrack
        return found;
    }
}
```

```cpp
class Solution {
    bool dfs(vector<vector<char>>& board, const string& word, int r, int c, int k) {
        if (k == (int)word.size()) {
            return true;
        }
        if (r < 0 || r >= (int)board.size() || c < 0 || c >= (int)board[0].size() || board[r][c] != word[k]) {
            return false;
        }
        char letter = board[r][c];
        board[r][c] = '#';  // mark as in use on this path
        bool found = dfs(board, word, r + 1, c, k + 1) || dfs(board, word, r - 1, c, k + 1) ||
                     dfs(board, word, r, c + 1, k + 1) || dfs(board, word, r, c - 1, k + 1);
        board[r][c] = letter;  // backtrack
        return found;
    }

public:
    bool exist(vector<vector<char>>& board, string word) {
        for (int r = 0; r < (int)board.size(); r++) {
            for (int c = 0; c < (int)board[0].size(); c++) {
                if (dfs(board, word, r, c, 0)) {
                    return true;
                }
            }
        }
        return false;
    }
};
```

```javascript
/**
 * @param {character[][]} board
 * @param {string} word
 * @return {boolean}
 */
var exist = function (board, word) {
  const rows = board.length, cols = board[0].length;
  const dfs = (r, c, k) => {
    if (k === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[k]) return false;
    const letter = board[r][c];
    board[r][c] = '#'; // mark as in use on this path
    const found = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
    board[r][c] = letter; // backtrack
    return found;
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
};
```

```go
func exist(board [][]byte, word string) bool {
	rows, cols := len(board), len(board[0])
	var dfs func(r, c, k int) bool
	dfs = func(r, c, k int) bool {
		if k == len(word) {
			return true
		}
		if r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] != word[k] {
			return false
		}
		letter := board[r][c]
		board[r][c] = '#' // mark as in use on this path
		found := dfs(r+1, c, k+1) || dfs(r-1, c, k+1) || dfs(r, c+1, k+1) || dfs(r, c-1, k+1)
		board[r][c] = letter // backtrack
		return found
	}
	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if dfs(r, c, 0) {
				return true
			}
		}
	}
	return false
}
```
