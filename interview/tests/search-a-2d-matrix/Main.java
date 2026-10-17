import java.util.*;

class Main {
    public static void main(String[] args) {
        int[][] grid = {{2, 4, 6}, {9, 11, 13}, {20, 25, 30}};
        Object[][] cases = {
            {grid, 11, true},
            {grid, 12, false},
            {grid, 2, true},
            {grid, 30, true},
            {grid, 1, false},
            {grid, 31, false},
            {grid, 9, true},
            {new int[][] {{7}}, 7, true},
            {new int[][] {{7}}, 8, false},
            {new int[][] {{1, 2, 3, 4, 5}}, 4, true}, // a single row
            {new int[][] {{1, 2, 3, 4, 5}}, 0, false},
            {new int[][] {{1}, {3}, {5}}, 3, true}, // a single column
            {new int[][] {{1}, {3}, {5}}, 4, false},
            {new int[][] {{-9, -7}, {-5, -3}, {-1, 0}}, -3, true}, // negatives
            {new int[][] {{-9, -7}, {-5, -3}, {-1, 0}}, -4, false}};
        for (int n = 0; n < cases.length; n++) {
            Check.eq(new Solution().searchMatrix((int[][]) cases[n][0], (int) cases[n][1]), cases[n][2], "case " + n + " target=" + cases[n][1]);
        }

        // Larger case: a 100 x 100 matrix of even numbers; every even value is found and no odd one is.
        int[][] big = new int[100][100];
        for (int i = 0; i < 100; i++)
            for (int j = 0; j < 100; j++) big[i][j] = 2 * (i * 100 + j);
        boolean allEven = true, anyOdd = false;
        for (int k = 0; k < 10000; k++) {
            allEven &= new Solution().searchMatrix(big, 2 * k);
            anyOdd |= new Solution().searchMatrix(big, 2 * k + 1);
        }
        Check.eq(allEven, true, "100x100 all even values present");
        Check.eq(anyOdd, false, "100x100 no odd value present");
        Check.eq(new Solution().searchMatrix(big, 20000), false, "100x100 target past the end");
        Check.done();
    }
}
