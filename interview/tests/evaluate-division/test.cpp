int main() {
    vector<vector<string>> chain;
    for (int i = 0; i < 19; i++) chain.push_back({"v" + to_string(i), "v" + to_string(i + 1)});
    struct Case { vector<vector<string>> equations; vector<double> values; vector<vector<string>> queries; vector<double> expected; };
    vector<Case> cases = {
        {{{"a", "b"}, {"b", "c"}}, {3.0, 0.5}, {{"a", "c"}, {"c", "a"}, {"b", "b"}, {"a", "z"}}, {1.5, 2.0 / 3, 1.0, -1.0}},
        {{{"p", "q"}, {"r", "s"}}, {4.0, 2.0}, {{"p", "s"}, {"q", "p"}, {"s", "r"}}, {-1.0, 0.25, 0.5}},
        {{{"x", "y"}}, {5.0}, {{"x", "x"}, {"w", "w"}, {"y", "x"}}, {1.0, -1.0, 0.2}},
        {{{"ab", "cd"}, {"cd", "ef"}, {"ab", "gh"}}, {2.0, 3.0, 4.0}, {{"ef", "gh"}, {"gh", "cd"}}, {4.0 / 6, 0.5}},
        {{{"a", "b"}, {"b", "c"}, {"c", "a"}}, {2.0, 3.0, 1.0 / 6}, {{"a", "c"}, {"c", "b"}}, {6.0, 1.0 / 3}},
        {chain, vector<double>(19, 2.0), {{"v0", "v19"}, {"v19", "v0"}, {"v5", "v10"}, {"v3", "v20"}}, {524288.0, 1.0 / 524288, 32.0, -1.0}},
    };
    int n = 0;
    for (auto& c : cases) {
        vector<double> got = Solution().calcEquation(c.equations, c.values, c.queries);
        bool ok = got.size() == c.expected.size();
        for (size_t i = 0; ok && i < got.size(); i++) ok = fabs(got[i] - c.expected[i]) <= 1e-5 * max(1.0, fabs(c.expected[i]));
        check(ok, true, "case " + to_string(++n));
    }
    return failures ? 1 : 0;
}
