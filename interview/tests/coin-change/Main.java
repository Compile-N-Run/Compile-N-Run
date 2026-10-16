import java.util.*;

class Main {
    public static void main(String[] args) {
        Object[][] cases = {{new int[] {2, 5, 10}, 27, 4}, {new int[] {1, 3, 4}, 6, 2}, {new int[] {3, 7}, 5, -1}, {new int[] {4}, 0, 0},
            {new int[] {1}, 1, 1}, {new int[] {2}, 3, -1}, {new int[] {2147483647}, 2, -1}, {new int[] {3, 7, 405, 436}, 8839, 25},
            {new int[] {37, 233, 91, 512}, 9999, 28}, {new int[] {2, 7}, 10000, 1430}};
        for (Object[] c : cases) {
            Check.eq(new Solution().coinChange(((int[]) c[0]).clone(), (int) c[1]), c[2], Arrays.toString((int[]) c[0]) + " " + c[1]);
        }
        Check.done();
    }
}
