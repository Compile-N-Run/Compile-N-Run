static vector<vector<int>> normalise(vector<vector<int>> lists) {
    for (auto& s : lists) sort(s.begin(), s.end());
    sort(lists.begin(), lists.end());
    return lists;
}

int main() {
    vector<vector<int>> three = {{}, {1}, {1, 2}, {1, 2, 3}, {1, 3}, {2}, {2, 3}, {3}};
    vector<pair<vector<int>, vector<vector<int>>>> exact = {
        {{1, 2, 3}, three},
        {{3, 1, 2}, three},
        {{}, {{}}},
        {{0}, {{}, {0}}},
        {{-1, 4}, {{}, {-1}, {-1, 4}, {4}}},
        {{5, -2, 7, 0}, {{}, {-2}, {-2, 0}, {-2, 0, 5}, {-2, 0, 5, 7}, {-2, 0, 7}, {-2, 5}, {-2, 5, 7}, {-2, 7},
                         {0}, {0, 5}, {0, 5, 7}, {0, 7}, {5}, {5, 7}, {7}}},
    };
    for (size_t n = 0; n < exact.size(); n++) {
        vector<int> copy = exact[n].first;
        check(normalise(Solution().subsets(copy)), exact[n].second, "case " + to_string(n));
    }
    // Larger inputs: 2^n distinct subsets, each made of distinct elements of nums.
    vector<int> ten(10), twelve(12);
    iota(ten.begin(), ten.end(), 1);
    iota(twelve.begin(), twelve.end(), -6);
    for (const vector<int>& nums : {ten, twelve}) {
        vector<int> copy = nums;
        vector<vector<int>> got = Solution().subsets(copy);
        size_t want = (size_t)1 << nums.size();
        check(got.size(), want, "count for n=" + to_string(nums.size()));
        set<vector<int>> seen;
        for (const auto& s : normalise(got)) seen.insert(s);
        check(seen.size(), want, "distinct for n=" + to_string(nums.size()));
        set<int> allowed(nums.begin(), nums.end());
        for (const auto& s : got) {
            set<int> elems(s.begin(), s.end());
            bool valid = elems.size() == s.size() && all_of(s.begin(), s.end(), [&](int v) { return allowed.count(v); });
            check(valid, true, "invalid subset for n=" + to_string(nums.size()));
        }
    }
    return failures ? 1 : 0;
}
