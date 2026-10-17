int main() {
    vector<tuple<string, string, string>> cases = {
        {"12", "34", "408"},
        {"3", "4", "12"},
        {"999", "999", "998001"},
        {"0", "98765", "0"},
        {"2", "0", "0"},
        {"1", "1", "1"},
        {"25", "4", "100"},
        {"123456789", "987654321", "121932631112635269"},
        {"1" + string(199, '0'), "1" + string(199, '0'), "1" + string(398, '0')},
        // (10^200 - 1)^2 = 10^400 - 2 * 10^200 + 1
        {string(200, '9'), string(200, '9'), string(199, '9') + "8" + string(199, '0') + "1"},
    };
    for (auto& [num1, num2, expected] : cases) {
        check(Solution().multiply(num1, num2), expected, num1.substr(0, 12) + " * " + num2.substr(0, 12));
    }
    return failures ? 1 : 0;
}
