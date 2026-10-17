import java.util.*;

class Main {
    public static void main(String[] args) {
        Object[][] cases = {
            {"12", 2},
            {"226", 3},
            {"06", 0},
            {"2101", 1},
            {"27", 1},
            {"0", 0},
            {"1", 1},
            {"10", 1},
            {"100", 0},
            {"230", 0},
            {"11106", 2},
            {"1000", 0},
            {"12".repeat(10), 10946},
            {"1".repeat(40), 165580141}, // 41st Fibonacci number
            {"10".repeat(500), 1}, // every "10" must be taken as a pair
            {"27".repeat(500), 1}, // "27" is never a pair
            {"9".repeat(1000), 1},
        };
        for (Object[] c : cases) {
            String s = (String) c[0];
            String label = "\"" + s.substring(0, Math.min(12, s.length())) + (s.length() > 12 ? "..." : "") + "\" (length " + s.length() + ")";
            Check.eq(new Solution().numDecodings(s), c[1], label);
        }
        Check.done();
    }
}
