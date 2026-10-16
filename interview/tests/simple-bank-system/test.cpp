int main() {
    // Each op is {0, account, 0, money, expected} for deposit, {1, account, 0, money, expected} for withdraw
    // or {2, account1, account2, money, expected} for transfer.
    typedef array<long long, 5> Op;
    vector<pair<vector<long long>, vector<Op>>> cases = {
        {{10, 100, 20, 50, 30}, {{1, 3, 0, 10, 1}, {2, 5, 1, 20, 1}, {0, 5, 0, 20, 1}, {2, 3, 4, 15, 0}, {1, 10, 0, 50, 0},
                                 {1, 1, 0, 30, 1}, {1, 5, 0, 30, 1}, {1, 2, 0, 101, 0}}},
        {{0}, {{0, 1, 0, 5, 1}, {1, 1, 0, 5, 1}, {1, 1, 0, 1, 0}, {2, 1, 2, 1, 0}, {0, 0, 0, 5, 0}, {0, 2, 0, 5, 0}, {1, 1, 0, 1, 0}}},
        {{7}, {{1, 1, 0, 8, 0}, {1, 1, 0, 7, 1}, {1, 1, 0, 7, 0}}},
        {{5, 0}, {{2, 2, 1, 1, 0}, {2, 1, 2, 5, 1}, {2, 1, 2, 1, 0}, {1, 2, 0, 5, 1}, {1, 1, 0, 1, 0}}},
        {{5000000000000LL, 1}, {{1, 1, 0, 4000000000000LL, 1}, {2, 1, 2, 1000000000000LL, 1}, {1, 1, 0, 1, 0},
                                {1, 2, 0, 1000000000001LL, 1}, {1, 2, 0, 1, 0}, {0, 2, 0, 9999999999999LL, 1}, {1, 2, 0, 9999999999999LL, 1}}},
        {{10, 10}, {{2, 1, 2, 11, 0}, {2, 1, 3, 5, 0}, {2, 0, 2, 5, 0}, {1, 1, 0, 10, 1}, {1, 2, 0, 10, 1}, {2, 1, 2, 1, 0}}},
    };
    vector<Op> big;
    for (long long i = 1; i <= 1000; i++) big.push_back({0, i, 0, i, 1});
    for (long long i = 1; i < 1000; i++) big.push_back({2, i, i + 1, 1000 + i, 1});
    for (long long i = 2; i < 1000; i++) big.push_back({1, i, 0, 999 + i, 1});
    for (long long i = 1; i < 1000; i++) big.push_back({1, i, 0, 1, 0});
    big.push_back({1, 1000, 0, 3999, 1});
    big.push_back({1, 1000, 0, 1, 0});
    cases.push_back({vector<long long>(1000, 1000), big});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<long long> balance = cases[n].first;
        Bank bank(balance);
        const auto& ops = cases[n].second;
        for (size_t step = 0; step < ops.size(); step++) {
            auto [op, a, b, money, expected] = ops[step];
            bool got = op == 0 ? bank.deposit((int)a, money) : op == 1 ? bank.withdraw((int)a, money) : bank.transfer((int)a, (int)b, money);
            check(got, expected == 1, "case " + to_string(n) + " step " + to_string(step) + " op " + to_string(op));
        }
    }
    return failures ? 1 : 0;
}
