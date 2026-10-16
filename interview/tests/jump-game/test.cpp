int main() {
    vector<pair<vector<int>, bool>> cases = {
        {{2, 0, 1, 0}, true}, {{1, 1, 0, 2}, false}, {{3, 0, 0, 0, 5}, false}, {{0}, true}, {{5}, true},
        {{0, 1}, false}, {{2, 3, 0, 0, 1}, true}, {{4, 0, 0, 0, 0}, true}, {{1, 0, 1, 0}, false},
    };
    vector<int> bigOk(10000, 1), bigStuck(10000, 1), bigLeap(10000, 0);
    bigStuck[5000] = 0;
    bigLeap[0] = 10000;
    cases.push_back({bigOk, true});
    cases.push_back({bigStuck, false});
    cases.push_back({bigLeap, true});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> input = cases[n].first;
        check(Solution().canJump(input), cases[n].second, "case " + to_string(n));
    }
    return failures ? 1 : 0;
}
