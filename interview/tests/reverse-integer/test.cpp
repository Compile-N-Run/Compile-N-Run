int main() {
    vector<pair<int, int>> cases = {
        {123, 321},
        {-450, -54},
        {1200, 21},
        {1534236469, 0},  // 9646324351 is too large
        {INT_MIN, 0},     // -8463847412 is too small
        {INT_MAX, 0},     // 7463847412 is too large
        {1463847412, 2147483641},  // fits, 6 below INT_MAX
        {-1463847412, -2147483641},
        {0, 0},
        {7, 7},
        {-120, -21},
        {1000000000, 1},
        {1000000003, 0},  // 3000000001 is too large
        {2147447412, 2147447412},  // a palindrome that fits
        {-2147447412, -2147447412},
        {1056389759, 0},  // 9579836501 is too large
        {2147483641, 1463847412},
        {1234567899, 0},  // 9987654321 is too large
    };
    for (auto& c : cases) check(Solution().reverse(c.first), c.second, "x=" + to_string(c.first));
    // every ten-digit value in a stretch: whatever fits must be reversed exactly, the rest must give 0
    for (int x = 1463847400; x < 1463847500; x++) {
        string digits = to_string(x);
        std::reverse(digits.begin(), digits.end());
        long long rev = stoll(digits);
        check((long long) Solution().reverse(x), rev <= INT_MAX ? rev : 0, "x=" + to_string(x));
        check((long long) Solution().reverse(-x), rev <= INT_MAX ? -rev : 0, "x=" + to_string(-x));
    }
    return failures ? 1 : 0;
}
