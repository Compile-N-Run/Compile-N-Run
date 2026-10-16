static vector<vector<string>> norm(vector<vector<string>> groups) {
    for (auto& g : groups) sort(g.begin(), g.end());
    sort(groups.begin(), groups.end());
    return groups;
}

int main() {
    vector<pair<vector<string>, vector<vector<string>>>> cases = {
        {{"note", "stone", "tone", "onset", "cat"}, {{"note", "tone"}, {"stone", "onset"}, {"cat"}}},
        {{"", "b", ""}, {{"", ""}, {"b"}}}, {{"loop"}, {{"loop"}}}, {{""}, {{""}}},
        {{"ab", "ab", "ba", "abb"}, {{"ab", "ab", "ba"}, {"abb"}}}, {{"aab", "abb", "bab", "aba"}, {{"aab", "aba"}, {"abb", "bab"}}},
        {{"x", "y", "z"}, {{"x"}, {"y"}, {"z"}}}};
    // Larger case: 1000 rotations of prefixes of "abcdefghij"; words of equal length are anagrams.
    vector<string> big;
    vector<vector<string>> expectedBig(10);
    for (int i = 0; i < 1000; i++) {
        int n = i % 10 + 1, r = (i / 10) % n;
        string base = string("abcdefghij").substr(0, n);
        string w = base.substr(r) + base.substr(0, r);
        big.push_back(w);
        expectedBig[n - 1].push_back(w);
    }
    cases.push_back({big, expectedBig});
    for (auto& [strs, expected] : cases) {
        vector<string> copy = strs;
        check(norm(Solution().groupAnagrams(copy)), norm(expected), "group of " + to_string(strs.size()));
    }
    return failures ? 1 : 0;
}
