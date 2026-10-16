from solution import *

chain = [[f'v{i}', f'v{i + 1}'] for i in range(19)]
cases = [
    ([['a', 'b'], ['b', 'c']], [3.0, 0.5], [['a', 'c'], ['c', 'a'], ['b', 'b'], ['a', 'z']], [1.5, 2 / 3, 1.0, -1.0]),
    ([['p', 'q'], ['r', 's']], [4.0, 2.0], [['p', 's'], ['q', 'p'], ['s', 'r']], [-1.0, 0.25, 0.5]),
    ([['x', 'y']], [5.0], [['x', 'x'], ['w', 'w'], ['y', 'x']], [1.0, -1.0, 0.2]),
    ([['ab', 'cd'], ['cd', 'ef'], ['ab', 'gh']], [2.0, 3.0, 4.0], [['ef', 'gh'], ['gh', 'cd']], [4 / 6, 0.5]),
    ([['a', 'b'], ['b', 'c'], ['c', 'a']], [2.0, 3.0, 1 / 6], [['a', 'c'], ['c', 'b']], [6.0, 1 / 3]),
    (chain, [2.0] * 19, [['v0', 'v19'], ['v19', 'v0'], ['v5', 'v10'], ['v3', 'v20']], [524288.0, 1 / 524288, 32.0, -1.0]),
]
for equations, values, queries, expected in cases:
    got = Solution().calcEquation(equations, values, queries)
    ok = len(got) == len(expected) and all(abs(g - e) <= 1e-5 * max(1.0, abs(e)) for g, e in zip(got, expected))
    if not ok:
        raise AssertionError(f'{equations}: expected {expected}, got {got}')
