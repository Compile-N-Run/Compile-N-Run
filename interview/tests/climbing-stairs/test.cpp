int main() {
    vector<pair<int, int>> cases = {{1, 1}, {2, 2}, {3, 3}, {4, 5}, {6, 13}, {10, 89}, {20, 10946}, {45, 1836311903}};
    for (auto [n, expected] : cases) {
        check(Solution().climbStairs(n), expected, "n=" + to_string(n));
    }
    return failures ? 1 : 0;
}
