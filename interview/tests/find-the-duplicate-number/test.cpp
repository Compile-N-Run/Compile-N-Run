int main() {
    vector<pair<vector<int>, int>> cases = {
        {{2, 5, 1, 4, 3, 5}, 5},
        {{1, 3, 4, 2, 2}, 2},
        {{3, 1, 3, 4, 2}, 3},
        {{4, 4, 4, 4, 4, 4}, 4},
        {{1, 1}, 1},
        {{2, 2, 1}, 2},
        {{2, 5, 9, 6, 9, 3, 8, 9, 7, 1}, 9},
        {{9, 8, 7, 6, 5, 4, 3, 2, 1, 9}, 9},
    };
    vector<int> big = {777};
    for (int i = 100000; i >= 1; i--) big.push_back(i);
    cases.push_back({big, 777});
    cases.push_back({vector<int>(50001, 1), 1});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> nums = cases[n].first;
        check(Solution().findDuplicate(nums), cases[n].second, "case " + to_string(n));
        check(nums, cases[n].first, "case " + to_string(n) + " must not modify the input");
    }
    return failures ? 1 : 0;
}
