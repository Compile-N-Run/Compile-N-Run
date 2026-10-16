import java.util.*;

class Main {
    public static void main(String[] args) {
        // Each op is {0, key, value} for put or {1, key, expected} for get.
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {2, new int[][] {{0, 1, 10}, {0, 2, 20}, {1, 1, 10}, {0, 3, 30}, {1, 2, -1}, {1, 3, 30}, {1, 1, 10}}},
            new Object[] {1, new int[][] {{0, 5, 50}, {1, 5, 50}, {0, 6, 60}, {1, 5, -1}, {1, 6, 60}}},
            new Object[] {2, new int[][] {{0, 1, 1}, {0, 2, 2}, {0, 1, 100}, {0, 3, 3}, {1, 1, 100}, {1, 2, -1}, {1, 3, 3}}},
            new Object[] {3, new int[][] {{1, 7, -1}, {0, 7, 0}, {1, 7, 0}, {1, 8, -1}}},
            new Object[] {2, new int[][] {{0, 1, 1}, {0, 2, 2}, {1, 1, 1}, {0, 3, 3}, {1, 2, -1}, {0, 4, 4}, {1, 1, -1}, {1, 3, 3}, {1, 4, 4}}},
            new Object[] {2, new int[][] {{0, 2, 1}, {0, 2, 2}, {1, 2, 2}, {0, 1, 1}, {0, 4, 1}, {1, 2, -1}}}));
        int[][] big = new int[2000][];
        for (int i = 0; i < 1000; i++) {
            big[i] = new int[] {0, i, 2 * i};
            big[1000 + i] = new int[] {1, i, i >= 900 ? 2 * i : -1};
        }
        cases.add(new Object[] {100, big});
        for (int n = 0; n < cases.size(); n++) {
            LRUCache cache = new LRUCache((int) cases.get(n)[0]);
            int[][] ops = (int[][]) cases.get(n)[1];
            for (int step = 0; step < ops.length; step++) {
                int[] op = ops[step];
                if (op[0] == 0) cache.put(op[1], op[2]);
                else Check.eq(cache.get(op[1]), op[2], "case " + n + " step " + step + " get(" + op[1] + ")");
            }
        }
        Check.done();
    }
}
