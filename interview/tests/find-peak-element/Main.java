import java.util.*;

class Main {
    static boolean isPeak(int[] nums, int i) {
        int n = nums.length;
        return i >= 0 && i < n && (i == 0 || nums[i] > nums[i - 1]) && (i == n - 1 || nums[i] > nums[i + 1]);
    }

    public static void main(String[] args) {
        int min = Integer.MIN_VALUE, max = Integer.MAX_VALUE;
        int[] zigzag = new int[10001], mountain = new int[10000];
        for (int i = 0; i < zigzag.length; i++) zigzag[i] = i % 2;
        for (int i = 0; i < mountain.length; i++) mountain[i] = i < 7000 ? i : 14000 - i;
        int[][] cases = {{2, 5, 3}, {1, 3, 2, 6, 4}, {9, 7, 4}, {1, 2, 3, 4}, {7}, {min}, {min, min + 1}, {3, 1},
            {max, min, max}, zigzag, mountain};
        for (int n = 0; n < cases.length; n++) {
            int got = new Solution().findPeakElement(cases[n].clone());
            Check.eq(isPeak(cases[n], got), true, "case " + n + " returned " + got);
        }
        Check.done();
    }
}
