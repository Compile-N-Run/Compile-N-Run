from solution import *

KEYS = {'2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'}


def expand(digits):
    """Independent iterative reference: extend every prefix by each letter of the next digit."""
    if not digits:
        return []
    out = ['']
    for d in digits:
        out = [s + ch for s in out for ch in KEYS[d]]
    return sorted(out)


cases = [('56', ['jm', 'jn', 'jo', 'km', 'kn', 'ko', 'lm', 'ln', 'lo']), ('7', ['p', 'q', 'r', 's']), ('', []),
         ('2', ['a', 'b', 'c']), ('29', expand('29')), ('99', expand('99')), ('234', expand('234')),
         ('7979', expand('7979'))]
check(len(expand('29')), 12, 'count 29')
check(len(expand('7979')), 256, 'count 7979')
for digits, expected in cases:
    check(sorted(Solution().letterCombinations(digits)), expected, repr(digits))
