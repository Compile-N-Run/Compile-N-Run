static TreeNode* balanced(int lo, int hi) {  // a perfectly balanced BST holding lo..hi
    if (lo > hi) return nullptr;
    int mid = lo + (hi - lo) / 2;
    return new TreeNode(mid, balanced(lo, mid - 1), balanced(mid + 1, hi));
}

int main() {
    vector<int> chain = {1};  // 1 -> 2 -> ... -> 500 down the right side
    for (int i = 2; i <= 500; i++) { chain.push_back(NUL); chain.push_back(i); }
    vector<int> dip = chain;
    dip[2 * 249] = 100;  // node 250 is replaced by 100, which is smaller than its ancestors
    struct Case { vector<int> values; bool expected; };
    vector<Case> cases = {
        {{8, 3, 10}, true},
        {{8, 3, 10, NUL, NUL, 6, 12}, false},
        {{5, 5}, false},
        {{INT_MAX}, true},
        {{3, 1, 5, 0, 2, 4, 6}, true},
        {{3, 1, 5, 0, 4, 4, 6}, false},
        {{10, 5, 15, NUL, NUL, 6, 20}, false},
        {{10, 5, 15, NUL, NUL, 12, 20}, true},
        {chain, true},
        {dip, false},
    };
    for (size_t n = 0; n < cases.size(); n++) {
        check(Solution().isValidBST(buildTree(cases[n].values)), cases[n].expected, "case " + to_string(n));
    }
    // INT_MIN is the NUL marker of buildTree, so these trees are built by hand.
    check(Solution().isValidBST(new TreeNode(INT_MIN)), true, "[INT_MIN]");
    check(Solution().isValidBST(new TreeNode(INT_MIN, nullptr, new TreeNode(INT_MAX))), true, "[INT_MIN, null, INT_MAX]");
    check(Solution().isValidBST(new TreeNode(INT_MAX, new TreeNode(INT_MIN), nullptr)), true, "[INT_MAX, INT_MIN]");
    check(Solution().isValidBST(new TreeNode(INT_MIN, new TreeNode(INT_MAX), nullptr)), false, "[INT_MIN, INT_MAX]");

    TreeNode* big = balanced(1, 4095);
    check(Solution().isValidBST(big), true, "balanced BST of 1..4095");
    TreeNode* node = big;
    while (node->left) node = node->left;
    node->val = 5000;  // the leftmost leaf now exceeds every ancestor
    check(Solution().isValidBST(big), false, "balanced BST of 1..4095 with leftmost leaf set to 5000");
    return failures ? 1 : 0;
}
