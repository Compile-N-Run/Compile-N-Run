---
title: Integer to English Words
leetcode: integer-to-english-words
description: "Integer to English Words explained: spell a non-negative integer in English by splitting it into three-digit groups named Billion, Million and Thousand, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a non-negative integer `num` no larger than `2^31 - 1` (2,147,483,647). Return its English name as a string: words are capitalised, separated by single spaces, with no commas, hyphens or the word "and". Zero is spelled `"Zero"`.

## Examples

- `45` → `"Forty Five"`.
- `118` → `"One Hundred Eighteen"`. Numbers from 10 to 19 have their own words, so no "Ten Eight".
- `1000` → `"One Thousand"`. An all-zero group below the thousands produces nothing, not "Zero".
- `1000010` → `"One Million Ten"`. The thousands group is empty, so the word "Thousand" never appears.
- `2147483647` → `"Two Billion One Hundred Forty Seven Million Four Hundred Eighty Three Thousand Six Hundred Forty Seven"`.
- `0` → `"Zero"`.

## Key idea

English names numbers in groups of three digits. Every group is read the same way ("Four Hundred Eighty Three") and is then followed by the group's scale word: Billion, Million, Thousand, or nothing for the last group. So the whole problem reduces to one helper that spells a number from 1 to 999, applied up to four times. The only special case is the number 0 itself, because an empty group is normally silent.

## Approach

1. If `num` is 0, return `"Zero"` immediately.
2. Prepare three word tables: `ones[1..19]` ("One" … "Nineteen"), `tens[2..9]` ("Twenty" … "Ninety"), and the scales `["Billion", "Million", "Thousand", ""]`.
3. Write `belowThousand(n)` for `1 <= n <= 999`, appending words to a list:
   1. If `n >= 100`, append `ones[n / 100]` and `"Hundred"`, then keep `n % 100`.
   2. If `n >= 20`, append `tens[n / 10]`, then keep `n % 10`.
   3. If `n > 0`, append `ones[n]` (this also covers 1 to 19 in one step).
4. Walk the scales from the largest down with a divisor that starts at 1,000,000,000 and shrinks by 1,000 each step: `chunk = num / divisor`, `num %= divisor`. When `chunk` is not 0, spell it with `belowThousand` and append the scale word (unless it is the empty last one).
5. Join the words with single spaces.

Collecting words in a list and joining them at the end avoids the fiddly double-space and trailing-space bugs that come from concatenating strings with `" "` as you go.

## Complexity

- **Time:** O(1). A 32-bit integer has at most four groups, each spelled with a constant amount of work; in terms of digits it is O(d).
- **Space:** O(1) beyond the output string.

## Common mistakes

- Printing "Zero" for an empty middle group (`1000010` is not "One Million Zero Thousand Ten"), or emitting a scale word for an empty group ("One Million Thousand Ten").
- Treating 10 to 19 like other two-digit numbers and producing "Ten Five" instead of "Fifteen".
- Off-by-one spelling: "Fourty" (correct: "Forty"), "Ninty" (correct: "Ninety"), "Fourteen" vs "Forty".
- Extra or missing spaces from string concatenation; trim or, better, join a list of words.
- Forgetting the lone special case `num == 0`.

## Follow-up questions

- Spell negative numbers ("Negative ...") or numbers up to 64 bits (add "Trillion" and "Quadrillion" to the scale list; nothing else changes).
- Produce British style with "and" ("One Hundred and Eighteen") or hyphens ("Forty-Five").
- The reverse: parse English words back into a number.

## Related problems

- [Integer to Roman](/interview/problems/integer-to-roman/)
- [Roman to Integer](/interview/problems/roman-to-integer/)
- [String to Integer (atoi)](/interview/problems/string-to-integer-atoi/)

## Solutions

```python
class Solution:
    def numberToWords(self, num: int) -> str:
        if num == 0:
            return 'Zero'
        ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
                'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
        tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
        words = []

        def below_thousand(n: int) -> None:  # 1 <= n <= 999
            if n >= 100:
                words.extend([ones[n // 100], 'Hundred'])
                n %= 100
            if n >= 20:
                words.append(tens[n // 10])
                n %= 10
            if n > 0:
                words.append(ones[n])  # covers 1..19 in one step

        divisor = 1_000_000_000
        for scale in ('Billion', 'Million', 'Thousand', ''):
            chunk, num = divmod(num, divisor)
            divisor //= 1000
            if chunk:
                below_thousand(chunk)
                if scale:
                    words.append(scale)
        return ' '.join(words)
```

```java
class Solution {
    private static final String[] ONES = {"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"};
    private static final String[] TENS = {"", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"};
    private static final String[] SCALES = {"Billion", "Million", "Thousand", ""};

    public String numberToWords(int num) {
        if (num == 0) {
            return "Zero";
        }
        List<String> words = new ArrayList<>();
        int divisor = 1_000_000_000;
        for (String scale : SCALES) {
            int chunk = num / divisor;
            num %= divisor;
            divisor /= 1000;
            if (chunk > 0) {
                belowThousand(words, chunk);
                if (!scale.isEmpty()) {
                    words.add(scale);
                }
            }
        }
        return String.join(" ", words);
    }

    private void belowThousand(List<String> words, int n) { // 1 <= n <= 999
        if (n >= 100) {
            words.add(ONES[n / 100]);
            words.add("Hundred");
            n %= 100;
        }
        if (n >= 20) {
            words.add(TENS[n / 10]);
            n %= 10;
        }
        if (n > 0) {
            words.add(ONES[n]); // covers 1..19 in one step
        }
    }
}
```

```cpp
class Solution {
    const vector<string> ones = {"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"};
    const vector<string> tens = {"", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"};

    void belowThousand(vector<string>& words, int n) {  // 1 <= n <= 999
        if (n >= 100) {
            words.push_back(ones[n / 100]);
            words.push_back("Hundred");
            n %= 100;
        }
        if (n >= 20) {
            words.push_back(tens[n / 10]);
            n %= 10;
        }
        if (n > 0) {
            words.push_back(ones[n]);  // covers 1..19 in one step
        }
    }

public:
    string numberToWords(int num) {
        if (num == 0) {
            return "Zero";
        }
        vector<string> words;
        int divisor = 1000000000;
        for (const string& scale : {"Billion", "Million", "Thousand", ""}) {
            int chunk = num / divisor;
            num %= divisor;
            divisor /= 1000;
            if (chunk > 0) {
                belowThousand(words, chunk);
                if (!scale.empty()) {
                    words.push_back(scale);
                }
            }
        }
        string out;
        for (size_t i = 0; i < words.size(); i++) {
            out += (i ? " " : "") + words[i];
        }
        return out;
    }
};
```

```javascript
/**
 * @param {number} num
 * @return {string}
 */
var numberToWords = function (num) {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const words = [];

  const belowThousand = (n) => {
    // 1 <= n <= 999
    if (n >= 100) {
      words.push(ones[Math.floor(n / 100)], 'Hundred');
      n %= 100;
    }
    if (n >= 20) {
      words.push(tens[Math.floor(n / 10)]);
      n %= 10;
    }
    if (n > 0) words.push(ones[n]); // covers 1..19 in one step
  };

  let divisor = 1e9;
  for (const scale of ['Billion', 'Million', 'Thousand', '']) {
    const chunk = Math.floor(num / divisor);
    num %= divisor;
    divisor /= 1000;
    if (chunk > 0) {
      belowThousand(chunk);
      if (scale) words.push(scale);
    }
  }
  return words.join(' ');
};
```

```go
import "strings"

func numberToWords(num int) string {
	if num == 0 {
		return "Zero"
	}
	ones := []string{"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
		"Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"}
	tens := []string{"", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"}
	words := []string{}

	belowThousand := func(n int) { // 1 <= n <= 999
		if n >= 100 {
			words = append(words, ones[n/100], "Hundred")
			n %= 100
		}
		if n >= 20 {
			words = append(words, tens[n/10])
			n %= 10
		}
		if n > 0 {
			words = append(words, ones[n]) // covers 1..19 in one step
		}
	}

	divisor := 1000000000
	for _, scale := range []string{"Billion", "Million", "Thousand", ""} {
		chunk := num / divisor
		num %= divisor
		divisor /= 1000
		if chunk > 0 {
			belowThousand(chunk)
			if scale != "" {
				words = append(words, scale)
			}
		}
	}
	return strings.Join(words, " ")
}
```
