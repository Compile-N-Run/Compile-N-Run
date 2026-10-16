int main() {
    vector<string> big;
    for (char a = 'a'; a <= 'j'; a++)
        for (char b = 'a'; b <= 'j'; b++)
            for (char c = 'a'; c <= 'j'; c++) big.push_back(string{a, b, c});
    vector<tuple<string, string, vector<string>, int>> cases = {
        {"cat", "dog", {"cot", "cog", "dog", "bat"}, 4},
        {"cold", "warm", {"cord", "card", "ward", "warm", "worm"}, 5},
        {"cat", "dog", {"cot", "cog", "bat"}, 0},
        {"a", "c", {"a", "b", "c"}, 2},
        {"hot", "dog", {"hot", "dog"}, 0},
        {"lost", "cost", {"most", "fist", "lost", "cost", "fish"}, 2},
        {"abc", "xyz", {"abd", "xyz"}, 0},
        {"aaa", "jjj", big, 4}};
    for (auto& [begin, end, words, expected] : cases) {
        vector<string> copy = words;
        check(Solution().ladderLength(begin, end, copy), expected, begin + " -> " + end);
    }
    return failures ? 1 : 0;
}
