// A spec is a list of {val, random index or -1}.
static Node* buildRandomList(const vector<pair<int, int>>& spec) {
    vector<Node*> nodes;
    for (auto& [v, r] : spec) nodes.push_back(new Node(v));
    for (size_t i = 0; i < spec.size(); i++) {
        if (i + 1 < nodes.size()) nodes[i]->next = nodes[i + 1];
        if (spec[i].second >= 0) nodes[i]->random = nodes[spec[i].second];
    }
    return nodes.empty() ? nullptr : nodes[0];
}
static vector<Node*> nodesOf(Node* head) { vector<Node*> out; for (; head; head = head->next) out.push_back(head); return out; }
static vector<pair<int, int>> describeRandomList(Node* head) {  // -2 marks a random pointer leaving the list
    vector<Node*> nodes = nodesOf(head);
    unordered_map<Node*, int> index;
    for (size_t i = 0; i < nodes.size(); i++) index[nodes[i]] = i;
    vector<pair<int, int>> out;
    for (Node* node : nodes) out.push_back({node->val, !node->random ? -1 : index.count(node->random) ? index[node->random] : -2});
    return out;
}

int main() {
    vector<vector<pair<int, int>>> cases = {{{4, 2}, {8, -1}, {2, 0}}, {{6, 0}}, {{1, 1}, {1, 0}, {1, -1}}, {},
        {{1, -1}, {2, -1}, {3, -1}}, {{-10000, 4}, {0, 4}, {5, 4}, {10000, 4}, {7, 4}}, {{3, 1}, {9, 0}}};
    vector<pair<int, int>> big;
    for (int i = 0; i < 1000; i++) big.push_back({i - 500, i % 5 == 0 ? -1 : i * 7 % 1000});
    cases.push_back(big);
    for (size_t n = 0; n < cases.size(); n++) {
        Node* head = buildRandomList(cases[n]);
        vector<Node*> originalNodes = nodesOf(head);
        set<Node*> originals(originalNodes.begin(), originalNodes.end());
        Node* copy = Solution().copyRandomList(head);
        string label = "case " + to_string(n);
        check(describeRandomList(copy), cases[n], label + " copy");
        check(describeRandomList(head), cases[n], label + " original changed");
        bool shared = false;
        for (Node* node : nodesOf(copy)) shared = shared || originals.count(node);
        check(shared, false, label + " copy shares nodes with the original");
    }
    return failures ? 1 : 0;
}
