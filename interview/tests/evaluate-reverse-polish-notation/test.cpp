int main() {
    vector<pair<vector<string>, int>> cases = {
        {{"3", "4", "+", "2", "*"}, 14},
        {{"10", "3", "/"}, 3},
        {{"-7", "2", "/"}, -3},
        {{"7", "-2", "/"}, -3},
        {{"-7", "-2", "/"}, 3},
        {{"0", "-5", "/"}, 0},
        {{"2", "3", "4", "*", "+", "5", "-"}, 9},
        {{"5"}, 5},
        {{"-3", "-2", "*"}, 6},
        {{"6", "3", "-"}, 3},
        {{"2147483647", "1", "-"}, 2147483646},
        {{"-2147483648", "1", "/"}, INT_MIN},
        {{"4", "13", "5", "/", "+"}, 6},
    };
    vector<string> ones(1000, "1"), pluses(999, "+");  // pushes everything before the first operator
    ones.insert(ones.end(), pluses.begin(), pluses.end());
    cases.push_back({ones, 1000});
    vector<string> doubling = {"3", "1", "*"};  // x -> 2x - 1, ten times, from 3
    for (int i = 0; i < 10; i++) for (const char* t : {"2", "*", "1", "-"}) doubling.push_back(t);
    cases.push_back({doubling, 2049});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<string> tokens = cases[n].first;
        check(Solution().evalRPN(tokens), cases[n].second, "case " + to_string(n) + " (" + to_string(tokens.size()) + " tokens)");
    }
    return failures ? 1 : 0;
}
