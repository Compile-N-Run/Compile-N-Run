from solution import *

cases = [
    (["pear", "apple", "pear", "fig", "apple", "pear"], 2, ["pear", "apple"]),
    (["b", "a", "b", "a"], 2, ["a", "b"]),
    (["dog", "cat", "dog", "cat", "bird", "bird", "ant"], 3, ["bird", "cat", "dog"]),
    (["solo"], 1, ["solo"]),
    (["z", "y", "x"], 1, ["x"]),
    (["aa", "a", "aaa", "a", "aa"], 3, ["a", "aa", "aaa"]),
    (["q", "w", "e", "w"], 3, ["w", "e", "q"]),
    (["x", "y", "y", "x", "z"], 1, ["x"]),
]
# word i (0..199) appears i % 10 + 1 times, pushed in descending order of i.
big = [f'w{i:03d}' for i in reversed(range(200)) for _ in range(i % 10 + 1)]
cases.append((big, 25, [f'w{i:03d}' for i in range(9, 200, 10)] + ['w008', 'w018', 'w028', 'w038', 'w048']))
cases.append((big, 200, [f'w{i:03d}' for f in range(10, 0, -1) for i in range(f - 1, 200, 10)]))
for words, k, expected in cases:
    check(Solution().topKFrequent(list(words), k), expected, f'{words[:6]} k={k}')
