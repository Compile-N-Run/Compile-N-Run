int main() {
    vector<vector<int>> big(50);  // 50 interleaved lists covering 0..4999
    for (int j = 0; j < 50; j++) for (int x = j; x < 5000; x += 50) big[j].push_back(x);
    vector<int> bigExpected(5000);
    iota(bigExpected.begin(), bigExpected.end(), 0);
    vector<pair<vector<vector<int>>, vector<int>>> cases = {{{{1, 4, 9}, {2, 3}, {5, 6, 10}}, {1, 2, 3, 4, 5, 6, 9, 10}},
        {{{}, {-3, 0}}, {-3, 0}}, {{{7}, {7, 8}}, {7, 7, 8}}, {{}, {}}, {{{}}, {}}, {{{5}}, {5}},
        {{{-2, -1}, {-3}, {0, 0}, {}, {-5, 10}}, {-5, -3, -2, -1, 0, 0, 10}}, {big, bigExpected}};
    for (auto& [values, expected] : cases) {
        vector<ListNode*> lists;
        for (auto& v : values) lists.push_back(buildList(v));
        check(listValues(Solution().mergeKLists(lists)), expected, "k " + to_string(values.size()));
    }
    return failures ? 1 : 0;
}
