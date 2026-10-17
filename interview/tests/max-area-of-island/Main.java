import java.util.*;

class Main {
    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {new int[][] {{0, 1, 1, 0}, {0, 1, 0, 0}, {1, 0, 0, 1}}, 3},
            new Object[] {new int[][] {{1, 0, 1}, {0, 1, 0}, {1, 0, 1}}, 1},
            new Object[] {new int[][] {{1, 1, 1}, {1, 1, 1}}, 6},
            new Object[] {new int[][] {{0, 0}, {0, 0}}, 0},
            new Object[] {new int[][] {{1}}, 1},
            new Object[] {new int[][] {{0}}, 0},
            new Object[] {new int[][] {{1, 1, 0, 0, 0}, {1, 1, 0, 1, 1}, {0, 0, 0, 1, 1}, {0, 1, 0, 0, 1}}, 5},
            new Object[] {new int[][] {{1, 0, 1, 1, 1, 0, 1}}, 3}));
        int[][] full = new int[50][50], checker = new int[50][50], stripes = new int[50][50], comb = new int[50][50];
        for (int r = 0; r < 50; r++) {
            for (int c = 0; c < 50; c++) {
                full[r][c] = 1;
                checker[r][c] = (r + c) % 2;                   // every 1 touches only diagonally
                stripes[r][c] = r % 2 == 0 ? 1 : 0;            // 25 separate rows of 50
                comb[r][c] = r == 0 || c % 2 == 0 ? 1 : 0;     // one island: a top bar with 25 teeth
            }
        }
        cases.add(new Object[] {full, 2500});
        cases.add(new Object[] {checker, 1});
        cases.add(new Object[] {stripes, 50});
        cases.add(new Object[] {comb, 50 + 25 * 49});
        for (int n = 0; n < cases.size(); n++) {
            int[][] grid = (int[][]) cases.get(n)[0], copy = new int[grid.length][];
            for (int i = 0; i < grid.length; i++) copy[i] = grid[i].clone();
            Check.eq(new Solution().maxAreaOfIsland(copy), cases.get(n)[1],
                "case " + n + " (" + grid.length + "x" + grid[0].length + ")");
        }
        Check.done();
    }
}
