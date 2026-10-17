static string repeat(const string& part, int times) {
    string out;
    for (int i = 0; i < times; i++) out += part;
    return out;
}

int main() {
    vector<pair<string, int>> cases = {
        {"12", 2},
        {"226", 3},
        {"06", 0},
        {"2101", 1},
        {"27", 1},
        {"0", 0},
        {"1", 1},
        {"10", 1},
        {"100", 0},
        {"230", 0},
        {"11106", 2},
        {"1000", 0},
        {repeat("12", 10), 10946},
        {repeat("1", 40), 165580141},  // 41st Fibonacci number
        {repeat("10", 500), 1},        // every "10" must be taken as a pair
        {repeat("27", 500), 1},        // "27" is never a pair
        {repeat("9", 1000), 1},
    };
    for (auto& c : cases) {
        check(Solution().numDecodings(c.first), c.second, "\"" + c.first.substr(0, 12) + "\" (length " + to_string(c.first.size()) + ")");
    }
    return failures ? 1 : 0;
}
