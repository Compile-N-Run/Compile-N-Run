int main() {
    vector<int> full, chain = {0};
    for (int i = 1; i <= 1023; i++) full.push_back(i);  // complete tree of 1023 nodes: 9 edges down each side
    for (int i = 1; i < 1000; i++) { chain.push_back(i); chain.push_back(NUL); }  // 0 -> 1 -> ... -> 999 down the left side
    vector<pair<vector<int>, int>> cases = {
        {{1, 2, 3, 4, 5}, 3},
        {{1}, 0},
        {{1, NUL, 2}, 1},
        {{1, 2, NUL, 3, 4, 5, NUL, NUL, 6, 7}, 5},  // longest path avoids the root
        {{1, 2, 3}, 2},
        {{1, 2, NUL, 3, NUL, 4}, 3},  // a chain of four
        {{1, 2, 3, 4, 5, 6, 7}, 4},
        {{1, 2, 3, 4, NUL, NUL, 5}, 4},
        {{-7, -7, -7, NUL, 3}, 3},  // values do not matter
        {{}, 0},                     // no tree at all
        {full, 18},
        {chain, 999},
    };
    for (auto& c : cases) {
        int got = Solution().diameterOfBinaryTree(buildTree(c.first));
        string label = "tree=[";
        for (size_t i = 0; i < min<size_t>(10, c.first.size()); i++) label += (i ? "," : "") + (c.first[i] == NUL ? string("null") : to_string(c.first[i]));
        label += (c.first.size() > 10 ? ",...] (" : "] (") + to_string(c.first.size()) + " entries)";
        check(got, c.second, label);
    }
    return failures ? 1 : 0;
}
