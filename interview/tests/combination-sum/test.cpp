static vector<vector<int>> normalise(vector<vector<int>> combos) {
    for (auto& c : combos) sort(c.begin(), c.end());
    sort(combos.begin(), combos.end());
    return combos;
}

int main() {
    vector<tuple<vector<int>, int, vector<vector<int>>>> cases = {{{3, 4, 5}, 8, {{3, 5}, {4, 4}}},
        {{6, 3, 9}, 9, {{3, 3, 3}, {3, 6}, {9}}}, {{2}, 6, {{2, 2, 2}}}, {{5}, 3, {}},
        {{2, 3, 5}, 12, {{2, 2, 2, 2, 2, 2}, {2, 2, 2, 3, 3}, {2, 2, 3, 5}, {2, 5, 5}, {3, 3, 3, 3}}}, {{7}, 7, {{7}}},
        {{40, 2}, 1, {}}};
    for (auto& [candidates, target, expected] : cases) {
        vector<int> copy = candidates;
        check(normalise(Solution().combinationSum(copy, target)), expected, "target " + to_string(target));
    }
    // Larger case: 45 distinct combinations, each summing to 30 and using only the candidates.
    vector<int> bigInput = {7, 3, 2, 5};
    auto big = normalise(Solution().combinationSum(bigInput, 30));
    check(big.size(), (size_t)45, "count for [7, 3, 2, 5] 30");
    bool valid = true;
    for (auto& c : big) {
        int sum = 0;
        for (int x : c) { sum += x; if (x != 2 && x != 3 && x != 5 && x != 7) valid = false; }
        if (sum != 30) valid = false;
    }
    check(valid, true, "valid combinations");
    check(set<vector<int>>(big.begin(), big.end()).size(), (size_t)45, "no duplicates");
    return failures ? 1 : 0;
}
