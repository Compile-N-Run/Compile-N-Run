from solution import *

cases = [
    (['cat', 'ore', 'dog'], ['care', 'tar', 'code', 'god', 'cac'], ['care', 'god', 'tar']),
    (['ab', 'dc'], ['ab', 'abc', 'abcd', 'abcda'], ['ab', 'abc', 'abcd']),
    (['a'], ['a', 'b', 'aa'], ['a']),
    (['xyz', 'qrs'], ['hello'], []),
    (['aa', 'aa'], ['aaa', 'aaaa', 'aaaaa'], ['aaa', 'aaaa']),
    (['tape', 'oarn', 'pike', 'seal'], ['tap', 'pan', 'pear', 'rope', 'kin', 'ikea', 'seal', 'lake', 'ran', 'topi', 'tapenade'],
     ['lake', 'seal', 'tap', 'topi']),
    (['cat', 'ore', 'dog'], ['care', 'doge', 'code', 'cac', 'tar', 'caterodog', 'dog', 'god', 'rod', 'ore'],
     ['care', 'caterodog', 'dog', 'doge', 'god', 'ore', 'rod', 'tar']),
    (['abc', 'def', 'ghi'], ['abcfedghi', 'abcfi', 'adgheb', 'ihgfedcba', 'bei', 'aei'], ['abcfedghi', 'abcfi', 'adgheb']),
    (['aaaaaa'] * 6, ['a' * k for k in range(1, 11)] + ['a' * k + 'b' for k in range(10)], ['a' * k for k in range(1, 11)]),
]
# 12x12 grid; the words walked along rows and columns exist, 2000 pseudo-random words do not.
grid = [''.join(chr(97 + (r * 7 + c * 3) % 26) for c in range(12)) for r in range(12)]
walks = [grid[r][c:c + 10] for r in range(12) for c in range(3)]
walks += [''.join(grid[r + i][c] for i in range(10)) for c in range(12) for r in range(3)]
seed = 12345


def rand():
    global seed
    seed = seed * 48271 % 2147483647
    return seed


words = list(walks)
for _ in range(2000):
    length = 6 + rand() % 5
    words.append(''.join(chr(97 + rand() % 26) for _ in range(length)))
words = list(dict.fromkeys(words))  # LeetCode guarantees distinct words
cases.append((grid, words, sorted(set(walks))))
for rows, words, expected in cases:
    got = Solution().findWords([list(row) for row in rows], list(words))
    check(sorted(got), expected, f'{rows[:3]} {words[:4]}')
