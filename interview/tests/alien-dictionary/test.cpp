// True when `order` lists every letter of `words` exactly once and respects every adjacent-pair constraint.
static bool validOrder(const vector<string>& words, const string& order) {
    set<char> letters;
    for (const string& w : words) letters.insert(w.begin(), w.end());
    set<char> seen(order.begin(), order.end());
    if (seen.size() != order.size() || seen != letters) return false;
    int pos[26];
    for (size_t i = 0; i < order.size(); i++) pos[order[i] - 'a'] = i;
    for (size_t i = 0; i + 1 < words.size(); i++) {
        const string &w1 = words[i], &w2 = words[i + 1];
        size_t k = 0;
        while (k < w1.size() && k < w2.size() && w1[k] == w2[k]) k++;
        if (k < w1.size() && k < w2.size()) {
            if (pos[w1[k] - 'a'] >= pos[w2[k] - 'a']) return false;
        } else if (w1.size() > w2.size()) {
            return false;
        }
    }
    return true;
}

int main() {
    // {words, solvable}: any valid order is accepted; an unsolvable list must give "".
    const string perm = "qwertyuiopasdfghjklzxcvbnm";
    vector<string> pairs;
    for (char a : perm) for (char b : perm) pairs.push_back(string{a, b});
    vector<pair<vector<string>, bool>> cases = {
        {{"ba", "bc", "ac", "cab"}, true},
        {{"zy", "zx"}, true},
        {{"ab", "abc"}, true},
        {{"abc", "ab"}, false},
        {{"q", "w", "q"}, false},
        {{"wrt", "wrf", "er", "ett", "rftt"}, true},
        {{"z", "z"}, true},
        {{"a"}, true},
        {{"abcxyz"}, true},
        {{"ac", "ab", "zc", "zb"}, true},
        {{"ab", "ba", "ab"}, false},
        {{"abc", "abd", "ab"}, false},
        {{"z", "y", "x", "w"}, true},
        {pairs, true},  // 676 words that pin down every letter
    };
    for (size_t n = 0; n < cases.size(); n++) {
        vector<string> words = cases[n].first;
        string got = Solution().alienOrder(words);
        if (cases[n].second) check(validOrder(cases[n].first, got), true, "case " + to_string(n) + ": got \"" + got + "\"");
        else check(got, string(""), "case " + to_string(n) + ": got \"" + got + "\"");
    }
    vector<string> copy = pairs;
    check(Solution().alienOrder(copy), perm, "full alphabet is unique");
    return failures ? 1 : 0;
}
