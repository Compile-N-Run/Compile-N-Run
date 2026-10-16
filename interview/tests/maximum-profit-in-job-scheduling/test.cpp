int main() {
    struct Case { vector<int> start, end, profit; int expected; };
    vector<Case> cases = {
        {{1, 2, 4}, {3, 5, 6}, {50, 10, 70}, 120},
        {{1, 1, 1}, {2, 3, 4}, {5, 6, 4}, 6},
        {{1, 3, 5}, {3, 5, 7}, {10, 10, 10}, 30},
        {{2, 5, 1, 6}, {4, 7, 8, 9}, {30, 25, 100, 20}, 100},
        {{4}, {9}, {7}, 7},
        {{1, 2}, {10, 3}, {5, 5}, 5},
        {{1, 2, 3}, {4, 5, 6}, {3, 3, 3}, 3},
        {{1, 4, 2}, {4, 6, 6}, {5, 6, 10}, 11},
        {{1, 999999999}, {1000000000, 1000000000}, {1, 2}, 2},
    };
    // 10000 unit jobs in reverse order: all of them fit.
    Case units;
    for (int i = 9999; i >= 0; i--) {
        units.start.push_back(i);
        units.end.push_back(i + 1);
        units.profit.push_back(1);
    }
    units.expected = 10000;
    cases.push_back(units);
    // Unit jobs plus length-2 jobs worth 3: one unit job (0..1) then 5000 long jobs at 1, 3, ..., 9999.
    Case mixed = units;
    for (int i = 0; i < 10000; i++) {
        mixed.start.push_back(i);
        mixed.end.push_back(i + 2);
        mixed.profit.push_back(3);
    }
    mixed.expected = 15001;
    cases.push_back(mixed);
    for (size_t n = 0; n < cases.size(); n++) {
        vector<int> start = cases[n].start, end = cases[n].end, profit = cases[n].profit;
        check(Solution().jobScheduling(start, end, profit), cases[n].expected, "case " + to_string(n) + " (n=" + to_string(start.size()) + ")");
    }
    return failures ? 1 : 0;
}
