int main() {
    string bigS;
    for (int i = 0; i < 50000; i++) bigS += char('a' + i % 26);
    string bigT(bigS.rbegin(), bigS.rend());
    string bigBad = bigT.substr(0, bigT.size() - 1) + "q";
    vector<tuple<string, string, bool>> cases = {{"listen", "silent", true}, {"bell", "bel", false}, {"aab", "abb", false},
        {"x", "x", true}, {"a", "b", false}, {"anagram", "nagaram", true}, {"abc", "abcc", false}, {"zzzz", "zzzz", true},
        {bigS, bigT, true}, {bigS, bigBad, false}};
    for (auto& [s, t, expected] : cases) {
        check(Solution().isAnagram(s, t), expected, s.substr(0, 20) + " " + t.substr(0, 20));
    }
    return failures ? 1 : 0;
}
