---
title: Reverse Words in a String
leetcode: reverse-words-in-a-string
description: "Reverse Words in a String explained: reverse the order of words while dropping extra spaces by splitting on whitespace and joining in reverse, plus the in-place two-reversal trick, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` made of English letters, digits and spaces. A *word* is a maximal run of non-space characters. Return a new string containing the same words in **reverse order**, separated by exactly one space.

The input may start or end with spaces and may have several spaces between two words; none of that extra spacing should appear in the output (no leading, trailing or doubled spaces). The words themselves are not changed, only their order. `s` contains at least one word.

## Examples

- `s = "  hello   big world "` → `"world big hello"`: the words are reversed and the extra spaces disappear.
- `s = "a"` → `"a"`: a single word stays as it is.
- `s = "code  2 run"` → `"run 2 code"`: digits form words too.
- `s = "   spaces  "` → `"spaces"`.

## Key idea

Think of the task in two parts: first find the words, then write them back in the opposite order. Every language has a "split on whitespace" tool that already ignores leading, trailing and repeated spaces and returns just the words; reversing that list and joining it with single spaces gives the answer directly. The interesting part in an interview is usually the follow-up: doing it **in place** on a character array. There the trick is a double reversal: reverse the whole string (which puts the words in the right order but spells each one backwards), then reverse each word again to fix its spelling, and finally squeeze out the extra spaces.

## Approach

1. Split `s` into words, treating any run of spaces as a single separator and ignoring spaces at either end.
2. Reverse the list of words.
3. Join the words with one space between neighbours and return the result.

Watch out for splitting on a single space character (for example `s.split(" ")` in Java or JavaScript): with repeated spaces it produces empty strings, which then turn into doubled spaces in the output. Trim the string and split on "one or more whitespace characters", or use a split that skips empty pieces.

In-place version (when the string is a mutable character array): reverse the entire array, then walk it and reverse each word, and copy characters forward so that only single spaces remain between words; the final length is where the copying stopped. It uses O(1) extra space.

## Complexity

- **Time:** O(n), where `n` is the length of `s`. Splitting, reversing and joining each touch every character a constant number of times.
- **Space:** O(n) for the list of words and the output string (O(1) extra for the in-place version, apart from the output in languages with immutable strings).

## Common mistakes

- Splitting on a single space and keeping the empty pieces, which leaves doubled, leading or trailing spaces in the result.
- Reversing the characters of the whole string and stopping there: `"big world"` becomes `"dlrow gib"`, not `"world big"`.
- Building the result with repeated string concatenation in a loop in Java, which copies the string each time; use a `StringBuilder` or a join.

## Follow-up questions

- Can you do it in place with O(1) extra memory? Use the reverse-everything-then-reverse-each-word trick described above (Reverse Words in a String II is the version where the input is already a character array without extra spaces).
- How would you reverse the letters inside each word but keep the word order? That is Reverse Words in a String III: just the second half of the trick.

## Related problems

- Reverse Words in a String II
- Reverse Words in a String III
- Rotate Array (the same "reverse the whole, then reverse the parts" trick)

## Solutions

```python
class Solution:
    def reverseWords(self, s: str) -> str:
        # split() with no argument drops leading, trailing and repeated spaces
        return " ".join(reversed(s.split()))
```

```java
class Solution {
    public String reverseWords(String s) {
        String[] words = s.trim().split("\\s+"); // trim first, or the split starts with an empty word
        StringBuilder out = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            out.append(words[i]);
            if (i > 0) out.append(' ');
        }
        return out.toString();
    }
}
```

```cpp
class Solution {
public:
    string reverseWords(string s) {
        istringstream in(s);  // >> skips any amount of whitespace
        vector<string> words;
        string word;
        while (in >> word) words.push_back(word);
        string out;
        for (int i = words.size() - 1; i >= 0; i--) {
            out += words[i];
            if (i > 0) out += ' ';
        }
        return out;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {string}
 */
var reverseWords = function (s) {
  // trim first, or the split starts or ends with an empty word
  return s.trim().split(/\s+/).reverse().join(' ');
};
```

```go
import "strings"

func reverseWords(s string) string {
	words := strings.Fields(s) // drops leading, trailing and repeated spaces
	for i, j := 0, len(words)-1; i < j; i, j = i+1, j-1 {
		words[i], words[j] = words[j], words[i]
	}
	return strings.Join(words, " ")
}
```
