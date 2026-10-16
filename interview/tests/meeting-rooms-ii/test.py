from solution import *

big = [[i, i + 100] for i in range(10000)][::-1]  # each moment is covered by 100 meetings
cases = [([[1, 5], [2, 6], [8, 9]], 2), ([[0, 4], [4, 7]], 1), ([[1, 10], [2, 3], [4, 5], [6, 7]], 2),
         ([[3, 8], [3, 8], [3, 8]], 3), ([[5, 6]], 1), ([[6, 9], [1, 3], [2, 5]], 2), ([[1, 2], [3, 4], [5, 6]], 1),
         ([[0, 1000000], [1, 2], [2, 3], [1, 3]], 3), (big, 100)]
for intervals, expected in cases:
    check(Solution().minMeetingRooms([list(m) for m in intervals]), expected, str(intervals[:4]))
