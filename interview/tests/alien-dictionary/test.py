from solution import *


def valid(words, order):
    """True when `order` lists every letter of `words` exactly once and respects every adjacent-pair constraint."""
    letters = set(''.join(words))
    if sorted(order) != sorted(letters):
        return False
    pos = {c: i for i, c in enumerate(order)}
    for w1, w2 in zip(words, words[1:]):
        for a, b in zip(w1, w2):
            if a != b:
                if pos[a] >= pos[b]:
                    return False
                break
        else:
            if len(w1) > len(w2):
                return False
    return True


# (words, solvable): any valid order is accepted; an unsolvable list must give ''.
perm = 'qwertyuiopasdfghjklzxcvbnm'
cases = [
    (['ba', 'bc', 'ac', 'cab'], True),
    (['zy', 'zx'], True),
    (['ab', 'abc'], True),
    (['abc', 'ab'], False),
    (['q', 'w', 'q'], False),
    (['wrt', 'wrf', 'er', 'ett', 'rftt'], True),
    (['z', 'z'], True),
    (['a'], True),
    (['abcxyz'], True),
    (['ac', 'ab', 'zc', 'zb'], True),
    (['ab', 'ba', 'ab'], False),
    (['abc', 'abd', 'ab'], False),
    (['z', 'y', 'x', 'w'], True),
    ([a + b for a in perm for b in perm], True),  # 676 words that pin down every letter
]
for words, solvable in cases:
    got = Solution().alienOrder(list(words))
    if solvable:
        check(valid(words, got), True, f'{words[:5]}: got {got!r}')
    else:
        check(got, '', f'{words[:5]}')
check(Solution().alienOrder([a + b for a in perm for b in perm]), perm, 'full alphabet is unique')
