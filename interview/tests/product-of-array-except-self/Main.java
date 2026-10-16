import java.util.*;

class Main {
    static int[] brute(int[] nums) {
        int[] out = new int[nums.length];
        for (int i = 0; i < nums.length; i++) {
            int p = 1;
            for (int j = 0; j < nums.length; j++) if (j != i) p *= nums[j];
            out[i] = p;
        }
        return out;
    }

    public static void main(String[] args) {
        int[] big = new int[1000];
        for (int i = 0; i < 1000; i++) big[i] = i % 100 == 0 ? 2 : (i % 7 == 0 ? -1 : 1);
        int[][][] cases = {{{2, 3, 4, 5}, {60, 40, 30, 24}}, {{3, 0, 4}, {0, 12, 0}}, {{0, 5, 0}, {0, 0, 0}},
            {{-1, 2, -3}, {-6, 3, -2}}, {{7, 9}, {9, 7}}, {{0, 0}, {0, 0}}, {{1, 1, 1, 1}, {1, 1, 1, 1}}, {big, brute(big)}};
        for (int[][] c : cases) {
            Check.eq(new Solution().productExceptSelf(c[0].clone()), c[1], Arrays.toString(Arrays.copyOf(c[0], Math.min(10, c[0].length))));
        }
        Check.done();
    }
}
