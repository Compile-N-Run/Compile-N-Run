int main() {
    vector<pair<vector<int>, int>> cases = {{{2, 7, 2}, 2}, {{5}, 5}, {{-1, -1, 4, 4, -1}, -1}, {{3, 3, 8, 8, 3, 8, 8}, 8},
        {{1000000000, -1000000000, 1000000000}, 1000000000}, {{0, 0, 0, 0}, 0}, {{1, 2, 1, 3, 1, 4, 1}, 1}};
    // Larger case: 25001 copies of -7 interleaved with 24999 distinct other values.
    vector<int> big;
    for (int i = 0; i < 25000; i++) { big.push_back(-7); big.push_back(i); }
    big.back() = -7;
    big.push_back(99);
    cases.push_back({big, -7});
    for (auto& [nums, expected] : cases) {
        vector<int> copy = nums;
        check(Solution().majorityElement(copy), expected, "size " + to_string(nums.size()));
    }
    return failures ? 1 : 0;
}
