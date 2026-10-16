int main() {
    vector<string> grid = {"CAT", "ORE", "DOG"};
    vector<string> snake = {"ABCDEF", "LKJIHG", "MNOPQR", "XWVUTS", "YZABCD", "JIHGFE"};
    vector<string> flat(6, "AAAAAA");
    vector<tuple<vector<string>, string, bool>> cases = {{grid, "CARE", true}, {grid, "DOGE", true}, {grid, "CODE", false},
        {grid, "CAC", false}, {grid, "TAR", true}, {grid, "CATERODOG", true}, {{"a"}, "a", true}, {{"a"}, "b", false},
        {{"ab"}, "aba", false}, {{"ab", "cd"}, "abdc", true}, {{"ab", "cd"}, "ad", false},
        {snake, "ABCDEFGHIJKLMNO", true}, {snake, "ABCDEFGHIJKLMNQ", false}, {flat, "AAAAAAAAAB", false},
        {flat, string(15, 'A'), true}};
    for (auto& [rows, word, expected] : cases) {
        vector<vector<char>> board;
        for (auto& row : rows) board.push_back(vector<char>(row.begin(), row.end()));
        check(Solution().exist(board, word), expected, word);
    }
    return failures ? 1 : 0;
}
