static TreeNode* findNode(TreeNode* root, int val) {
    vector<TreeNode*> stack = {root};
    while (!stack.empty()) {
        TreeNode* node = stack.back();
        stack.pop_back();
        if (!node) continue;
        if (node->val == val) return node;
        stack.push_back(node->left);
        stack.push_back(node->right);
    }
    return nullptr;
}

int main() {
    vector<int> example = {10, 4, 15, 1, 7, NUL, 20, NUL, NUL, 6, 9};
    vector<int> full, chain = {0};
    for (int i = 1; i <= 1023; i++) full.push_back(i);  // complete tree of 1023 nodes
    for (int i = 1; i < 500; i++) { chain.push_back(i); chain.push_back(NUL); }  // 0 -> 1 -> ... -> 499 down the left side
    struct Case { vector<int> values; int p, q, expected; };
    vector<Case> cases = {{example, 6, 9, 7}, {example, 1, 9, 4}, {example, 4, 6, 4}, {example, 9, 20, 10},
        {example, 15, 20, 15}, {{1, 2}, 1, 2, 1}, {{1, 2}, 2, 1, 1}, {{0, -5, 8, NUL, -3}, -3, 8, 0},
        {full, 1000, 1023, 31}, {full, 1000, 1001, 500}, {full, 960, 975, 60}, {chain, 499, 200, 200}};
    for (auto& c : cases) {
        TreeNode* root = buildTree(c.values);
        TreeNode* got = Solution().lowestCommonAncestor(root, findNode(root, c.p), findNode(root, c.q));
        check(got == findNode(root, c.expected) && got != nullptr, true, "p=" + to_string(c.p) + " q=" + to_string(c.q));
    }
    return failures ? 1 : 0;
}
