int main() {
    vector<int> ones(1023, 1), negatives;
    for (int i = 0; i < 1023; i++) negatives.push_back(-(i % 5 + 1));
    vector<pair<vector<int>, int>> cases = {{{2, 1, 3}, 6}, {{-8, 4, 6, NUL, NUL, 5, 7}, 18}, {{-3}, -3}, {{-2, -5, -1}, -1},
        {{1, -2, 3}, 4}, {{5, 4, 8, 11, NUL, 13, 4, 7, 2, NUL, NUL, NUL, 1}, 48},
        {{-10, 9, 20, NUL, NUL, 15, -7}, 35}, {ones, 19}, {negatives, -1}};
    int n = 0;
    for (auto& [values, expected] : cases) {
        check(Solution().maxPathSum(buildTree(values)), expected, "case " + to_string(++n));
    }
    return failures ? 1 : 0;
}
