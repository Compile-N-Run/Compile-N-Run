int main() {
    vector<int> ramp(1000);
    iota(ramp.begin(), ramp.end(), 1);
    vector<tuple<vector<int>, int, int>> cases = {
        {{7, 2, 5, 10, 8}, 2, 18},
        {{1, 2, 3, 4, 5}, 2, 9},
        {{1, 4, 4}, 3, 4},
        {{5}, 1, 5},
        {{1, 1, 1, 1}, 4, 1},
        {{0, 0, 0}, 2, 0},
        {{10, 1, 1, 1, 10}, 3, 10},
        {{2, 3, 1, 2, 4, 3}, 5, 4},
        {ramp, 1, 500500},
        {ramp, 2, 250278},
        {vector<int>(1000, 1000000), 3, 334000000},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        auto& [nums, k, expected] = cases[n];
        vector<int> copy = nums;
        check(Solution().splitArray(copy, k), expected, "case " + to_string(n) + " k=" + to_string(k));
    }
    return failures ? 1 : 0;
}
