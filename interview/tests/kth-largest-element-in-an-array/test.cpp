int main() {
    vector<int> big;
    for (int i = 0; i < 100000; i++) big.push_back((int)((i * 7919LL) % 20001) - 10000);
    vector<int> desc = big;
    sort(desc.rbegin(), desc.rend());
    vector<tuple<vector<int>, int, int>> cases = {{{7, 2, 9, 4}, 2, 7}, {{5, 5, 1}, 2, 5}, {{-1, -8, -3}, 3, -8}, {{6}, 1, 6},
        {{1, 2, 3, 4, 5}, 1, 5}, {{3, 3, 3, 3}, 3, 3}, {{10, -10, 0}, 2, 0}, {big, 500, desc[499]}, {big, 100000, desc[99999]}};
    for (auto& [nums, k, expected] : cases) {
        vector<int> copy = nums;
        check(Solution().findKthLargest(copy, k), expected, "k " + to_string(k));
    }
    return failures ? 1 : 0;
}
