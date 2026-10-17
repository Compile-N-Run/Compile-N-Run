int main() {
    vector<int> oneTo50000, evens50000;
    for (int i = 1; i <= 50000; i++) { oneTo50000.push_back(i); evens50000.push_back(2 * i); }
    struct Case { vector<int> arr1, arr2; int expected; };
    vector<Case> cases = {
        {{1, 10, 100}, {1000}, 3},
        {{123, 456}, {1234, 45}, 3},
        {{12}, {123, 124, 125}, 2},
        {{1, 2, 3}, {4, 4, 4}, 0},
        {{100000000}, {100000000}, 9},
        {{5}, {5}, 1},
        {{7, 77, 777}, {7777}, 3},
        {{100}, {1000, 10}, 3},
        {{13, 27}, {2, 1}, 1},
        {{987654321}, {98765, 9876543}, 7},
        {{21, 210}, {2100, 20}, 3},
        {oneTo50000, {49999}, 5},      // 49999 itself is in arr1
        {oneTo50000, {100000000}, 5},  // prefix 10000 is in arr1 but 100000 is not
        {evens50000, {99999999}, 4},   // 9999 is a prefix of 99990, but no even number below 100001 starts with 99999
    };
    for (size_t n = 0; n < cases.size(); n++) {
        check(Solution().longestCommonPrefix(cases[n].arr1, cases[n].arr2), cases[n].expected,
              "case " + to_string(n) + " (arr1 length " + to_string(cases[n].arr1.size()) + ", arr2[0]=" + to_string(cases[n].arr2[0]) + ")");
    }
    return failures ? 1 : 0;
}
