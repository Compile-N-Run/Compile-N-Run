int main() {
    vector<int> big(20000, 0);
    big.front() = big.back() = 100000;
    vector<pair<vector<int>, int>> cases = {{{3, 0, 2, 0, 4}, 7}, {{1, 2, 3, 4}, 0}, {{5, 1, 1, 5, 2, 4}, 10}, {{6}, 0},
        {{2, 0, 2}, 2}, {{0, 0, 0}, 0}, {{5, 4, 3, 2, 1}, 0}, {{2, 1, 3, 1, 2}, 2}, {big, 100000 * 19998}};
    for (auto& [height, expected] : cases) {
        vector<int> copy = height;
        check(Solution().trap(copy), expected, "size " + to_string(height.size()));
    }
    return failures ? 1 : 0;
}
