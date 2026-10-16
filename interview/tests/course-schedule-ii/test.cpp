// Any topological order is accepted; an impossible schedule must give {}.
static bool valid(int n, const vector<vector<int>>& prereq, const vector<int>& order, bool possible) {
    if (!possible) return order.empty();
    if ((int)order.size() != n) return false;
    vector<int> pos(n, -1);
    for (int i = 0; i < n; i++) {
        if (order[i] < 0 || order[i] >= n || pos[order[i]] != -1) return false;
        pos[order[i]] = i;
    }
    for (auto& p : prereq) {
        if (pos[p[1]] > pos[p[0]]) return false;
    }
    return true;
}

int main() {
    vector<vector<int>> chain;  // course i before course i - 1
    for (int i = 1; i < 2000; i++) chain.push_back({i - 1, i});
    vector<vector<int>> looped = chain;
    looped.push_back({1999, 0});
    vector<tuple<int, vector<vector<int>>, bool>> cases = {{3, {{1, 0}, {2, 1}}, true}, {4, {{1, 0}, {2, 0}, {3, 1}, {3, 2}}, true},
        {3, {{0, 2}, {2, 0}}, false}, {3, {}, true}, {1, {}, true}, {3, {{0, 1}, {1, 2}, {2, 0}}, false},
        {6, {{5, 4}, {4, 3}, {0, 5}, {2, 1}}, true}, {2000, chain, true}, {2000, looped, false}};
    int i = 0;
    for (auto& [n, prereq, possible] : cases) {
        vector<vector<int>> copy = prereq;
        check(valid(n, prereq, Solution().findOrder(n, copy), possible), true, "case " + to_string(i++));
    }
    return failures ? 1 : 0;
}
