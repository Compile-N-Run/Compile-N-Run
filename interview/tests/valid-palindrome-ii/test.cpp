int main() {
    vector<pair<string, bool>> cases = {
        {"abca", true},
        {"acba", true},
        {"abc", false},
        {"racecar", true},
        {"abcdba", true},
        {"a", true},
        {"ab", true},
        {"aba", true},
        {"abba", true},
        {"abcca", true},
        {"accba", true},
        {"abcdedcbaq", true},
        {"xabcdedcby", false},
        {"deeee", true},
        {"eedcfee", false},
        {"compilexnrunnurnelipmoc", true},
        {"compilexnrunnurnelipmyoc", false},
    };
    string half, alternating;
    for (int i = 0; i < 2500; i++) half += "ab";
    for (int i = 0; i < 5000; i++) alternating += "ab";
    string mirror = half + string(half.rbegin(), half.rend());  // a 10,000-character palindrome
    cases.push_back({mirror, true});
    cases.push_back({half + "z" + string(half.rbegin(), half.rend()), true});
    cases.push_back({"z" + mirror, true});
    cases.push_back({mirror + "z", true});
    cases.push_back({alternating, true});
    cases.push_back({mirror.substr(0, 2500) + "zq" + mirror.substr(2500), false});
    cases.push_back({mirror.substr(0, 100) + "z" + mirror.substr(100, 100) + "q" + mirror.substr(200), false});
    for (size_t n = 0; n < cases.size(); n++) {
        const string& s = cases[n].first;
        string label = s.size() <= 40 ? s : s.substr(0, 12) + "..." + s.substr(s.size() - 12) + " (" + to_string(s.size()) + " chars)";
        check(Solution().validPalindrome(s), cases[n].second, "case " + to_string(n) + " " + label);
    }
    return failures ? 1 : 0;
}
