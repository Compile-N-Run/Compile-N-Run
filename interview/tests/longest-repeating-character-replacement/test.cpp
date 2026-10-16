static string repeatStr(const string& part, int times) {
    string out;
    for (int i = 0; i < times; i++) out += part;
    return out;
}

int main() {
    struct Case { string s; int k, expected; };
    vector<Case> cases = {
        {"AABCA", 1, 3},
        {"AABCA", 2, 5},
        {"ABBBAA", 1, 4},
        {"XYZ", 0, 1},
        {"BBBB", 0, 4},
        {"ABAB", 2, 4},
        {"AAABBB", 1, 4},
        {"A", 5, 1},
        {"ABCDE", 2, 3},
        {"AABBCC", 2, 4},
        {repeatStr("A", 5000) + repeatStr("B", 5000), 100, 5100},
        {repeatStr("AB", 5000), 0, 1},
        {repeatStr("AB", 5000), 5000, 10000},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        check(Solution().characterReplacement(cases[n].s, cases[n].k), cases[n].expected,
              "case " + to_string(n) + " (n=" + to_string(cases[n].s.size()) + ") k=" + to_string(cases[n].k));
    }
    return failures ? 1 : 0;
}
