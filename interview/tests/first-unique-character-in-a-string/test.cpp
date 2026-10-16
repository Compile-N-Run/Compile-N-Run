static string repeat(const string& s, int times) {
    string out;
    for (int i = 0; i < times; i++) out += s;
    return out;
}

int main() {
    vector<pair<string, int>> cases = {{"stress", 1}, {"racecar", 3}, {"aabbcc", -1}, {"x", 0}, {"zzyzx", 2}, {"abcabc", -1},
        {"abba", -1}, {"zza", 2}, {"abcdefghijklmnopqrstuvwxyz", 0}, {repeat("ab", 5000) + "q", 10000}, {string(100000, 'a'), -1},
        {"q" + repeat("ab", 5000), 0}};
    for (auto& [s, expected] : cases) {
        check(Solution().firstUniqChar(s), expected, s.substr(0, 12));
    }
    return failures ? 1 : 0;
}
