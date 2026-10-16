int main() {
    vector<int> big;
    for (int i = 99999; i >= 0; i -= 2) big.push_back(i);
    for (int i = 0; i < 100000; i += 2) big.push_back(i);
    big.push_back(200000);
    big.push_back(-5);
    vector<pair<vector<int>, int>> cases = {{{10, 4, 20, 1, 3, 2}, 4}, {{5, -1, 0, 7, 1, 6, 1}, 3}, {{42}, 1}, {{}, 0},
        {{7, 7, 7}, 1}, {{1, 3, 5, 7}, 1}, {{-1000000000, 1000000000, 0, -999999999}, 2},
        {{9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6}, 7}, {big, 100000}};
    for (auto& [nums, expected] : cases) {
        vector<int> copy = nums;
        check(Solution().longestConsecutive(copy), expected, "size " + to_string(nums.size()));
    }
    return failures ? 1 : 0;
}
