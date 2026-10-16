import java.util.*;

class Main {
    // A spec is a list of {val, random index or -1}.
    static Node build(int[][] spec) {
        Node[] nodes = new Node[spec.length];
        for (int i = 0; i < spec.length; i++) nodes[i] = new Node(spec[i][0]);
        for (int i = 0; i < spec.length; i++) {
            if (i + 1 < spec.length) nodes[i].next = nodes[i + 1];
            if (spec[i][1] >= 0) nodes[i].random = nodes[spec[i][1]];
        }
        return spec.length == 0 ? null : nodes[0];
    }

    static List<Node> nodesOf(Node head) {
        List<Node> out = new ArrayList<>();
        for (; head != null; head = head.next) out.add(head);
        return out;
    }

    static int[][] describe(Node head) { // -2 marks a random pointer leaving the list
        List<Node> nodes = nodesOf(head);
        Map<Node, Integer> index = new IdentityHashMap<>();
        for (int i = 0; i < nodes.size(); i++) index.put(nodes.get(i), i);
        int[][] out = new int[nodes.size()][];
        for (int i = 0; i < nodes.size(); i++) {
            Node r = nodes.get(i).random;
            out[i] = new int[] {nodes.get(i).val, r == null ? -1 : index.getOrDefault(r, -2)};
        }
        return out;
    }

    public static void main(String[] args) {
        List<int[][]> cases = new ArrayList<>(Arrays.asList(
            new int[][] {{4, 2}, {8, -1}, {2, 0}}, new int[][] {{6, 0}}, new int[][] {{1, 1}, {1, 0}, {1, -1}}, new int[0][],
            new int[][] {{1, -1}, {2, -1}, {3, -1}}, new int[][] {{-10000, 4}, {0, 4}, {5, 4}, {10000, 4}, {7, 4}},
            new int[][] {{3, 1}, {9, 0}}));
        int[][] big = new int[1000][];
        for (int i = 0; i < 1000; i++) big[i] = new int[] {i - 500, i % 5 == 0 ? -1 : i * 7 % 1000};
        cases.add(big);
        for (int n = 0; n < cases.size(); n++) {
            int[][] spec = cases.get(n);
            Node head = build(spec);
            Set<Node> originals = Collections.newSetFromMap(new IdentityHashMap<>());
            originals.addAll(nodesOf(head));
            Node copy = new Solution().copyRandomList(head);
            Check.eq(describe(copy), spec, "case " + n + " copy");
            Check.eq(describe(head), spec, "case " + n + " original changed");
            boolean shared = false;
            for (Node node : nodesOf(copy)) shared |= originals.contains(node);
            Check.eq(shared, false, "case " + n + " copy shares nodes with the original");
        }
        Check.done();
    }
}
