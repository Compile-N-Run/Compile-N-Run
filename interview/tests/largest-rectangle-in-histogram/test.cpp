int main() {
    vector<int> inc, flat(100000, 10000);
    for (int i = 1; i <= 1000; i++) inc.push_back(i);
    vector<pair<vector<int>, int>> cases = {{{2, 1, 4, 5, 1, 3}, 8}, {{3, 3, 3}, 9}, {{1, 2, 3, 4, 5}, 9}, {{6, 0, 6}, 6}, {{7}, 7},
        {{0, 0}, 0}, {{5, 4, 1, 2}, 8}, {{2, 4, 2, 4, 2}, 10}, {inc, 250500}, {flat, 1000000000}};
    for (auto& [heights, expected] : cases) {
        vector<int> copy = heights;
        check(Solution().largestRectangleArea(copy), expected, "expected " + to_string(expected));
    }
    return failures ? 1 : 0;
}
