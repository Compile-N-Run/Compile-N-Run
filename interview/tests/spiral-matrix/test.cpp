// m x n matrix whose spiral order is 0, 1, 2, ... (filled by a turning walker).
static vector<vector<int>> spiralFilled(int m, int n) {
    vector<vector<int>> grid(m, vector<int>(n, -1));
    int di[] = {0, 1, 0, -1}, dj[] = {1, 0, -1, 0};
    int i = 0, j = 0, d = 0;
    for (int v = 0; v < m * n; v++) {
        grid[i][j] = v;
        int ni = i + di[d], nj = j + dj[d];
        if (ni < 0 || ni >= m || nj < 0 || nj >= n || grid[ni][nj] != -1) {
            d = (d + 1) % 4;
            ni = i + di[d];
            nj = j + dj[d];
        }
        i = ni;
        j = nj;
    }
    return grid;
}

int main() {
    vector<pair<vector<vector<int>>, vector<int>>> cases = {
        {{{10, 20, 30}, {40, 50, 60}, {70, 80, 90}}, {10, 20, 30, 60, 90, 80, 70, 40, 50}},
        {{{1, 2, 3, 4}, {5, 6, 7, 8}}, {1, 2, 3, 4, 8, 7, 6, 5}}, {{{7}, {8}, {9}}, {7, 8, 9}}, {{{5}}, {5}},
        {{{1, 2, 3}}, {1, 2, 3}}, {{{1, 2}, {3, 4}, {5, 6}}, {1, 2, 4, 6, 5, 3}},
        {{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}, {10, 11, 12}}, {1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 5, 8}},
        {{{-1, -2}, {-3, -4}}, {-1, -2, -4, -3}}};
    for (auto [m, n] : vector<pair<int, int>>{{10, 7}, {7, 10}, {10, 10}}) {
        vector<int> expected(m * n);
        iota(expected.begin(), expected.end(), 0);
        cases.push_back({spiralFilled(m, n), expected});
    }
    for (auto& [matrix, expected] : cases) {
        vector<vector<int>> copy = matrix;
        check(Solution().spiralOrder(copy), expected, to_string(matrix.size()) + "x" + to_string(matrix[0].size()));
    }
    return failures ? 1 : 0;
}
