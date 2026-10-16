import java.util.*;

class Main {
    public static void main(String[] args) {
        String[] grid = {"CAT", "ORE", "DOG"};
        String[] snake = {"ABCDEF", "LKJIHG", "MNOPQR", "XWVUTS", "YZABCD", "JIHGFE"};
        String[] flat = {"AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA"};
        Object[][] cases = {{grid, "CARE", true}, {grid, "DOGE", true}, {grid, "CODE", false}, {grid, "CAC", false},
            {grid, "TAR", true}, {grid, "CATERODOG", true}, {new String[] {"a"}, "a", true}, {new String[] {"a"}, "b", false},
            {new String[] {"ab"}, "aba", false}, {new String[] {"ab", "cd"}, "abdc", true}, {new String[] {"ab", "cd"}, "ad", false},
            {snake, "ABCDEFGHIJKLMNO", true}, {snake, "ABCDEFGHIJKLMNQ", false}, {flat, "AAAAAAAAAB", false},
            {flat, "A".repeat(15), true}};
        for (Object[] c : cases) {
            String[] rows = (String[]) c[0];
            char[][] board = new char[rows.length][];
            for (int i = 0; i < rows.length; i++) board[i] = rows[i].toCharArray();
            Check.eq(new Solution().exist(board, (String) c[1]), c[2], Arrays.toString(rows) + " " + c[1]);
        }
        Check.done();
    }
}
