import java.util.*;

class Main {
    static List<List<Integer>> levels(int[][] rows) {
        List<List<Integer>> out = new ArrayList<>();
        for (int[] row : rows) {
            List<Integer> level = new ArrayList<>();
            for (int v : row) level.add(v);
            out.add(level);
        }
        return out;
    }

    public static void main(String[] args) {
        Integer[] full = new Integer[1023]; // complete tree of 1023 nodes: level d holds 2^d .. 2^(d+1) - 1
        for (int i = 0; i < 1023; i++) full[i] = i + 1;
        List<List<Integer>> fullWant = new ArrayList<>();
        for (int d = 0; d < 10; d++) {
            List<Integer> level = new ArrayList<>();
            for (int v = 1 << d; v < 2 << d; v++) level.add(v);
            if (d % 2 == 1) Collections.reverse(level);
            fullWant.add(level);
        }
        Integer[] chain = new Integer[599]; // 0 -> 1 -> ... -> 299 down the left side
        chain[0] = 0;
        List<List<Integer>> chainWant = new ArrayList<>();
        chainWant.add(Arrays.asList(0));
        for (int i = 1; i < 300; i++) {
            chain[2 * i - 1] = i;
            chainWant.add(Arrays.asList(i));
        }
        Object[][] cases = {
            {new Integer[] {}, levels(new int[][] {})},
            {new Integer[] {8}, levels(new int[][] {{8}})},
            {new Integer[] {1, 2, 3, 4, 5, 6, 7}, levels(new int[][] {{1}, {3, 2}, {4, 5, 6, 7}})},
            {new Integer[] {4, 2, 7, 1, null, null, 9}, levels(new int[][] {{4}, {7, 2}, {1, 9}})},
            {new Integer[] {1, 2, null, 3, null, 4}, levels(new int[][] {{1}, {2}, {3}, {4}})},
            {new Integer[] {1, null, 2, null, 3}, levels(new int[][] {{1}, {2}, {3}})},
            {new Integer[] {1, 2, 3, 4, null, null, 5, null, 6, 7}, levels(new int[][] {{1}, {3, 2}, {4, 5}, {7, 6}})},
            {new Integer[] {0, -1, -2, -3, -4, -5, -6, -7}, levels(new int[][] {{0}, {-2, -1}, {-3, -4, -5, -6}, {-7}})},
            {full, fullWant},
            {chain, chainWant},
        };
        for (int n = 0; n < cases.length; n++) {
            Integer[] values = (Integer[]) cases[n][0];
            List<List<Integer>> got = new Solution().zigzagLevelOrder(Check.tree(values));
            Check.eq(got, cases[n][1], "case " + n + " with " + values.length + " entries");
        }
        Check.done();
    }
}
