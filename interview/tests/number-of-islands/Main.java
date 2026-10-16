import java.util.*;

class Main {
    public static void main(String[] args) {
        String[] full = new String[300], board = new String[300];
        for (int r = 0; r < 300; r++) {
            full[r] = "1".repeat(300);
            StringBuilder row = new StringBuilder();
            for (int c = 0; c < 300; c++) row.append((r + c) % 2 == 0 ? '1' : '0');
            board[r] = row.toString();
        }
        Object[][] cases = {{new String[] {"110", "010", "001"}, 2}, {new String[] {"101", "010", "101"}, 5},
            {new String[] {"000"}, 0}, {new String[] {"1111", "1001", "1111"}, 1}, {new String[] {"1"}, 1},
            {new String[] {"10", "01", "10"}, 3}, {new String[] {"1", "1", "0", "1"}, 2}, {full, 1}, {board, 45000}};
        for (int n = 0; n < cases.length; n++) {
            String[] rows = (String[]) cases[n][0];
            char[][] grid = new char[rows.length][];
            for (int i = 0; i < rows.length; i++) grid[i] = rows[i].toCharArray();
            Check.eq(new Solution().numIslands(grid), cases[n][1], "case " + n + " " + Arrays.toString(Arrays.copyOf(rows, Math.min(3, rows.length))));
        }
        Check.done();
    }
}
