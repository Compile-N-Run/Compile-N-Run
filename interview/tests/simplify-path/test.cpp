int main() {
    string big, bigExpected;
    for (int i = 0; i < 500; i++) {
        big += "/d" + to_string(i) + "/./e" + to_string(i) + "//..";
        if (i < 499) bigExpected += "/d" + to_string(i);
    }
    big += "/../";
    vector<pair<string, string>> cases = {{"/docs/./drafts//final/", "/docs/drafts/final"}, {"/a/b/../../c", "/c"}, {"/../..", "/"},
        {"/x/.../y/..", "/x/..."}, {"/", "/"}, {"///", "/"}, {"/home/", "/home"}, {"/a/./b/./c/.", "/a/b/c"},
        {"/.hidden/..../_x/", "/.hidden/..../_x"}, {"/a/..", "/"}, {big, bigExpected}};
    for (auto& [path, expected] : cases) {
        check(Solution().simplifyPath(path), expected, path.substr(0, 40));
    }
    return failures ? 1 : 0;
}
