int main() {
    vector<pair<vector<int>, vector<int>>> cases = {
        {{1, 3, 2}, {2, 1, 3}}, {{5, 4, 3}, {3, 4, 5}}, {{2, 2, 7}, {2, 7, 2}},
        {{1, 5, 8, 4, 7, 6, 5, 3, 1}, {1, 5, 8, 5, 1, 3, 4, 6, 7}}, {{1}, {1}}, {{1, 1}, {1, 1}}, {{1, 2}, {2, 1}},
        {{3, 1, 2}, {3, 2, 1}}, {{1, 5, 1}, {5, 1, 1}}, {{2, 3, 1, 3, 3}, {2, 3, 3, 1, 3}}, {{0, -1, 4}, {0, 4, -1}},
    };
    vector<int> asc(1000);
    iota(asc.begin(), asc.end(), 0);
    vector<int> ascNext = asc;
    swap(ascNext[998], ascNext[999]);
    vector<int> desc(asc.rbegin(), asc.rend());
    cases.push_back({asc, ascNext});
    cases.push_back({desc, asc});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> arr = cases[n].first;
        Solution().nextPermutation(arr);
        check(arr, cases[n].second, "case " + to_string(n));
    }
    return failures ? 1 : 0;
}
