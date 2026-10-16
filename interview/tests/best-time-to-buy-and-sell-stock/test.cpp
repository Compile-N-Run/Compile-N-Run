int main() {
    // Large case: prices fall from 50000 to 1, then rise from 1 to 50000.
    vector<int> big;
    for (int i = 0; i < 50000; i++) big.push_back(50000 - i);
    for (int i = 0; i < 50000; i++) big.push_back(i + 1);
    vector<pair<vector<int>, int>> cases = {{{9, 2, 6, 1, 4}, 4}, {{2, 9, 1, 8}, 7}, {{8, 6, 5, 3}, 0}, {{5}, 0}, {{3, 3, 3}, 0},
        {{0, 10000}, 10000}, {{4, 1, 7, 0, 2}, 6}, {big, 49999}};
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> copy = cases[n].first;
        check(Solution().maxProfit(copy), cases[n].second, "case " + to_string(n));
    }
    return failures ? 1 : 0;
}
