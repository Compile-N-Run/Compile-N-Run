import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] alternating = new int[10000], ones = new int[10000];
        for (int i = 0; i < 10000; i++) {
            alternating[i] = 1 - i % 2;
            ones[i] = 1;
        }
        Object[][] cases = {
            {new int[] {1, 1, 0, 0, 1, 1, 1, 0, 1}, 2, 7},
            {new int[] {0, 0, 0}, 1, 1},
            {new int[] {0, 0, 0}, 0, 0},
            {new int[] {1, 1, 1}, 0, 3},
            {new int[] {1, 0, 1, 0, 1}, 5, 5},
            {new int[] {1}, 0, 1},
            {new int[] {0}, 0, 0},
            {new int[] {0}, 1, 1},
            {new int[] {1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1}, 2, 7},
            {new int[] {0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1}, 0, 3},
            {alternating, 100, 201},
            {ones, 0, 10000},
            {new int[10000], 10000, 10000},
        };
        for (int n = 0; n < cases.length; n++) {
            int[] nums = ((int[]) cases[n][0]).clone();
            int k = (int) cases[n][1];
            Check.eq(new Solution().longestOnes(nums, k), cases[n][2], "case " + n + " k=" + k);
        }
        Check.done();
    }
}
