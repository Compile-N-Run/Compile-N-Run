static string toRoman(int n) {
    vector<pair<int, string>> table = {{1000, "M"}, {900, "CM"}, {500, "D"}, {400, "CD"}, {100, "C"}, {90, "XC"},
        {50, "L"}, {40, "XL"}, {10, "X"}, {9, "IX"}, {5, "V"}, {4, "IV"}, {1, "I"}};
    string out;
    for (auto& [v, sym] : table) {
        while (n >= v) { out += sym; n -= v; }
    }
    return out;
}

int main() {
    vector<pair<string, int>> cases = {{"LXXVIII", 78}, {"CDXLIV", 444}, {"MMXXVI", 2026}, {"IX", 9}, {"I", 1},
        {"MMMCMXCIX", 3999}, {"MMMDCCCLXXXVIII", 3888}, {"XLIX", 49}};
    for (auto& [s, expected] : cases) check(Solution().romanToInt(s), expected, s);
    for (int n = 1; n < 4000; n++) check(Solution().romanToInt(toRoman(n)), n, toRoman(n));  // every valid numeral
    return failures ? 1 : 0;
}
