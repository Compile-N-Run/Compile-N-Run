int main() {
    string E = ".........";
    vector<tuple<string, vector<string>, bool>> cases = {
        {"empty board", vector<string>(9, E), true},
        {"two 5s in row 0", {"5.......5", E, E, E, E, E, E, E, E}, false},
        {"two 9s in the centre box", {E, E, E, "...9.....", E, ".....9...", E, E, E}, false},
        {"valid but unsolvable", {"12345678.", "........9", E, E, E, E, E, E, E}, true},
        {"two 3s in column 4", {E, "....3....", E, E, E, E, E, "....3....", E}, false},
        {"full solved grid", {"123456789", "456789123", "789123456", "234567891", "567891234",
                              "891234567", "345678912", "678912345", "912345678"}, true},
        {"partly filled valid grid", {"...45..8.", ".5.7.9.23", ".89.23..6", ".3456.8.1", "5...9.2..",
                                      "..1234567", "3.56789.2", "6..91.3..", ".12.4.6.8"}, true},
        {"full grid with one wrong cell", {"123456789", "456789123", "789123456", "234567891", "567891234",
                                           "891234567", "345678912", "678912345", "912345677"}, false},
    };
    for (auto& [label, rows, expected] : cases) {
        vector<vector<char>> board;
        for (auto& row : rows) board.push_back(vector<char>(row.begin(), row.end()));
        check(Solution().isValidSudoku(board), expected, label);
    }
    return failures ? 1 : 0;
}
