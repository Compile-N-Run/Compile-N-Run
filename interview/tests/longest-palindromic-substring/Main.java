import java.util.*;

class Main {
    public static void main(String[] args) {
        // Larger case: 990 letters cycling through the alphabet (no palindrome longer than 1)
        // with a 10-character palindrome inserted in the middle.
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 990; i++) sb.append((char) ('a' + i % 26));
        String alpha = sb.toString();
        String big = alpha.substring(0, 500) + "1234554321" + alpha.substring(500);
        Object[][] cases = {{"xracecarz", 7}, {"abbc", 2}, {"pqr", 1}, {"aaaa", 4}, {"a", 1}, {"Aa", 1},
            {"abacdfgdcaba", 3}, {"ab12321ba", 9}, {big, 10}};
        for (Object[] c : cases) {
            String s = (String) c[0];
            String got = new Solution().longestPalindrome(s);
            boolean ok = got.length() == (int) c[1] && new StringBuilder(got).reverse().toString().equals(got) && s.contains(got);
            Check.eq(ok, true, s.substring(0, Math.min(20, s.length())) + " got " + got);
        }
        Check.done();
    }
}
