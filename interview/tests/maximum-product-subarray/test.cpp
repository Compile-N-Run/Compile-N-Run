int main() {
    vector<int> negatives(9999, -1);  // odd count of negatives: drop one end
    vector<int> ends(10000, 1);       // the whole array is the answer
    ends.front() = ends.back() = -2;
    vector<pair<vector<int>, int>> cases = {
        {{2, -3, 4}, 4},
        {{-2, 3, -4}, 24},
        {{2, -5, -2, -4, 3}, 24},
        {{0, -1}, 0},
        {{-5}, -5},
        {{2, 0, 3, 4}, 12},
        {{-1, -2, -3, 0, 5}, 6},
        {{3, -1, 4}, 4},
        {{-3, 0, -2, -1}, 2},
        {{0, 0, 0}, 0},
        {{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, -1}, 3628800},
        {negatives, 1},
        {ends, 4},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> nums = cases[n].first;
        check(Solution().maxProduct(nums), cases[n].second, "case " + to_string(n) + " (n=" + to_string(nums.size()) + ")");
    }
    return failures ? 1 : 0;
}
