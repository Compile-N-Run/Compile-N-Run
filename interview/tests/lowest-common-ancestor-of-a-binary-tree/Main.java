import java.util.*;

class Main {
    static TreeNode find(TreeNode root, int val) {
        Deque<TreeNode> stack = new ArrayDeque<>();
        stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            if (node.val == val) return node;
            if (node.left != null) stack.push(node.left);
            if (node.right != null) stack.push(node.right);
        }
        return null;
    }

    public static void main(String[] args) {
        Integer[] example = {10, 4, 15, 1, 7, null, 20, null, null, 6, 9};
        Integer[] full = new Integer[1023]; // complete tree of 1023 nodes
        for (int i = 0; i < 1023; i++) full[i] = i + 1;
        Integer[] chain = new Integer[999]; // 0 -> 1 -> ... -> 499 down the left side
        chain[0] = 0;
        for (int i = 1; i < 500; i++) chain[2 * i - 1] = i;
        Object[][] cases = {{example, 6, 9, 7}, {example, 1, 9, 4}, {example, 4, 6, 4}, {example, 9, 20, 10},
            {example, 15, 20, 15}, {new Integer[] {1, 2}, 1, 2, 1}, {new Integer[] {1, 2}, 2, 1, 1},
            {new Integer[] {0, -5, 8, null, -3}, -3, 8, 0},
            {full, 1000, 1023, 31}, {full, 1000, 1001, 500}, {full, 960, 975, 60}, {chain, 499, 200, 200}};
        for (Object[] c : cases) {
            TreeNode root = Check.tree((Integer[]) c[0]);
            int p = (int) c[1], q = (int) c[2];
            TreeNode got = new Solution().lowestCommonAncestor(root, find(root, p), find(root, q));
            Check.eq(got != null && got == find(root, (int) c[3]), true, "p=" + p + " q=" + q + " got " + (got == null ? null : got.val));
        }
        Check.done();
    }
}
