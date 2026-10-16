from solution import *

# Each op is (0, word, 0) for insert, (1, word, expected) for search or (2, prefix, expected) for startsWith.
cases = [
    [(0, 'card', 0), (1, 'card', 1), (1, 'car', 0), (2, 'car', 1), (0, 'car', 0), (1, 'car', 1), (2, 'cat', 0), (2, 'c', 1), (1, 'cards', 0)],
    [(1, 'a', 0), (2, 'a', 0)],
    [(0, 'a', 0), (1, 'a', 1), (2, 'a', 1), (1, 'aa', 0), (2, 'aa', 0), (1, 'b', 0), (2, 'b', 0)],
    [(0, 'zoo', 0), (0, 'zoo', 0), (1, 'zoo', 1), (1, 'zo', 0), (2, 'zoo', 1), (2, 'zoom', 0)],
    [(0, 'apple', 0), (0, 'apply', 0), (0, 'ape', 0), (1, 'app', 0), (2, 'app', 1), (2, 'appl', 1), (1, 'apply', 1), (1, 'ape', 1),
     (1, 'apes', 0), (2, 'apes', 0), (2, 'b', 0), (0, 'app', 0), (1, 'app', 1)],
    [(0, 'abcdefghijklmnopqrstuvwxyz', 0), (1, 'abcdefghijklmnopqrstuvwxyz', 1), (1, 'abcdefghijklmnopqrstuvwxy', 0),
     (2, 'abcdefghijklmnopqrstuvwxy', 1), (0, 'z', 0), (1, 'z', 1), (1, 'zz', 0), (2, 'zy', 0)],
]


def word(i):  # digits of i spelled as letters: 123 -> "wbcd"
    return 'w' + ''.join(chr(ord('a') + int(d)) for d in str(i))


big = [(0, word(i), 0) for i in range(0, 2000, 2)]
big += [(1, word(i), 1 - i % 2) for i in range(2000)]
big += [(2, word(i), 1) for i in range(200)] + [(2, word(i) + 'z', 0) for i in range(200)]
cases.append(big)
for n, ops in enumerate(cases):
    trie = Trie()
    for step, (op, s, expected) in enumerate(ops):
        if op == 0:
            trie.insert(s)
        else:
            got = trie.search(s) if op == 1 else trie.startsWith(s)
            check(got, bool(expected), f'case {n} step {step} op {op}({s!r})')
