int main() {
    vector<string> big(101, "abc");
    vector<string> bigExpected(50, "abc    abc");
    bigExpected.push_back("abc       ");
    vector<tuple<vector<string>, int, vector<string>>> cases = {
        {{"ab", "c", "de", "fghij"}, 10, {"ab   c  de", "fghij     "}},
        {{"hello", "extraordinary", "ok"}, 13, {"hello        ", "extraordinary", "ok           "}},
        {{"we", "can", "solve", "this", "one", "line", "at", "a", "time"}, 11, {"we      can", "solve  this", "one line at", "a time     "}},
        {{"word"}, 4, {"word"}},
        {{"hi"}, 5, {"hi   "}},
        {{"a", "b", "c", "d", "e"}, 3, {"a b", "c d", "e  "}},
        {{"x", "y", "z", "w", "longword"}, 9, {"x  y  z w", "longword "}},
        {big, 10, bigExpected}};
    int i = 0;
    for (auto& [words, width, expected] : cases) {
        vector<string> copy = words;
        check(Solution().fullJustify(copy, width), expected, "case " + to_string(i++));
    }
    return failures ? 1 : 0;
}
