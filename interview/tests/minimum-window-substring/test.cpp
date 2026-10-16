int main() {
    string big(100000, 'x');
    big[10] = 'a'; big[30000] = 'a'; big[30005] = 'c'; big[30010] = 'b';
    vector<tuple<string, string, string>> cases = {{"thequickfox", "qf", "quickf"}, {"abacab", "aab", "aba"}, {"abc", "aa", ""},
        {"a", "ab", ""}, {"a", "a", "a"}, {"Aa", "a", "a"}, {"Aa", "A", "A"}, {"abc", "d", ""}, {"MXNOYXMN", "MN", "MN"},
        {"aaflslflsldkalskaaa", "aaa", "aaa"}, {big, "abc", big.substr(30000, 11)}};
    for (auto& [s, t, expected] : cases) {
        check(Solution().minWindow(s, t), expected, s.substr(0, 20) + " " + t);
    }
    return failures ? 1 : 0;
}
