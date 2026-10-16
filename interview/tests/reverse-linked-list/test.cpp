int main() {
    vector<int> big;
    for (int v = -2500; v < 2500; v++) big.push_back(v);
    vector<vector<int>> cases = {{1, 2, 3, 4}, {8, 5}, {7}, {}, {3, 3, 1}, {-5, 0, 5, -5}, big};
    for (auto& values : cases) {
        vector<int> expected(values.rbegin(), values.rend());
        check(listValues(Solution().reverseList(buildList(values))), expected, "size " + to_string(values.size()));
    }
    return failures ? 1 : 0;
}
