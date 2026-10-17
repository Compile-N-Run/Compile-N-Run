// "ok" when got is a valid rearrangement of s (or "" when none exists); otherwise what went wrong.
static string reorganizeVerdict(const string& s, const string& got) {
    vector<int> counts(26, 0);
    for (char c : s) counts[c - 'a']++;
    bool possible = *max_element(counts.begin(), counts.end()) <= (int)(s.size() + 1) / 2;
    if (got.empty()) return possible ? "empty, but an arrangement exists" : "ok";
    if (!possible) return "not empty, but no arrangement exists";
    string a = s, b = got;
    sort(a.begin(), a.end());
    sort(b.begin(), b.end());
    if (a != b) return "letters differ from the input";
    for (size_t i = 1; i < got.size(); i++) if (got[i] == got[i - 1]) return "two equal letters are adjacent";
    return "ok";
}

int main() {
    vector<string> cases = {"aab", "aaab", "vvvlo", "a", "aa", "ab", "aabb", "aaabbc", "aaaabbbccd", "zzzzzzyyyyxxww",
        "abcdefghijklmnopqrstuvwxyz",
        string(250, 'a') + string(150, 'b') + string(100, 'c'),  // 500 letters, exactly half of them a
        string(251, 'a') + string(249, 'b')};  // impossible by one letter
    for (const string& s : cases) {
        string got = Solution().reorganizeString(s);
        string label = s.size() <= 30 ? s : s.substr(0, 12) + "... (" + to_string(s.size()) + " letters)";
        string verdict = reorganizeVerdict(s, got);
        if (verdict != "ok") cerr << label << " -> \"" << got.substr(0, 30) << "\": " << verdict << endl;
        check(verdict, string("ok"), label);
    }
    return failures ? 1 : 0;
}
