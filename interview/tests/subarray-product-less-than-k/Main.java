import java.util.*;

class Main {
    static int[] repeat(int value, int n) { int[] out = new int[n]; Arrays.fill(out, value); return out; }

    public static void main(String[] args) {
        Object[][] cases = {
            {new int[] {2, 3, 4}, 10, 4},
            {new int[] {1, 1, 1}, 2, 6},
            {new int[] {5, 5}, 5, 0},
            {new int[] {3}, 0, 0},
            {new int[] {3}, 1, 0},
            {new int[] {3}, 4, 1},
            {new int[] {10, 5, 2, 6}, 100, 8},
            {new int[] {1, 2, 3, 4, 5}, 20, 9},
            {new int[] {4, 1, 1, 8, 2}, 9, 10},
            {repeat(2, 20), 1024, 144},
            {repeat(1, 30000), 2, 450015000},
            {repeat(1000, 30000), 1000000, 30000},
        };
        for (int n = 0; n < cases.length; n++) {
            int[] nums = ((int[]) cases[n][0]).clone();
            Check.eq(new Solution().numSubarrayProductLessThanK(nums, (int) cases[n][1]), cases[n][2], "case " + n);
        }
        Check.done();
    }
}
