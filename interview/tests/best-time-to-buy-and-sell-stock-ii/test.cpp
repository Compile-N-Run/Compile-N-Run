int main() {
    vector<int> big;
    for (int i = 0; i < 10000; i++) big.push_back(i % 10);  // 1000 climbs from 0 to 9
    vector<pair<vector<int>, int>> cases = {{{3, 1, 4, 2, 6}, 7}, {{2, 3, 5, 8}, 6}, {{9, 7, 4, 1}, 0}, {{5}, 0}, {{4, 4, 4}, 0},
        {{0, 10000}, 10000}, {{7, 1, 5, 3, 6, 4}, 7}, {{1, 5, 5, 2, 8}, 10}, {big, 9000}};
    for (auto& [prices, expected] : cases) {
        vector<int> copy = prices;
        check(Solution().maxProfit(copy), expected, "size " + to_string(prices.size()));
    }
    return failures ? 1 : 0;
}
