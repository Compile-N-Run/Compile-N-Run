import java.util.*;

class Main {
    // Pairs 0,0,1,1,...,n-1,n-1 with the lone value `single` kept once, in sorted order.
    static int[] withSingle(int n, int single) {
        int[] values = new int[2 * n - 1];
        int i = 0;
        for (int v = 0; v < n; v++) {
            values[i++] = v;
            if (v != single) values[i++] = v;
        }
        return values;
    }

    public static void main(String[] args) {
        Object[][] cases = {
            {new int[] {1, 1, 2, 3, 3, 4, 4}, 2},
            {new int[] {0, 0, 5, 5, 9}, 9},
            {new int[] {2, 3, 3}, 2},
            {new int[] {-4, -4, -1, -1, 0, 6, 6}, 0},
            {new int[] {7}, 7},
            {new int[] {1, 1, 2, 2, 3}, 3},
            {new int[] {1, 2, 2, 3, 3}, 1},
            {new int[] {1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6}, 3},
            {new int[] {-7, -7, -3, -3, -2, -1, -1}, -2},
            {withSingle(1000, 0), 0},     // the lone value first among 1999 elements
            {withSingle(1000, 999), 999}, // the lone value last
            {withSingle(1000, 617), 617}, // the lone value somewhere in the middle
        };
        for (Object[] c : cases) {
            int[] nums = (int[]) c[0];
            int got = new Solution().singleNonDuplicate(nums.clone());
            String head = Arrays.toString(Arrays.copyOf(nums, Math.min(8, nums.length)));
            Check.eq(got, c[1], "nums=" + head + (nums.length > 8 ? "..." : "") + " (" + nums.length + " elements)");
        }
        Check.done();
    }
}
