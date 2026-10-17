import java.util.*;

class Main {
    public static void main(String[] args) {
        Object[][] cases = {
            {0, "Zero"},
            {7, "Seven"},
            {10, "Ten"},
            {13, "Thirteen"},
            {19, "Nineteen"},
            {20, "Twenty"},
            {45, "Forty Five"},
            {90, "Ninety"},
            {100, "One Hundred"},
            {110, "One Hundred Ten"},
            {118, "One Hundred Eighteen"},
            {999, "Nine Hundred Ninety Nine"},
            {1000, "One Thousand"},
            {1001, "One Thousand One"},
            {50003, "Fifty Thousand Three"},
            {100000, "One Hundred Thousand"},
            {1000000, "One Million"},
            {1000010, "One Million Ten"},
            {1001000, "One Million One Thousand"},
            {1000000000, "One Billion"},
            {1000000001, "One Billion One"},
            {1234567891, "One Billion Two Hundred Thirty Four Million Five Hundred Sixty Seven Thousand Eight Hundred Ninety One"},
            {2147483647, "Two Billion One Hundred Forty Seven Million Four Hundred Eighty Three Thousand Six Hundred Forty Seven"},
        };
        for (Object[] c : cases) {
            Check.eq(new Solution().numberToWords((int) c[0]), c[1], String.valueOf(c[0]));
        }
        Check.done();
    }
}
