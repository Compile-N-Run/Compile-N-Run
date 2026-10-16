from solution import *


def valid(s):
    depth = 0
    for ch in s:
        depth += 1 if ch == '(' else -1
        if depth < 0:
            return False
    return depth == 0


exact = {1: ['()'], 2: ['(())', '()()'], 3: ['((()))', '(()())', '(())()', '()(())', '()()()']}
catalan = [1, 1, 2, 5, 14, 42, 132, 429, 1430]
for n in range(1, 9):
    got = sorted(Solution().generateParenthesis(n))
    if n in exact:
        check(got, exact[n], f'n={n}')
    check(len(got), catalan[n], f'n={n} count')
    check(len(set(got)), len(got), f'n={n} duplicates')
    check(all(len(s) == 2 * n and valid(s) for s in got), True, f'n={n} all valid')
