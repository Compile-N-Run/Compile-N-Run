static string repeat(const string& s, int times) {
    string out;
    for (int i = 0; i < times; i++) out += s;
    return out;
}

int main() {
    vector<tuple<string, string, int>> cases = {{"kitten", "sitting", 3}, {"sunday", "saturday", 3}, {"abc", "", 3}, {"", "abc", 3},
        {"", "", 0}, {"same", "same", 0}, {"a", "b", 1}, {"abcdef", "azced", 3}, {"ab", "ba", 2}, {"abcabcabc", "cba", 6},
        {string(500, 'a'), string(500, 'b'), 500}, {repeat("ab", 250), repeat("ba", 250), 2}, {string(300, 'x'), string(500, 'x'), 200}};
    for (auto& [word1, word2, expected] : cases) {
        check(Solution().minDistance(word1, word2), expected, word1.substr(0, 10) + " -> " + word2.substr(0, 10));
    }
    return failures ? 1 : 0;
}
