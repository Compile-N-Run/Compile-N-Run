import java.util.*;

class Main {
    public static void main(String[] args) {
        // Larger case: 100000 values alternating 10000, -9999; the best run stops at the last 10000.
        int[] big = new int[100000];
        for (int i = 0; i < big.length; i++) big[i] = i % 2 == 0 ? 10000 : -9999;
        Object[][] cases = {{new int[] {2, -5, 3, -1, 4, -6, 1}, 6}, {new int[] {-4, -2, -7}, -2}, {new int[] {1, 2, 3}, 6},
            {new int[] {7}, 7}, {new int[] {0}, 0}, {new int[] {-1, 0, -2}, 0}, {new int[] {5, -10, 5}, 5},
            {new int[] {-3, 4, -1, 2, 1, -5}, 6}, {new int[] {-10000}, -10000}, {big, 59999}};
        for (Object[] c : cases) {
            int got = new Solution().maxSubArray(((int[]) c[0]).clone());
            Check.eq(got, c[1], "size " + ((int[]) c[0]).length);
        }
        Check.done();
    }
}
