from solution import *

half = 'ab' * 2500
mirror = half + half[::-1]  # a 10,000-character palindrome
cases = [
    ('abca', True),
    ('acba', True),
    ('abc', False),
    ('racecar', True),
    ('abcdba', True),
    ('a', True),
    ('ab', True),
    ('aba', True),
    ('abba', True),
    ('abcca', True),
    ('accba', True),
    ('abcdedcbaq', True),
    ('xabcdedcby', False),
    ('deeee', True),
    ('eedcfee', False),
    ('compilexnrunnurnelipmoc', True),
    ('compilexnrunnurnelipmyoc', False),
    (mirror, True),
    (half + 'z' + half[::-1], True),
    ('z' + mirror, True),
    (mirror + 'z', True),
    ('ab' * 5000, True),
    (mirror[:2500] + 'zq' + mirror[2500:], False),
    (mirror[:100] + 'z' + mirror[100:200] + 'q' + mirror[200:], False),
]
for s, expected in cases:
    label = s if len(s) <= 40 else f'{s[:12]}...{s[-12:]} ({len(s)} chars)'
    check(Solution().validPalindrome(s), expected, label)
