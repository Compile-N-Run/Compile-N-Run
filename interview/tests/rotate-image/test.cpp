static vector<vector<int>> grid(int n) {
    vector<vector<int>> m(n, vector<int>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) m[i][j] = i * n + j;
    return m;
}

static vector<vector<int>> rotated(const vector<vector<int>>& m) {  // reference: copy into a new matrix
    int n = m.size();
    vector<vector<int>> out(n, vector<int>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) out[j][n - 1 - i] = m[i][j];
    return out;
}

int main() {
    vector<pair<vector<vector<int>>, vector<vector<int>>>> cases = {
        {{{1, 2}, {3, 4}}, {{3, 1}, {4, 2}}},
        {{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}, {{7, 4, 1}, {8, 5, 2}, {9, 6, 3}}},
        {{{5}}, {{5}}},
        {{{-1, 0}, {0, -1}}, {{0, -1}, {-1, 0}}},
        {{{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}, {13, 14, 15, 16}}, {{13, 9, 5, 1}, {14, 10, 6, 2}, {15, 11, 7, 3}, {16, 12, 8, 4}}},
        {grid(5), rotated(grid(5))},
        {grid(20), rotated(grid(20))}};
    for (auto& [matrix, expected] : cases) {
        vector<vector<int>> m = matrix;
        Solution().rotate(m);
        check(m, expected, to_string(m.size()) + "x" + to_string(m.size()));
    }
    return failures ? 1 : 0;
}
