int main() {
    vector<pair<vector<vector<int>>, int>> cases = {
        {{{0, 1, 1, 0}, {0, 1, 0, 0}, {1, 0, 0, 1}}, 3},
        {{{1, 0, 1}, {0, 1, 0}, {1, 0, 1}}, 1},
        {{{1, 1, 1}, {1, 1, 1}}, 6},
        {{{0, 0}, {0, 0}}, 0},
        {{{1}}, 1},
        {{{0}}, 0},
        {{{1, 1, 0, 0, 0}, {1, 1, 0, 1, 1}, {0, 0, 0, 1, 1}, {0, 1, 0, 0, 1}}, 5},
        {{{1, 0, 1, 1, 1, 0, 1}}, 3},
    };
    vector<vector<int>> full(50, vector<int>(50, 1)), checker(50, vector<int>(50)), stripes(50, vector<int>(50)), comb(50, vector<int>(50));
    for (int r = 0; r < 50; r++) {
        for (int c = 0; c < 50; c++) {
            checker[r][c] = (r + c) % 2;             // every 1 touches only diagonally
            stripes[r][c] = r % 2 == 0;              // 25 separate rows of 50
            comb[r][c] = r == 0 || c % 2 == 0;       // one island: a top bar with 25 teeth
        }
    }
    cases.push_back({full, 2500});
    cases.push_back({checker, 1});
    cases.push_back({stripes, 50});
    cases.push_back({comb, 50 + 25 * 49});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<vector<int>> copy = cases[n].first;
        check(Solution().maxAreaOfIsland(copy), cases[n].second,
              "case " + to_string(n) + " (" + to_string(copy.size()) + "x" + to_string(copy[0].size()) + ")");
    }
    return failures ? 1 : 0;
}
