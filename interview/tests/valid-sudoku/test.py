from solution import *

E = '.........'
cases = [
    ('empty board', [E] * 9, True),
    ('two 5s in row 0', ['5.......5'] + [E] * 8, False),
    ('two 9s in the centre box', [E] * 3 + ['...9.....', E, '.....9...'] + [E] * 3, False),
    ('valid but unsolvable', ['12345678.', '........9'] + [E] * 7, True),
    ('two 3s in column 4', [E, '....3....', E, E, E, E, E, '....3....', E], False),
    ('full solved grid', ['123456789', '456789123', '789123456', '234567891', '567891234',
                          '891234567', '345678912', '678912345', '912345678'], True),
    ('partly filled valid grid', ['...45..8.', '.5.7.9.23', '.89.23..6', '.3456.8.1', '5...9.2..',
                                  '..1234567', '3.56789.2', '6..91.3..', '.12.4.6.8'], True),
    ('full grid with one wrong cell', ['123456789', '456789123', '789123456', '234567891', '567891234',
                                       '891234567', '345678912', '678912345', '912345677'], False),
]
for label, rows, expected in cases:
    check(Solution().isValidSudoku([list(row) for row in rows]), expected, label)
