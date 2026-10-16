int main() {
    vector<string> full(300, string(300, '1')), board(300, string(300, '0'));
    for (int r = 0; r < 300; r++)
        for (int c = 0; c < 300; c++)
            if ((r + c) % 2 == 0) board[r][c] = '1';
    vector<pair<vector<string>, int>> cases = {{{"110", "010", "001"}, 2}, {{"101", "010", "101"}, 5}, {{"000"}, 0},
        {{"1111", "1001", "1111"}, 1}, {{"1"}, 1}, {{"10", "01", "10"}, 3}, {{"1", "1", "0", "1"}, 2}, {full, 1}, {board, 45000}};
    for (size_t n = 0; n < cases.size(); n++) {
        vector<vector<char>> grid;
        for (const string& row : cases[n].first) grid.push_back(vector<char>(row.begin(), row.end()));
        check(Solution().numIslands(grid), cases[n].second, "case " + to_string(n));
    }
    return failures ? 1 : 0;
}
