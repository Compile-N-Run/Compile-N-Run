import java.util.*;

class Main {
    public static void main(String[] args) {
        Object[][] cases = {
            {"5329174", 3, "2174"},
            {"20300", 1, "300"},
            {"12345", 2, "123"},
            {"7", 1, "0"},
            {"1432219", 3, "1219"},
            {"10", 2, "0"},
            {"112", 1, "11"},
            {"54321", 2, "321"},
            {"10001", 1, "1"},
            {"100", 1, "0"},
            {"9871", 3, "1"},
            {"5337", 2, "33"},
            {"1173", 2, "11"},
            {"0", 0, "0"},
            {"123", 0, "123"},
            {"9".repeat(5000) + "1", 5000, "1"},
            {"1".repeat(10000) + "0", 1, "1".repeat(9999) + "0"},
        };
        for (Object[] c : cases) {
            String num = (String) c[0];
            Check.eq(new Solution().removeKdigits(num, (int) c[1]), c[2], "removeKdigits(" + num.substring(0, Math.min(12, num.length())) + ", " + c[1] + ")");
        }
        Check.done();
    }
}
