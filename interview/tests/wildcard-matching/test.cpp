static string repeat(const string& part, int times) {
    string out;
    for (int i = 0; i < times; i++) out += part;
    return out;
}

int main() {
    struct Case { string s, p; bool expected; };
    vector<Case> cases = {
        {"adceb", "*a*b", true},
        {"acdcb", "a*c?b", false},
        {"cb", "?a", false},
        {"", "**", true},
        {"abc", "", false},
        {"aa", "a", false},
        {"aa", "*", true},
        {"", "", true},
        {"", "?", false},
        {"abc", "abc", true},
        {"abc", "a?c", true},
        {"a", "a*", true},
        {"ho", "**ho", true},
        {"mississippi", "m??*ss*?i*pi", false},
        {"abefcdgiescdfimde", "ab*cd?i*de", true},
        {repeat("a", 2000) + "b", "*a", false},
        {repeat("a", 1000) + "b", "*a*b", true},
        {repeat("a", 2000), repeat("*", 50) + "b", false},
        {repeat("a", 2000), repeat("*a", 100) + "*", true},  // many stars that must each stretch
    };
    for (auto& c : cases) {
        check(Solution().isMatch(c.s, c.p), c.expected,
              "\"" + c.s.substr(0, 10) + "\" (length " + to_string(c.s.size()) + ") against \"" + c.p.substr(0, 12) + "\"");
    }
    return failures ? 1 : 0;
}
