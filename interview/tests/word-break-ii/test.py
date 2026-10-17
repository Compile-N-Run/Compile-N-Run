from solution import *

cases = [
    ('icecreamcone', ['ice', 'cream', 'cone', 'icecream'], ['ice cream cone', 'icecream cone']),
    ('sunflowerpot', ['sun', 'flower', 'pot', 'flow', 'erpot'], ['sun flow erpot', 'sun flower pot']),
    ('hotdogs', ['hot', 'dog', 'hotdog'], []),
    ('a', ['a'], ['a']),
    ('a', ['b'], []),
    ('aaa', ['a', 'aa'], ['a a a', 'a aa', 'aa a']),
    ('abab', ['ab', 'abab', 'a', 'b'], ['a b a b', 'a b ab', 'ab a b', 'ab ab', 'abab']),
    ('a' * 25 + 'b', ['a', 'aa', 'aaa'], []),
]
for s, words, expected in cases:
    check(sorted(Solution().wordBreak(s, list(words))), expected, f'{s[:20]} {words}')

# Larger case: 'a' * 12 with pieces of 1-3 letters has 927 sentences (a tribonacci number).
s, words = 'a' * 12, ['a', 'aa', 'aaa']
got = Solution().wordBreak(s, list(words))
check(len(got), 927, f'count {s} {words}')
check(len(set(got)), 927, f'distinct {s} {words}')
check(all(sentence.replace(' ', '') == s and set(sentence.split()) <= set(words) for sentence in got), True,
      f'each sentence spells s {s} {words}')
