from solution import *

letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
big = ''.join(letters[i % 26].lower() for i in range(2000))
cases = [
    ('ABCDEFGHIJ', 3, 'AEIBDFHJCG'),
    ('ABCD', 2, 'ACBD'),
    ('HELLO', 1, 'HELLO'),
    ('AB', 5, 'AB'),
    ('ABCDEFGH', 7, 'ABCDEFHG'),
    ('ABCDEFG', 7, 'ABCDEFG'),
    ('A', 1, 'A'),
    ('A', 3, 'A'),
    (letters, 4, 'AGMSYBFHLNRTXZCEIKOQUWDJPV'),
    (letters, 5, 'AIQYBHJPRXZCGKOSWDFLNTVEMU'),
    ('a.b,c d', 2, 'abcd., '),  # punctuation and spaces are ordinary characters
    (big, 2, big[0::2] + big[1::2]),  # two rows: every other character, then the rest
    (big, 2000, big),  # as many rows as characters: unchanged
    (big, 1, big),
]
for s, num_rows, expected in cases:
    got = Solution().convert(s, num_rows)
    check(got, expected, f's={s[:12]!r}{"..." if len(s) > 12 else ""} numRows={num_rows}')
