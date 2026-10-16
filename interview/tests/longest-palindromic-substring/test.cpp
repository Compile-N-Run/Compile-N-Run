int main() {
    // Larger case: 990 letters cycling through the alphabet (no palindrome longer than 1)
    // with a 10-character palindrome inserted in the middle.
    string alpha;
    for (int i = 0; i < 990; i++) alpha += char('a' + i % 26);
    string big = alpha.substr(0, 500) + "1234554321" + alpha.substr(500);
    vector<pair<string, int>> cases = {{"xracecarz", 7}, {"abbc", 2}, {"pqr", 1}, {"aaaa", 4}, {"a", 1}, {"Aa", 1},
        {"abacdfgdcaba", 3}, {"ab12321ba", 9}, {big, 10}};
    for (auto& [s, length] : cases) {
        string got = Solution().longestPalindrome(s);
        string rev(got.rbegin(), got.rend());
        bool ok = (int)got.size() == length && got == rev && s.find(got) != string::npos;
        check(ok, true, s.substr(0, 20));
    }
    return failures ? 1 : 0;
}
