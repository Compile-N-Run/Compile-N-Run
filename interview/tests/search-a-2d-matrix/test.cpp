int main() {
    vector<vector<int>> grid = {{2, 4, 6}, {9, 11, 13}, {20, 25, 30}};
    vector<tuple<vector<vector<int>>, int, bool>> cases = {
        {grid, 11, true},
        {grid, 12, false},
        {grid, 2, true},
        {grid, 30, true},
        {grid, 1, false},
        {grid, 31, false},
        {grid, 9, true},
        {{{7}}, 7, true},
        {{{7}}, 8, false},
        {{{1, 2, 3, 4, 5}}, 4, true},  // a single row
        {{{1, 2, 3, 4, 5}}, 0, false},
        {{{1}, {3}, {5}}, 3, true},  // a single column
        {{{1}, {3}, {5}}, 4, false},
        {{{-9, -7}, {-5, -3}, {-1, 0}}, -3, true},  // negatives
        {{{-9, -7}, {-5, -3}, {-1, 0}}, -4, false},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        auto [matrix, target, expected] = cases[n];
        check(Solution().searchMatrix(matrix, target), expected, "case " + to_string(n) + " target=" + to_string(target));
    }

    // Larger case: a 100 x 100 matrix of even numbers; every even value is found and no odd one is.
    vector<vector<int>> big(100, vector<int>(100));
    for (int i = 0; i < 100; i++)
        for (int j = 0; j < 100; j++) big[i][j] = 2 * (i * 100 + j);
    bool allEven = true, anyOdd = false;
    for (int k = 0; k < 10000; k++) {
        allEven = allEven && Solution().searchMatrix(big, 2 * k);
        anyOdd = anyOdd || Solution().searchMatrix(big, 2 * k + 1);
    }
    check(allEven, true, "100x100 all even values present");
    check(anyOdd, false, "100x100 no odd value present");
    check(Solution().searchMatrix(big, 20000), false, "100x100 target past the end");
    return failures ? 1 : 0;
}
