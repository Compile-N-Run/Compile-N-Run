static int bruteCount(const vector<int>& nums, int k) {
    int total = 0;
    for (size_t i = 0; i < nums.size(); i++) {
        int s = 0;
        for (size_t j = i; j < nums.size(); j++) { s += nums[j]; if (s == k) total++; }
    }
    return total;
}
int main() {
    vector<int> big;
    long long x = 3;
    for (int i = 0; i < 2000; i++) { x = x * 48271 % 2147483647; big.push_back((int)(x % 21) - 10); }
    vector<tuple<vector<int>, int, int>> cases = {{{1, 2, 3}, 3, 2}, {{1, 1, 1, 1}, 2, 3}, {{2, -2, 2, -2}, 0, 4}, {{5}, 5, 1},
        {{5}, 4, 0}, {{-1, -1, 1}, 0, 1}, {{0, 0, 0}, 0, 6}, {{3, 4, 7, 2, -3, 1, 4, 2}, 7, 4}, {{1, -1, 0}, 0, 3},
        {{-3, -2}, -5, 1}, {vector<int>(2000, 0), 0, 2001000}, {big, 5, bruteCount(big, 5)}};
    int i = 0;
    for (auto& [nums, k, expected] : cases) {
        vector<int> copy = nums;
        check(Solution().subarraySum(copy, k), expected, "case " + to_string(i++));
    }
    return failures ? 1 : 0;
}
