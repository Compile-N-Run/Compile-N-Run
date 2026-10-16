// Shared definitions available to every C++ solution (LeetCode provides these implicitly).
#include <bits/stdc++.h>
using namespace std;

struct ListNode {
    int val; ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
struct TreeNode {
    int val; TreeNode *left; TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
static ListNode* buildList(const vector<int>& values) {
    ListNode head; ListNode* tail = &head;
    for (int v : values) { tail->next = new ListNode(v); tail = tail->next; }
    return head.next;
}
static vector<int> listValues(ListNode* node) { vector<int> out; for (; node; node = node->next) out.push_back(node->val); return out; }
static const int NUL = INT_MIN;  // marks a missing child in buildTree input
static TreeNode* buildTree(const vector<int>& values) {
    if (values.empty() || values[0] == NUL) return nullptr;
    TreeNode* root = new TreeNode(values[0]); queue<TreeNode*> q; q.push(root); size_t i = 1;
    while (!q.empty() && i < values.size()) {
        TreeNode* node = q.front(); q.pop();
        if (i < values.size() && values[i] != NUL) { node->left = new TreeNode(values[i]); q.push(node->left); } i++;
        if (i < values.size() && values[i] != NUL) { node->right = new TreeNode(values[i]); q.push(node->right); } i++;
    }
    return root;
}
static int failures = 0;
template <class A, class B> static void check(const A& actual, const B& expected, const string& label) {
    if (!(actual == expected)) { cerr << label << ": wrong answer" << endl; failures++; }
}
