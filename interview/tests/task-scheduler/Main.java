import java.util.*;

class Main {
    public static void main(String[] args) {
        String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        Object[][] cases = {{"AAABBB", 2, 8}, {"AAABBB", 0, 6}, {"AAAAAABCDEFG", 2, 16}, {"ABCD", 5, 4}, {"A", 5, 1}, {"AAAA", 1, 7},
            {"AABBCC", 1, 6}, {"AAB", 2, 4}, {"AAABBBCCC", 2, 9}, {"AAABBBCC", 3, 10}, {"ZZZZZZZZZZ", 0, 10},
            {"A".repeat(10000) + "B".repeat(10000), 50, 9999 * 51 + 2}, {alphabet.repeat(400), 1, 10400}, {"Q".repeat(1000), 100, 999 * 101 + 1}};
        for (Object[] c : cases) {
            String tasks = (String) c[0];
            int n = (int) c[1];
            Check.eq(new Solution().leastInterval(tasks.toCharArray(), n), c[2], tasks.substring(0, Math.min(12, tasks.length())) + " n=" + n);
        }
        Check.done();
    }
}
