int main() {
    vector<tuple<vector<int>, int, int>> cases = {{{2, 5, 10}, 27, 4}, {{1, 3, 4}, 6, 2}, {{3, 7}, 5, -1}, {{4}, 0, 0}, {{1}, 1, 1},
        {{2}, 3, -1}, {{2147483647}, 2, -1}, {{3, 7, 405, 436}, 8839, 25}, {{37, 233, 91, 512}, 9999, 28}, {{2, 7}, 10000, 1430}};
    for (auto& [coins, amount, expected] : cases) {
        vector<int> copy = coins;
        check(Solution().coinChange(copy, amount), expected, "amount " + to_string(amount));
    }
    return failures ? 1 : 0;
}
