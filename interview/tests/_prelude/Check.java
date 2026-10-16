import java.util.*;

// Test helpers shared by every Main.java.
class Check {
    static int failures = 0;
    static void eq(Object actual, Object expected, String label) {
        boolean same = actual instanceof int[] && expected instanceof int[] ? Arrays.equals((int[]) actual, (int[]) expected)
            : Objects.deepEquals(actual, expected);
        if (!same) { System.err.println(label + ": expected " + str(expected) + ", got " + str(actual)); failures++; }
    }
    static String str(Object o) { return o instanceof int[] ? Arrays.toString((int[]) o) : o instanceof Object[] ? Arrays.deepToString((Object[]) o) : String.valueOf(o); }
    static ListNode list(int... values) { ListNode head = new ListNode(), tail = head; for (int v : values) { tail.next = new ListNode(v); tail = tail.next; } return head.next; }
    static List<Integer> values(ListNode node) { List<Integer> out = new ArrayList<>(); for (; node != null; node = node.next) out.add(node.val); return out; }
    static TreeNode tree(Integer... values) {
        if (values.length == 0 || values[0] == null) return null;
        TreeNode root = new TreeNode(values[0]); Deque<TreeNode> q = new ArrayDeque<>(); q.add(root); int i = 1;
        while (!q.isEmpty() && i < values.length) {
            TreeNode node = q.poll();
            if (i < values.length && values[i] != null) { node.left = new TreeNode(values[i]); q.add(node.left); } i++;
            if (i < values.length && values[i] != null) { node.right = new TreeNode(values[i]); q.add(node.right); } i++;
        }
        return root;
    }
    static void done() { if (failures > 0) System.exit(1); }
}
