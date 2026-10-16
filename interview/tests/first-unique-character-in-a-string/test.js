const uniqCases = [["stress", 1], ["racecar", 3], ["aabbcc", -1], ["x", 0], ["zzyzx", 2], ["abcabc", -1], ["abba", -1], ["zza", 2],
  ["abcdefghijklmnopqrstuvwxyz", 0], ["ab".repeat(5000) + "q", 10000], ["a".repeat(100000), -1], ["q" + "ab".repeat(5000), 0]];
for (const [s, expected] of uniqCases) {
  check(firstUniqChar(s), expected, JSON.stringify(s.slice(0, 12)));
}
