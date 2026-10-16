from solution import *

cases = [('2[ab]c', 'ababc'), ('3[x2[y]]', 'xyyxyyxyy'), ('a10[b]', 'abbbbbbbbbb'), ('pq', 'pq'),
         ('3[a]2[bc]', 'aaabcbc'), ('2[abc]3[cd]ef', 'abcabccdcdcdef'), ('1[z]', 'z'),
         ('2[a3[b4[c]]]d', 'abccccbccccbccccabccccbccccbccccd'), ('300[a]', 'a' * 300),
         ('10[10[10[ab]]]', 'ab' * 1000), ('x2[y3[z]]w', 'xyzzzyzzzw')]
for s, expected in cases:
    check(Solution().decodeString(s), expected, s)
