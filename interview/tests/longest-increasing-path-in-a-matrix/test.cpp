int main() {
    vector<pair<vector<vector<int>>, int>> cases = {
        {{{1, 2, 3}, {6, 5, 4}, {7, 8, 9}}, 9},
        {{{9, 1}, {8, 2}}, 4},
        {{{5, 5}, {5, 5}}, 1},
        {{{7}}, 1},
        {{{3, 4, 5}, {3, 2, 6}, {2, 2, 1}}, 4},
        {{{-3, -2}, {0, -1}}, 4},
        {{{1, 2}, {2, 1}}, 2},
        {{{10, 9, 8, 7, 6, 5, 4, 3, 2, 1}}, 10},
    };
    vector<vector<int>> ordered(200, vector<int>(200)), snake(20, vector<int>(20));
    for (int r = 0; r < 200; r++)
        for (int c = 0; c < 200; c++) ordered[r][c] = r * 200 + c;  // only right/down steps: 199 + 199 + 1
    for (int r = 0; r < 20; r++)
        for (int c = 0; c < 20; c++) snake[r][c] = r * 20 + (r % 2 == 0 ? c : 19 - c);  // one path over all cells
    cases.push_back({ordered, 399});
    cases.push_back({snake, 400});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<vector<int>> copy = cases[n].first;
        check(Solution().longestIncreasingPath(copy), cases[n].second,
              "case " + to_string(n) + " (" + to_string(copy.size()) + "x" + to_string(copy[0].size()) + ")");
    }
    return failures ? 1 : 0;
}
