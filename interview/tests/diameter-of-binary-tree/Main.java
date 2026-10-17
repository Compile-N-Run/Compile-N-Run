import java.util.*;

class Main {
    public static void main(String[] args) {
        Integer[] full = new Integer[1023]; // complete tree of 1023 nodes: 9 edges down each side
        for (int i = 0; i < 1023; i++) full[i] = i + 1;
        Integer[] chain = new Integer[1999]; // 0 -> 1 -> ... -> 999 down the left side
        chain[0] = 0;
        for (int i = 1; i < 1000; i++) chain[2 * i - 1] = i;
        Object[][] cases = {
            {new Integer[] {1, 2, 3, 4, 5}, 3},
            {new Integer[] {1}, 0},
            {new Integer[] {1, null, 2}, 1},
            {new Integer[] {1, 2, null, 3, 4, 5, null, null, 6, 7}, 5}, // longest path avoids the root
            {new Integer[] {1, 2, 3}, 2},
            {new Integer[] {1, 2, null, 3, null, 4}, 3}, // a chain of four
            {new Integer[] {1, 2, 3, 4, 5, 6, 7}, 4},
            {new Integer[] {1, 2, 3, 4, null, null, 5}, 4},
            {new Integer[] {-7, -7, -7, null, 3}, 3}, // values do not matter
            {new Integer[] {}, 0}, // no tree at all
            {full, 18},
            {chain, 999},
        };
        for (Object[] c : cases) {
            Integer[] values = (Integer[]) c[0];
            int got = new Solution().diameterOfBinaryTree(Check.tree(values));
            String head = Arrays.toString(Arrays.copyOf(values, Math.min(10, values.length)));
            Check.eq(got, c[1], "tree=" + head + (values.length > 10 ? "..." : "") + " (" + values.length + " entries)");
        }
        Check.done();
    }
}
