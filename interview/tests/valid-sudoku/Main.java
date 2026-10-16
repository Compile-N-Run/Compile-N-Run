import java.util.*;

class Main {
    public static void main(String[] args) {
        String E = ".........";
        Object[][] cases = {
            {"empty board", new String[] {E, E, E, E, E, E, E, E, E}, true},
            {"two 5s in row 0", new String[] {"5.......5", E, E, E, E, E, E, E, E}, false},
            {"two 9s in the centre box", new String[] {E, E, E, "...9.....", E, ".....9...", E, E, E}, false},
            {"valid but unsolvable", new String[] {"12345678.", "........9", E, E, E, E, E, E, E}, true},
            {"two 3s in column 4", new String[] {E, "....3....", E, E, E, E, E, "....3....", E}, false},
            {"full solved grid", new String[] {"123456789", "456789123", "789123456", "234567891", "567891234",
                "891234567", "345678912", "678912345", "912345678"}, true},
            {"partly filled valid grid", new String[] {"...45..8.", ".5.7.9.23", ".89.23..6", ".3456.8.1", "5...9.2..",
                "..1234567", "3.56789.2", "6..91.3..", ".12.4.6.8"}, true},
            {"full grid with one wrong cell", new String[] {"123456789", "456789123", "789123456", "234567891", "567891234",
                "891234567", "345678912", "678912345", "912345677"}, false},
        };
        for (Object[] c : cases) {
            String[] rows = (String[]) c[1];
            char[][] board = new char[9][];
            for (int r = 0; r < 9; r++) board[r] = rows[r].toCharArray();
            Check.eq(new Solution().isValidSudoku(board), c[2], (String) c[0]);
        }
        Check.done();
    }
}
