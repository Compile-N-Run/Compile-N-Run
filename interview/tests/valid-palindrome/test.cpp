int main() {
    string half;
    for (int i = 0; i < 20000; i++) half += "Ab1, ";
    string rev(half.rbegin(), half.rend());
    vector<pair<string, bool>> cases = {{"Step on no pets!", true}, {"Top spot 1", false}, {"?! .", true}, {"ab2a", false},
        {"a", true}, {"Aa", true}, {"0P", false}, {"No 'x' in Nixon", true}, {half + "#" + rev, true},
        {half + "x" + rev + "z", false}};
    for (auto& [s, expected] : cases) {
        check(Solution().isPalindrome(s), expected, s.substr(0, 30));
    }
    return failures ? 1 : 0;
}
