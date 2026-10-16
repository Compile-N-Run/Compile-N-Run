int main() {
    const int n = 100000;
    vector<int> big(n), bigExpected(n);
    for (int i = 0; i < n; i++) {
        big[i] = i;
        bigExpected[i] = (i - 23456 + n) % n;  // k = 123456 is 23456 after wrapping
    }
    vector<tuple<vector<int>, int, vector<int>>> cases = {{{10, 20, 30, 40, 50}, 2, {40, 50, 10, 20, 30}}, {{1, 2, 3}, 4, {3, 1, 2}},
        {{-5, 8}, 0, {-5, 8}}, {{9}, 7, {9}}, {{1, 2, 3, 4}, 4, {1, 2, 3, 4}}, {{1, 2, 3, 4, 5, 6, 7}, 3, {5, 6, 7, 1, 2, 3, 4}},
        {{1, 2}, 1, {2, 1}}, {{4, 4, 1, 4}, 3, {4, 1, 4, 4}}, {big, 123456, bigExpected}};
    for (auto& [nums, k, expected] : cases) {
        vector<int> arr = nums;
        Solution().rotate(arr, k);
        check(arr, expected, "size " + to_string(nums.size()) + " k=" + to_string(k));
    }
    return failures ? 1 : 0;
}
