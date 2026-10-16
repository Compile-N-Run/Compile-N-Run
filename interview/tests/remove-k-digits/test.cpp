int main() {
    vector<tuple<string, int, string>> cases = {
        {"5329174", 3, "2174"},
        {"20300", 1, "300"},
        {"12345", 2, "123"},
        {"7", 1, "0"},
        {"1432219", 3, "1219"},
        {"10", 2, "0"},
        {"112", 1, "11"},
        {"54321", 2, "321"},
        {"10001", 1, "1"},
        {"100", 1, "0"},
        {"9871", 3, "1"},
        {"5337", 2, "33"},
        {"1173", 2, "11"},
        {"0", 0, "0"},
        {"123", 0, "123"},
        {string(5000, '9') + "1", 5000, "1"},
        {string(10000, '1') + "0", 1, string(9999, '1') + "0"},
    };
    for (const auto& [num, k, expected] : cases) {
        check(Solution().removeKdigits(num, k), expected, "removeKdigits(" + num.substr(0, 12) + ", " + to_string(k) + ")");
    }
    return failures ? 1 : 0;
}
