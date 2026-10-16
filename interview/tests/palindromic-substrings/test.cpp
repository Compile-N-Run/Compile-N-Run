int main() {
    string ab;
    for (int i = 0; i < 500; i++) ab += "ab";
    vector<pair<string, int>> cases = {{"aba", 4}, {"aaaa", 10}, {"abba", 6}, {"abcd", 4}, {"x", 1}, {"racecar", 10},
        {"zz", 3}, {string(1000, 'a'), 500500}, {ab, 250500}};
    for (auto& [s, expected] : cases) check(Solution().countSubstrings(s), expected, s.substr(0, 20));
    return failures ? 1 : 0;
}
