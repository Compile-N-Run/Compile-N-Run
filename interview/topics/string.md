---
title: String
topic: String
group: structures
description: "Strings in coding interviews: treating text as an array of characters, counting with a fixed-size table, building output with a builder instead of concatenation, and which problems to practise first."
---

## What it is

A string is a sequence of characters, and for interview purposes it is an array whose elements happen to be letters. Everything in the [Array](/interview/topics/array/) guide applies: index access, single passes with running state, two pointers from both ends, sliding windows. Three things are specific to strings and worth knowing cold:

1. **Immutability.** In Python, Java, JavaScript and Go a string cannot be changed in place. Every `s += c` copies the whole string, so a loop that appends one character at a time is O(n²). Build with a list of pieces and join at the end (Python, JavaScript), a `StringBuilder` (Java), a `std::string` with `push_back` (C++, which is mutable), or a `[]byte` / `strings.Builder` (Go).
2. **A small alphabet.** Most problems promise lowercase letters, or ASCII. Then a frequency table is an array of 26 or 128 integers, not a hash map, and "same letters in any order" becomes "same 26 counts".
3. **Characters are numbers.** `'c' - 'a'` is 2, so a letter maps to a table slot with one subtraction. Digits convert with `ch - '0'`. Keep an eye on the language: Python needs `ord`, JavaScript needs `charCodeAt`, Go iterates bytes unless you ask for runes.

## When to use it

- The input is text and the task is to validate it (palindrome, balanced, anagram), transform it (reverse words, compress, decode), or search it (longest substring with a property, pattern matching).
- The statement limits the alphabet ("consists of lowercase English letters"). That is a hint to use a fixed array for counts instead of a map.
- You need to compare two strings by content regardless of order: sort them, or compare their count tables.
- Output must be assembled piece by piece. Reach for a builder before you write a single `+=`.
- Substrings and subsequences appear. A substring is contiguous (window or two pointers); a subsequence is not (usually dynamic programming).
- Parsing is involved: numbers with signs, nested brackets, paths with `..`. These are stack problems in string clothing.

## How it works

The most reused string routine is the count-table check. Suppose you must decide whether two strings `a` and `b` are anagrams, meaning the same letters with the same multiplicities, lowercase only.

Make one array `count` of 26 zeros. Walk `a` and add one at `count[ch - 'a']` for each letter; walk `b` and subtract one. If any slot is non-zero at the end, the strings differ. Trace it on `a = "tea"`, `b = "eat"`:

| step | character | slot | count (showing only a, e, t) |
|---|---|---|---|
| add from `a` | t | 19 | a:0 e:0 t:1 |
| add | e | 4 | a:0 e:1 t:1 |
| add | a | 0 | a:1 e:1 t:1 |
| subtract from `b` | e | 4 | a:1 e:0 t:1 |
| subtract | a | 0 | a:0 e:0 t:1 |
| subtract | t | 19 | a:0 e:0 t:0 |

All zeros, so they are anagrams. Two lengths that differ can be rejected before counting. The same table, with a sliding window adding the character that enters and removing the one that leaves, is how "find every anagram of `p` inside `s`" and "smallest window containing all of `t`" are solved.

The second routine is the builder. To reverse the words of `"  the  sky is blue "` you do not shuffle characters; you split on whitespace, drop the empty pieces, and join the pieces in reverse order with single spaces. Thinking in pieces rather than characters keeps the code short and the edge cases (leading, trailing, repeated spaces) out of the way.

## Template

The skeleton below shows both routines: a 26-slot frequency table, and output assembled with a builder. The `main` runs it on a short example.

```python
def transform(s):
    """Scan s once, keep a letter count table, and build the output in pieces."""
    count = [0] * 26                  # lowercase letters only; use 128 for ASCII
    pieces = []                       # never do out += ch in a loop
    for ch in s:
        count[ord(ch) - ord('a')] += 1
        # problem-specific: decide what to emit for this character.
        # Example rule: keep a character the first time it is seen.
        if count[ord(ch) - ord('a')] == 1:
            pieces.append(ch)
    return "".join(pieces)


if __name__ == "__main__":
    print(transform("programming"))  # progamin
```

```java
public class Main {
    /** Scans s once, keeps a letter count table, and builds the output with a builder. */
    static String transform(String s) {
        int[] count = new int[26];             // lowercase letters only; use 128 for ASCII
        StringBuilder out = new StringBuilder(); // never do out += ch in a loop
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            count[ch - 'a']++;
            // problem-specific: decide what to emit for this character.
            // Example rule: keep a character the first time it is seen.
            if (count[ch - 'a'] == 1) {
                out.append(ch);
            }
        }
        return out.toString();
    }

    public static void main(String[] args) {
        System.out.println(transform("programming")); // progamin
    }
}
```

```cpp
#include <iostream>
#include <string>

// Scans s once, keeps a letter count table, and builds the output with push_back.
std::string transform(const std::string& s) {
    int count[26] = {0};   // lowercase letters only; use 128 for ASCII
    std::string out;       // std::string is mutable; push_back is amortised O(1)
    for (char ch : s) {
        count[ch - 'a']++;
        // problem-specific: decide what to emit for this character.
        // Example rule: keep a character the first time it is seen.
        if (count[ch - 'a'] == 1) {
            out.push_back(ch);
        }
    }
    return out;
}

int main() {
    std::cout << transform("programming") << '\n';  // progamin
}
```

```javascript
// Scans s once, keeps a letter count table, and builds the output in pieces.
function transform(s) {
  const count = new Array(26).fill(0); // lowercase letters only; use 128 for ASCII
  const pieces = [];                   // never do out += ch in a loop
  const base = "a".charCodeAt(0);
  for (const ch of s) {
    const slot = ch.charCodeAt(0) - base;
    count[slot]++;
    // problem-specific: decide what to emit for this character.
    // Example rule: keep a character the first time it is seen.
    if (count[slot] === 1) {
      pieces.push(ch);
    }
  }
  return pieces.join("");
}

console.log(transform("programming")); // progamin
```

```go
package main

import (
	"fmt"
	"strings"
)

// transform scans s once, keeps a letter count table, and builds the output with a Builder.
func transform(s string) string {
	var count [26]int        // lowercase letters only; use 128 for ASCII
	var out strings.Builder  // never do out += ch in a loop
	for i := 0; i < len(s); i++ {
		ch := s[i] // a byte; range over s instead if the input may hold multi-byte runes
		count[ch-'a']++
		// problem-specific: decide what to emit for this character.
		// Example rule: keep a character the first time it is seen.
		if count[ch-'a'] == 1 {
			out.WriteByte(ch)
		}
	}
	return out.String()
}

func main() {
	fmt.Println(transform("programming")) // progamin
}
```

## Variations

- **Two pointers from both ends** for palindromes and reversals: compare `s[l]` with `s[r]`, move inwards, skip characters the problem says to ignore.
- **Expand around the centre** for palindromic substrings: every palindrome has a middle (a character or a gap between two), so try all `2n - 1` centres and grow outwards.
- **Sorted key or count key** for grouping anagrams: the sorted string, or the 26 counts joined into a string, is the map key.
- **Sliding window with a count table** for "longest substring with at most k distinct", "minimum window containing t", "all anagrams of p in s".
- **Stack for nested structure**: brackets, `k[encoded]` strings, calculators, file paths.
- **Dynamic programming over two strings** (edit distance, longest common subsequence, regular expression matching): `dp[i][j]` describes prefixes `a[:i]` and `b[:j]`.

## Common mistakes

- Appending to a string inside a loop. It passes small tests and times out on large ones.
- Forgetting case: `'A' - 'a'` is not 0. Lowercase first if the problem is case-insensitive.
- Using a 26-slot table when the input can contain digits, spaces or punctuation. Read the constraints line.
- Treating characters as integers without converting: `"7" + 1` in JavaScript is `"71"`.
- Indexing by Unicode code point in Go with `s[i]`, which gives bytes. Fine for ASCII; wrong for accented text.
- Off-by-one on substring bounds: decide whether your end index is inclusive or exclusive and stick to it.

## Complexity

One pass with a fixed-size count table is O(n) time and O(1) extra space (26 or 128 counters, regardless of input length). Sorting a string costs O(n log n). Building output through a builder is O(n) total; repeated concatenation is O(n²). Comparing two strings is O(min length), which matters when you compare inside a loop.

## Where to start

1. [125. Valid Palindrome](/interview/problems/valid-palindrome/) — two pointers from the ends, skipping what is not alphanumeric.
2. [242. Valid Anagram](/interview/problems/valid-anagram/) — the 26-slot count table from this guide.
3. [14. Longest Common Prefix](/interview/problems/longest-common-prefix/) — compare column by column; stop at the first mismatch.
4. [151. Reverse Words in a String](/interview/problems/reverse-words-in-a-string/) — think in pieces, build with a joiner.
5. [443. String Compression](/interview/problems/string-compression/) — a write pointer on a character array; digits of a count written one by one.
6. [3. Longest Substring Without Repeating Characters](/interview/problems/longest-substring-without-repeating-characters/) — the first sliding-window-plus-table problem.
7. [49. Group Anagrams](/interview/problems/group-anagrams/) — a canonical key per string in a hash map.
8. [5. Longest Palindromic Substring](/interview/problems/longest-palindromic-substring/) — expand around every centre.
