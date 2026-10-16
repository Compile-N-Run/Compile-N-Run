int main() {
    vector<int> evens, odds, all;
    for (int i = -100; i < 100; i += 2) evens.push_back(i);
    for (int i = -99; i < 101; i += 2) odds.push_back(i);
    for (int i = -100; i < 100; i++) all.push_back(i);
    vector<tuple<vector<int>, vector<int>, vector<int>>> cases = {{{2, 5, 9}, {1, 6}, {1, 2, 5, 6, 9}},
        {{3, 3, 4}, {3}, {3, 3, 3, 4}}, {{}, {7, 8}, {7, 8}}, {{}, {}, {}}, {{1, 2, 3}, {}, {1, 2, 3}},
        {{-5, 0}, {-10, -5, 20}, {-10, -5, -5, 0, 20}}, {{1}, {2}, {1, 2}}, {{10, 11, 12}, {1, 2, 3}, {1, 2, 3, 10, 11, 12}},
        {evens, odds, all}};
    for (auto& [a, b, expected] : cases) {
        check(listValues(Solution().mergeTwoLists(buildList(a), buildList(b))), expected,
              "sizes " + to_string(a.size()) + "+" + to_string(b.size()));
    }
    return failures ? 1 : 0;
}
