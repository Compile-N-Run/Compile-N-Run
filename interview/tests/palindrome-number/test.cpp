int main() {
    vector<pair<int, bool>> cases = {{1331, true}, {12321, true}, {-44, false}, {50, false}, {0, true}, {7, true}, {10, false},
        {1000021, false}, {1000000001, true}, {2147447412, true}, {2147483647, false}, {INT_MIN, false}};
    for (auto& [x, expected] : cases) check(Solution().isPalindrome(x), expected, to_string(x));
    return failures ? 1 : 0;
}
