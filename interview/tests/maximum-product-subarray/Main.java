import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] negatives = new int[9999]; // odd count of negatives: drop one end
        Arrays.fill(negatives, -1);
        int[] ends = new int[10000]; // the whole array is the answer
        Arrays.fill(ends, 1);
        ends[0] = ends[9999] = -2;
        Object[][] cases = {
            {new int[] {2, -3, 4}, 4},
            {new int[] {-2, 3, -4}, 24},
            {new int[] {2, -5, -2, -4, 3}, 24},
            {new int[] {0, -1}, 0},
            {new int[] {-5}, -5},
            {new int[] {2, 0, 3, 4}, 12},
            {new int[] {-1, -2, -3, 0, 5}, 6},
            {new int[] {3, -1, 4}, 4},
            {new int[] {-3, 0, -2, -1}, 2},
            {new int[] {0, 0, 0}, 0},
            {new int[] {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, -1}, 3628800},
            {negatives, 1},
            {ends, 4},
        };
        for (int n = 0; n < cases.length; n++) {
            int[] nums = (int[]) cases[n][0];
            Check.eq(new Solution().maxProduct(nums.clone()), cases[n][1], "case " + n + " (n=" + nums.length + ")");
        }
        Check.done();
    }
}
