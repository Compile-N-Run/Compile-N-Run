static vector<vector<int>> normalise(vector<vector<int>> ts) {
    for (auto& t : ts) sort(t.begin(), t.end());
    sort(ts.begin(), ts.end());
    return ts;
}

int main() {
    // Larger case: values -6..6, each at least 15 times, so every value triple summing to 0 is present.
    vector<int> big;
    for (int i = 0; i < 200; i++) big.push_back((i * 7) % 13 - 6);
    vector<vector<int>> bigExpected;
    for (int a = -6; a <= 6; a++)
        for (int b = a; b <= 6; b++)
            if (b <= -a - b && -a - b <= 6) bigExpected.push_back({a, b, -a - b});
    vector<pair<vector<int>, vector<vector<int>>>> cases = {{{-4, 1, 3, 2, -1, -2}, {{-4, 1, 3}, {-2, -1, 3}}},
        {{-2, 1, 1, -2, 4, 0}, {{-2, -2, 4}, {-2, 1, 1}}}, {{0, 0, 0, 0}, {{0, 0, 0}}}, {{2, 5, -1}, {}},
        {{-2, 0, 0, 2, 2}, {{-2, 0, 2}}}, {{-1, 0, 1, 2, -1, -4}, {{-1, -1, 2}, {-1, 0, 1}}}, {{1, 2, -2, -1}, {}},
        {big, bigExpected}};
    for (auto& [nums, expected] : cases) {
        vector<int> copy = nums;
        check(normalise(Solution().threeSum(copy)), normalise(expected), "size " + to_string(nums.size()));
    }
    return failures ? 1 : 0;
}
