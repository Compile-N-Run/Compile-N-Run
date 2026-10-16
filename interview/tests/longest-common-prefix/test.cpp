int main() {
    // Larger case: 200 words of 200 characters that share their first 150 characters.
    vector<string> big;
    for (int i = 0; i < 200; i++) big.push_back(string(150, 'k') + string(50, char('a' + i % 26)));
    vector<pair<vector<string>, string>> cases = {{{"interview", "internet", "interval"}, "inter"}, {{"apple", "banana"}, ""},
        {{"code", "coder", "co"}, "co"}, {{"solo"}, "solo"}, {{""}, ""}, {{"abc", ""}, ""}, {{"same", "same", "same"}, "same"},
        {{"prefix", "pre", "prelude", "prey"}, "pre"}, {big, string(150, 'k')}};
    for (auto& [strs, expected] : cases) {
        vector<string> copy = strs;
        check(Solution().longestCommonPrefix(copy), expected, "first word " + strs[0].substr(0, 20));
    }
    return failures ? 1 : 0;
}
