static string rep(const string& s, int k) { string out; for (int i = 0; i < k; i++) out += s; return out; }

int main() {
    vector<pair<string, int>> cases = {{"())((())", 4}, {"(()()", 4}, {"()(())", 6}, {")(", 0}, {"", 0}, {"((((", 0},
        {"()(()", 2}, {")()())()()(", 4}, {"()", 2},
        {"(" + rep("()", 5000) + "))", 10002}, {rep("()", 3000) + "(" + rep("()", 2000), 6000}};
    for (auto& [s, expected] : cases) check(Solution().longestValidParentheses(s), expected, "'" + s.substr(0, 20) + "'");
    return failures ? 1 : 0;
}
