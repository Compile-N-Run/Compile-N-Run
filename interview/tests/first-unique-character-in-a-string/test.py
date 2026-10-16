from solution import *

cases = [("stress", 1), ("racecar", 3), ("aabbcc", -1), ("x", 0), ("zzyzx", 2), ("abcabc", -1), ("abba", -1), ("zza", 2),
         ("abcdefghijklmnopqrstuvwxyz", 0), ("ab" * 5000 + "q", 10000), ("a" * 100000, -1), ("q" + "ab" * 5000, 0)]
for s, expected in cases:
    check(Solution().firstUniqChar(s), expected, repr(s[:12]))
