import java.util.*;

class Main {
    public static void main(String[] args) {
        Object[][] cases = {{new int[] {15, 18, 22, 3, 7, 11}, 7, 4}, {new int[] {15, 18, 22, 3, 7, 11}, 20, -1},
            {new int[] {30, 40, 50, 10, 20}, 40, 1}, {new int[] {9}, 9, 0}, {new int[] {9}, 4, -1}, {new int[] {2, 1}, 1, 1},
            {new int[] {1, 2, 3, 4, 5}, 5, 4}, {new int[] {5, 1, 3}, 5, 0}, {new int[] {5, 1, 3}, 3, 2}, {new int[] {-8, -5, -10}, -10, 2}};
        for (Object[] c : cases) {
            Check.eq(new Solution().search(((int[]) c[0]).clone(), (int) c[1]), c[2], Arrays.toString((int[]) c[0]) + " " + c[1]);
        }
        // Exhaustive: every rotation of small arrays of even numbers, every target (odd ones are missing).
        for (int n : new int[] {1, 2, 3, 7, 50}) {
            for (int r = 0; r < n; r++) {
                int[] nums = new int[n];
                for (int j = 0; j < n; j++) nums[j] = 2 * ((j + r) % n);
                for (int t = -1; t <= 2 * n; t++) {
                    int expected = (t >= 0 && t < 2 * n && t % 2 == 0) ? ((t / 2 - r) % n + n) % n : -1;
                    Check.eq(new Solution().search(nums, t), expected, "n=" + n + " r=" + r + " t=" + t);
                }
            }
        }
        int[] big = new int[5000];
        for (int i = 0; i < 5000; i++) big[i] = (i + 1234) % 5000; // 5000 values, rotated
        Check.eq(new Solution().search(big, 0), 3766, "big 0");
        Check.eq(new Solution().search(big, 4999), 3765, "big 4999");
        Check.eq(new Solution().search(big, 5000), -1, "big 5000");
        Check.done();
    }
}
