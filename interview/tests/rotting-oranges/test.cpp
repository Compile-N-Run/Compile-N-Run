int main() {
    vector<vector<int>> big(10, vector<int>(10, 1)), allFresh = big;
    big[0][0] = 2;  // the far corner is 18 steps away
    vector<pair<vector<vector<int>>, int>> cases = {{{{2, 1, 0}, {1, 1, 1}, {0, 1, 1}}, 4}, {{{2, 1, 1, 1, 2}}, 2},
        {{{1, 0, 2}}, -1}, {{{0, 2}, {0, 0}}, 0}, {{{1}}, -1}, {{{0}}, 0}, {{{2, 2}, {1, 1}, {0, 1}}, 2}, {big, 18}, {allFresh, -1}};
    for (auto& [grid, expected] : cases) {
        vector<vector<int>> copy = grid;
        check(Solution().orangesRotting(copy), expected, to_string(grid.size()) + "x" + to_string(grid[0].size()));
    }
    return failures ? 1 : 0;
}
