// adj[i] lists the (1-based) neighbours of node i + 1. Returns node 1, or nullptr for an empty graph.
static Node* buildGraph(const vector<vector<int>>& adj) {
    vector<Node*> nodes;
    for (size_t i = 0; i < adj.size(); i++) nodes.push_back(new Node(i + 1));
    for (size_t i = 0; i < adj.size(); i++)
        for (int j : adj[i]) nodes[i]->neighbors.push_back(nodes[j - 1]);
    return nodes.empty() ? nullptr : nodes[0];
}
static vector<Node*> graphNodes(Node* start) {  // every node reachable from start, each object once
    set<Node*> seen;
    vector<Node*> out, stack;
    if (start) stack.push_back(start);
    while (!stack.empty()) {
        Node* node = stack.back();
        stack.pop_back();
        if (!seen.insert(node).second) continue;
        out.push_back(node);
        for (Node* nb : node->neighbors) stack.push_back(nb);
    }
    return out;
}
// Back to an adjacency list; a node whose value is out of range or repeated makes the result differ from the input.
static vector<vector<int>> describeGraph(Node* start) {
    vector<Node*> nodes = graphNodes(start);
    map<int, Node*> byVal;
    for (Node* node : nodes) {
        if (byVal.count(node->val)) return {{-node->val}};  // two nodes with the same value
        byVal[node->val] = node;
    }
    vector<vector<int>> out;
    for (int v = 1; v <= (int) nodes.size(); v++) {
        if (!byVal.count(v)) return {{0}};  // values are not 1..n
        vector<int> row;
        for (Node* nb : byVal[v]->neighbors) row.push_back(nb->val);
        out.push_back(row);
    }
    return out;
}
static vector<vector<int>> ringWithChords(int n) {  // node i joined to its two ring neighbours and to the node opposite it
    vector<vector<int>> adj;
    for (int i = 1; i <= n; i++) adj.push_back({(i - 2 + n) % n + 1, i % n + 1, (i + n / 2 - 1) % n + 1});
    return adj;
}

int main() {
    vector<vector<vector<int>>> cases = {
        {{2, 4}, {1, 3}, {2, 4}, {1, 3}},  // a square
        {{}},                              // a single node
        {},                                // empty graph
        {{2}, {1}},
        {{2, 3}, {1, 3}, {1, 2}},                   // a triangle
        {{2}, {1, 3}, {2, 4}, {3, 5}, {4}},         // a path
        {{2, 3, 4, 5, 6}, {1}, {1}, {1}, {1}, {1}},  // a star
        {{2, 3, 4}, {1, 3}, {1, 2, 4}, {1, 3}},
        ringWithChords(100),  // the largest allowed graph
    };
    for (auto& adj : cases) {
        Node* start = buildGraph(adj);
        vector<Node*> originalNodes = graphNodes(start);
        set<Node*> originals(originalNodes.begin(), originalNodes.end());
        Node* clone = Solution().cloneGraph(start);
        string label = "graph with " + to_string(adj.size()) + " nodes";
        if (adj.empty()) {
            check(clone == nullptr, true, label + " clone");
            continue;
        }
        check(describeGraph(clone), adj, label + " clone");
        check(describeGraph(start), adj, label + " original changed");
        bool shared = false;
        for (Node* node : graphNodes(clone)) shared = shared || originals.count(node);
        check(shared, false, label + " clone shares nodes with the original");
    }
    return failures ? 1 : 0;
}
