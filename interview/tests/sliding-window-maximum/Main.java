import java.util.*;

class Main {
    static int[] brute(int[] nums, int k) {
        int[] out = new int[nums.length - k + 1];
        for (int i = 0; i < out.length; i++) {
            int m = nums[i];
            for (int j = i; j < i + k; j++) m = Math.max(m, nums[j]);
            out[i] = m;
        }
        return out;
    }

    static int[] generate(int n, long seed) {
        int[] out = new int[n];
        long x = seed;
        for (int i = 0; i < n; i++) { x = x * 48271 % 2147483647L; out[i] = (int) (x % 2001) - 1000; }
        return out;
    }

    public static void main(String[] args) {
        int[] big = generate(5000, 7);
        Object[][] cases = {{new int[] {2, 5, 1, 3, 4, 0}, 3, new int[] {5, 5, 4, 4}}, {new int[] {6, 4, 2}, 1, new int[] {6, 4, 2}},
            {new int[] {-3, -1, -7, -2}, 4, new int[] {-1}}, {new int[] {1, 3, 3, 2}, 2, new int[] {3, 3, 3}},
            {new int[] {1, 3, -1, -3, 5, 3, 6, 7}, 3, new int[] {3, 3, 5, 5, 6, 7}}, {new int[] {9, 8, 7, 6, 5}, 2, new int[] {9, 8, 7, 6}},
            {new int[] {4}, 1, new int[] {4}}, {new int[] {7, 7, 7, 7}, 3, new int[] {7, 7}}, {big, 137, brute(big, 137)}};
        for (Object[] c : cases) {
            int[] nums = (int[]) c[0];
            Check.eq(new Solution().maxSlidingWindow(nums.clone(), (int) c[1]), c[2], "n " + nums.length + " k " + c[1]);
        }
        Check.done();
    }
}
