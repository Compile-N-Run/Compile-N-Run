int main() {
    vector<pair<vector<vector<int>>, vector<vector<int>>>> cases = {
        {{{1, 2, 3}, {4, 0, 6}, {7, 8, 9}}, {{1, 0, 3}, {0, 0, 0}, {7, 0, 9}}},
        {{{0, 5}, {7, 8}}, {{0, 0}, {0, 8}}},
        {{{1, 1, 1}, {0, 1, 1}}, {{0, 1, 1}, {0, 0, 0}}},
        {{{3, 4}, {5, 6}}, {{3, 4}, {5, 6}}},
        {{{0, 1, 2, 0}, {3, 4, 5, 2}, {1, 3, 1, 5}}, {{0, 0, 0, 0}, {0, 4, 5, 0}, {0, 3, 1, 0}}},
        {{{1}}, {{1}}},
        {{{0}}, {{0}}},
        {{{1, 0, 3}}, {{0, 0, 0}}},
        {{{1}, {0}, {3}}, {{0}, {0}, {0}}},
        {{{1, 0}, {1, 1}, {1, 1}}, {{0, 0}, {1, 0}, {1, 0}}},
        {{{-1, 5}, {0, -7}}, {{0, 5}, {0, 0}}},
        {{{1, 2, 3}, {4, 5, 6}, {7, 8, 0}}, {{1, 2, 0}, {4, 5, 0}, {0, 0, 0}}},
    };
    // 200 x 200 with zeros on the diagonal at every 50th row: rows and columns 0, 50, 100, 150 are cleared.
    vector<vector<int>> big(200, vector<int>(200, 1)), bigWant(200, vector<int>(200, 1));
    for (int r = 0; r < 200; r++) {
        for (int c = 0; c < 200; c++) {
            if (r == c && r % 50 == 0) big[r][c] = 0;
            if (r % 50 == 0 || c % 50 == 0) bigWant[r][c] = 0;
        }
    }
    cases.push_back({big, bigWant});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<vector<int>> work = cases[n].first;
        Solution().setZeroes(work);
        check(work, cases[n].second, "case " + to_string(n));
    }
    return failures ? 1 : 0;
}
