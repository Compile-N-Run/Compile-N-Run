int main() {
    vector<vector<int>> cases = {{2, 1, 0, 2, 0, 1}, {1, 2, 1}, {2, 2, 0}, {1}, {2, 0}, {1, 0}, {0, 0, 0}, {2, 1, 0}};
    vector<int> big;
    for (int i = 0; i < 1000; i++) big.push_back((i * 7 + i / 3) % 3);
    cases.push_back(big);
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> got = cases[n], expected = cases[n];
        sort(expected.begin(), expected.end());
        Solution().sortColors(got);
        check(got, expected, "case " + to_string(n));
    }
    return failures ? 1 : 0;
}
