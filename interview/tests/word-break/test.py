from solution import *

a_words = ['a', 'aa', 'aaa', 'aaaa', 'aaaaa', 'aaaaaaaaaa']
cases = [('sunflower', ['sun', 'flower', 'flow'], True), ('hotdogs', ['hot', 'dog', 'hotdog'], False),
         ('abab', ['ab'], True), ('applepie', ['apple', 'app', 'lepie'], True), ('a', ['b'], False), ('a', ['a'], True),
         ('catcat', ['cats', 'at'], False), ('ab', ['abc'], False),
         ('a' * 299 + 'b', a_words, False), ('a' * 300, a_words, True), ('ab' * 150, ['a', 'b', 'ba'], True)]
for s, words, expected in cases:
    check(Solution().wordBreak(s, list(words)), expected, f'{s[:20]} {words}')
