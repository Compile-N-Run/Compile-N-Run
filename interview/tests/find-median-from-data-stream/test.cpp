// Each sequence is a list of operations: {0, num} adds num, {1, expected} checks the median.
int main() {
    vector<vector<pair<int, double>>> sequences = {
        {{0, 4}, {1, 4.0}, {0, 10}, {1, 7.0}, {0, 1}, {1, 4.0}, {0, 7}, {1, 5.5}},
        {{0, -5}, {1, -5.0}},
        {{0, 3}, {0, 3}, {0, 3}, {1, 3.0}, {0, 3}, {1, 3.0}},
        {{0, 5}, {1, 5.0}, {0, 4}, {1, 4.5}, {0, 3}, {1, 4.0}, {0, 2}, {1, 3.5}, {0, 1}, {1, 3.0}},
        {{0, -100000}, {0, 100000}, {1, 0.0}, {0, 0}, {1, 0.0}},
        {{0, 2}, {1, 2.0}, {1, 2.0}, {0, 8}, {1, 5.0}, {1, 5.0}},
    };
    vector<pair<int, double>> big;
    vector<int> ref;
    long long x = 11;
    for (int i = 0; i < 3000; i++) {
        x = x * 48271 % 2147483647;
        int num = (int)(x % 200001) - 100000;
        ref.insert(upper_bound(ref.begin(), ref.end(), num), num);
        size_t t = ref.size();
        big.push_back({0, num});
        big.push_back({1, t % 2 ? ref[t / 2] : (ref[t / 2 - 1] + (double)ref[t / 2]) / 2});
    }
    sequences.push_back(big);
    for (size_t s = 0; s < sequences.size(); s++) {
        MedianFinder finder;
        for (size_t step = 0; step < sequences[s].size(); step++) {
            auto [op, value] = sequences[s][step];
            if (op == 0) {
                finder.addNum((int)value);
            } else {
                double got = finder.findMedian();
                check(fabs(got - value) <= 1e-6, true, "sequence " + to_string(s) + " step " + to_string(step));
            }
        }
    }
    return failures ? 1 : 0;
}
