import java.util.*;

class Main {
    static char[][] grid(String... rows) {
        char[][] g = new char[rows.length][];
        for (int i = 0; i < rows.length; i++) g[i] = rows[i].toCharArray();
        return g;
    }

    public static void main(String[] args) {
        String[] big = new String[100];
        Arrays.fill(big, "1".repeat(100));
        big[50] = "0".repeat(100);
        Object[][] cases = {{new String[] {"110", "111", "011"}, 4}, {new String[] {"00", "00"}, 0}, {new String[] {"1"}, 1},
            {new String[] {"1111", "1111", "1110"}, 9}, {new String[] {"0"}, 0}, {new String[] {"10111"}, 1},
            {new String[] {"01", "10"}, 1}, {new String[] {"10111", "11111", "01111", "11110"}, 9}, {big, 2500}};
        for (Object[] c : cases) {
            String[] rows = (String[]) c[0];
            Check.eq(new Solution().maximalSquare(grid(rows)), c[1], rows[0] + "...");
        }
        Check.done();
    }
}
