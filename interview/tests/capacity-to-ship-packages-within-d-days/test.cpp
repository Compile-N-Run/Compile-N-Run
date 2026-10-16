int main() {
    vector<int> big;
    for (int i = 0; i < 50000; i++) big.push_back(i % 500 + 1);
    vector<tuple<vector<int>, int, int>> cases = {
        {{3, 2, 2, 4, 1, 4}, 3, 6},
        {{7, 3, 5}, 1, 15},
        {{7, 3, 5}, 3, 7},
        {{5}, 1, 5},
        {{1, 1, 1, 1}, 2, 2},
        {{1, 1, 1, 1}, 4, 1},
        {{1, 1, 1, 1}, 3, 2},
        {{10, 1, 1, 1, 1, 10}, 2, 12},
        {{6, 2, 9, 3, 8, 1}, 4, 9},
        {{500, 500, 500}, 50, 500},
        {big, 100, 125250},
        {big, 1, 12525000},
        {big, 50000, 500},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> weights = get<0>(cases[n]);
        check(Solution().shipWithinDays(weights, get<1>(cases[n])), get<2>(cases[n]), "case " + to_string(n));
    }
    return failures ? 1 : 0;
}
