---
title: Text Justification
leetcode: text-justification
description: "Text Justification explained: pack words greedily into lines of a fixed width and spread the spaces evenly, left gaps first, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a list of words `words` and a line width `maxWidth`. Lay the words out as text, in their original order, so that every line is exactly `maxWidth` characters long. Return the lines as a list of strings.

The rules are the ones a word processor uses for fully justified text:

- **Greedy packing.** Put as many words on a line as fit, with at least one space between neighbouring words, before starting the next line.
- **Even spacing.** On a normal line, add spaces between the words until the line is `maxWidth` long. Spread them as evenly as possible. When they do not divide evenly, the gaps on the left get one more space than the gaps on the right.
- **Single word.** A line holding just one word is left-aligned: the word, then spaces up to `maxWidth`.
- **Last line.** The final line is left-aligned too: words separated by exactly one space, then spaces up to `maxWidth`.

Words contain no spaces, every word has at least one character and no word is longer than `maxWidth`. There is at least one word.

## Examples

- `words = ["ab", "c", "de", "fghij"]`, `maxWidth = 10` → `["ab   c  de", "fghij     "]`. The first line has 5 letters, so it needs 5 spaces across 2 gaps: the left gap gets 3 and the right gap 2. The last line is left-aligned.
- `words = ["hello", "extraordinary", "ok"]`, `maxWidth = 13` → `["hello        ", "extraordinary", "ok           "]`. No two words fit together, so every line holds one word and is padded on the right.
- `words = ["we", "can", "solve", "this", "one", "line", "at", "a", "time"]`, `maxWidth = 11` → `["we      can", "solve  this", "one line at", "a time     "]`. Note that `"one line at"` already fills the width with single spaces, while the last line keeps single spaces even though it is short.

## Key idea

Split the work into two independent questions. First, **which words go on each line?** Greedy is correct: keep adding the next word while the words so far, plus one space between each pair, still fit in `maxWidth`. Second, **how is one line spaced?** Once you know the words on a line, the number of spaces is fixed: `maxWidth` minus the total letters. Dividing that number by the number of gaps gives the base width of every gap, and the remainder says how many gaps (counting from the left) get one extra space.

## Approach

1. Start with `i = 0`, the index of the first word of the current line.
2. Find the end of the line: let `j = i + 1` and `length = len(words[i])`. While `j` is a valid index and `length + 1 + len(words[j]) <= maxWidth`, add `1 + len(words[j])` to `length` and move `j` forward. The line holds `words[i..j-1]`, and `gaps = j - i - 1`.
3. If this is the last line (`j == n`) or the line has one word (`gaps == 0`), join the words with single spaces and pad the right side with spaces up to `maxWidth`.
4. Otherwise the line is fully justified:
   1. `letters = length - gaps` (remove the single spaces counted in step 2).
   2. `spaces = maxWidth - letters`, `base = spaces // gaps`, `extra = spaces % gaps`.
   3. Build the line word by word. After word number `k` (counting from 0 within the line, not after the last word), write `base` spaces, plus one more if `k < extra`.
5. Add the line to the answer, set `i = j` and repeat until all words are used.

## Complexity

- **Time:** O(L), where L is the total size of the output (number of lines times `maxWidth`). Each word is examined a constant number of times and each output character is written once.
- **Space:** O(L) for the returned lines; apart from the output only a few counters are used.

## Common mistakes

- Justifying the last line. It must keep single spaces and put all the padding at the end.
- Dividing by zero on a line with one word. Handle `gaps == 0` before computing `spaces / gaps`.
- Giving the extra spaces to the right gaps instead of the left ones.
- Forgetting the trailing padding on the last line or on single-word lines: every line, without exception, has length `maxWidth`.
- Off-by-one in the fit test: the next word needs one space in front of it, so the test is `length + 1 + len(next) <= maxWidth`.

## Follow-up questions

- How would you center each line instead? (Same packing; put half the padding on each side.)
- What if you wanted the layout with the most balanced line lengths instead of greedy packing? (That is the "word wrap" dynamic-programming problem, minimising the sum of squared trailing spaces.)

## Related problems

- Rearrange Spaces Between Words: the same space-splitting arithmetic for a single line.
- Sentence Screen Fitting: count how many times a sentence fits on a screen with greedy line packing.

## Solutions

```python
class Solution:
    def fullJustify(self, words: List[str], maxWidth: int) -> List[str]:
        lines = []
        n = len(words)
        i = 0
        while i < n:
            # Greedily take words while they fit with one space between each pair.
            j = i + 1
            length = len(words[i])
            while j < n and length + 1 + len(words[j]) <= maxWidth:
                length += 1 + len(words[j])
                j += 1
            gaps = j - i - 1
            if j == n or gaps == 0:
                # Last line or a single word: left-aligned, padded on the right.
                line = " ".join(words[i:j])
                lines.append(line + " " * (maxWidth - len(line)))
            else:
                spaces = maxWidth - (length - gaps)
                base, extra = divmod(spaces, gaps)
                parts = []
                for k in range(gaps):
                    parts.append(words[i + k])
                    parts.append(" " * (base + (1 if k < extra else 0)))
                parts.append(words[j - 1])
                lines.append("".join(parts))
            i = j
        return lines
```

```java
class Solution {
    public List<String> fullJustify(String[] words, int maxWidth) {
        List<String> lines = new ArrayList<>();
        int n = words.length;
        int i = 0;
        while (i < n) {
            // Greedily take words while they fit with one space between each pair.
            int j = i + 1;
            int length = words[i].length();
            while (j < n && length + 1 + words[j].length() <= maxWidth) {
                length += 1 + words[j].length();
                j++;
            }
            int gaps = j - i - 1;
            StringBuilder line = new StringBuilder();
            if (j == n || gaps == 0) {
                // Last line or a single word: left-aligned, padded on the right.
                for (int k = i; k < j; k++) {
                    if (k > i) line.append(' ');
                    line.append(words[k]);
                }
                while (line.length() < maxWidth) line.append(' ');
            } else {
                int spaces = maxWidth - (length - gaps);
                int base = spaces / gaps, extra = spaces % gaps;
                for (int k = 0; k < gaps; k++) {
                    line.append(words[i + k]);
                    line.append(" ".repeat(base + (k < extra ? 1 : 0)));
                }
                line.append(words[j - 1]);
            }
            lines.add(line.toString());
            i = j;
        }
        return lines;
    }
}
```

```cpp
class Solution {
public:
    vector<string> fullJustify(vector<string>& words, int maxWidth) {
        vector<string> lines;
        int n = words.size();
        int i = 0;
        while (i < n) {
            // Greedily take words while they fit with one space between each pair.
            int j = i + 1;
            int length = words[i].size();
            while (j < n && length + 1 + (int)words[j].size() <= maxWidth) {
                length += 1 + words[j].size();
                j++;
            }
            int gaps = j - i - 1;
            string line;
            if (j == n || gaps == 0) {
                // Last line or a single word: left-aligned, padded on the right.
                for (int k = i; k < j; k++) {
                    if (k > i) line += ' ';
                    line += words[k];
                }
                line += string(maxWidth - line.size(), ' ');
            } else {
                int spaces = maxWidth - (length - gaps);
                int base = spaces / gaps, extra = spaces % gaps;
                for (int k = 0; k < gaps; k++) {
                    line += words[i + k];
                    line += string(base + (k < extra ? 1 : 0), ' ');
                }
                line += words[j - 1];
            }
            lines.push_back(line);
            i = j;
        }
        return lines;
    }
};
```

```javascript
/**
 * @param {string[]} words
 * @param {number} maxWidth
 * @return {string[]}
 */
var fullJustify = function (words, maxWidth) {
  const lines = [];
  const n = words.length;
  let i = 0;
  while (i < n) {
    // Greedily take words while they fit with one space between each pair.
    let j = i + 1;
    let length = words[i].length;
    while (j < n && length + 1 + words[j].length <= maxWidth) {
      length += 1 + words[j].length;
      j++;
    }
    const gaps = j - i - 1;
    let line = "";
    if (j === n || gaps === 0) {
      // Last line or a single word: left-aligned, padded on the right.
      line = words.slice(i, j).join(" ");
      line += " ".repeat(maxWidth - line.length);
    } else {
      const spaces = maxWidth - (length - gaps);
      const base = Math.floor(spaces / gaps);
      const extra = spaces % gaps;
      for (let k = 0; k < gaps; k++) {
        line += words[i + k] + " ".repeat(base + (k < extra ? 1 : 0));
      }
      line += words[j - 1];
    }
    lines.push(line);
    i = j;
  }
  return lines;
};
```

```go
import "strings"

func fullJustify(words []string, maxWidth int) []string {
	lines := []string{}
	n := len(words)
	i := 0
	for i < n {
		// Greedily take words while they fit with one space between each pair.
		j := i + 1
		length := len(words[i])
		for j < n && length+1+len(words[j]) <= maxWidth {
			length += 1 + len(words[j])
			j++
		}
		gaps := j - i - 1
		var line strings.Builder
		if j == n || gaps == 0 {
			// Last line or a single word: left-aligned, padded on the right.
			line.WriteString(strings.Join(words[i:j], " "))
			line.WriteString(strings.Repeat(" ", maxWidth-line.Len()))
		} else {
			spaces := maxWidth - (length - gaps)
			base, extra := spaces/gaps, spaces%gaps
			for k := 0; k < gaps; k++ {
				line.WriteString(words[i+k])
				pad := base
				if k < extra {
					pad++
				}
				line.WriteString(strings.Repeat(" ", pad))
			}
			line.WriteString(words[j-1])
		}
		lines = append(lines, line.String())
		i = j
	}
	return lines
}
```
