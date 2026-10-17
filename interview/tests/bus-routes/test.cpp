int main() {
    vector<tuple<vector<vector<int>>, int, int, int>> cases = {
        {{{10, 20, 30}, {30, 40, 50}}, 10, 50, 2},
        {{{1, 2, 3}}, 1, 3, 1},
        {{{1, 2}, {3, 4}}, 1, 4, -1},
        {{{5, 6}}, 5, 5, 0},
        {{{1, 2, 3, 4, 5}, {2, 10}, {5, 10}}, 1, 10, 2},
        {{{1, 2, 3}, {3, 4}}, 1, 3, 1},
        {{{1, 9}, {2, 3, 8}, {4}, {8, 11}, {5, 9, 10}}, 8, 9, -1},
        {{{1, 2}, {2, 3}, {3, 4}, {4, 5}}, 1, 5, 4},
        {{{7, 8}}, 1, 8, -1},  // source is not on any route
    };
    vector<vector<int>> chain, star, longRoutes;
    for (int i = 0; i < 500; i++) chain.push_back({i, i + 1});
    for (int i = 1; i <= 1000; i++) star.push_back({0, i});
    for (int i = 0; i < 50000; i += 500) {
        vector<int> route(1000);
        iota(route.begin(), route.end(), i);
        longRoutes.push_back(route);
    }
    cases.push_back({chain, 0, 500, 500});           // a chain of 500 buses
    cases.push_back({star, 1, 1000, 2});             // a star: every route passes the hub 0
    cases.push_back({longRoutes, 0, 49999 + 500, 100});  // long overlapping routes
    for (size_t n = 0; n < cases.size(); n++) {
        auto [routes, source, target, expected] = cases[n];
        check(Solution().numBusesToDestination(routes, source, target), expected,
              "case " + to_string(n) + ": " + to_string(routes.size()) + " routes " + to_string(source) + "->" + to_string(target));
    }
    return failures ? 1 : 0;
}
