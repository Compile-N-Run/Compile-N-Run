import java.util.*;

class Main {
    public static void main(String[] args) {
        // Each op is {0, timestamp, 0} for hit or {1, timestamp, expected} for getHits.
        List<int[][]> cases = new ArrayList<>(Arrays.asList(
            new int[][] {{0, 2, 0}, {0, 2, 0}, {0, 5, 0}, {1, 5, 3}, {1, 301, 3}, {1, 302, 1}, {1, 305, 0}},
            new int[][] {{1, 1, 0}, {1, 100, 0}},
            new int[][] {{0, 1, 0}, {1, 300, 1}, {1, 301, 0}},
            new int[][] {{0, 10, 0}, {0, 10, 0}, {0, 10, 0}, {0, 10, 0}, {0, 10, 0}, {1, 10, 5}, {1, 309, 5}, {1, 310, 0}},
            new int[][] {{0, 1, 0}, {0, 100, 0}, {0, 250, 0}, {1, 350, 2}, {0, 400, 0}, {1, 400, 2}, {1, 549, 2}, {1, 550, 1}},
            new int[][] {{1, 5, 0}, {0, 5, 0}, {1, 5, 1}, {0, 6, 0}, {0, 6, 0}, {1, 304, 3}, {1, 305, 2}, {1, 306, 0}}));
        int[][] big = new int[20001][];
        for (int t = 1; t <= 10000; t++) {
            big[2 * t - 2] = new int[] {0, t, 0};
            big[2 * t - 1] = new int[] {1, t, Math.min(t, 300)};
        }
        big[20000] = new int[] {1, 20000, 0};
        cases.add(big);
        for (int n = 0; n < cases.size(); n++) {
            HitCounter counter = new HitCounter();
            int[][] ops = cases.get(n);
            for (int step = 0; step < ops.length; step++) {
                int[] op = ops[step];
                if (op[0] == 0) counter.hit(op[1]);
                else Check.eq(counter.getHits(op[1]), op[2], "case " + n + " step " + step + " getHits(" + op[1] + ")");
            }
        }
        Check.done();
    }
}
