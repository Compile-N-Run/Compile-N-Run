import java.util.*;

class Main {
    public static void main(String[] args) {
        // Larger case: 200 words of 200 characters that share their first 150 characters.
        String[] big = new String[200];
        for (int i = 0; i < 200; i++) big[i] = "k".repeat(150) + String.valueOf((char) ('a' + i % 26)).repeat(50);
        Object[][] cases = {{new String[] {"interview", "internet", "interval"}, "inter"}, {new String[] {"apple", "banana"}, ""},
            {new String[] {"code", "coder", "co"}, "co"}, {new String[] {"solo"}, "solo"}, {new String[] {""}, ""},
            {new String[] {"abc", ""}, ""}, {new String[] {"same", "same", "same"}, "same"},
            {new String[] {"prefix", "pre", "prelude", "prey"}, "pre"}, {big, "k".repeat(150)}};
        for (Object[] c : cases) {
            String[] strs = (String[]) c[0];
            Check.eq(new Solution().longestCommonPrefix(strs.clone()), c[1], Arrays.toString(Arrays.copyOf(strs, Math.min(4, strs.length))));
        }
        Check.done();
    }
}
