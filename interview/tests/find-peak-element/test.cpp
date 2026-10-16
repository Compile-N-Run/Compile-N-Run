static bool isPeak(const vector<int>& nums, int i) {
    int n = nums.size();
    return i >= 0 && i < n && (i == 0 || nums[i] > nums[i - 1]) && (i == n - 1 || nums[i] > nums[i + 1]);
}

int main() {
    vector<vector<int>> cases = {{2, 5, 3}, {1, 3, 2, 6, 4}, {9, 7, 4}, {1, 2, 3, 4}, {7}, {INT_MIN},
                                 {INT_MIN, INT_MIN + 1}, {3, 1}, {INT_MAX, INT_MIN, INT_MAX}};
    vector<int> zigzag(10001), mountain(10000);
    for (int i = 0; i < 10001; i++) zigzag[i] = i % 2;
    for (int i = 0; i < 10000; i++) mountain[i] = i < 7000 ? i : 14000 - i;
    cases.push_back(zigzag);
    cases.push_back(mountain);
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> input = cases[n];
        int got = Solution().findPeakElement(input);
        check(isPeak(cases[n], got), true, "case " + to_string(n) + " returned " + to_string(got));
    }
    return failures ? 1 : 0;
}
