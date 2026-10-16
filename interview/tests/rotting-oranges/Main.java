import java.util.*;

class Main {
    public static void main(String[] args) {
        int[][] big = new int[10][10], allFresh = new int[10][10];
        for (int i = 0; i < 10; i++) {
            Arrays.fill(big[i], 1);
            Arrays.fill(allFresh[i], 1);
        }
        big[0][0] = 2; // the far corner is 18 steps away
        Object[][] cases = {{new int[][] {{2, 1, 0}, {1, 1, 1}, {0, 1, 1}}, 4}, {new int[][] {{2, 1, 1, 1, 2}}, 2},
            {new int[][] {{1, 0, 2}}, -1}, {new int[][] {{0, 2}, {0, 0}}, 0}, {new int[][] {{1}}, -1}, {new int[][] {{0}}, 0},
            {new int[][] {{2, 2}, {1, 1}, {0, 1}}, 2}, {big, 18}, {allFresh, -1}};
        for (Object[] c : cases) {
            int[][] grid = (int[][]) c[0];
            String label = Arrays.deepToString(grid);
            Check.eq(new Solution().orangesRotting(grid), c[1], label);
        }
        Check.done();
    }
}
