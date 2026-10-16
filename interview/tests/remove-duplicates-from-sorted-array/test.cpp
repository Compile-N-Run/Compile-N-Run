int main() {
    vector<int> big, bigExpected;
    for (int v = -500; v < 500; v++) { bigExpected.push_back(v); for (int c = 0; c <= ((v % 3) + 3) % 3; c++) big.push_back(v); }
    vector<pair<vector<int>, vector<int>>> cases = {{{2, 2, 5, 7, 7, 7}, {2, 5, 7}}, {{-4, -4, -4}, {-4}}, {{1, 3, 8}, {1, 3, 8}},
        {{6}, {6}}, {{0, 0, 1, 1, 1, 2, 2, 3, 3, 4}, {0, 1, 2, 3, 4}}, {{-100, 100}, {-100, 100}}, {big, bigExpected}};
    for (auto& [nums, expected] : cases) {
        vector<int> arr = nums;
        int k = Solution().removeDuplicates(arr);
        check(k, (int)expected.size(), "k, size " + to_string(nums.size()));
        if (k == (int)expected.size()) check(vector<int>(arr.begin(), arr.begin() + k), expected, "prefix, size " + to_string(nums.size()));
    }
    return failures ? 1 : 0;
}
