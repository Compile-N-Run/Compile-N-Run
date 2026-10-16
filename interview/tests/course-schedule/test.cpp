int main() {
    vector<vector<int>> chain;
    for (int i = 1; i < 2000; i++) chain.push_back({i, i - 1});
    vector<vector<int>> looped = chain;
    looped.push_back({0, 1999});
    vector<tuple<int, vector<vector<int>>, bool>> cases = {{3, {{1, 0}, {2, 1}}, true}, {2, {{0, 1}, {1, 0}}, false}, {4, {}, true},
        {4, {{1, 0}, {2, 1}, {3, 2}, {1, 3}}, false}, {1, {}, true}, {5, {{1, 0}, {2, 0}, {3, 1}, {3, 2}, {4, 3}}, true},
        {3, {{0, 1}, {1, 2}, {2, 0}}, false}, {2000, chain, true}, {2000, looped, false}};
    int i = 0;
    for (auto& [n, prereq, expected] : cases) {
        vector<vector<int>> copy = prereq;
        check(Solution().canFinish(n, copy), expected, "case " + to_string(i++));
    }
    return failures ? 1 : 0;
}
