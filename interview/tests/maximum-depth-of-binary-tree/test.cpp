int main() {
    vector<int> full, chain = {0};
    for (int i = 1; i <= 1023; i++) full.push_back(i);  // complete tree of 1023 nodes
    for (int i = 1; i < 500; i++) { chain.push_back(i); chain.push_back(NUL); }  // 0 -> 1 -> ... -> 499 down the left side
    vector<pair<vector<int>, int>> cases = {
        {{}, 0},
        {{7}, 1},
        {{5, 3, 8, NUL, 4}, 3},
        {{1, NUL, 2, NUL, 3, NUL, 4}, 4},
        {{1, 2, 3, 4, 5, 6, 7}, 3},
        {{1, 2}, 2},
        {{1, 2, 3, 4, 5, 6, 7, 8}, 4},
        {{-1, -2, NUL, -3, NUL, NUL, -4}, 4},
        {full, 10},
        {chain, 500},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        check(Solution().maxDepth(buildTree(cases[n].first)), cases[n].second, "case " + to_string(n) + " with " + to_string(cases[n].first.size()) + " entries");
    }
    return failures ? 1 : 0;
}
