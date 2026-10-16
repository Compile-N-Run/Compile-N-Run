int main() {
    vector<int> seq(10000);
    iota(seq.begin(), seq.end(), 1);
    vector<tuple<vector<int>, int, int>> cases = {{{5, 9, 2}, 6, 3}, {{10, 10}, 2, 10}, {{7}, 7, 1}, {{4, 1, 8}, 5, 4},
        {{2, 2, 2}, 3, 2}, {{1, 1, 1, 1}, 10, 1}, {{1000000000}, 2, 500000000},
        {vector<int>(10000, 1000000000), 1000000000, 10000}, {seq, 10000, 10000}};
    for (auto& [piles, h, expected] : cases) {
        vector<int> copy = piles;
        check(Solution().minEatingSpeed(copy, h), expected, "h " + to_string(h));
    }
    return failures ? 1 : 0;
}
