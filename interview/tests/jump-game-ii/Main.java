import java.util.*;

class Main {
    static int[] filled(int n, int value) {
        int[] out = new int[n];
        Arrays.fill(out, value);
        return out;
    }

    public static void main(String[] args) {
        int[] oneThenOnes = filled(10000, 1);
        oneThenOnes[0] = 10000;
        Object[][] cases = {
            {new int[] {3, 1, 1, 4, 1, 1, 1}, 2},
            {new int[] {1, 1, 1, 1}, 3},
            {new int[] {4, 1, 1, 1, 1}, 1},
            {new int[] {1, 3, 0, 0, 2, 0, 1}, 3},
            {new int[] {5}, 0},
            {new int[] {0}, 0},
            {new int[] {2, 1}, 1},
            {new int[] {1, 2, 3}, 2},
            {new int[] {3, 0, 0, 1, 0}, 2},
            {filled(10000, 1), 9999},
            {oneThenOnes, 1},
            {filled(10001, 2), 5000},
        };
        for (int n = 0; n < cases.length; n++) {
            int[] nums = (int[]) cases[n][0];
            Check.eq(new Solution().jump(nums.clone()), cases[n][1], "case " + n + " (n=" + nums.length + ")");
        }
        Check.done();
    }
}
