static string repeatStr(const string& s, int n) { string out; for (int i = 0; i < n; i++) out += s; return out; }

int main() {
    vector<pair<string, bool>> cases = {{"([]{})", true}, {"([)]", false}, {"((", false}, {"}", false}, {"()[]{}", true},
        {")(", false}, {"{[()()]}", true}, {"[", false}, {"(]", false},
        {repeatStr("{[(", 3000) + repeatStr(")]}", 3000), true}, {string(5000, '(') + string(4999, ')'), false}};
    for (auto& [s, expected] : cases) {
        check(Solution().isValid(s), expected, s.substr(0, 20));
    }
    return failures ? 1 : 0;
}
