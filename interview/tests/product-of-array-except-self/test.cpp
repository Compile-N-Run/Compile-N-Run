static vector<int> bruteProduct(const vector<int>& nums) {
    vector<int> out;
    for (size_t i = 0; i < nums.size(); i++) {
        int p = 1;
        for (size_t j = 0; j < nums.size(); j++) if (j != i) p *= nums[j];
        out.push_back(p);
    }
    return out;
}

int main() {
    vector<int> big;
    for (int i = 0; i < 1000; i++) big.push_back(i % 100 == 0 ? 2 : (i % 7 == 0 ? -1 : 1));
    vector<pair<vector<int>, vector<int>>> cases = {{{2, 3, 4, 5}, {60, 40, 30, 24}}, {{3, 0, 4}, {0, 12, 0}}, {{0, 5, 0}, {0, 0, 0}},
        {{-1, 2, -3}, {-6, 3, -2}}, {{7, 9}, {9, 7}}, {{0, 0}, {0, 0}}, {{1, 1, 1, 1}, {1, 1, 1, 1}}, {big, bruteProduct(big)}};
    for (size_t c = 0; c < cases.size(); c++) {
        vector<int> nums = cases[c].first;
        check(Solution().productExceptSelf(nums), cases[c].second, "case " + to_string(c));
    }
    return failures ? 1 : 0;
}
