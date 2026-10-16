int main() {
    vector<int> big;
    for (int v = 0; v < 100; v++) for (int i = 0; i <= v; i++) big.push_back(v);  // value v appears v + 1 times
    vector<tuple<vector<int>, int, vector<int>>> cases = {{{5, 7, 5, 9, 7, 5}, 2, {5, 7}}, {{-3, -3, 4}, 1, {-3}},
        {{8, 2, 6}, 3, {2, 6, 8}}, {{1}, 1, {1}}, {{4, 4, 4, 4}, 1, {4}}, {{-1, -1, 0, 0, 0, 2}, 2, {-1, 0}},
        {big, 5, {95, 96, 97, 98, 99}}};
    for (auto& [nums, k, expected] : cases) {
        vector<int> copy = nums;
        vector<int> got = Solution().topKFrequent(copy, k);
        sort(got.begin(), got.end());
        check(got, expected, "k " + to_string(k) + " size " + to_string(nums.size()));
    }
    return failures ? 1 : 0;
}
