import java.util.*;

class Main {
    public static void main(String[] args) {
        Object[][] cases = {
            {"abbbacd", 3, "aacd"},
            {"abbbaac", 3, "c"},
            {"aabbccbba", 2, "a"},
            {"xyz", 2, "xyz"},
            {"aaaa", 3, "a"},
            {"abcd", 2, "abcd"},
            {"deeedbbcccbdaa", 3, "aa"},
            {"pbbcggttciiippooaais", 2, "ps"},
            {"aaa", 3, ""},
            {"aa", 3, "aa"},
            {"yfttttfbbbbnnnnffbgffffgbbbbgssssgthyyyy", 4, "ybth"},
            {"a", 2, "a"},
            {"a".repeat(10000), 10, ""},
            {"a".repeat(10001), 10, "a"},
            {"ab".repeat(5000), 2, "ab".repeat(5000)},
        };
        for (Object[] c : cases) {
            String s = (String) c[0];
            Check.eq(new Solution().removeDuplicates(s, (int) c[1]), c[2], "removeDuplicates(" + s.substring(0, Math.min(16, s.length())) + ", " + c[1] + ")");
        }
        Check.done();
    }
}
