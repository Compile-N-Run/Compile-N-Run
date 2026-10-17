int main() {
    vector<pair<vector<int>, vector<int>>> cases = {
        {{-4, -1, 0, 3, 10}, {0, 1, 9, 16, 100}},
        {{-7, -3, 2, 3, 11}, {4, 9, 9, 49, 121}},
        {{1, 2, 3}, {1, 4, 9}},
        {{-3, -2, -1}, {1, 4, 9}},
        {{0}, {0}},
        {{-5}, {25}},
        {{0, 0, 0}, {0, 0, 0}},
        {{-2, -2, 2, 2}, {4, 4, 4, 4}},
        {{-10000, 10000}, {100000000, 100000000}},
    };
    vector<int> big, bigWant;
    for (int i = -500; i < 500; i++) { big.push_back(i); bigWant.push_back(i * i); }
    sort(bigWant.begin(), bigWant.end());
    cases.push_back({big, bigWant});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> copy = cases[n].first;
        check(Solution().sortedSquares(copy), cases[n].second, "case " + to_string(n) + " first " + to_string(copy[0]));
    }
    return failures ? 1 : 0;
}
