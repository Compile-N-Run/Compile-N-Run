int main() {
    vector<pair<vector<int>, int>> cases = {
        {{1, 3, 2}, 4},
        {{2, 2, 2}, 3},
        {{5, 4, 3, 2}, 10},
        {{1, 2, 2, 1}, 6},
        {{7}, 1},
        {{1, 0, 2}, 5},
        {{1, 2, 3, 1}, 7},
        {{1, 2, 87, 87, 87, 2, 1}, 13},
        {{1, 2, 3, 4, 3, 2, 1}, 16},
    };
    vector<int> alternating, rising, slope;
    for (int i = 0; i < 1000; i++) { alternating.push_back(i % 2); rising.push_back(i); }  // 1,2,1,2,... and 1+2+...+1000
    for (int i = 0; i < 999; i++) slope.push_back(i < 500 ? 500 - i : i - 499);  // a long slope down then up
    cases.push_back({alternating, 1500});
    cases.push_back({rising, 500500});
    cases.push_back({slope, 250000});
    for (auto& c : cases) {
        vector<int> ratings = c.first;
        int got = Solution().candy(ratings);
        string label = "ratings=[";
        for (size_t i = 0; i < min<size_t>(8, c.first.size()); i++) label += (i ? "," : "") + to_string(c.first[i]);
        label += c.first.size() > 8 ? ",...]" : "]";
        check(got, c.second, label);
    }
    return failures ? 1 : 0;
}
