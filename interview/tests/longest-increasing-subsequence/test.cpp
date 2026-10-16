int main() {
    vector<int> inc, pairs;
    for (int i = 0; i < 2500; i++) inc.push_back(i);
    for (int i = 0; i < 2000; i++) pairs.push_back(i / 2);
    vector<pair<vector<int>, int>> cases = {{{4, 1, 6, 2, 7, 3, 8}, 4}, {{5, 5, 5}, 1}, {{9, 7, 4, 2}, 1}, {{-3, 10, -1, 0, 2}, 4},
        {{7}, 1}, {{1, 3, 2, 3, 4, 0}, 4}, {inc, 2500}, {pairs, 1000}};
    for (auto& [nums, expected] : cases) {
        vector<int> copy = nums;
        check(Solution().lengthOfLIS(copy), expected, "expected " + to_string(expected));
    }
    return failures ? 1 : 0;
}
