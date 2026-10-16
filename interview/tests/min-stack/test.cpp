int main() {
    // Each op is {0, value} for push, {1, 0} for pop, {2, expected} for top or {3, expected} for getMin.
    vector<pair<int, int>> big;
    for (int v = 1000; v >= 1; v--) big.push_back({0, v});
    for (int v = 1; v < 1000; v++) {
        big.push_back({3, v});
        big.push_back({2, v});
        big.push_back({1, 0});
    }
    big.push_back({3, 1000});
    for (int v = 2000; v < 3000; v++) big.push_back({0, v});
    big.push_back({3, 1000});
    big.push_back({2, 2999});
    vector<vector<pair<int, int>>> cases = {
        {{0, 4}, {0, 2}, {0, 7}, {3, 2}, {2, 7}, {1, 0}, {1, 0}, {3, 4}, {2, 4}},
        {{0, 3}, {0, 3}, {1, 0}, {3, 3}, {2, 3}},
        {{0, -1}, {0, 5}, {3, -1}, {2, 5}},
        {{0, 9}, {3, 9}, {2, 9}},
        {{0, INT_MIN}, {0, INT_MAX}, {3, INT_MIN}, {2, INT_MAX}, {1, 0}, {2, INT_MIN}},
        {{0, 1}, {0, 2}, {0, 0}, {3, 0}, {1, 0}, {3, 1}, {0, -3}, {3, -3}, {1, 0}, {1, 0}, {3, 1}, {2, 1}},
        {{0, 5}, {1, 0}, {0, 8}, {3, 8}, {0, 6}, {3, 6}, {2, 6}},
        big,
    };
    for (size_t n = 0; n < cases.size(); n++) {
        MinStack stack;
        for (size_t step = 0; step < cases[n].size(); step++) {
            auto [op, x] = cases[n][step];
            string label = "case " + to_string(n) + " step " + to_string(step);
            if (op == 0) stack.push(x);
            else if (op == 1) stack.pop();
            else if (op == 2) check(stack.top(), x, label + " top");
            else check(stack.getMin(), x, label + " getMin");
        }
    }
    return failures ? 1 : 0;
}
