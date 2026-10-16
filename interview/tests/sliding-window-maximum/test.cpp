static vector<int> bruteWindowMax(const vector<int>& nums, int k) {
    vector<int> out;
    for (int i = 0; i + k <= (int)nums.size(); i++) out.push_back(*max_element(nums.begin() + i, nums.begin() + i + k));
    return out;
}
static vector<int> generateNums(int n, long long seed) {
    vector<int> out;
    long long x = seed;
    for (int i = 0; i < n; i++) { x = x * 48271 % 2147483647; out.push_back((int)(x % 2001) - 1000); }
    return out;
}
int main() {
    vector<int> big = generateNums(5000, 7);
    vector<tuple<vector<int>, int, vector<int>>> cases = {{{2, 5, 1, 3, 4, 0}, 3, {5, 5, 4, 4}}, {{6, 4, 2}, 1, {6, 4, 2}},
        {{-3, -1, -7, -2}, 4, {-1}}, {{1, 3, 3, 2}, 2, {3, 3, 3}}, {{1, 3, -1, -3, 5, 3, 6, 7}, 3, {3, 3, 5, 5, 6, 7}},
        {{9, 8, 7, 6, 5}, 2, {9, 8, 7, 6}}, {{4}, 1, {4}}, {{7, 7, 7, 7}, 3, {7, 7}}, {big, 137, bruteWindowMax(big, 137)}};
    for (auto& [nums, k, expected] : cases) {
        vector<int> copy = nums;
        check(Solution().maxSlidingWindow(copy, k), expected, "k " + to_string(k) + " n " + to_string(nums.size()));
    }
    return failures ? 1 : 0;
}
