int main() {
    vector<int> nines(100, 9), bigSum(100, 0);
    bigSum.push_back(1);
    vector<int> seq, seqDouble;  // 1234567890 repeated 10 times, ones digit first, and its double
    for (int i = 0; i < 10; i++) for (int d : {0, 9, 8, 7, 6, 5, 4, 3, 2, 1}) seq.push_back(d);
    int carryIn = 0;
    for (int d : seq) { int s = 2 * d + carryIn; seqDouble.push_back(s % 10); carryIn = s / 10; }
    if (carryIn) seqDouble.push_back(carryIn);
    vector<tuple<vector<int>, vector<int>, vector<int>>> cases = {{{2, 1, 5}, {8, 4}, {0, 6, 5}}, {{9, 9}, {1}, {0, 0, 1}},
        {{0}, {0}, {0}}, {{3}, {4}, {7}}, {{1}, {9, 9, 9, 9}, {0, 0, 0, 0, 1}}, {{5}, {5}, {0, 1}}, {{1, 0, 1}, {2, 3}, {3, 3, 1}},
        {nines, {1}, bigSum}, {seq, seq, seqDouble}};
    for (auto& [a, b, expected] : cases) {
        check(listValues(Solution().addTwoNumbers(buildList(a), buildList(b))), expected,
              "sizes " + to_string(a.size()) + " " + to_string(b.size()));
    }
    return failures ? 1 : 0;
}
