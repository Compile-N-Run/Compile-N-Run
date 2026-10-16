import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] inc = new int[2500], pairs = new int[2000];
        for (int i = 0; i < inc.length; i++) inc[i] = i;
        for (int i = 0; i < pairs.length; i++) pairs[i] = i / 2;
        Object[][] cases = {{new int[] {4, 1, 6, 2, 7, 3, 8}, 4}, {new int[] {5, 5, 5}, 1}, {new int[] {9, 7, 4, 2}, 1},
            {new int[] {-3, 10, -1, 0, 2}, 4}, {new int[] {7}, 1}, {new int[] {1, 3, 2, 3, 4, 0}, 4}, {inc, 2500}, {pairs, 1000}};
        for (Object[] c : cases) {
            Check.eq(new Solution().lengthOfLIS(((int[]) c[0]).clone()), c[1], "n=" + ((int[]) c[0]).length);
        }
        Check.done();
    }
}
