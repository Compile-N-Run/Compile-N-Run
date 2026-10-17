import java.util.*;

class Main {
    // adj[i] lists the (1-based) neighbours of node i + 1. Returns node 1, or null for an empty graph.
    static Node build(int[][] adj) {
        Node[] nodes = new Node[adj.length];
        for (int i = 0; i < adj.length; i++) nodes[i] = new Node(i + 1);
        for (int i = 0; i < adj.length; i++)
            for (int j : adj[i]) nodes[i].neighbors.add(nodes[j - 1]);
        return adj.length == 0 ? null : nodes[0];
    }

    static List<Node> graphNodes(Node start) { // every node reachable from start, each object once
        Set<Node> seen = Collections.newSetFromMap(new IdentityHashMap<>());
        List<Node> out = new ArrayList<>();
        Deque<Node> stack = new ArrayDeque<>();
        if (start != null) stack.push(start);
        while (!stack.isEmpty()) {
            Node node = stack.pop();
            if (!seen.add(node)) continue;
            out.add(node);
            for (Node nb : node.neighbors) stack.push(nb);
        }
        return out;
    }

    // Back to an adjacency list; a node whose value is out of range or repeated makes the result differ from the input.
    static int[][] describe(Node start) {
        List<Node> nodes = graphNodes(start);
        Map<Integer, Node> byVal = new HashMap<>();
        for (Node node : nodes) {
            if (byVal.containsKey(node.val)) return new int[][] {{-node.val}}; // two nodes with the same value
            byVal.put(node.val, node);
        }
        int[][] out = new int[nodes.size()][];
        for (int v = 1; v <= nodes.size(); v++) {
            Node node = byVal.get(v);
            if (node == null) return new int[][] {{0}}; // values are not 1..n
            out[v - 1] = node.neighbors.stream().mapToInt(nb -> nb.val).toArray();
        }
        return out;
    }

    static int[][] ringWithChords(int n) { // node i joined to its two ring neighbours and to the node opposite it
        int[][] adj = new int[n][];
        for (int i = 1; i <= n; i++) adj[i - 1] = new int[] {(i - 2 + n) % n + 1, i % n + 1, (i + n / 2 - 1) % n + 1};
        return adj;
    }

    public static void main(String[] args) {
        int[][][] cases = {
            {{2, 4}, {1, 3}, {2, 4}, {1, 3}}, // a square
            {{}}, // a single node
            {}, // empty graph
            {{2}, {1}},
            {{2, 3}, {1, 3}, {1, 2}}, // a triangle
            {{2}, {1, 3}, {2, 4}, {3, 5}, {4}}, // a path
            {{2, 3, 4, 5, 6}, {1}, {1}, {1}, {1}, {1}}, // a star
            {{2, 3, 4}, {1, 3}, {1, 2, 4}, {1, 3}},
            ringWithChords(100), // the largest allowed graph
        };
        for (int[][] adj : cases) {
            Node start = build(adj);
            Set<Node> originals = Collections.newSetFromMap(new IdentityHashMap<>());
            originals.addAll(graphNodes(start));
            Node clone = new Solution().cloneGraph(start);
            String label = "graph with " + adj.length + " nodes";
            if (adj.length == 0) {
                Check.eq(clone, null, label + " clone");
                continue;
            }
            Check.eq(describe(clone), adj, label + " clone");
            Check.eq(describe(start), adj, label + " original changed");
            boolean shared = false;
            for (Node node : graphNodes(clone)) shared |= originals.contains(node);
            Check.eq(shared, false, label + " clone shares nodes with the original");
        }
        Check.done();
    }
}
