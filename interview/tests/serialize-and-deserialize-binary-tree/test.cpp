static bool sameTree(TreeNode* a, TreeNode* b) {
    if (!a || !b) return a == b;
    return a->val == b->val && sameTree(a->left, b->left) && sameTree(a->right, b->right);
}

int main() {
    vector<int> chain = {0};  // 0 -> 1 -> ... -> 499 down the left side
    for (int i = 1; i < 500; i++) { chain.push_back(i); chain.push_back(NUL); }
    vector<int> full;  // complete tree of 1023 nodes
    for (int i = 1; i <= 1023; i++) full.push_back(i);
    vector<vector<int>> cases = {
        {},
        {1},
        {1, 2, 3, NUL, NUL, 4, 5},
        {-5, NUL, 7},
        {100, 20, 300},
        {0, 0, 0},
        {1, NUL, 2, NUL, 3},
        {-1, -2, -3, -4, NUL, NUL, -5},
        {2147483647, -2147483647},  // INT_MIN is the NUL marker, so stay one above it
        {7, 7, NUL, 7, NUL, 7},
        chain,
        full,
    };
    for (size_t n = 0; n < cases.size(); n++) {
        TreeNode* root = buildTree(cases[n]);
        Codec ser, deser;  // separate instances, as LeetCode calls them
        string data = ser.serialize(root);
        TreeNode* got = deser.deserialize(data);
        check(sameTree(got, buildTree(cases[n])), true, "case " + to_string(n) + " (n=" + to_string(cases[n].size()) + "): round trip changed the tree");
        if (root) check(got != root, true, "case " + to_string(n) + ": deserialize must build a new tree");
        // The rebuilt tree must serialize and rebuild again just as well.
        Codec ser2, deser2;
        TreeNode* again = deser2.deserialize(ser2.serialize(got));
        check(sameTree(again, buildTree(cases[n])), true, "case " + to_string(n) + " (n=" + to_string(cases[n].size()) + "): second round trip");
    }
    return failures ? 1 : 0;
}
