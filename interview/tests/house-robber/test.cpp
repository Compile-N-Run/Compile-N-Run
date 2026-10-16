int main() {
    vector<int> big;
    for (int i = 0; i < 100; i++) big.push_back((i * 37) % 401);
    vector<pair<vector<int>, int>> cases = {{{3, 10, 3, 1, 8}, 18}, {{6, 1, 1, 6}, 12}, {{4, 1, 2, 7, 5, 3, 1}, 14}, {{9}, 9},
        {{0, 0, 0}, 0}, {{2, 1}, 2}, {{1, 2}, 2}, {{5, 0, 0, 5, 0, 0, 5}, 15}, {vector<int>(100, 400), 20000}, {big, 10569}};
    for (auto& [nums, expected] : cases) {
        vector<int> copy = nums;
        check(Solution().rob(copy), expected, "size " + to_string(nums.size()));
    }
    return failures ? 1 : 0;
}
