---
title: String Compression
leetcode: string-compression
description: "String Compression explained: rewrite runs of repeated characters as the character plus its count, in place in the same array, with a read pointer and a write pointer, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array of characters `chars`. Split it into *groups*: maximal runs of the same character next to each other. Compress the array by writing, for each group in order:

- the character itself, and
- if the group is longer than one, its length written out as decimal digits, one digit per array slot (a run of 12 becomes `'1'`, `'2'`).

The result must be written back into `chars` itself, starting at index 0, and the function returns the length of the compressed result. Whatever is left in the array after that length does not matter. Only a constant amount of extra memory may be used.

The array has at least one character. Characters can be letters, digits or symbols.

## Examples

- `chars = ["x","x","x","y","z","z"]` → returns `5`, and the array starts with `["x","3","y","z","2"]`. The single `y` gets no count.
- `chars = ["q"]` → returns `1`, the array stays `["q"]`.
- `chars` holds twelve `"m"` characters → returns `3`, the array starts with `["m","1","2"]`. The count 12 takes two slots.
- `chars = ["a","b","b","a"]` → returns `4`, giving `["a","b","2","a"]`. The two `a`s are not next to each other, so they are separate groups.

## Key idea

The compressed form is never longer than the part of the array it replaces: a group of length 1 becomes 1 slot, and a group of length `L ≥ 2` becomes 1 + (number of digits of `L`) slots, which is at most `L`. So we can read groups with one pointer and write their compressed form with a second pointer that never overtakes the first. Writing over characters we have already read is safe.

## Approach

1. Keep two indexes: `read` (start of the current group) and `write` (next free output slot). Both start at 0.
2. While `read < n`:
   1. Remember the character `c = chars[read]` and advance a second index `end` while `chars[end] == c`. The group length is `end - read`.
   2. Write `c` at `chars[write]` and move `write` forward.
   3. If the length is greater than 1, convert it to a string and write each digit into the next slots, moving `write` each time.
   4. Set `read = end` to jump to the next group.
3. Return `write`, the length of the compressed result.

Building the result in a new string and copying it back is simpler to write, but it uses O(n) extra memory, which the problem forbids.

## Complexity

- **Time:** O(n). Every character is read once while measuring its group, and the output is at most `n` writes.
- **Space:** O(1) extra. The digits of a count take at most a handful of characters (a group can be at most a few thousand long), and everything else is written in place.

## Common mistakes

- Writing `"a1"` for a single character. Groups of length 1 get no count.
- Writing a count of 12 as one slot holding `12` instead of two slots `'1'` and `'2'`.
- Forgetting the last group. Loops that only write a group when the character *changes* need an extra write after the loop; measuring each group with an inner loop avoids that.
- Returning the compressed string or the original length instead of the new length.

## Follow-up questions

- How would you decompress the result? Read a character, then read all following digits as the count, and repeat.
- What if a count could be written only when it saves space? That is exactly what happens here: a count is only ever written for groups of length 2 or more, where it never makes the output longer.

## Related problems

- Count and Say
- Encode and Decode Strings

## Solutions

```python
class Solution:
    def compress(self, chars: List[str]) -> int:
        n = len(chars)
        read = write = 0
        while read < n:
            end = read
            while end < n and chars[end] == chars[read]:
                end += 1
            chars[write] = chars[read]
            write += 1
            if end - read > 1:
                for digit in str(end - read):
                    chars[write] = digit
                    write += 1
            read = end
        return write
```

```java
class Solution {
    public int compress(char[] chars) {
        int n = chars.length, read = 0, write = 0;
        while (read < n) {
            int end = read;
            while (end < n && chars[end] == chars[read]) end++;
            chars[write++] = chars[read];
            if (end - read > 1) {
                for (char digit : Integer.toString(end - read).toCharArray()) {
                    chars[write++] = digit;
                }
            }
            read = end;
        }
        return write;
    }
}
```

```cpp
class Solution {
public:
    int compress(vector<char>& chars) {
        int n = chars.size(), read = 0, write = 0;
        while (read < n) {
            int end = read;
            while (end < n && chars[end] == chars[read]) end++;
            chars[write++] = chars[read];
            if (end - read > 1) {
                for (char digit : to_string(end - read)) {
                    chars[write++] = digit;
                }
            }
            read = end;
        }
        return write;
    }
};
```

```javascript
/**
 * @param {character[]} chars
 * @return {number}
 */
var compress = function (chars) {
  const n = chars.length;
  let read = 0, write = 0;
  while (read < n) {
    let end = read;
    while (end < n && chars[end] === chars[read]) end++;
    chars[write++] = chars[read];
    if (end - read > 1) {
      for (const digit of String(end - read)) {
        chars[write++] = digit;
      }
    }
    read = end;
  }
  return write;
};
```

```go
import "strconv"

func compress(chars []byte) int {
	n, read, write := len(chars), 0, 0
	for read < n {
		end := read
		for end < n && chars[end] == chars[read] {
			end++
		}
		chars[write] = chars[read]
		write++
		if end-read > 1 {
			for _, digit := range []byte(strconv.Itoa(end - read)) {
				chars[write] = digit
				write++
			}
		}
		read = end
	}
	return write
}
```
