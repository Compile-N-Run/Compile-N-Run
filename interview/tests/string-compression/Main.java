import java.util.*;

class Main {
    public static void main(String[] args) {
        String[][] cases = {{"xxxyzz", "x3yz2"}, {"q", "q"}, {"m".repeat(12), "m12"}, {"abba", "ab2a"}, {"##@@@1111", "#2@314"},
            {"z".repeat(10), "z10"}, {"ab", "ab"}, {"11122", "1322"}, {"a".repeat(1000) + "b" + "c".repeat(100), "a1000bc100"}};
        for (String[] c : cases) {
            char[] chars = c[0].toCharArray();
            int n = new Solution().compress(chars);
            String label = c[0].substring(0, Math.min(20, c[0].length()));
            Check.eq(n, c[1].length(), label + " length");
            Check.eq(new String(chars, 0, Math.min(n, chars.length)), c[1], label);
        }
        Check.done();
    }
}
