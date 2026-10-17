---
title: Zigzag Conversion
leetcode: zigzag-conversion
description: "Zigzag Conversion explained: write a string down and up across a given number of rows, then read it row by row, by appending each character to its row while a direction flag bounces, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` and a number of rows `numRows`. Imagine writing `s` in a zigzag: the first character goes in row 0, the next ones go **down** one row at a time until the last row, then the characters climb back **up** diagonally to row 0, then down again, and so on until the string runs out.

Return the string you get by reading the rows from top to bottom, each row left to right. With `numRows = 1` nothing moves, so the answer is `s` itself. `s` has at least one character and `numRows` is at least 1.

## Examples

- `s = "ABCDEFGHIJ"`, `numRows = 3` → `"AEIBDFHJCG"`. Laid out in a zigzag:

```
A   E   I
B D F H J
C   G
```

- `s = "ABCD"`, `numRows = 2` → `"ACBD"`. With two rows the characters simply alternate: A and C on top, B and D below.
- `s = "HELLO"`, `numRows = 1` → `"HELLO"`. A single row changes nothing.
- `s = "AB"`, `numRows = 5` → `"AB"`. When there are at least as many rows as characters, every character gets its own row, so the order is unchanged.
- `s = "ABCDEFGH"`, `numRows = 7` → `"ABCDEFHG"`. The walk goes down to row 6 (G) and the last character H climbs back to row 5, so H is read before G.

## Key idea

You never need the two-dimensional picture, only which **row** each character lands in. The row index walks `0, 1, ..., numRows-1, numRows-2, ..., 1, 0, 1, ...`, like a ball bouncing between the top and bottom rows. Keep one string builder per row, walk through `s` while bouncing a row counter, and append each character to its row. The answer is the rows glued together.

## Approach

1. If `numRows == 1` (or `numRows >= len(s)`), return `s` unchanged. Those cases have no zigzag, and the `numRows == 1` case would otherwise make the direction flip on every character.
2. Create `numRows` empty row builders, a current row `row = 0`, and a direction `step = 1` (moving down).
3. For each character `c` in `s`:
   1. Append `c` to row `row`.
   2. If `row` is the top row, set `step = 1`; if it is the bottom row, set `step = -1`.
   3. Move: `row += step`.
4. Concatenate the rows in order and return the result.

An index-arithmetic version avoids the row buffers: characters in row `r` sit at positions `r`, `r + cycle`, `r + 2·cycle`, ... with `cycle = 2·(numRows - 1)`, and the middle rows also get `k·cycle - r`. It uses O(1) extra space besides the output, but the bouncing counter is easier to get right under pressure.

## Complexity

- **Time:** O(n). Each character is appended once and the rows are concatenated once.
- **Space:** O(n) for the row buffers, which together hold every character of `s`.

## Common mistakes

- Not special-casing `numRows == 1`. The direction flips on every character (the top row is also the bottom row), so the code either loops forever or indexes row `-1`.
- Flipping the direction *before* appending instead of after. The first character must land in row 0 and the row-0 and bottom-row characters must be appended before the turn.
- Building the layout as a real grid with gaps. The problem only asks for the reading order, and a grid wastes O(n · numRows) memory.
- Off-by-one in the index-arithmetic version: the cycle length is `2·(numRows - 1)`, not `2·numRows`, and the top and bottom rows do not get the diagonal extra character.

## Follow-up questions

- *Can you compute the result without any extra buffers?* Yes, with the index-arithmetic version: for each row `r`, walk `i = r; i < n; i += cycle` and also emit `i + cycle - 2r` when `r` is a middle row and that index is in range.
- *How would you reverse it, recovering `s` from the zigzag string and `numRows`?* Compute how many characters each row holds (same loop, counting instead of appending), split the zigzag string into rows of those lengths, then replay the bouncing walk and pull the next character from each row as you visit it.

## Related problems

- [String Compression](/interview/problems/string-compression/): another string problem that is purely about careful indexing.
- [Reverse Words in a String](/interview/problems/reverse-words-in-a-string/): rearranging a string by walking it once.
- [Spiral Matrix](/interview/problems/spiral-matrix/): reading a two-dimensional layout in a fixed order.

## Solutions

```python
class Solution:
    def convert(self, s: str, numRows: int) -> str:
        if numRows == 1 or numRows >= len(s):
            return s
        rows = [[] for _ in range(numRows)]
        row, step = 0, 1
        for c in s:
            rows[row].append(c)
            if row == 0:
                step = 1  # bounce off the top
            elif row == numRows - 1:
                step = -1  # bounce off the bottom
            row += step
        return ''.join(''.join(r) for r in rows)
```

```java
class Solution {
    public String convert(String s, int numRows) {
        if (numRows == 1 || numRows >= s.length()) {
            return s;
        }
        StringBuilder[] rows = new StringBuilder[numRows];
        for (int i = 0; i < numRows; i++) {
            rows[i] = new StringBuilder();
        }
        int row = 0, step = 1;
        for (char c : s.toCharArray()) {
            rows[row].append(c);
            if (row == 0) {
                step = 1; // bounce off the top
            } else if (row == numRows - 1) {
                step = -1; // bounce off the bottom
            }
            row += step;
        }
        StringBuilder out = new StringBuilder();
        for (StringBuilder r : rows) {
            out.append(r);
        }
        return out.toString();
    }
}
```

```cpp
class Solution {
public:
    string convert(string s, int numRows) {
        if (numRows == 1 || numRows >= (int) s.size()) {
            return s;
        }
        vector<string> rows(numRows);
        int row = 0, step = 1;
        for (char c : s) {
            rows[row] += c;
            if (row == 0) {
                step = 1;  // bounce off the top
            } else if (row == numRows - 1) {
                step = -1;  // bounce off the bottom
            }
            row += step;
        }
        string out;
        for (const string& r : rows) {
            out += r;
        }
        return out;
    }
};
```

```javascript
/**
 * @param {string} s
 * @param {number} numRows
 * @return {string}
 */
var convert = function (s, numRows) {
  if (numRows === 1 || numRows >= s.length) {
    return s;
  }
  const rows = Array.from({ length: numRows }, () => []);
  let row = 0;
  let step = 1;
  for (const c of s) {
    rows[row].push(c);
    if (row === 0) {
      step = 1; // bounce off the top
    } else if (row === numRows - 1) {
      step = -1; // bounce off the bottom
    }
    row += step;
  }
  return rows.map((r) => r.join('')).join('');
};
```

```go
import "strings"

func convert(s string, numRows int) string {
	if numRows == 1 || numRows >= len(s) {
		return s
	}
	rows := make([]strings.Builder, numRows)
	row, step := 0, 1
	for i := 0; i < len(s); i++ {
		rows[row].WriteByte(s[i])
		if row == 0 {
			step = 1 // bounce off the top
		} else if row == numRows-1 {
			step = -1 // bounce off the bottom
		}
		row += step
	}
	var out strings.Builder
	for i := range rows {
		out.WriteString(rows[i].String())
	}
	return out.String()
}
```
