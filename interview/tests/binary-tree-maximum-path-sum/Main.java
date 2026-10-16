import java.util.*;

class Main {
    public static void main(String[] args) {
        Integer[] ones = new Integer[1023], negatives = new Integer[1023];
        for (int i = 0; i < 1023; i++) { ones[i] = 1; negatives[i] = -(i % 5 + 1); }
        Object[][] cases = {{new Integer[] {2, 1, 3}, 6}, {new Integer[] {-8, 4, 6, null, null, 5, 7}, 18}, {new Integer[] {-3}, -3},
            {new Integer[] {-2, -5, -1}, -1}, {new Integer[] {1, -2, 3}, 4},
            {new Integer[] {5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1}, 48},
            {new Integer[] {-10, 9, 20, null, null, 15, -7}, 35}, {ones, 19}, {negatives, -1}};
        int n = 0;
        for (Object[] c : cases) {
            Check.eq(new Solution().maxPathSum(Check.tree((Integer[]) c[0])), c[1], "case " + (++n));
        }
        Check.done();
    }
}
