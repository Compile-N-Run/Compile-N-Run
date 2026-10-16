int main() {
    string chain = "1";  // 1+1+...+1
    for (int i = 1; i < 5000; i++) chain += "+1";
    string deep = string(2000, '(') + "1" + string(2000, ')');
    vector<pair<string, int>> cases = {{"12 - 5 + 3", 10}, {"2-(5-6)", 3}, {"(1+(4+5+2)-3)+(6+8)", 23}, {"-(2+3)", -5},
        {"1-(2-(3-(4-5)))", 3}, {"  42  ", 42}, {"(  (7) )", 7}, {"1-(-1)", 2}, {"0", 0}, {"2147483647", 2147483647}, {"10 - 100", -90},
        {"- (3 + (4 + 5))", -12}, {"123+45-678", -510}, {"(0-2147483647)-1", INT_MIN}, {chain, 5000}, {deep, 1},
        {"-" + deep + "+(" + chain + ")", 4999}};
    for (auto& [s, expected] : cases) {
        check(Solution().calculate(s), expected, s.substr(0, 24));
    }
    return failures ? 1 : 0;
}
