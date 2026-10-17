int main() {
    string letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", big, evens, odds;
    for (int i = 0; i < 2000; i++) big += (char) tolower(letters[i % 26]);
    for (int i = 0; i < 2000; i++) (i % 2 == 0 ? evens : odds) += big[i];
    struct Case { string s; int numRows; string expected; };
    vector<Case> cases = {
        {"ABCDEFGHIJ", 3, "AEIBDFHJCG"},
        {"ABCD", 2, "ACBD"},
        {"HELLO", 1, "HELLO"},
        {"AB", 5, "AB"},
        {"ABCDEFGH", 7, "ABCDEFHG"},
        {"ABCDEFG", 7, "ABCDEFG"},
        {"A", 1, "A"},
        {"A", 3, "A"},
        {letters, 4, "AGMSYBFHLNRTXZCEIKOQUWDJPV"},
        {letters, 5, "AIQYBHJPRXZCGKOSWDFLNTVEMU"},
        {"a.b,c d", 2, "abcd., "},  // punctuation and spaces are ordinary characters
        {big, 2, evens + odds},     // two rows: every other character, then the rest
        {big, 2000, big},           // as many rows as characters: unchanged
        {big, 1, big},
    };
    for (auto& c : cases) {
        string got = Solution().convert(c.s, c.numRows);
        check(got, c.expected, "s=\"" + c.s.substr(0, 12) + (c.s.size() > 12 ? "...\"" : "\"") + " numRows=" + to_string(c.numRows));
    }
    return failures ? 1 : 0;
}
