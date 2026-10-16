---
title: Valid Palindrome
leetcode: valid-palindrome
description: "Valid Palindrome explained: check whether a string reads the same both ways after ignoring case and every non-alphanumeric character, using two pointers, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` made of printable ASCII characters. Decide whether it is a palindrome once you

- keep only letters and digits (drop spaces, punctuation and every other symbol), and
- treat uppercase and lowercase letters as the same.

Return `true` if the cleaned-up text reads the same forwards and backwards, and `false` otherwise. If nothing is left after cleaning, the empty text counts as a palindrome. The string has at least one character.

## Examples

- `s = "Step on no pets!"` → `true`. The cleaned text is `steponnopets`, which is the same reversed.
- `s = "Top spot 1"` → `false`. The cleaned text is `topspot1`; reversed it starts with `1`.
- `s = "?! ."` → `true`. No letters or digits remain, and the empty text is a palindrome.
- `s = "ab2a"` → `false`. Digits count as characters too, and `b` does not match `2`.

## Key idea

A palindrome check compares the first character with the last, the second with the second-to-last, and so on. Do exactly that with **two pointers**, one starting at each end, and simply step over any character that is not a letter or digit. Comparing lowercase versions handles the case rule. This way you never build the cleaned string.

## Approach

1. Set `left = 0` and `right = len(s) - 1`.
2. While `left < right`:
   1. Move `left` forward while it points at a non-alphanumeric character (and stays below `right`).
   2. Move `right` backward while it points at a non-alphanumeric character (and stays above `left`).
   3. If the lowercase characters at `left` and `right` differ, return `false`.
   4. Move both pointers one step inward.
3. If the pointers meet without a mismatch, return `true`.

The simpler alternative builds the cleaned lowercase string and compares it with its reverse. It is also O(n) time, but uses O(n) extra memory; interviewers often ask for the in-place version.

## Complexity

- **Time:** O(n). Each pointer moves across the string at most once.
- **Space:** O(1). Only two indexes are stored.

## Common mistakes

- Treating digits as punctuation and skipping them. `"ab2a"` is not a palindrome.
- Forgetting the `left < right` bound inside the skipping loops, which can run past the other pointer or off the end of a string like `"?! ."`.
- Comparing without lowercasing, so `"Aa"` is wrongly rejected.
- Using a locale- or Unicode-aware check where only ASCII letters and digits should count. With ASCII input this does not matter, but say which definition you use.

## Follow-up questions

- What if you may delete at most one character? (Valid Palindrome II: on the first mismatch, try skipping either side once.)
- How would you handle full Unicode text? (Normalise the string and use the language's Unicode letter/digit tests.)

## Related problems

- Valid Palindrome II: allow removing one character.
- [Palindrome Number](/interview/problems/palindrome-number/): the same question for the digits of an integer.
- Longest Palindromic Substring: find the longest palindrome inside a string.

## Solutions

```python
class Solution:
    def isPalindrome(self, s: str) -> bool:
        left, right = 0, len(s) - 1
        while left < right:
            while left < right and not s[left].isalnum():
                left += 1
            while left < right and not s[right].isalnum():
                right -= 1
            if s[left].lower() != s[right].lower():
                return False
            left += 1
            right -= 1
        return True
```

```java
class Solution {
    public boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) {
                left++;
            }
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) {
                right--;
            }
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}
```

```cpp
class Solution {
public:
    bool isPalindrome(string s) {
        int left = 0, right = (int)s.size() - 1;
        while (left < right) {
            // Cast to unsigned char: the <cctype> functions reject negative values.
            while (left < right && !isalnum((unsigned char)s[left])) left++;
            while (left < right && !isalnum((unsigned char)s[right])) right--;
            if (tolower((unsigned char)s[left]) != tolower((unsigned char)s[right])) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function (s) {
  const isAlnum = (ch) => /[a-z0-9]/i.test(ch);
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    while (left < right && !isAlnum(s[left])) left++;
    while (left < right && !isAlnum(s[right])) right--;
    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }
    left++;
    right--;
  }
  return true;
};
```

```go
func isPalindrome(s string) bool {
	left, right := 0, len(s)-1
	for left < right {
		for left < right && !isAlnum(s[left]) {
			left++
		}
		for left < right && !isAlnum(s[right]) {
			right--
		}
		if toLower(s[left]) != toLower(s[right]) {
			return false
		}
		left++
		right--
	}
	return true
}

func isAlnum(c byte) bool {
	return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0' && c <= '9'
}

func toLower(c byte) byte {
	if c >= 'A' && c <= 'Z' {
		return c + 'a' - 'A'
	}
	return c
}
```
