int main() {
    // Each op is {0, value, expected} for enQueue, {1, 0, expected} for deQueue, {2, 0, expected} for Front,
    // {3, 0, expected} for Rear, {4, 0, expected} for isEmpty or {5, 0, expected} for isFull; booleans are 1/0.
    vector<array<int, 3>> big;
    for (int v = 0; v < 1000; v++) big.push_back({0, v, 1});
    big.push_back({0, 1000, 0});
    big.push_back({5, 0, 1});
    for (int i = 0; i < 500; i++) big.push_back({1, 0, 1});
    big.push_back({2, 0, 500});
    big.push_back({3, 0, 999});
    for (int v = 1000; v < 1500; v++) big.push_back({0, v, 1});
    big.push_back({3, 0, 1499});
    big.push_back({5, 0, 1});
    big.push_back({0, 9, 0});
    for (int i = 0; i < 1000; i++) big.push_back({1, 0, 1});
    big.push_back({1, 0, 0});
    big.push_back({4, 0, 1});
    big.push_back({2, 0, -1});
    big.push_back({3, 0, -1});
    vector<pair<int, vector<array<int, 3>>>> cases = {
        {3, {{0, 4, 1}, {0, 9, 1}, {0, 2, 1}, {0, 7, 0}, {5, 0, 1}, {1, 0, 1}, {2, 0, 9}, {0, 7, 1}, {3, 0, 7}, {4, 0, 0}}},
        {1, {{2, 0, -1}, {3, 0, -1}, {1, 0, 0}, {4, 0, 1}, {0, 5, 1}, {5, 0, 1}, {0, 6, 0}, {2, 0, 5}, {3, 0, 5}, {1, 0, 1}, {4, 0, 1},
             {2, 0, -1}, {0, 8, 1}, {3, 0, 8}}},
        {2, {{0, 1, 1}, {0, 2, 1}, {1, 0, 1}, {0, 3, 1}, {2, 0, 2}, {3, 0, 3}, {5, 0, 1}, {1, 0, 1}, {1, 0, 1}, {1, 0, 0}, {4, 0, 1},
             {0, 7, 1}, {2, 0, 7}, {3, 0, 7}}},
        {4, {{0, 1, 1}, {0, 2, 1}, {0, 3, 1}, {0, 4, 1}, {5, 0, 1}, {1, 0, 1}, {1, 0, 1}, {1, 0, 1}, {1, 0, 1}, {4, 0, 1}, {0, 5, 1},
             {0, 6, 1}, {2, 0, 5}, {3, 0, 6}, {1, 0, 1}, {2, 0, 6}, {3, 0, 6}}},
        {3, {{0, 0, 1}, {0, 0, 1}, {2, 0, 0}, {3, 0, 0}, {1, 0, 1}, {3, 0, 0}, {2, 0, 0}, {0, 1000, 1}, {3, 0, 1000}, {5, 0, 0}, {0, 2, 1}, {5, 0, 1}}},
        {3, {{0, 1, 1}, {0, 2, 1}, {0, 3, 1}, {1, 0, 1}, {0, 4, 1}, {2, 0, 2}, {3, 0, 4}, {1, 0, 1}, {0, 5, 1}, {2, 0, 3}, {3, 0, 5},
             {1, 0, 1}, {0, 6, 1}, {2, 0, 4}, {3, 0, 6}, {1, 0, 1}, {0, 7, 1}, {2, 0, 5}, {3, 0, 7}}},
        {1000, big},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        MyCircularQueue queue(cases[n].first);
        const auto& ops = cases[n].second;
        for (size_t step = 0; step < ops.size(); step++) {
            auto [op, value, expected] = ops[step];
            string label = "case " + to_string(n) + " step " + to_string(step) + " op " + to_string(op);
            if (op == 0) check(queue.enQueue(value), expected == 1, label);
            else if (op == 1) check(queue.deQueue(), expected == 1, label);
            else if (op == 2) check(queue.Front(), expected, label);
            else if (op == 3) check(queue.Rear(), expected, label);
            else if (op == 4) check(queue.isEmpty(), expected == 1, label);
            else check(queue.isFull(), expected == 1, label);
        }
    }
    return failures ? 1 : 0;
}
