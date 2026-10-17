import java.util.*;

class Main {
    public static void main(String[] args) {
        Integer[] full = new Integer[1023]; // complete tree of 1023 nodes
        for (int i = 0; i < 1023; i++) full[i] = i + 1;
        Integer[] chain = new Integer[999]; // 0 -> 1 -> ... -> 499 down the left side
        chain[0] = 0;
        for (int i = 1; i < 500; i++) chain[2 * i - 1] = i;
        Object[][] cases = {
            {new Integer[] {}, 0},
            {new Integer[] {7}, 1},
            {new Integer[] {5, 3, 8, null, 4}, 3},
            {new Integer[] {1, null, 2, null, 3, null, 4}, 4},
            {new Integer[] {1, 2, 3, 4, 5, 6, 7}, 3},
            {new Integer[] {1, 2}, 2},
            {new Integer[] {1, 2, 3, 4, 5, 6, 7, 8}, 4},
            {new Integer[] {-1, -2, null, -3, null, null, -4}, 4},
            {full, 10},
            {chain, 500},
        };
        for (int n = 0; n < cases.length; n++) {
            Integer[] values = (Integer[]) cases[n][0];
            Check.eq(new Solution().maxDepth(Check.tree(values)), cases[n][1], "case " + n + " with " + values.length + " entries");
        }
        Check.done();
    }
}
