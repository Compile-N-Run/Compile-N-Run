int main() {
    vector<pair<vector<int>, vector<int>>> cases = {
        {{4, 9, -6}, {4, 9}}, {{7, -7}, {}}, {{-3, -1, 2, 5}, {-3, -1, 2, 5}}, {{3, 5, -8, 2}, {-8, 2}},
        {{10, 2, -5}, {10}}, {{1, -2, -3, 4}, {-2, -3, 4}}, {{5}, {5}}, {{-4}, {-4}}, {{6, 6, -6, -6}, {}},
    };
    vector<int> big1(5000, 1);
    big1.push_back(-2);
    cases.push_back({big1, {-2}});
    vector<int> big2(5001, -1);
    big2[0] = 1000;
    cases.push_back({big2, {1000}});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> input = cases[n].first;
        check(Solution().asteroidCollision(input), cases[n].second, "case " + to_string(n));
    }
    return failures ? 1 : 0;
}
