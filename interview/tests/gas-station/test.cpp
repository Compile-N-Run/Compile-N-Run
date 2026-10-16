int main() {
    vector<int> bigGas(1000, 1), bigCost(1000, 1);
    bigGas[700] = 2; bigCost[699] = 2;
    vector<tuple<vector<int>, vector<int>, int>> cases = {{{2, 5, 1, 4}, {3, 2, 4, 1}, 1}, {{1, 1, 1}, {2, 1, 1}, -1},
        {{0, 0, 7}, {2, 3, 2}, 2}, {{3}, {3}, 0}, {{5}, {6}, -1}, {{4, 0, 2}, {1, 3, 2}, 0}, {bigGas, bigCost, 700}};
    for (auto& [gas, cost, expected] : cases) {
        vector<int> g = gas, c = cost;
        check(Solution().canCompleteCircuit(g, c), expected, "n=" + to_string(gas.size()) + " expected " + to_string(expected));
    }
    return failures ? 1 : 0;
}
