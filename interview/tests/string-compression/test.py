from solution import *

cases = [('xxxyzz', 'x3yz2'), ('q', 'q'), ('m' * 12, 'm12'), ('abba', 'ab2a'), ('##@@@1111', '#2@314'),
         ('z' * 10, 'z10'), ('ab', 'ab'), ('11122', '1322'), ('a' * 1000 + 'b' + 'c' * 100, 'a1000bc100')]
for text, expected in cases:
    chars = list(text)
    n = Solution().compress(chars)
    check(n, len(expected), f'{text[:20]} length')
    check(''.join(chars[:n]), expected, text[:20])
