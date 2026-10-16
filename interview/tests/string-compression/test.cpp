int main() {
    vector<pair<string, string>> cases = {{"xxxyzz", "x3yz2"}, {"q", "q"}, {string(12, 'm'), "m12"}, {"abba", "ab2a"},
        {"##@@@1111", "#2@314"}, {string(10, 'z'), "z10"}, {"ab", "ab"}, {"11122", "1322"},
        {string(1000, 'a') + "b" + string(100, 'c'), "a1000bc100"}};
    for (auto& [text, expected] : cases) {
        vector<char> chars(text.begin(), text.end());
        int n = Solution().compress(chars);
        check(n, (int)expected.size(), text.substr(0, 20) + " length");
        check(string(chars.begin(), chars.begin() + min(n, (int)chars.size())), expected, text.substr(0, 20));
    }
    return failures ? 1 : 0;
}
