int main() {
    vector<vector<int>> big;
    for (int i = 9999; i >= 0; i--) big.push_back({i, i + 100});  // each moment is covered by 100 meetings
    vector<pair<vector<vector<int>>, int>> cases = {{{{1, 5}, {2, 6}, {8, 9}}, 2}, {{{0, 4}, {4, 7}}, 1},
        {{{1, 10}, {2, 3}, {4, 5}, {6, 7}}, 2}, {{{3, 8}, {3, 8}, {3, 8}}, 3}, {{{5, 6}}, 1}, {{{6, 9}, {1, 3}, {2, 5}}, 2},
        {{{1, 2}, {3, 4}, {5, 6}}, 1}, {{{0, 1000000}, {1, 2}, {2, 3}, {1, 3}}, 3}, {big, 100}};
    for (auto& [intervals, expected] : cases) {
        vector<vector<int>> copy = intervals;
        check(Solution().minMeetingRooms(copy), expected, "meetings " + to_string(intervals.size()));
    }
    return failures ? 1 : 0;
}
