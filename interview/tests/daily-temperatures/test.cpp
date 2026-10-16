int main() {
    vector<int> big(1000, 50), bigExpected(1000, 0);
    big[999] = 60;
    for (int i = 0; i < 999; i++) bigExpected[i] = 999 - i;
    vector<pair<vector<int>, vector<int>>> cases = {{{70, 68, 69, 72, 71}, {3, 1, 1, 0, 0}}, {{50, 50, 50}, {0, 0, 0}},
        {{30, 40, 50}, {1, 1, 0}}, {{80, 60, 70, 90}, {3, 1, 1, 0}}, {{55}, {0}}, {{100, 90, 80, 95, 30}, {0, 2, 1, 0, 0}},
        {big, bigExpected}};
    for (auto& [temps, expected] : cases) {
        vector<int> copy = temps;
        check(Solution().dailyTemperatures(copy), expected, "n=" + to_string(temps.size()));
    }
    return failures ? 1 : 0;
}
