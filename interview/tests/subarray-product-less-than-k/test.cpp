int main() {
    vector<tuple<vector<int>, int, int>> cases = {
        {{2, 3, 4}, 10, 4},
        {{1, 1, 1}, 2, 6},
        {{5, 5}, 5, 0},
        {{3}, 0, 0},
        {{3}, 1, 0},
        {{3}, 4, 1},
        {{10, 5, 2, 6}, 100, 8},
        {{1, 2, 3, 4, 5}, 20, 9},
        {{4, 1, 1, 8, 2}, 9, 10},
        {vector<int>(20, 2), 1024, 144},
        {vector<int>(30000, 1), 2, 450015000},
        {vector<int>(30000, 1000), 1000000, 30000},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> nums = get<0>(cases[n]);
        check(Solution().numSubarrayProductLessThanK(nums, get<1>(cases[n])), get<2>(cases[n]), "case " + to_string(n));
    }
    return failures ? 1 : 0;
}
