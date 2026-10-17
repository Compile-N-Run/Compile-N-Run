import java.util.*;

class Main {
    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {new int[][] {{10, 20, 30}, {30, 40, 50}}, 10, 50, 2},
            new Object[] {new int[][] {{1, 2, 3}}, 1, 3, 1},
            new Object[] {new int[][] {{1, 2}, {3, 4}}, 1, 4, -1},
            new Object[] {new int[][] {{5, 6}}, 5, 5, 0},
            new Object[] {new int[][] {{1, 2, 3, 4, 5}, {2, 10}, {5, 10}}, 1, 10, 2},
            new Object[] {new int[][] {{1, 2, 3}, {3, 4}}, 1, 3, 1},
            new Object[] {new int[][] {{1, 9}, {2, 3, 8}, {4}, {8, 11}, {5, 9, 10}}, 8, 9, -1},
            new Object[] {new int[][] {{1, 2}, {2, 3}, {3, 4}, {4, 5}}, 1, 5, 4},
            new Object[] {new int[][] {{7, 8}}, 1, 8, -1})); // source is not on any route
        int[][] chain = new int[500][], star = new int[1000][], longRoutes = new int[100][];
        for (int i = 0; i < 500; i++) chain[i] = new int[] {i, i + 1};
        for (int i = 1; i <= 1000; i++) star[i - 1] = new int[] {0, i};
        for (int r = 0; r < 100; r++) {
            longRoutes[r] = new int[1000];
            for (int k = 0; k < 1000; k++) longRoutes[r][k] = r * 500 + k;
        }
        cases.add(new Object[] {chain, 0, 500, 500}); // a chain of 500 buses
        cases.add(new Object[] {star, 1, 1000, 2}); // a star: every route passes the hub 0
        cases.add(new Object[] {longRoutes, 0, 49999 + 500, 100}); // long overlapping routes
        for (int n = 0; n < cases.size(); n++) {
            Object[] c = cases.get(n);
            int[][] routes = (int[][]) c[0];
            int got = new Solution().numBusesToDestination(routes, (int) c[1], (int) c[2]);
            Check.eq(got, c[3], "case " + n + ": " + routes.length + " routes " + c[1] + "->" + c[2]);
        }
        Check.done();
    }
}
