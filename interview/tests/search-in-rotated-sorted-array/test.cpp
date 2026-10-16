int main() {
    vector<tuple<vector<int>, int, int>> cases = {{{15, 18, 22, 3, 7, 11}, 7, 4}, {{15, 18, 22, 3, 7, 11}, 20, -1},
        {{30, 40, 50, 10, 20}, 40, 1}, {{9}, 9, 0}, {{9}, 4, -1}, {{2, 1}, 1, 1}, {{1, 2, 3, 4, 5}, 5, 4}, {{5, 1, 3}, 5, 0},
        {{5, 1, 3}, 3, 2}, {{-8, -5, -10}, -10, 2}};
    for (auto& [nums, target, expected] : cases) {
        vector<int> copy = nums;
        check(Solution().search(copy, target), expected, "target " + to_string(target));
    }
    // Exhaustive: every rotation of small arrays of even numbers, every target (odd ones are missing).
    for (int n : {1, 2, 3, 7, 50}) {
        for (int r = 0; r < n; r++) {
            vector<int> nums(n);
            for (int j = 0; j < n; j++) nums[j] = 2 * ((j + r) % n);
            for (int t = -1; t <= 2 * n; t++) {
                int expected = (t >= 0 && t < 2 * n && t % 2 == 0) ? ((t / 2 - r) % n + n) % n : -1;
                check(Solution().search(nums, t), expected, "n=" + to_string(n) + " r=" + to_string(r) + " t=" + to_string(t));
            }
        }
    }
    vector<int> big(5000);
    for (int i = 0; i < 5000; i++) big[i] = (i + 1234) % 5000;  // 5000 values, rotated
    check(Solution().search(big, 0), 3766, "big 0");
    check(Solution().search(big, 4999), 3765, "big 4999");
    check(Solution().search(big, 5000), -1, "big 5000");
    return failures ? 1 : 0;
}
