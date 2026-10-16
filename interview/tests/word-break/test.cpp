int main() {
    vector<string> aWords = {"a", "aa", "aaa", "aaaa", "aaaaa", "aaaaaaaaaa"};
    string ab;
    for (int i = 0; i < 150; i++) ab += "ab";
    vector<tuple<string, vector<string>, bool>> cases = {
        {"sunflower", {"sun", "flower", "flow"}, true}, {"hotdogs", {"hot", "dog", "hotdog"}, false},
        {"abab", {"ab"}, true}, {"applepie", {"apple", "app", "lepie"}, true}, {"a", {"b"}, false}, {"a", {"a"}, true},
        {"catcat", {"cats", "at"}, false}, {"ab", {"abc"}, false},
        {string(299, 'a') + "b", aWords, false}, {string(300, 'a'), aWords, true}, {ab, {"a", "b", "ba"}, true},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        auto [s, words, expected] = cases[n];
        check(Solution().wordBreak(s, words), expected, "case " + to_string(n));
    }
    return failures ? 1 : 0;
}
