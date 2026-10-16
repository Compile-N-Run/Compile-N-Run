import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] big = new int[100], flat = new int[100];
        for (int i = 0; i < 100; i++) {
            big[i] = (i * 37) % 401;
            flat[i] = 400;
        }
        Object[][] cases = {{new int[] {3, 10, 3, 1, 8}, 18}, {new int[] {6, 1, 1, 6}, 12}, {new int[] {4, 1, 2, 7, 5, 3, 1}, 14},
            {new int[] {9}, 9}, {new int[] {0, 0, 0}, 0}, {new int[] {2, 1}, 2}, {new int[] {1, 2}, 2},
            {new int[] {5, 0, 0, 5, 0, 0, 5}, 15}, {flat, 20000}, {big, 10569}};
        for (Object[] c : cases) {
            int[] nums = (int[]) c[0];
            Check.eq(new Solution().rob(nums.clone()), c[1], Arrays.toString(nums));
        }
        Check.done();
    }
}
