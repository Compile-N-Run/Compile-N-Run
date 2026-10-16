int main() {
    vector<tuple<vector<string>, vector<string>, vector<string>>> cases = {
        {{"cat", "ore", "dog"}, {"care", "tar", "code", "god", "cac"}, {"care", "god", "tar"}},
        {{"ab", "dc"}, {"ab", "abc", "abcd", "abcda"}, {"ab", "abc", "abcd"}},
        {{"a"}, {"a", "b", "aa"}, {"a"}},
        {{"xyz", "qrs"}, {"hello"}, {}},
        {{"aa", "aa"}, {"aaa", "aaaa", "aaaaa"}, {"aaa", "aaaa"}},
        {{"tape", "oarn", "pike", "seal"}, {"tap", "pan", "pear", "rope", "kin", "ikea", "seal", "lake", "ran", "topi", "tapenade"},
         {"lake", "seal", "tap", "topi"}},
        {{"cat", "ore", "dog"}, {"care", "doge", "code", "cac", "tar", "caterodog", "dog", "god", "rod", "ore"},
         {"care", "caterodog", "dog", "doge", "god", "ore", "rod", "tar"}},
        {{"abc", "def", "ghi"}, {"abcfedghi", "abcfi", "adgheb", "ihgfedcba", "bei", "aei"}, {"abcfedghi", "abcfi", "adgheb"}},
    };
    vector<string> aWords, aWant;
    for (int k = 1; k <= 10; k++) { aWords.push_back(string(k, 'a')); aWant.push_back(string(k, 'a')); }
    for (int k = 0; k < 10; k++) aWords.push_back(string(k, 'a') + "b");
    cases.push_back({vector<string>(6, "aaaaaa"), aWords, aWant});
    // 12x12 grid; the words walked along rows and columns exist, 2000 pseudo-random words do not.
    vector<string> grid(12, string(12, ' '));
    for (int r = 0; r < 12; r++)
        for (int c = 0; c < 12; c++) grid[r][c] = 'a' + (r * 7 + c * 3) % 26;
    vector<string> walks;
    for (int r = 0; r < 12; r++)
        for (int c = 0; c < 3; c++) walks.push_back(grid[r].substr(c, 10));
    for (int c = 0; c < 12; c++)
        for (int r = 0; r < 3; r++) {
            string w;
            for (int i = 0; i < 10; i++) w += grid[r + i][c];
            walks.push_back(w);
        }
    long long seed = 12345;
    auto rand = [&seed]() { seed = seed * 48271 % 2147483647; return seed; };
    vector<string> bigWords = walks;
    for (int n = 0; n < 2000; n++) {
        int length = 6 + rand() % 5;
        string w;
        for (int i = 0; i < length; i++) w += (char)('a' + rand() % 26);
        bigWords.push_back(w);
    }
    set<string> seen;
    vector<string> distinctWords;
    for (const string& w : bigWords) if (seen.insert(w).second) distinctWords.push_back(w);
    set<string> walkSet(walks.begin(), walks.end());
    cases.push_back({grid, distinctWords, vector<string>(walkSet.begin(), walkSet.end())});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<vector<char>> board;
        for (const string& row : get<0>(cases[n])) board.push_back(vector<char>(row.begin(), row.end()));
        vector<string> words = get<1>(cases[n]);
        vector<string> got = Solution().findWords(board, words);
        sort(got.begin(), got.end());
        check(got, get<2>(cases[n]), "case " + to_string(n));
    }
    return failures ? 1 : 0;
}
