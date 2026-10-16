static string repeatString(const string& s, int k) { string out; for (int i = 0; i < k; i++) out += s; return out; }
int main() {
    vector<pair<string, string>> cases = {{"2[ab]c", "ababc"}, {"3[x2[y]]", "xyyxyyxyy"}, {"a10[b]", "abbbbbbbbbb"}, {"pq", "pq"},
        {"3[a]2[bc]", "aaabcbc"}, {"2[abc]3[cd]ef", "abcabccdcdcdef"}, {"1[z]", "z"},
        {"2[a3[b4[c]]]d", "abccccbccccbccccabccccbccccbccccd"}, {"300[a]", string(300, 'a')},
        {"10[10[10[ab]]]", repeatString("ab", 1000)}, {"x2[y3[z]]w", "xyzzzyzzzw"}};
    for (auto& [s, expected] : cases) {
        check(Solution().decodeString(s), expected, s);
    }
    return failures ? 1 : 0;
}
