import java.util.*;

class Main {
    static boolean sameTree(TreeNode a, TreeNode b) {
        if (a == null || b == null) return a == b;
        return a.val == b.val && sameTree(a.left, b.left) && sameTree(a.right, b.right);
    }

    public static void main(String[] args) {
        Integer[] chain = new Integer[999]; // 0 -> 1 -> ... -> 499 down the left side
        chain[0] = 0;
        for (int i = 1; i < 500; i++) chain[2 * i - 1] = i;
        Integer[] full = new Integer[1023]; // complete tree of 1023 nodes
        for (int i = 0; i < 1023; i++) full[i] = i + 1;
        Integer[][] cases = {
            {},
            {1},
            {1, 2, 3, null, null, 4, 5},
            {-5, null, 7},
            {100, 20, 300},
            {0, 0, 0},
            {1, null, 2, null, 3},
            {-1, -2, -3, -4, null, null, -5},
            {2147483647, -2147483648},
            {7, 7, null, 7, null, 7},
            chain,
            full,
        };
        for (int n = 0; n < cases.length; n++) {
            TreeNode root = Check.tree(cases[n]);
            Codec ser = new Codec(), deser = new Codec(); // separate instances, as LeetCode calls them
            String data = ser.serialize(root);
            Check.eq(data != null, true, "case " + n + ": serialize must return a string");
            TreeNode got = deser.deserialize(data);
            Check.eq(sameTree(got, Check.tree(cases[n])), true, "case " + n + " (n=" + cases[n].length + "): round trip changed the tree");
            if (root != null) Check.eq(got != root, true, "case " + n + ": deserialize must build a new tree");
            // The rebuilt tree must serialize and rebuild again just as well.
            TreeNode again = new Codec().deserialize(new Codec().serialize(got));
            Check.eq(sameTree(again, Check.tree(cases[n])), true, "case " + n + " (n=" + cases[n].length + "): second round trip");
        }
        Check.done();
    }
}
