import java.util.*;

class Main {
    public static void main(String[] args) {
        // Larger case: 100000 lines rising to 10000 and then staying flat; best pair is index 10000 with the last line.
        int[] big = new int[100000];
        for (int i = 0; i < big.length; i++) big[i] = Math.min(i, 10000);
        Object[][] cases = {{new int[] {2, 7, 4, 1, 6, 3}, 18}, {new int[] {5, 5}, 5}, {new int[] {1, 8, 1, 1, 8, 1}, 24},
            {new int[] {0, 0}, 0}, {new int[] {3, 1}, 1}, {new int[] {1, 2, 3, 4, 5}, 6}, {new int[] {4, 3, 2, 1, 4}, 16},
            {new int[] {10000, 10000}, 10000}, {big, 10000 * 89999}};
        for (Object[] c : cases) {
            int got = new Solution().maxArea(((int[]) c[0]).clone());
            Check.eq(got, c[1], "size " + ((int[]) c[0]).length);
        }
        Check.done();
    }
}
