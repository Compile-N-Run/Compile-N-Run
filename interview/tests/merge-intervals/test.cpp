int main() {
    vector<pair<vector<vector<int>>, vector<vector<int>>>> cases = {
        {{{6, 8}, {1, 4}, {3, 5}}, {{1, 5}, {6, 8}}},
        {{{2, 4}, {4, 7}}, {{2, 7}}},
        {{{1, 10}, {2, 3}, {4, 5}}, {{1, 10}}},
        {{{5, 5}}, {{5, 5}}},
        {{{1, 2}, {3, 4}}, {{1, 2}, {3, 4}}},
        {{{0, 0}, {0, 0}}, {{0, 0}}},
        {{{4, 9}, {1, 3}, {2, 4}}, {{1, 9}}},
    };
    vector<vector<int>> disjoint, disjointWant, chain;
    for (int i = 999; i >= 0; i--) { disjoint.push_back({2 * i, 2 * i + 1}); chain.push_back({i, i + 1}); }
    for (int i = 0; i < 1000; i++) disjointWant.push_back({2 * i, 2 * i + 1});
    cases.push_back({disjoint, disjointWant});
    cases.push_back({chain, {{0, 1000}}});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<vector<int>> copy = cases[n].first;
        vector<vector<int>> got = Solution().merge(copy);
        sort(got.begin(), got.end());
        check(got, cases[n].second, "case " + to_string(n));
    }
    return failures ? 1 : 0;
}
