// Draw many picks; every index must be valid and frequencies must match the weights.
// Indexes are bucketed by i % buckets so long arrays can be checked with fewer samples.
static void checkWeights(vector<int> w, int buckets = 0) {
    const int SAMPLES = 100000;
    int n = w.size();
    if (buckets == 0) buckets = n;
    Solution s(w);
    double total = 0;
    for (int x : w) total += x;
    vector<double> expected(buckets, 0);
    vector<int> counts(buckets, 0);
    for (int i = 0; i < n; i++) expected[i % buckets] += w[i] / total;
    for (int t = 0; t < SAMPLES; t++) {
        int i = s.pickIndex();
        if (i < 0 || i >= n) { check(i, -1, "invalid index"); return; }
        counts[i % buckets]++;
    }
    for (int g = 0; g < buckets; g++) {
        double got = (double)counts[g] / SAMPLES;
        // 6 standard deviations (+ a little slack): a false alarm is about one in a billion,
        // but an off-by-one that moves a whole slot between indexes is still caught.
        double p = expected[g], tolerance = 6 * sqrt(p * (1 - p) / SAMPLES) + 0.0005;
        check(fabs(got - p) <= tolerance, true, "size " + to_string(n) + " group " + to_string(g) + ": expected " + to_string(expected[g]) + ", got " + to_string(got));
    }
}

int main() {
    checkWeights({2, 5, 3});
    vector<int> one = {7};
    Solution s(one);
    for (int t = 0; t < 100; t++) check(s.pickIndex(), 0, "single weight");
    checkWeights({1, 1, 1, 1});
    checkWeights({1, 99});
    checkWeights({100000, 1, 100000});
    checkWeights({5, 1, 1, 1, 1, 1, 1, 1, 1, 5});
    // Larger case: 10000 weights up to 100000, checked in 10 buckets.
    vector<int> big;
    for (long long i = 0; i < 10000; i++) big.push_back((i * 7919) % 100000 + 1);
    checkWeights(big, 10);
    return failures ? 1 : 0;
}
