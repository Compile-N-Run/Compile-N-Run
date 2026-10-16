int main() {
    vector<string> big(100, string(100, '1'));
    big[50] = string(100, '0');
    vector<pair<vector<string>, int>> cases = {{{"110", "111", "011"}, 4}, {{"00", "00"}, 0}, {{"1"}, 1},
        {{"1111", "1111", "1110"}, 9}, {{"0"}, 0}, {{"10111"}, 1}, {{"01", "10"}, 1},
        {{"10111", "11111", "01111", "11110"}, 9}, {big, 2500}};
    for (auto& [rows, expected] : cases) {
        vector<vector<char>> matrix;
        for (auto& r : rows) matrix.push_back(vector<char>(r.begin(), r.end()));
        check(Solution().maximalSquare(matrix), expected, rows[0] + "... expected " + to_string(expected));
    }
    return failures ? 1 : 0;
}
