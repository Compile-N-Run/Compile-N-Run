static string padWord(int i) {
    char buf[8];
    snprintf(buf, sizeof buf, "w%03d", i);
    return buf;
}

int main() {
    vector<string> big, top25, all;
    for (int i = 199; i >= 0; i--)  // word i appears i % 10 + 1 times
        for (int r = 0; r <= i % 10; r++) big.push_back(padWord(i));
    for (int i = 9; i < 200; i += 10) top25.push_back(padWord(i));
    for (int i : {8, 18, 28, 38, 48}) top25.push_back(padWord(i));
    for (int f = 10; f >= 1; f--)
        for (int i = f - 1; i < 200; i += 10) all.push_back(padWord(i));
    vector<tuple<vector<string>, int, vector<string>>> cases = {
        {{"pear", "apple", "pear", "fig", "apple", "pear"}, 2, {"pear", "apple"}},
        {{"b", "a", "b", "a"}, 2, {"a", "b"}},
        {{"dog", "cat", "dog", "cat", "bird", "bird", "ant"}, 3, {"bird", "cat", "dog"}},
        {{"solo"}, 1, {"solo"}},
        {{"z", "y", "x"}, 1, {"x"}},
        {{"aa", "a", "aaa", "a", "aa"}, 3, {"a", "aa", "aaa"}},
        {{"q", "w", "e", "w"}, 3, {"w", "e", "q"}},
        {{"x", "y", "y", "x", "z"}, 1, {"x"}},
        {big, 25, top25},
        {big, 200, all},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        auto& [words, k, expected] = cases[n];
        vector<string> copy = words;
        check(Solution().topKFrequent(copy, k), expected, "case " + to_string(n) + " k=" + to_string(k));
    }
    return failures ? 1 : 0;
}
