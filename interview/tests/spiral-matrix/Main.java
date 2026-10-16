import java.util.*;

class Main {
    // m x n matrix whose spiral order is 0, 1, 2, ... (filled by a turning walker).
    static int[][] spiralFilled(int m, int n) {
        int[][] grid = new int[m][n];
        for (int[] row : grid) Arrays.fill(row, -1);
        int[] di = {0, 1, 0, -1}, dj = {1, 0, -1, 0};
        int i = 0, j = 0, d = 0;
        for (int v = 0; v < m * n; v++) {
            grid[i][j] = v;
            int ni = i + di[d], nj = j + dj[d];
            if (ni < 0 || ni >= m || nj < 0 || nj >= n || grid[ni][nj] != -1) {
                d = (d + 1) % 4;
                ni = i + di[d];
                nj = j + dj[d];
            }
            i = ni;
            j = nj;
        }
        return grid;
    }

    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(List.of(
            new Object[] {new int[][] {{10, 20, 30}, {40, 50, 60}, {70, 80, 90}}, List.of(10, 20, 30, 60, 90, 80, 70, 40, 50)},
            new Object[] {new int[][] {{1, 2, 3, 4}, {5, 6, 7, 8}}, List.of(1, 2, 3, 4, 8, 7, 6, 5)},
            new Object[] {new int[][] {{7}, {8}, {9}}, List.of(7, 8, 9)}, new Object[] {new int[][] {{5}}, List.of(5)},
            new Object[] {new int[][] {{1, 2, 3}}, List.of(1, 2, 3)},
            new Object[] {new int[][] {{1, 2}, {3, 4}, {5, 6}}, List.of(1, 2, 4, 6, 5, 3)},
            new Object[] {new int[][] {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}, {10, 11, 12}}, List.of(1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 5, 8)},
            new Object[] {new int[][] {{-1, -2}, {-3, -4}}, List.of(-1, -2, -4, -3)}));
        for (int[] size : new int[][] {{10, 7}, {7, 10}, {10, 10}}) {
            List<Integer> expected = new ArrayList<>();
            for (int k = 0; k < size[0] * size[1]; k++) expected.add(k);
            cases.add(new Object[] {spiralFilled(size[0], size[1]), expected});
        }
        for (Object[] c : cases) {
            int[][] matrix = (int[][]) c[0];
            Check.eq(new Solution().spiralOrder(matrix), c[1], matrix.length + "x" + matrix[0].length);
        }
        Check.done();
    }
}
