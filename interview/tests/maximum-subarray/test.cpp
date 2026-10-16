int main() {
    // Larger case: 100000 values alternating 10000, -9999; the best run stops at the last 10000.
    vector<int> big(100000);
    for (int i = 0; i < 100000; i++) big[i] = i % 2 == 0 ? 10000 : -9999;
    vector<pair<vector<int>, int>> cases = {{{2, -5, 3, -1, 4, -6, 1}, 6}, {{-4, -2, -7}, -2}, {{1, 2, 3}, 6}, {{7}, 7}, {{0}, 0},
        {{-1, 0, -2}, 0}, {{5, -10, 5}, 5}, {{-3, 4, -1, 2, 1, -5}, 6}, {{-10000}, -10000}, {big, 59999}};
    for (auto& [nums, expected] : cases) {
        vector<int> copy = nums;
        check(Solution().maxSubArray(copy), expected, "size " + to_string(nums.size()));
    }
    return failures ? 1 : 0;
}
