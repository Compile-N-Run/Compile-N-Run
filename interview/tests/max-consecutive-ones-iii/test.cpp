int main() {
    vector<int> alternating(10000);
    for (int i = 0; i < 10000; i++) alternating[i] = i % 2 == 0 ? 1 : 0;
    vector<tuple<vector<int>, int, int>> cases = {
        {{1, 1, 0, 0, 1, 1, 1, 0, 1}, 2, 7},
        {{0, 0, 0}, 1, 1},
        {{0, 0, 0}, 0, 0},
        {{1, 1, 1}, 0, 3},
        {{1, 0, 1, 0, 1}, 5, 5},
        {{1}, 0, 1},
        {{0}, 0, 0},
        {{0}, 1, 1},
        {{1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1}, 2, 7},
        {{0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1}, 0, 3},
        {alternating, 100, 201},
        {vector<int>(10000, 1), 0, 10000},
        {vector<int>(10000, 0), 10000, 10000},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        auto& [nums, k, expected] = cases[n];
        vector<int> copy = nums;
        check(Solution().longestOnes(copy, k), expected, "case " + to_string(n) + " k=" + to_string(k));
    }
    return failures ? 1 : 0;
}
