int main() {
    vector<int> big, bigExpected;
    int zeros = 0;
    for (int i = 0; i < 10000; i++) {
        big.push_back(i % 3 == 0 ? 0 : i);
        if (i % 3 == 0) zeros++; else bigExpected.push_back(i);
    }
    bigExpected.insert(bigExpected.end(), zeros, 0);
    vector<pair<vector<int>, vector<int>>> cases = {{{4, 0, 5, 0, 0, 9}, {4, 5, 9, 0, 0, 0}}, {{0, 0, 7}, {7, 0, 0}}, {{-3, 2}, {-3, 2}},
        {{0}, {0}}, {{5}, {5}}, {{0, 0, 0}, {0, 0, 0}}, {{0, 1, 0, 3, 12}, {1, 3, 12, 0, 0}}, {{2, 0, 2, 0, -1}, {2, 2, -1, 0, 0}},
        {big, bigExpected}};
    for (auto& [nums, expected] : cases) {
        vector<int> arr = nums;
        Solution().moveZeroes(arr);
        check(arr, expected, "size " + to_string(nums.size()));
    }
    return failures ? 1 : 0;
}
