int main() {
    vector<int> oneThenOnes(10000, 1);
    oneThenOnes[0] = 10000;
    vector<pair<vector<int>, int>> cases = {
        {{3, 1, 1, 4, 1, 1, 1}, 2},
        {{1, 1, 1, 1}, 3},
        {{4, 1, 1, 1, 1}, 1},
        {{1, 3, 0, 0, 2, 0, 1}, 3},
        {{5}, 0},
        {{0}, 0},
        {{2, 1}, 1},
        {{1, 2, 3}, 2},
        {{3, 0, 0, 1, 0}, 2},
        {vector<int>(10000, 1), 9999},
        {oneThenOnes, 1},
        {vector<int>(10001, 2), 5000},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> nums = cases[n].first;
        check(Solution().jump(nums), cases[n].second, "case " + to_string(n) + " (n=" + to_string(nums.size()) + ")");
    }
    return failures ? 1 : 0;
}
