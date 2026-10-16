static double referenceMedian(vector<int> a, const vector<int>& b) {
    a.insert(a.end(), b.begin(), b.end());
    sort(a.begin(), a.end());
    size_t t = a.size();
    return t % 2 ? a[t / 2] : (a[t / 2 - 1] + (double)a[t / 2]) / 2;
}
int main() {
    vector<int> big1, big2;
    for (int i = 0; i < 999; i++) big1.push_back((i * 7919) % 2001 - 1000);
    for (int i = 0; i < 1000; i++) big2.push_back((int)((i * 104729LL) % 1999) - 1000);
    sort(big1.begin(), big1.end());
    sort(big2.begin(), big2.end());
    vector<tuple<vector<int>, vector<int>, double>> cases = {{{1, 4, 9}, {2, 3}, 3.0}, {{5, 8}, {1, 2, 10, 12}, 6.5}, {{}, {7}, 7.0},
        {{2, 2}, {2, 2}, 2.0}, {{3}, {}, 3.0}, {{1, 2}, {3, 4}, 2.5}, {{10, 20, 30}, {1, 2, 3, 4, 5, 6}, 5.0}, {{-5, -3}, {-4}, -4.0},
        {{1000000}, {-1000000}, 0.0}, {big1, big2, referenceMedian(big1, big2)}};
    int n = 0;
    for (auto& [a, b, expected] : cases) {
        vector<int> x = a, y = b;
        double got = Solution().findMedianSortedArrays(x, y);
        check(fabs(got - expected) <= 1e-6, true, "case " + to_string(n++) + " got " + to_string(got));
    }
    return failures ? 1 : 0;
}
