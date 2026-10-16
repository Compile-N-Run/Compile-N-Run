// Independent iterative reference: extend every prefix by each letter of the next digit.
static vector<string> lcExpand(const string& digits) {
    static const vector<string> keys = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    if (digits.empty()) return {};
    vector<string> out = {""};
    for (char d : digits) {
        vector<string> next;
        for (auto& s : out) for (char ch : keys[d - '0']) next.push_back(s + ch);
        out = next;
    }
    sort(out.begin(), out.end());
    return out;
}

int main() {
    check(lcExpand("29").size(), (size_t)12, "count 29");
    check(lcExpand("7979").size(), (size_t)256, "count 7979");
    vector<pair<string, vector<string>>> cases = {{"56", {"jm", "jn", "jo", "km", "kn", "ko", "lm", "ln", "lo"}},
        {"7", {"p", "q", "r", "s"}}, {"", {}}, {"2", {"a", "b", "c"}}, {"29", lcExpand("29")}, {"99", lcExpand("99")},
        {"234", lcExpand("234")}, {"7979", lcExpand("7979")}};
    for (auto& [digits, expected] : cases) {
        vector<string> got = Solution().letterCombinations(digits);
        sort(got.begin(), got.end());
        check(got, expected, "digits \"" + digits + "\"");
    }
    return failures ? 1 : 0;
}
