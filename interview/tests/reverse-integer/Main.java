import java.util.*;

class Main {
    public static void main(String[] args) {
        int[][] cases = {
            {123, 321},
            {-450, -54},
            {1200, 21},
            {1534236469, 0}, // 9646324351 is too large
            {Integer.MIN_VALUE, 0}, // -8463847412 is too small
            {Integer.MAX_VALUE, 0}, // 7463847412 is too large
            {1463847412, 2147483641}, // fits, 6 below INT_MAX
            {-1463847412, -2147483641},
            {0, 0},
            {7, 7},
            {-120, -21},
            {1000000000, 1},
            {1000000003, 0}, // 3000000001 is too large
            {2147447412, 2147447412}, // a palindrome that fits
            {-2147447412, -2147447412},
            {1056389759, 0}, // 9579836501 is too large
            {2147483641, 1463847412},
            {1234567899, 0}, // 9987654321 is too large
        };
        for (int[] c : cases) Check.eq(new Solution().reverse(c[0]), c[1], "x=" + c[0]);
        // every ten-digit value in a stretch: whatever fits must be reversed exactly, the rest must give 0
        for (int x = 1463847400; x < 1463847500; x++) {
            long rev = Long.parseLong(new StringBuilder(Integer.toString(x)).reverse().toString());
            int want = rev <= Integer.MAX_VALUE ? (int) rev : 0;
            Check.eq(new Solution().reverse(x), want, "x=" + x);
            Check.eq(new Solution().reverse(-x), -want, "x=" + (-x));
        }
        Check.done();
    }
}
