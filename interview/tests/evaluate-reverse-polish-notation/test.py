from solution import *

cases = [
    (['3', '4', '+', '2', '*'], 14),
    (['10', '3', '/'], 3),
    (['-7', '2', '/'], -3),
    (['7', '-2', '/'], -3),
    (['-7', '-2', '/'], 3),
    (['0', '-5', '/'], 0),
    (['2', '3', '4', '*', '+', '5', '-'], 9),
    (['5'], 5),
    (['-3', '-2', '*'], 6),
    (['6', '3', '-'], 3),
    (['2147483647', '1', '-'], 2147483646),
    (['-2147483648', '1', '/'], -2147483648),
    (['4', '13', '5', '/', '+'], 6),
    (['1'] * 1000 + ['+'] * 999, 1000),  # pushes everything before the first operator
    (['3', '1', '*'] + ['2', '*', '1', '-'] * 10, 2049),  # x -> 2x - 1, ten times, from 3
]
for tokens, expected in cases:
    label = ' '.join(tokens) if len(tokens) <= 12 else f'{" ".join(tokens[:6])} ... ({len(tokens)} tokens)'
    check(Solution().evalRPN(list(tokens)), expected, label)
