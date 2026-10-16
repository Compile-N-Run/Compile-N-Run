static bool validParens(const string& s) {
    int depth = 0;
    for (char ch : s) {
        depth += ch == '(' ? 1 : -1;
        if (depth < 0) return false;
    }
    return depth == 0;
}

int main() {
    map<int, vector<string>> exact = {{1, {"()"}}, {2, {"(())", "()()"}}, {3, {"((()))", "(()())", "(())()", "()(())", "()()()"}}};
    vector<int> catalan = {1, 1, 2, 5, 14, 42, 132, 429, 1430};
    for (int n = 1; n <= 8; n++) {
        vector<string> got = Solution().generateParenthesis(n);
        sort(got.begin(), got.end());
        string label = "n=" + to_string(n);
        if (exact.count(n)) check(got, exact[n], label);
        check((int)got.size(), catalan[n], label + " count");
        check((int)set<string>(got.begin(), got.end()).size(), (int)got.size(), label + " duplicates");
        bool ok = true;
        for (auto& s : got) ok = ok && (int)s.size() == 2 * n && validParens(s);
        check(ok, true, label + " all valid");
    }
    return failures ? 1 : 0;
}
