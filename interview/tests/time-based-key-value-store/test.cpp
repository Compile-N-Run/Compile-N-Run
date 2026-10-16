struct TmOp {
    bool isSet;
    string key, text;  // value for set, expected result for get
    int timestamp;
};

int main() {
    auto S = [](string k, string v, int t) { return TmOp{true, k, v, t}; };
    auto G = [](string k, int t, string want) { return TmOp{false, k, want, t}; };
    vector<vector<TmOp>> cases = {
        {S("color", "red", 3), S("color", "blue", 8), G("color", 2, ""), G("color", 3, "red"), G("color", 5, "red"),
         G("color", 8, "blue"), G("color", 100, "blue"), G("size", 5, "")},
        {G("x", 1, "")},
        {S("a", "one", 1), G("a", 1, "one"), G("a", 10000000, "one")},
        {S("a", "p", 2), S("b", "q", 4), S("a", "r", 6), G("b", 3, ""), G("a", 4, "p"), G("b", 5, "q"), G("a", 6, "r"), G("c", 6, "")},
        {S("k", "same", 1), S("k", "same", 2), S("k", "diff", 3), G("k", 2, "same"), G("k", 3, "diff")},
        {S("love", "high", 10), S("love", "low", 20), G("love", 5, ""), G("love", 10, "high"), G("love", 15, "high"),
         G("love", 20, "low"), G("love", 25, "low")},
    };
    vector<TmOp> big;
    for (int i = 1; i <= 1000; i++) big.push_back(S("k", "v" + to_string(i), 2 * i));
    for (int i = 1; i <= 1000; i++) big.push_back(G("k", 2 * i + 1, "v" + to_string(i)));
    big.push_back(G("k", 1, ""));
    cases.push_back(big);
    for (size_t n = 0; n < cases.size(); n++) {
        TimeMap tm;
        for (size_t step = 0; step < cases[n].size(); step++) {
            const TmOp& op = cases[n][step];
            if (op.isSet) tm.set(op.key, op.text, op.timestamp);
            else check(tm.get(op.key, op.timestamp), op.text, "case " + to_string(n) + " step " + to_string(step));
        }
    }
    return failures ? 1 : 0;
}
