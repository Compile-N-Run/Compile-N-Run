int main() {
    vector<string> items;
    for (int i = 999; i >= 0; i--) {
        char buf[16];
        snprintf(buf, sizeof buf, "item%04d", i);
        items.push_back(buf);
    }
    vector<string> firstThree = {"item0000", "item0001", "item0002"};
    struct Case { vector<string> products; string word; vector<vector<string>> expected; };
    vector<Case> cases = {
        {{"banana", "band", "bandana", "bandit", "bank"}, "band",
         {{"banana", "band", "bandana"}, {"banana", "band", "bandana"}, {"banana", "band", "bandana"}, {"band", "bandana", "bandit"}}},
        {{"apple", "apply", "ape"}, "apex", {{"ape", "apple", "apply"}, {"ape", "apple", "apply"}, {"ape"}, {}}},
        {{"cat"}, "dog", {{}, {}, {}}},
        {{"code", "coder", "codes", "coding"}, "code",
         {{"code", "coder", "codes"}, {"code", "coder", "codes"}, {"code", "coder", "codes"}, {"code", "coder", "codes"}}},
        {{"a", "aa", "aaa", "aaaa"}, "aaaa", {{"a", "aa", "aaa"}, {"aa", "aaa", "aaaa"}, {"aaa", "aaaa"}, {"aaaa"}}},
        {{"zebra", "zoo"}, "az", {{}, {}}},
        {{"sun", "sea", "sand", "sugar"}, "s", {{"sand", "sea", "sugar"}}},
        {{"tea", "ten", "team", "teach", "tear", "teal"}, "tean",
         {{"tea", "teach", "teal"}, {"tea", "teach", "teal"}, {"tea", "teach", "teal"}, {}}},
        {items, "item0999",
         {firstThree, firstThree, firstThree, firstThree, firstThree,
          {"item0900", "item0901", "item0902"}, {"item0990", "item0991", "item0992"}, {"item0999"}}},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        vector<string> copy = cases[n].products;
        check(Solution().suggestedProducts(copy, cases[n].word), cases[n].expected, "case " + to_string(n) + " \"" + cases[n].word + "\"");
    }
    return failures ? 1 : 0;
}
