import java.util.*;

class Main {
    static TreeNode balanced(int lo, int hi) { // a perfectly balanced BST holding lo..hi
        if (lo > hi) return null;
        int mid = lo + (hi - lo) / 2;
        return new TreeNode(mid, balanced(lo, mid - 1), balanced(mid + 1, hi));
    }

    public static void main(String[] args) {
        Integer[] chain = new Integer[999]; // 1 -> 2 -> ... -> 500 down the right side
        chain[0] = 1;
        for (int i = 2; i <= 500; i++) chain[2 * (i - 1)] = i;
        Integer[] dip = chain.clone();
        dip[2 * 249] = 100; // node 250 is replaced by 100, which is smaller than its ancestors
        Object[][] cases = {
            {new Integer[] {8, 3, 10}, true},
            {new Integer[] {8, 3, 10, null, null, 6, 12}, false},
            {new Integer[] {5, 5}, false},
            {new Integer[] {Integer.MAX_VALUE}, true},
            {new Integer[] {Integer.MIN_VALUE}, true},
            {new Integer[] {Integer.MIN_VALUE, null, Integer.MAX_VALUE}, true},
            {new Integer[] {Integer.MAX_VALUE, Integer.MIN_VALUE}, true},
            {new Integer[] {Integer.MIN_VALUE, Integer.MAX_VALUE}, false},
            {new Integer[] {3, 1, 5, 0, 2, 4, 6}, true},
            {new Integer[] {3, 1, 5, 0, 4, 4, 6}, false},
            {new Integer[] {10, 5, 15, null, null, 6, 20}, false},
            {new Integer[] {10, 5, 15, null, null, 12, 20}, true},
            {chain, true},
            {dip, false},
        };
        for (Object[] c : cases) {
            Integer[] values = (Integer[]) c[0];
            Check.eq(new Solution().isValidBST(Check.tree(values)), c[1], Arrays.toString(Arrays.copyOf(values, Math.min(7, values.length))));
        }

        TreeNode big = balanced(1, 4095);
        Check.eq(new Solution().isValidBST(big), true, "balanced BST of 1..4095");
        TreeNode node = big;
        while (node.left != null) node = node.left;
        node.val = 5000; // the leftmost leaf now exceeds every ancestor
        Check.eq(new Solution().isValidBST(big), false, "balanced BST of 1..4095 with leftmost leaf set to 5000");
        Check.done();
    }
}
