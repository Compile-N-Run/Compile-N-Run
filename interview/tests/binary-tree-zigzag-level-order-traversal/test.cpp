int main() {
    vector<int> full, chain = {0};
    vector<vector<int>> fullWant, chainWant;
    for (int i = 1; i <= 1023; i++) full.push_back(i);  // complete tree of 1023 nodes: level d holds 2^d .. 2^(d+1) - 1
    for (int d = 0; d < 10; d++) {
        vector<int> level;
        for (int v = 1 << d; v < 2 << d; v++) level.push_back(v);
        if (d % 2) reverse(level.begin(), level.end());
        fullWant.push_back(level);
    }
    chainWant.push_back({0});
    for (int i = 1; i < 300; i++) { chain.push_back(i); chain.push_back(NUL); chainWant.push_back({i}); }  // 0 -> 1 -> ... -> 299 down the left side
    vector<pair<vector<int>, vector<vector<int>>>> cases = {
        {{}, {}},
        {{8}, {{8}}},
        {{1, 2, 3, 4, 5, 6, 7}, {{1}, {3, 2}, {4, 5, 6, 7}}},
        {{4, 2, 7, 1, NUL, NUL, 9}, {{4}, {7, 2}, {1, 9}}},
        {{1, 2, NUL, 3, NUL, 4}, {{1}, {2}, {3}, {4}}},
        {{1, NUL, 2, NUL, 3}, {{1}, {2}, {3}}},
        {{1, 2, 3, 4, NUL, NUL, 5, NUL, 6, 7}, {{1}, {3, 2}, {4, 5}, {7, 6}}},
        {{0, -1, -2, -3, -4, -5, -6, -7}, {{0}, {-2, -1}, {-3, -4, -5, -6}, {-7}}},
        {full, fullWant},
        {chain, chainWant},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        check(Solution().zigzagLevelOrder(buildTree(cases[n].first)), cases[n].second, "case " + to_string(n) + " with " + to_string(cases[n].first.size()) + " entries");
    }
    return failures ? 1 : 0;
}
