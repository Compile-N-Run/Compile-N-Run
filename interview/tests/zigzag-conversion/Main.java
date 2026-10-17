import java.util.*;

class Main {
    public static void main(String[] args) {
        String letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        StringBuilder big = new StringBuilder(), evens = new StringBuilder(), odds = new StringBuilder();
        for (int i = 0; i < 2000; i++) {
            char c = Character.toLowerCase(letters.charAt(i % 26));
            big.append(c);
            (i % 2 == 0 ? evens : odds).append(c);
        }
        String bigS = big.toString();
        Object[][] cases = {
            {"ABCDEFGHIJ", 3, "AEIBDFHJCG"},
            {"ABCD", 2, "ACBD"},
            {"HELLO", 1, "HELLO"},
            {"AB", 5, "AB"},
            {"ABCDEFGH", 7, "ABCDEFHG"},
            {"ABCDEFG", 7, "ABCDEFG"},
            {"A", 1, "A"},
            {"A", 3, "A"},
            {letters, 4, "AGMSYBFHLNRTXZCEIKOQUWDJPV"},
            {letters, 5, "AIQYBHJPRXZCGKOSWDFLNTVEMU"},
            {"a.b,c d", 2, "abcd., "}, // punctuation and spaces are ordinary characters
            {bigS, 2, evens.toString() + odds.toString()}, // two rows: every other character, then the rest
            {bigS, 2000, bigS}, // as many rows as characters: unchanged
            {bigS, 1, bigS},
        };
        for (Object[] c : cases) {
            String s = (String) c[0];
            String got = new Solution().convert(s, (int) c[1]);
            String head = s.length() > 12 ? s.substring(0, 12) + "..." : s;
            Check.eq(got, c[2], "s=\"" + head + "\" numRows=" + c[1]);
        }
        Check.done();
    }
}
