int main() {
    // Each op is {0, key, value} for put or {1, key, expected} for get.
    vector<pair<int, vector<array<int, 3>>>> cases = {
        {2, {{0, 1, 10}, {0, 2, 20}, {1, 1, 10}, {0, 3, 30}, {1, 2, -1}, {1, 3, 30}, {0, 4, 40}, {1, 1, -1}, {1, 3, 30}, {1, 4, 40}}},
        {1, {{0, 5, 50}, {1, 5, 50}, {0, 6, 60}, {1, 5, -1}, {1, 6, 60}}},
        {2, {{0, 1, 1}, {0, 2, 2}, {0, 1, 100}, {0, 3, 3}, {1, 1, 100}, {1, 2, -1}, {1, 3, 3}}},
        {3, {{1, 7, -1}, {0, 7, 0}, {1, 7, 0}, {1, 8, -1}}},
        {2, {{0, 1, 1}, {1, 1, 1}, {1, 1, 1}, {1, 1, 1}, {0, 2, 2}, {0, 3, 3}, {1, 2, -1}, {1, 3, 3}, {0, 4, 4}, {1, 3, -1}, {1, 1, 1}, {1, 4, 4}}},
        {3, {{0, 1, 1}, {0, 2, 2}, {0, 3, 3}, {0, 4, 4}, {1, 1, -1}, {1, 2, 2}, {0, 5, 5}, {1, 3, -1}, {1, 4, 4}, {1, 5, 5}}},
        {2, {{0, 3, 1}, {0, 2, 1}, {0, 2, 2}, {0, 4, 4}, {1, 2, 2}, {1, 3, -1}, {1, 4, 4}}},
    };
    // Keys 0..49 are read once, so they outlive every key that is only ever inserted.
    vector<array<int, 3>> big;
    for (int i = 0; i < 100; i++) big.push_back({0, i, 2 * i});
    for (int i = 0; i < 50; i++) big.push_back({1, i, 2 * i});
    for (int i = 100; i < 1000; i++) big.push_back({0, i, 2 * i});
    for (int i = 0; i < 1000; i++) big.push_back({1, i, i < 50 || i >= 950 ? 2 * i : -1});
    cases.push_back({100, big});
    for (size_t n = 0; n < cases.size(); n++) {
        LFUCache cache(cases[n].first);
        const auto& ops = cases[n].second;
        for (size_t step = 0; step < ops.size(); step++) {
            auto [op, a, b] = ops[step];
            if (op == 0) cache.put(a, b);
            else check(cache.get(a), b, "case " + to_string(n) + " step " + to_string(step));
        }
    }
    return failures ? 1 : 0;
}
