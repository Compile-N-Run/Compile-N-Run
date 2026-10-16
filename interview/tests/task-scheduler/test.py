from solution import *

alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
cases = [("AAABBB", 2, 8), ("AAABBB", 0, 6), ("AAAAAABCDEFG", 2, 16), ("ABCD", 5, 4), ("A", 5, 1), ("AAAA", 1, 7),
         ("AABBCC", 1, 6), ("AAB", 2, 4), ("AAABBBCCC", 2, 9), ("AAABBBCC", 3, 10), ("ZZZZZZZZZZ", 0, 10),
         ("A" * 10000 + "B" * 10000, 50, 9999 * 51 + 2), (alphabet * 400, 1, 10400), ("Q" * 1000, 100, 999 * 101 + 1)]
for tasks, n, expected in cases:
    check(Solution().leastInterval(list(tasks), n), expected, f'{tasks[:12]!r} n={n}')
