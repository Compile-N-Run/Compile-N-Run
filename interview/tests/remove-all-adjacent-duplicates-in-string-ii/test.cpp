int main() {
    vector<tuple<string, int, string>> cases = {
        {"abbbacd", 3, "aacd"},
        {"abbbaac", 3, "c"},
        {"aabbccbba", 2, "a"},
        {"xyz", 2, "xyz"},
        {"aaaa", 3, "a"},
        {"abcd", 2, "abcd"},
        {"deeedbbcccbdaa", 3, "aa"},
        {"pbbcggttciiippooaais", 2, "ps"},
        {"aaa", 3, ""},
        {"aa", 3, "aa"},
        {"yfttttfbbbbnnnnffbgffffgbbbbgssssgthyyyy", 4, "ybth"},
        {"a", 2, "a"},
        {string(10000, 'a'), 10, ""},
        {string(10001, 'a'), 10, "a"},
    };
    string ab;
    for (int i = 0; i < 5000; i++) ab += "ab";
    cases.push_back({ab, 2, ab});
    for (const auto& [s, k, expected] : cases) {
        check(Solution().removeDuplicates(s, k), expected, "removeDuplicates(" + s.substr(0, 16) + ", " + to_string(k) + ")");
    }
    return failures ? 1 : 0;
}
