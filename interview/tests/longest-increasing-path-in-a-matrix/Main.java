import java.util.*;

class Main {
    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {new int[][] {{1, 2, 3}, {6, 5, 4}, {7, 8, 9}}, 9},
            new Object[] {new int[][] {{9, 1}, {8, 2}}, 4},
            new Object[] {new int[][] {{5, 5}, {5, 5}}, 1},
            new Object[] {new int[][] {{7}}, 1},
            new Object[] {new int[][] {{3, 4, 5}, {3, 2, 6}, {2, 2, 1}}, 4},
            new Object[] {new int[][] {{-3, -2}, {0, -1}}, 4},
            new Object[] {new int[][] {{1, 2}, {2, 1}}, 2},
            new Object[] {new int[][] {{10, 9, 8, 7, 6, 5, 4, 3, 2, 1}}, 10}));
        int[][] ordered = new int[200][200], snake = new int[20][20];
        for (int r = 0; r < 200; r++)
            for (int c = 0; c < 200; c++) ordered[r][c] = r * 200 + c; // only right/down steps: 199 + 199 + 1
        for (int r = 0; r < 20; r++)
            for (int c = 0; c < 20; c++) snake[r][c] = r * 20 + (r % 2 == 0 ? c : 19 - c); // one path over all cells
        cases.add(new Object[] {ordered, 399});
        cases.add(new Object[] {snake, 400});
        for (int n = 0; n < cases.size(); n++) {
            int[][] matrix = (int[][]) cases.get(n)[0], copy = new int[matrix.length][];
            for (int i = 0; i < matrix.length; i++) copy[i] = matrix[i].clone();
            Check.eq(new Solution().longestIncreasingPath(copy), cases.get(n)[1],
                "case " + n + " (" + matrix.length + "x" + matrix[0].length + ")");
        }
        Check.done();
    }
}
