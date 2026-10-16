int main() {
    vector<pair<int, string>> cases = {{68, "LXVIII"}, {944, "CMXLIV"}, {2026, "MMXXVI"}, {3999, "MMMCMXCIX"}, {1, "I"}, {4, "IV"},
        {9, "IX"}, {40, "XL"}, {1994, "MCMXCIV"}, {3888, "MMMDCCCLXXXVIII"}};
    for (auto& [num, expected] : cases) check(Solution().intToRoman(num), expected, to_string(num));
    // Larger case: every number in range, against an independent digit-by-digit table.
    vector<string> TH = {"", "M", "MM", "MMM"};
    vector<string> HU = {"", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"};
    vector<string> TE = {"", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"};
    vector<string> ON = {"", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"};
    for (int n = 1; n < 4000; n++) {
        check(Solution().intToRoman(n), TH[n / 1000] + HU[n / 100 % 10] + TE[n / 10 % 10] + ON[n % 10], to_string(n));
    }
    return failures ? 1 : 0;
}
