import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] ramp = new int[1000], big = new int[1000];
        for (int i = 0; i < 1000; i++) {
            ramp[i] = i + 1;
            big[i] = 1000000;
        }
        Object[][] cases = {
            {new int[] {7, 2, 5, 10, 8}, 2, 18},
            {new int[] {1, 2, 3, 4, 5}, 2, 9},
            {new int[] {1, 4, 4}, 3, 4},
            {new int[] {5}, 1, 5},
            {new int[] {1, 1, 1, 1}, 4, 1},
            {new int[] {0, 0, 0}, 2, 0},
            {new int[] {10, 1, 1, 1, 10}, 3, 10},
            {new int[] {2, 3, 1, 2, 4, 3}, 5, 4},
            {ramp, 1, 500500},
            {ramp, 2, 250278},
            {big, 3, 334000000},
        };
        for (int n = 0; n < cases.length; n++) {
            int[] nums = ((int[]) cases[n][0]).clone();
            int k = (int) cases[n][1];
            Check.eq(new Solution().splitArray(nums, k), cases[n][2], "case " + n + " k=" + k);
        }
        Check.done();
    }
}
