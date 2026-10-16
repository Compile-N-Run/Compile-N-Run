int main() {
    vector<pair<int, bool>> cases = {{7, true}, {4, false}, {1, true}, {100, true}, {2, false}, {INT_MAX, false}, {1111111, true}, {999999999, false}};
    for (auto& [n, expected] : cases) check(Solution().isHappy(n), expected, "n=" + to_string(n));
    // Every number up to 100, compared with the known list of happy numbers.
    set<int> happy = {1, 7, 10, 13, 19, 23, 28, 31, 32, 44, 49, 68, 70, 79, 82, 86, 91, 94, 97, 100};
    for (int n = 1; n <= 100; n++) check(Solution().isHappy(n), happy.count(n) == 1, "n=" + to_string(n));
    return failures ? 1 : 0;
}
