import java.util.*;

class Main {
    static String repeat(String part, int times) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < times; i++) sb.append(part);
        return sb.toString();
    }

    public static void main(String[] args) {
        Object[][] cases = {
            {"AABCA", 1, 3},
            {"AABCA", 2, 5},
            {"ABBBAA", 1, 4},
            {"XYZ", 0, 1},
            {"BBBB", 0, 4},
            {"ABAB", 2, 4},
            {"AAABBB", 1, 4},
            {"A", 5, 1},
            {"ABCDE", 2, 3},
            {"AABBCC", 2, 4},
            {repeat("A", 5000) + repeat("B", 5000), 100, 5100},
            {repeat("AB", 5000), 0, 1},
            {repeat("AB", 5000), 5000, 10000},
        };
        for (int n = 0; n < cases.length; n++) {
            String s = (String) cases[n][0];
            int k = (int) cases[n][1];
            Check.eq(new Solution().characterReplacement(s, k), cases[n][2], "case " + n + " (n=" + s.length() + ") k=" + k);
        }
        Check.done();
    }
}
