int main() {
    vector<pair<string, string>> cases = {{"  hello   big world ", "world big hello"}, {"a", "a"}, {"code  2 run", "run 2 code"},
        {"   spaces  ", "spaces"}, {"x y z", "z y x"}, {"Ab12 cD", "cD Ab12"}, {"same same", "same same"}};
    // Larger case: 2000 words with 1 to 3 spaces between them and spaces at both ends.
    string big = "  ", expected;
    for (int i = 0; i < 2000; i++) big += "w" + to_string(i) + string(1 + i % 3, ' ');
    for (int i = 1999; i >= 0; i--) expected += "w" + to_string(i) + (i > 0 ? " " : "");
    cases.push_back({big, expected});
    for (auto& [s, want] : cases) check(Solution().reverseWords(s), want, "\"" + s.substr(0, 30) + "\"");
    return failures ? 1 : 0;
}
