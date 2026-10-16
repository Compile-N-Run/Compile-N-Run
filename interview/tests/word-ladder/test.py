from solution import *

big = [a + b + c for a in 'abcdefghij' for b in 'abcdefghij' for c in 'abcdefghij']
cases = [('cat', 'dog', ['cot', 'cog', 'dog', 'bat'], 4),
         ('cold', 'warm', ['cord', 'card', 'ward', 'warm', 'worm'], 5),
         ('cat', 'dog', ['cot', 'cog', 'bat'], 0),
         ('a', 'c', ['a', 'b', 'c'], 2),
         ('hot', 'dog', ['hot', 'dog'], 0),
         ('lost', 'cost', ['most', 'fist', 'lost', 'cost', 'fish'], 2),
         ('abc', 'xyz', ['abd', 'xyz'], 0),
         ('aaa', 'jjj', big, 4)]
for begin, end, words, expected in cases:
    check(Solution().ladderLength(begin, end, list(words)), expected, f'{begin} -> {end}')
