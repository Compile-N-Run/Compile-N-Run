import java.util.*;

class Main {
    static String repeat(String part, int times) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < times; i++) sb.append(part);
        return sb.toString();
    }

    public static void main(String[] args) {
        Object[][] cases = {
            {"   -17abc", -17},
            {"+0042", 42},
            {"words 9", 0},
            {"  +-3", 0},
            {"3.14", 3},
            {"-91283472332", -2147483648},
            {"99999999999", 2147483647},
            {"", 0},
            {"   ", 0},
            {"-", 0},
            {"+", 0},
            {"-0", 0},
            {"- 5", 0},
            {"  12 34", 12},
            {"2147483647", 2147483647},
            {"2147483648", 2147483647},
            {"-2147483648", -2147483648},
            {"-2147483647", -2147483647},
            {repeat("0", 500) + "7", 7},
            {"-" + repeat("0", 500) + "2147483648", -2147483648},
            {repeat("9", 300), 2147483647},
            {"-" + repeat("9", 300) + "x", -2147483648},
        };
        for (int n = 0; n < cases.length; n++) {
            String s = (String) cases[n][0];
            Check.eq(new Solution().myAtoi(s), cases[n][1], "case " + n + " (n=" + s.length() + ")");
        }
        Check.done();
    }
}
