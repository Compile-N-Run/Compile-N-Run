from solution import *

big = ['abc'] * 101
big_expected = ['abc    abc'] * 50 + ['abc       ']
cases = [
    (['ab', 'c', 'de', 'fghij'], 10, ['ab   c  de', 'fghij     ']),
    (['hello', 'extraordinary', 'ok'], 13, ['hello        ', 'extraordinary', 'ok           ']),
    (['we', 'can', 'solve', 'this', 'one', 'line', 'at', 'a', 'time'], 11,
     ['we      can', 'solve  this', 'one line at', 'a time     ']),
    (['word'], 4, ['word']),
    (['hi'], 5, ['hi   ']),
    (['a', 'b', 'c', 'd', 'e'], 3, ['a b', 'c d', 'e  ']),
    (['x', 'y', 'z', 'w', 'longword'], 9, ['x  y  z w', 'longword ']),
    (big, 10, big_expected),
]
for words, width, expected in cases:
    check(Solution().fullJustify(list(words), width), expected, f'{words[:5]} {width}')
