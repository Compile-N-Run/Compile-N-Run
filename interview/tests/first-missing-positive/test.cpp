int main() {
    vector<int> big;
    for (int v = 100000; v >= 1; v--) big.push_back(v == 77777 ? -1 : v);  // 77777 removed
    vector<pair<vector<int>, int>> cases = {{{2, 5, 1, 9}, 3}, {{-4, 0, 6}, 1}, {{3, 1, 2, 2}, 4}, {{1}, 2}, {{2}, 1}, {{1, 1}, 2},
        {{0}, 1}, {{7, 8, 9, 11, 12}, 1}, {{INT_MIN, INT_MAX, 1, 2}, 3}, {{4, 3, 2, 1}, 5}, {big, 77777}};
    for (auto& [nums, expected] : cases) {
        vector<int> copy = nums;
        check(Solution().firstMissingPositive(copy), expected, "size " + to_string(nums.size()));
    }
    return failures ? 1 : 0;
}
