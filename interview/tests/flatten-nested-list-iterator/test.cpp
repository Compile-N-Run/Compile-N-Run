// Parses "[[4,5],6,[7,[8]]]" (no spaces) into NestedIntegers.
static NestedInteger parseNested(const string& s, size_t& i) {
    if (s[i] == '[') {
        NestedInteger list;
        i++;
        while (s[i] != ']') {
            list.add(parseNested(s, i));
            if (s[i] == ',') i++;
        }
        i++;
        return list;
    }
    int sign = 1;
    if (s[i] == '-') { sign = -1; i++; }
    int value = 0;
    while (i < s.size() && isdigit(s[i])) value = value * 10 + (s[i++] - '0');
    return NestedInteger(sign * value);
}
static vector<NestedInteger> parseList(const string& s) { size_t i = 0; return parseNested(s, i).getList(); }
static void flattenNested(const vector<NestedInteger>& list, vector<int>& out) {
    for (const NestedInteger& ni : list) {
        if (ni.isInteger()) out.push_back(ni.getInteger());
        else flattenNested(ni.getList(), out);
    }
}

int main() {
    string big = "[", deep;
    for (int i = 0; i < 500; i++) big += (i ? "," : "") + to_string(i) + ",[[" + to_string(i) + "],[]]";  // 1000 integers, half of them nested
    big += "]";
    deep = "[" + string(200, '[') + "42" + string(200, ']') + "]";  // one integer wrapped in 200 lists
    vector<string> cases = {"[[4,5],6,[7,[8]]]", "[1,[2,[3,[4,[5]]]]]", "[[],[[]],9]", "[]", "[[[]]]", "[9]",
        "[[[[-7]]],0,[],[3]]", "[[2,2],3,[2,2]]", big, deep};
    for (const string& spec : cases) {
        vector<NestedInteger> list = parseList(spec);
        vector<int> expected;
        flattenNested(list, expected);
        NestedIterator it(list);
        vector<int> got;
        while (it.hasNext()) got.push_back(it.next());
        check(got, expected, spec.size() <= 40 ? spec : spec.substr(0, 40) + "...");
    }
    // hasNext must not consume anything, however often it is called
    vector<NestedInteger> list = parseList("[[],5]");
    NestedIterator it(list);
    check(vector<bool>{it.hasNext(), it.hasNext(), it.hasNext()}, vector<bool>{true, true, true}, "[[],5] hasNext three times");
    check(it.next(), 5, "[[],5] next after repeated hasNext");
    check(it.hasNext(), false, "[[],5] hasNext at the end");
    return failures ? 1 : 0;
}
