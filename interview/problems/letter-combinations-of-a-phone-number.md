---
title: Letter Combinations of a Phone Number
leetcode: letter-combinations-of-a-phone-number
description: "Letter Combinations of a Phone Number explained: list every string a sequence of phone keypad digits could spell, using backtracking to build one letter per digit, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

On an old phone keypad, each digit from 2 to 9 stands for a few letters:

| Digit | Letters | Digit | Letters |
|---|---|---|---|
| 2 | abc | 6 | mno |
| 3 | def | 7 | pqrs |
| 4 | ghi | 8 | tuv |
| 5 | jkl | 9 | wxyz |

You are given a string `digits` (at most 4 characters, each between `'2'` and `'9'`). Return every string that can be formed by choosing one letter for each digit, keeping the digits' order. The strings may be returned in any order. If `digits` is empty, return an empty list.

## Examples

- `digits = "56"` → `["jm", "jn", "jo", "km", "kn", "ko", "lm", "ln", "lo"]`. Each of the 3 letters of 5 pairs with each of the 3 letters of 6.
- `digits = "7"` → `["p", "q", "r", "s"]`.
- `digits = "29"` → 12 strings, from `"aw"`, `"ax"`, … up to `"cz"`: 3 choices times 4 choices.
- `digits = ""` → `[]`. No digits means no combinations (not a list holding one empty string).

## Key idea

Think of the answer as a tree of choices. At depth 0 you pick a letter for the first digit, at depth 1 a letter for the second digit, and so on; every path from the top to the bottom spells one combination. **Backtracking** walks this tree depth-first: append a letter, recurse to the next digit, then remove the letter and try the next one. When the partial string is as long as `digits`, it is a complete combination and gets added to the result.

## Approach

1. If `digits` is empty, return an empty list.
2. Keep a table from digit to letters, a list `result`, and a buffer `path` holding the letters chosen so far.
3. Define `backtrack(i)`, where `i` is the index of the next digit to handle:
   1. If `i == len(digits)`, add `path` (as a string) to `result` and return.
   2. Otherwise, for each letter mapped to `digits[i]`: append it to `path`, call `backtrack(i + 1)`, then remove it again.
4. Call `backtrack(0)` and return `result`.

An iterative version works too: start with `[""]` and, for each digit, replace the list with every existing string extended by each of that digit's letters.

## Complexity

- **Time:** O(4^n · n), where n is the number of digits. There are at most 4^n combinations and building each string costs O(n).
- **Space:** O(n) for the recursion and the path, not counting the output (which itself holds up to 4^n strings of length n).

## Common mistakes

- Returning `[""]` for empty input. The expected answer is an empty list.
- Forgetting that 7 and 9 have four letters, not three.
- Sharing one mutable buffer and adding the buffer itself to the result instead of a copy (or a string built from it), so every entry ends up identical.

## Follow-up questions

- How many results can there be at most? (4^n, so this approach is only reasonable for short inputs.)
- Can you produce the combinations lazily, one at a time, instead of building the whole list? (Use a generator, or count in a mixed-radix number system.)

## Related problems

- Generate Parentheses
- Combination Sum
- Subsets

## Solutions

```python
class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []
        keys = {'2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
                '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'}
        result, path = [], []

        def backtrack(i: int) -> None:
            if i == len(digits):
                result.append(''.join(path))
                return
            for letter in keys[digits[i]]:
                path.append(letter)
                backtrack(i + 1)
                path.pop()

        backtrack(0)
        return result
```

```java
class Solution {
    private static final String[] KEYS = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

    public List<String> letterCombinations(String digits) {
        List<String> result = new ArrayList<>();
        if (digits.isEmpty()) {
            return result;
        }
        backtrack(digits, 0, new StringBuilder(), result);
        return result;
    }

    private void backtrack(String digits, int i, StringBuilder path, List<String> result) {
        if (i == digits.length()) {
            result.add(path.toString());
            return;
        }
        for (char letter : KEYS[digits.charAt(i) - '0'].toCharArray()) {
            path.append(letter);
            backtrack(digits, i + 1, path, result);
            path.deleteCharAt(path.length() - 1);
        }
    }
}
```

```cpp
class Solution {
    const vector<string> keys = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

    void backtrack(const string& digits, int i, string& path, vector<string>& result) {
        if (i == (int)digits.size()) {
            result.push_back(path);
            return;
        }
        for (char letter : keys[digits[i] - '0']) {
            path.push_back(letter);
            backtrack(digits, i + 1, path, result);
            path.pop_back();
        }
    }

public:
    vector<string> letterCombinations(string digits) {
        vector<string> result;
        if (digits.empty()) {
            return result;
        }
        string path;
        backtrack(digits, 0, path, result);
        return result;
    }
};
```

```javascript
/**
 * @param {string} digits
 * @return {string[]}
 */
var letterCombinations = function (digits) {
  if (digits.length === 0) return [];
  const keys = ['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'];
  const result = [], path = [];
  const backtrack = (i) => {
    if (i === digits.length) {
      result.push(path.join(''));
      return;
    }
    for (const letter of keys[Number(digits[i])]) {
      path.push(letter);
      backtrack(i + 1);
      path.pop();
    }
  };
  backtrack(0);
  return result;
};
```

```go
func letterCombinations(digits string) []string {
	result := []string{}
	if len(digits) == 0 {
		return result
	}
	keys := []string{"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"}
	path := make([]byte, 0, len(digits))
	var backtrack func(i int)
	backtrack = func(i int) {
		if i == len(digits) {
			result = append(result, string(path))
			return
		}
		for _, letter := range []byte(keys[digits[i]-'0']) {
			path = append(path, letter)
			backtrack(i + 1)
			path = path[:len(path)-1]
		}
	}
	backtrack(0)
	return result
}
```
