int main() {
    vector<pair<vector<int>, bool>> cases = {
        {{4, 1, 7, 1}, true},
        {{3, 8, -2, 5}, false},
        {{0, 0}, true},
        {{42}, false},
        {{-1, 1, -1}, true},
        {{2147483647, -2147483648, 0}, false},
        {{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 5}, true},
    };
    vector<int> distinct;
    for (int i = 0; i < 100000; i++) distinct.push_back(i);
    cases.push_back({distinct, false});
    distinct.push_back(99999);
    cases.push_back({distinct, true});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> copy = cases[n].first;
        check(Solution().containsDuplicate(copy), cases[n].second, "case " + to_string(n));
    }
    return failures ? 1 : 0;
}
