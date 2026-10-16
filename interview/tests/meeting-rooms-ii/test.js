{
  const big = Array.from({ length: 10000 }, (_, i) => [i, i + 100]).reverse(); // each moment is covered by 100 meetings
  for (const [intervals, expected] of [[[[1, 5], [2, 6], [8, 9]], 2], [[[0, 4], [4, 7]], 1], [[[1, 10], [2, 3], [4, 5], [6, 7]], 2],
    [[[3, 8], [3, 8], [3, 8]], 3], [[[5, 6]], 1], [[[6, 9], [1, 3], [2, 5]], 2], [[[1, 2], [3, 4], [5, 6]], 1],
    [[[0, 1000000], [1, 2], [2, 3], [1, 3]], 3], [big, 100]]) {
    check(minMeetingRooms(intervals.map((m) => m.slice())), expected, JSON.stringify(intervals.slice(0, 4)));
  }
}
