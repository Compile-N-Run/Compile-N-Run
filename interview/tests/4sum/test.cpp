static vector<vector<int>> normalise(vector<vector<int>> quads) {  // any order is valid
    for (auto& q : quads) sort(q.begin(), q.end());
    sort(quads.begin(), quads.end());
    return quads;
}

int main() {
    vector<int> mod10;
    vector<vector<int>> mod10Want;
    for (int i = 0; i < 200; i++) mod10.push_back(i % 10);
    for (int a = 0; a < 10; a++) for (int b = a; b < 10; b++) for (int c = b; c < 10; c++) for (int d = c; d < 10; d++) {
        if (a + b + c + d == 18) mod10Want.push_back({a, b, c, d});
    }
    struct Case { vector<int> nums; int target; vector<vector<int>> expected; };
    vector<Case> cases = {
        {{1, 0, -1, 0, -2, 2}, 0, {{-2, -1, 1, 2}, {-2, 0, 0, 2}, {-1, 0, 0, 1}}},
        {{2, 2, 2, 2, 2}, 8, {{2, 2, 2, 2}}},
        {{-3, -1, 0, 2, 4, 5}, 2, {{-3, -1, 2, 4}}},
        {{1, 2, 3}, 6, {}},
        {{}, 0, {}},
        {{0, 0, 0, 0}, 0, {{0, 0, 0, 0}}},
        {{0, 0, 0, 0}, 1, {}},
        {{-5, -4, -3, -2, -1}, -10, {{-4, -3, -2, -1}}},
        {{1, -2, -5, -4, -3, 3, 3, 5}, -11, {{-5, -4, -3, 1}}},
        {{1000000000, 1000000000, 1000000000, 1000000000}, -294967296, {}},  // a 32-bit sum wraps to the target
        {{-1000000000, -1000000000, 1000000000, 1000000000}, 0, {{-1000000000, -1000000000, 1000000000, 1000000000}}},
        {mod10, 18, mod10Want},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> nums = cases[n].nums;
        check(normalise(Solution().fourSum(nums, cases[n].target)), cases[n].expected,
              "case " + to_string(n) + " (length " + to_string(nums.size()) + ") target " + to_string(cases[n].target));
    }

    vector<int> distinct;  // 100 distinct values: 26536 quadruplets sum to 0
    for (int v = -50; v < 50; v++) distinct.push_back(v);
    vector<vector<int>> got = Solution().fourSum(distinct, 0);
    check((int)got.size(), 26536, "range(-50, 50) target 0: number of quadruplets");
    bool valid = true;
    for (auto& q : got) valid = valid && q[0] + q[1] + q[2] + q[3] == 0;
    vector<vector<int>> sorted = normalise(got);
    valid = valid && adjacent_find(sorted.begin(), sorted.end()) == sorted.end();
    check(valid, true, "range(-50, 50) target 0: all distinct and each sums to 0");
    return failures ? 1 : 0;
}
