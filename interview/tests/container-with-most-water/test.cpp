int main() {
    // Larger case: 100000 lines rising to 10000 and then staying flat; best pair is index 10000 with the last line.
    vector<int> big(100000);
    for (int i = 0; i < 100000; i++) big[i] = min(i, 10000);
    vector<pair<vector<int>, int>> cases = {{{2, 7, 4, 1, 6, 3}, 18}, {{5, 5}, 5}, {{1, 8, 1, 1, 8, 1}, 24}, {{0, 0}, 0}, {{3, 1}, 1},
        {{1, 2, 3, 4, 5}, 6}, {{4, 3, 2, 1, 4}, 16}, {{10000, 10000}, 10000}, {big, 10000 * 89999}};
    for (auto& [height, expected] : cases) {
        vector<int> copy = height;
        check(Solution().maxArea(copy), expected, "size " + to_string(height.size()));
    }
    return failures ? 1 : 0;
}
