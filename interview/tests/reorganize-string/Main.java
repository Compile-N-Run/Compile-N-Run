import java.util.*;

class Main {
    static String sorted(String s) {
        char[] chars = s.toCharArray();
        Arrays.sort(chars);
        return new String(chars);
    }

    // "ok" when got is a valid rearrangement of s (or "" when none exists); otherwise what went wrong.
    static String verdict(String s, String got) {
        int[] counts = new int[26];
        int most = 0;
        for (char c : s.toCharArray()) most = Math.max(most, ++counts[c - 'a']);
        boolean possible = most <= (s.length() + 1) / 2;
        if (got.isEmpty()) return possible ? "empty, but an arrangement exists" : "ok";
        if (!possible) return "not empty, but no arrangement exists";
        if (!sorted(got).equals(sorted(s))) return "letters differ from the input";
        for (int i = 1; i < got.length(); i++) if (got.charAt(i) == got.charAt(i - 1)) return "two equal letters are adjacent";
        return "ok";
    }

    public static void main(String[] args) {
        String[] cases = {"aab", "aaab", "vvvlo", "a", "aa", "ab", "aabb", "aaabbc", "aaaabbbccd", "zzzzzzyyyyxxww",
            "abcdefghijklmnopqrstuvwxyz",
            "a".repeat(250) + "b".repeat(150) + "c".repeat(100), // 500 letters, exactly half of them a
            "a".repeat(251) + "b".repeat(249)}; // impossible by one letter
        for (String s : cases) {
            String got = new Solution().reorganizeString(s);
            String label = s.length() <= 30 ? s : s.substring(0, 12) + "... (" + s.length() + " letters)";
            Check.eq(verdict(s, got), "ok", "\"" + label + "\" -> \"" + (got.length() <= 30 ? got : got.substring(0, 12) + "...") + "\"");
        }
        Check.done();
    }
}
