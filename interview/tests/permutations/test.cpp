int main() {
    vector<pair<vector<int>, vector<vector<int>>>> exact = {{{4, 9}, {{4, 9}, {9, 4}}},
        {{1, 2, 3}, {{1, 2, 3}, {1, 3, 2}, {2, 1, 3}, {2, 3, 1}, {3, 1, 2}, {3, 2, 1}}}, {{-5}, {{-5}}}, {{0, -10}, {{-10, 0}, {0, -10}}}};
    for (auto& [nums, expected] : exact) {
        vector<int> copy = nums;
        auto got = Solution().permute(copy);
        sort(got.begin(), got.end());
        check(got, expected, "size " + to_string(nums.size()));
    }
    vector<pair<vector<int>, int>> big = {{{0, -1, 7, 2}, 24}, {{6, -2, 3, 10, -8, 1}, 720}};
    for (auto& [nums, count] : big) {
        vector<int> copy = nums, sortedNums = nums;
        sort(sortedNums.begin(), sortedNums.end());
        auto got = Solution().permute(copy);
        check((int)got.size(), count, "count");
        check((int)set<vector<int>>(got.begin(), got.end()).size(), count, "distinct");
        bool all = true;
        for (auto p : got) { sort(p.begin(), p.end()); all = all && p == sortedNums; }
        check(all, true, "each is a permutation");
    }
    return failures ? 1 : 0;
}
