int main() {
    string big = "7*3/2";
    for (int i = 1; i < 5000; i++) big += "+7*3/2";  // 5000 terms of 10
    vector<pair<string, int>> cases = {{"3+4*2", 11}, {" 20 / 3 - 1 ", 5}, {"8-6/4*3", 5}, {"42", 42}, {"3-5/2", 1}, {"14-3/2", 13},
        {"1-1+1", 1}, {"0*7", 0}, {"2*3*4/5", 4}, {"  2147483647 ", 2147483647}, {"100 - 99 - 1", 0}, {big, 50000}};
    for (auto& [s, expected] : cases) check(Solution().calculate(s), expected, s.substr(0, 20));
    return failures ? 1 : 0;
}
