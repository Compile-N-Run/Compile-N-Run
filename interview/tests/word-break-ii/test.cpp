int main() {
    vector<tuple<string, vector<string>, vector<string>>> cases = {
        {"icecreamcone", {"ice", "cream", "cone", "icecream"}, {"ice cream cone", "icecream cone"}},
        {"sunflowerpot", {"sun", "flower", "pot", "flow", "erpot"}, {"sun flow erpot", "sun flower pot"}},
        {"hotdogs", {"hot", "dog", "hotdog"}, {}},
        {"a", {"a"}, {"a"}},
        {"a", {"b"}, {}},
        {"aaa", {"a", "aa"}, {"a a a", "a aa", "aa a"}},
        {"abab", {"ab", "abab", "a", "b"}, {"a b a b", "a b ab", "ab a b", "ab ab", "abab"}},
        {string(25, 'a') + "b", {"a", "aa", "aaa"}, {}},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        auto [s, words, expected] = cases[n];
        vector<string> got = Solution().wordBreak(s, words);
        sort(got.begin(), got.end());
        check(got, expected, "case " + to_string(n) + ": " + s.substr(0, 20));
    }

    // Larger case: 'a' * 12 with pieces of 1-3 letters has 927 sentences (a tribonacci number).
    string big(12, 'a');
    vector<string> bigWords = {"a", "aa", "aaa"};
    set<string> allowed(bigWords.begin(), bigWords.end());
    vector<string> got = Solution().wordBreak(big, bigWords);
    check((int)got.size(), 927, "count " + big);
    check((int)set<string>(got.begin(), got.end()).size(), 927, "distinct " + big);
    bool all = true;
    for (const string& sentence : got) {
        string joined;
        stringstream ss(sentence);
        for (string w; ss >> w;) { joined += w; all = all && allowed.count(w); }
        all = all && joined == big;
    }
    check(all, true, "each sentence spells s " + big);
    return failures ? 1 : 0;
}
