static string repeat(const string& s, int times) {
    string out;
    for (int i = 0; i < times; i++) out += s;
    return out;
}

int main() {
    string alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    vector<tuple<string, int, int>> cases = {{"AAABBB", 2, 8}, {"AAABBB", 0, 6}, {"AAAAAABCDEFG", 2, 16}, {"ABCD", 5, 4}, {"A", 5, 1},
        {"AAAA", 1, 7}, {"AABBCC", 1, 6}, {"AAB", 2, 4}, {"AAABBBCCC", 2, 9}, {"AAABBBCC", 3, 10}, {"ZZZZZZZZZZ", 0, 10},
        {string(10000, 'A') + string(10000, 'B'), 50, 9999 * 51 + 2}, {repeat(alphabet, 400), 1, 10400}, {string(1000, 'Q'), 100, 999 * 101 + 1}};
    for (auto& [tasks, n, expected] : cases) {
        vector<char> input(tasks.begin(), tasks.end());
        check(Solution().leastInterval(input, n), expected, tasks.substr(0, 12) + " n=" + to_string(n));
    }
    return failures ? 1 : 0;
}
