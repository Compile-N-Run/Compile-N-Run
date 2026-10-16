from solution import *

cases = [('  hello   big world ', 'world big hello'), ('a', 'a'), ('code  2 run', 'run 2 code'), ('   spaces  ', 'spaces'),
         ('x y z', 'z y x'), ('Ab12 cD', 'cD Ab12'), ('same same', 'same same')]
# Larger case: 2000 words with 1 to 3 spaces between them and spaces at both ends.
words = [f'w{i}' for i in range(2000)]
big = '  ' + ''.join(w + ' ' * (1 + i % 3) for i, w in enumerate(words))
cases.append((big, ' '.join(reversed(words))))
for s, expected in cases:
    check(Solution().reverseWords(s), expected, repr(s[:30]))
