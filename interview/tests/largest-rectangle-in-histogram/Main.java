import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] inc = new int[1000], flat = new int[100000];
        for (int i = 0; i < inc.length; i++) inc[i] = i + 1;
        Arrays.fill(flat, 10000);
        Object[][] cases = {{new int[] {2, 1, 4, 5, 1, 3}, 8}, {new int[] {3, 3, 3}, 9}, {new int[] {1, 2, 3, 4, 5}, 9},
            {new int[] {6, 0, 6}, 6}, {new int[] {7}, 7}, {new int[] {0, 0}, 0}, {new int[] {5, 4, 1, 2}, 8},
            {new int[] {2, 4, 2, 4, 2}, 10}, {inc, 250500}, {flat, 1000000000}};
        for (Object[] c : cases) {
            Check.eq(new Solution().largestRectangleArea(((int[]) c[0]).clone()), c[1], "n=" + ((int[]) c[0]).length);
        }
        Check.done();
    }
}
