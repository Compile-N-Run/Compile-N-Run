from solution import *

full = ['1' * 300] * 300
board = [''.join('1' if (r + c) % 2 == 0 else '0' for c in range(300)) for r in range(300)]
cases = [(['110', '010', '001'], 2), (['101', '010', '101'], 5), (['000'], 0), (['1111', '1001', '1111'], 1),
         (['1'], 1), (['10', '01', '10'], 3), (['1', '1', '0', '1'], 2), (full, 1), (board, 45000)]
for rows, expected in cases:
    grid = [list(row) for row in rows]
    check(Solution().numIslands(grid), expected, f'{rows[:3]}')
