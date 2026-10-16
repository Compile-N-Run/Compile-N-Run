struct LogCall { int t; string msg; bool expected; };

int main() {
    // Each case is a list of calls on one Logger.
    vector<vector<LogCall>> cases = {
        {{1, "start", true}, {4, "stop", true}, {10, "start", false}, {11, "start", true}, {13, "stop", false}, {14, "stop", true}},
        {{0, "a", true}, {5, "a", false}, {9, "a", false}, {10, "a", true}, {19, "a", false}, {20, "a", true}},
        {{7, "x", true}, {7, "y", true}, {7, "x", false}, {7, "z", true}, {16, "y", false}, {17, "y", true}},
        {{1000000000, "only", true}},
        {{1, "foo", true}, {100, "foo", true}, {105, "bar", true}, {109, "foo", false}, {110, "foo", true}},
        {{3, "Hi", true}, {4, "hi", true}, {5, "Hi", false}, {13, "Hi", true}, {13, "hi", false}, {14, "hi", true}},
    };
    vector<LogCall> big;
    for (int t = 0; t < 10000; t++) {
        big.push_back({t, "m" + to_string(t % 50), true});  // each of these repeats every 50 seconds
        big.push_back({t, "same", t % 10 == 0});
    }
    cases.push_back(big);
    for (size_t n = 0; n < cases.size(); n++) {
        Logger logger;
        for (size_t step = 0; step < cases[n].size(); step++) {
            const LogCall& c = cases[n][step];
            check(logger.shouldPrintMessage(c.t, c.msg), c.expected, "case " + to_string(n) + " step " + to_string(step));
        }
    }
    return failures ? 1 : 0;
}
