int main() {
    vector<pair<vector<int>, vector<int>>> cases = {{{2, 5, 9}, {4, 10}}, {{1, 1}, {1}}, {{}, {-3, 6}}, {{7}, {}},
        {{4, 5, 6}, {1, 2, 3}}, {{1, 2, 3}, {4, 5, 6}}, {{-5, 0, 0}, {-5, 0}}};
    vector<int> big1, big2;
    for (int i = 0; i < 1000; i++) { big1.push_back(2 * i); big2.push_back(2 * i - 1); }
    cases.push_back({big1, big2});
    for (size_t c = 0; c < cases.size(); c++) {
        auto [a, b] = cases[c];
        vector<int> nums1 = a, expected = a;
        nums1.resize(a.size() + b.size(), 0);
        expected.insert(expected.end(), b.begin(), b.end());
        sort(expected.begin(), expected.end());
        Solution().merge(nums1, (int)a.size(), b, (int)b.size());
        check(nums1, expected, "case " + to_string(c));
    }
    return failures ? 1 : 0;
}
