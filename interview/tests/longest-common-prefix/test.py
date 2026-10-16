from solution import *

# Larger case: 200 words of 200 characters that share their first 150 characters.
big = ['k' * 150 + chr(97 + i % 26) * 50 for i in range(200)]
cases = [(["interview", "internet", "interval"], "inter"), (["apple", "banana"], ""), (["code", "coder", "co"], "co"),
         (["solo"], "solo"), ([""], ""), (["abc", ""], ""), (["same", "same", "same"], "same"),
         (["prefix", "pre", "prelude", "prey"], "pre"), (big, 'k' * 150)]
for strs, expected in cases:
    check(Solution().longestCommonPrefix(list(strs)), expected, f'{strs[:4]}')
