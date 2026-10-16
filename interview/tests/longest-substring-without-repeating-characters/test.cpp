int main() {
    string alphabet = "abcdefghijklmnopqrstuvwxyz", repeated;
    for (int i = 0; i < 2000; i++) repeated += alphabet;
    vector<pair<string, int>> cases = {{"xyzxab", 5}, {"abba", 2}, {"zzzz", 1}, {"", 0}, {"a b!a", 4}, {"dvdf", 3},
        {"tmmzuxt", 5}, {"q", 1}, {"01234567890", 10}, {repeated, 26}, {string(30000, 'a') + alphabet, 26}};
    for (auto& [s, expected] : cases) {
        check(Solution().lengthOfLongestSubstring(s), expected, "\"" + s.substr(0, 20) + "\"");
    }
    return failures ? 1 : 0;
}
