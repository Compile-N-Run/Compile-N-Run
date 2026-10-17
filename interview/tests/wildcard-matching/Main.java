import java.util.*;

class Main {
    public static void main(String[] args) {
        Object[][] cases = {
            {"adceb", "*a*b", true},
            {"acdcb", "a*c?b", false},
            {"cb", "?a", false},
            {"", "**", true},
            {"abc", "", false},
            {"aa", "a", false},
            {"aa", "*", true},
            {"", "", true},
            {"", "?", false},
            {"abc", "abc", true},
            {"abc", "a?c", true},
            {"a", "a*", true},
            {"ho", "**ho", true},
            {"mississippi", "m??*ss*?i*pi", false},
            {"abefcdgiescdfimde", "ab*cd?i*de", true},
            {"a".repeat(2000) + "b", "*a", false},
            {"a".repeat(1000) + "b", "*a*b", true},
            {"a".repeat(2000), "*".repeat(50) + "b", false},
            {"a".repeat(2000), "*a".repeat(100) + "*", true}, // many stars that must each stretch
        };
        for (Object[] c : cases) {
            String s = (String) c[0], p = (String) c[1];
            String label = "\"" + s.substring(0, Math.min(10, s.length())) + (s.length() > 10 ? "..." : "") + "\" (length " + s.length()
                + ") against \"" + p.substring(0, Math.min(12, p.length())) + (p.length() > 12 ? "..." : "") + "\"";
            Check.eq(new Solution().isMatch(s, p), c[2], label);
        }
        Check.done();
    }
}
