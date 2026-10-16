int main() {
    vector<tuple<vector<int>, int, vector<int>>> cases = {{{10, 20, 30, 40, 50, 60, 70}, 3, {30, 20, 10, 60, 50, 40, 70}},
        {{1, 2, 3, 4}, 4, {4, 3, 2, 1}}, {{5, 6, 7, 8, 9}, 2, {6, 5, 8, 7, 9}}, {{1, 2, 3}, 1, {1, 2, 3}}, {{42}, 1, {42}},
        {{1, 2, 3, 4, 5, 6}, 3, {3, 2, 1, 6, 5, 4}}, {{0, 0, 1, 1, 2}, 2, {0, 0, 1, 1, 2}}};
    // Larger cases: 5000 nodes in groups of 7 (2 left over) and one group of 5000.
    vector<int> big(5000), expected7;
    iota(big.begin(), big.end(), 0);
    for (int i = 0; i < 5000; i += 7) {
        vector<int> chunk(big.begin() + i, big.begin() + min(i + 7, 5000));
        if (chunk.size() == 7) reverse(chunk.begin(), chunk.end());
        expected7.insert(expected7.end(), chunk.begin(), chunk.end());
    }
    cases.push_back({big, 7, expected7});
    cases.push_back({big, 5000, vector<int>(big.rbegin(), big.rend())});
    for (auto& [values, k, expected] : cases) {
        check(listValues(Solution().reverseKGroup(buildList(values), k)), expected, "size " + to_string(values.size()) + " k=" + to_string(k));
    }
    return failures ? 1 : 0;
}
