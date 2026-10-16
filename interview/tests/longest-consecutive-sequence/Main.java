import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] big = new int[100002];
        int k = 0;
        for (int i = 99999; i >= 0; i -= 2) big[k++] = i;
        for (int i = 0; i < 100000; i += 2) big[k++] = i;
        big[k++] = 200000;
        big[k++] = -5;
        Object[][] cases = {{new int[] {10, 4, 20, 1, 3, 2}, 4}, {new int[] {5, -1, 0, 7, 1, 6, 1}, 3}, {new int[] {42}, 1},
            {new int[] {}, 0}, {new int[] {7, 7, 7}, 1}, {new int[] {1, 3, 5, 7}, 1},
            {new int[] {-1000000000, 1000000000, 0, -999999999}, 2}, {new int[] {9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6}, 7},
            {big, 100000}};
        for (Object[] c : cases) {
            int[] nums = (int[]) c[0];
            Check.eq(new Solution().longestConsecutive(nums.clone()), c[1], "size " + nums.length);
        }
        Check.done();
    }
}
