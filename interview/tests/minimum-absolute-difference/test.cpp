int main() {
    vector<pair<vector<int>, vector<vector<int>>>> cases = {
        {{4, 2, 1, 3}, {{1, 2}, {2, 3}, {3, 4}}},
        {{1, 3, 6, 10, 15}, {{1, 3}}},
        {{3, 8, -10, 23, 19, -4, -14, 27}, {{-14, -10}, {19, 23}, {23, 27}}},
        {{10, 1, 100, 7}, {{7, 10}}},
        {{1, 2}, {{1, 2}}},
        {{-5, 5}, {{-5, 5}}},
        {{1000000, -1000000}, {{-1000000, 1000000}}},
        {{-3, -1, -2}, {{-3, -2}, {-2, -1}}},
        {{40, 11, 26, 27, 10}, {{10, 11}, {26, 27}}},
    };
    vector<int> evens, squares;  // evens: every neighbouring gap is 2; squares: only 0 and 1 are 1 apart
    vector<vector<int>> evensWant;
    for (int i = 999; i >= 0; i--) { evens.push_back(2 * i); squares.push_back(i * i); }
    for (int i = 0; i < 999; i++) evensWant.push_back({2 * i, 2 * i + 2});
    cases.push_back({evens, evensWant});
    cases.push_back({squares, {{0, 1}}});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> arr = cases[n].first;
        check(Solution().minimumAbsDifference(arr), cases[n].second, "case " + to_string(n) + " (length " + to_string(arr.size()) + ")");
    }
    return failures ? 1 : 0;
}
