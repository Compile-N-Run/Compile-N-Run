int main() {
    vector<pair<int, int>> cases = {
        {0, 0},
        {1, 1},
        {2, 1},
        {3, 1},
        {4, 2},
        {8, 2},
        {9, 3},
        {15, 3},
        {16, 4},
        {24, 4},
        {25, 5},
        {99, 9},
        {100, 10},
        {1000000, 1000},
        {999999, 999},
        {2147302921, 46339},  // 46339 squared
        {2147395599, 46339},
        {2147395600, 46340},  // 46340 squared
        {2147395601, 46340},
        {2147483647, 46340},
    };
    for (const auto& [x, expected] : cases) {
        check(Solution().mySqrt(x), expected, "x=" + to_string(x));
    }
    return failures ? 1 : 0;
}
