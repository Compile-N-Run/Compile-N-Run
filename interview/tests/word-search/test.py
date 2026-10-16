from solution import *

grid = ['CAT', 'ORE', 'DOG']
snake = ['ABCDEF', 'LKJIHG', 'MNOPQR', 'XWVUTS', 'YZABCD', 'JIHGFE']
flat = ['AAAAAA'] * 6
cases = [(grid, 'CARE', True), (grid, 'DOGE', True), (grid, 'CODE', False), (grid, 'CAC', False),
         (grid, 'TAR', True), (grid, 'CATERODOG', True), (['a'], 'a', True), (['a'], 'b', False),
         (['ab'], 'aba', False), (['ab', 'cd'], 'abdc', True), (['ab', 'cd'], 'ad', False),
         (snake, 'ABCDEFGHIJKLMNO', True), (snake, 'ABCDEFGHIJKLMNQ', False), (flat, 'AAAAAAAAAB', False),
         (flat, 'A' * 15, True)]
for rows, word, expected in cases:
    board = [list(row) for row in rows]
    check(Solution().exist(board, word), expected, f'{rows} {word}')
