// LeetCode's Node for this problem: a linked list node with an extra `random` pointer.
class Node {
public:
    int val;
    Node* next;
    Node* random;
    Node(int _val) : val(_val), next(nullptr), random(nullptr) {}
};
