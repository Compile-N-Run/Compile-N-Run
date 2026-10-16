import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] big = new int[20000];
        big[0] = big[19999] = 100000;
        Object[][] cases = {{new int[] {3, 0, 2, 0, 4}, 7}, {new int[] {1, 2, 3, 4}, 0}, {new int[] {5, 1, 1, 5, 2, 4}, 10},
            {new int[] {6}, 0}, {new int[] {2, 0, 2}, 2}, {new int[] {0, 0, 0}, 0}, {new int[] {5, 4, 3, 2, 1}, 0},
            {new int[] {2, 1, 3, 1, 2}, 2}, {big, 100000 * 19998}};
        for (Object[] c : cases) {
            int got = new Solution().trap(((int[]) c[0]).clone());
            Check.eq(got, c[1], "size " + ((int[]) c[0]).length);
        }
        Check.done();
    }
}
