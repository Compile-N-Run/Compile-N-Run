int main() {
    vector<tuple<vector<int>, int, vector<int>>> cases = {{{3, 8, 11, 5}, 13, {1, 3}}, {{4, 6, 4}, 8, {0, 2}}, {{-2, 7, 1}, -1, {0, 2}},
        {{2, 7, 11, 15}, 9, {0, 1}}, {{0, 4, 3, 0}, 0, {0, 3}}, {{1, 2}, 3, {0, 1}}};
    for (auto& [nums, target, expected] : cases) {
        vector<int> copy = nums;
        vector<int> got = Solution().twoSum(copy, target);
        sort(got.begin(), got.end());
        check(got, expected, "target " + to_string(target));
    }
    return failures ? 1 : 0;
}
