import java.util.*;

class Main {
    public static void main(String[] args) {
        Object[][] cases = {{"kitten", "sitting", 3}, {"sunday", "saturday", 3}, {"abc", "", 3}, {"", "abc", 3}, {"", "", 0},
            {"same", "same", 0}, {"a", "b", 1}, {"abcdef", "azced", 3}, {"ab", "ba", 2}, {"abcabcabc", "cba", 6},
            {"a".repeat(500), "b".repeat(500), 500}, {"ab".repeat(250), "ba".repeat(250), 2}, {"x".repeat(300), "x".repeat(500), 200}};
        for (int n = 0; n < cases.length; n++) {
            Check.eq(new Solution().minDistance((String) cases[n][0], (String) cases[n][1]), cases[n][2], "case " + n);
        }
        Check.done();
    }
}
