int main() {
    // Each op is {0, timestamp, 0} for hit or {1, timestamp, expected} for getHits.
    vector<vector<array<int, 3>>> cases = {
        {{0, 2, 0}, {0, 2, 0}, {0, 5, 0}, {1, 5, 3}, {1, 301, 3}, {1, 302, 1}, {1, 305, 0}},
        {{1, 1, 0}, {1, 100, 0}},
        {{0, 1, 0}, {1, 300, 1}, {1, 301, 0}},
        {{0, 10, 0}, {0, 10, 0}, {0, 10, 0}, {0, 10, 0}, {0, 10, 0}, {1, 10, 5}, {1, 309, 5}, {1, 310, 0}},
        {{0, 1, 0}, {0, 100, 0}, {0, 250, 0}, {1, 350, 2}, {0, 400, 0}, {1, 400, 2}, {1, 549, 2}, {1, 550, 1}},
        {{1, 5, 0}, {0, 5, 0}, {1, 5, 1}, {0, 6, 0}, {0, 6, 0}, {1, 304, 3}, {1, 305, 2}, {1, 306, 0}},
    };
    vector<array<int, 3>> big;
    for (int t = 1; t <= 10000; t++) {
        big.push_back({0, t, 0});
        big.push_back({1, t, min(t, 300)});
    }
    big.push_back({1, 20000, 0});
    cases.push_back(big);
    for (size_t n = 0; n < cases.size(); n++) {
        HitCounter counter;
        for (size_t step = 0; step < cases[n].size(); step++) {
            auto [op, t, expected] = cases[n][step];
            if (op == 0) counter.hit(t);
            else check(counter.getHits(t), expected, "case " + to_string(n) + " step " + to_string(step));
        }
    }
    return failures ? 1 : 0;
}
