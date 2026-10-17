import java.util.*;

class Main {
    public static void main(String[] args) {
        String[][] cases = {
            {"12", "34", "408"},
            {"3", "4", "12"},
            {"999", "999", "998001"},
            {"0", "98765", "0"},
            {"2", "0", "0"},
            {"1", "1", "1"},
            {"25", "4", "100"},
            {"123456789", "987654321", "121932631112635269"},
            {"1" + "0".repeat(199), "1" + "0".repeat(199), "1" + "0".repeat(398)},
            // (10^200 - 1)^2 = 10^400 - 2 * 10^200 + 1
            {"9".repeat(200), "9".repeat(200), "9".repeat(199) + "8" + "0".repeat(199) + "1"}};
        for (String[] c : cases) {
            Check.eq(new Solution().multiply(c[0], c[1]), c[2], c[0].substring(0, Math.min(12, c[0].length())) + " * " + c[1].substring(0, Math.min(12, c[1].length())));
        }
        Check.done();
    }
}
