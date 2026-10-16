import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] asc = new int[1000], ascNext = new int[1000], desc = new int[1000];
        for (int i = 0; i < 1000; i++) {
            asc[i] = i;
            ascNext[i] = i;
            desc[i] = 999 - i;
        }
        ascNext[998] = 999;
        ascNext[999] = 998;
        int[][][] cases = {{{1, 3, 2}, {2, 1, 3}}, {{5, 4, 3}, {3, 4, 5}}, {{2, 2, 7}, {2, 7, 2}},
            {{1, 5, 8, 4, 7, 6, 5, 3, 1}, {1, 5, 8, 5, 1, 3, 4, 6, 7}}, {{1}, {1}}, {{1, 1}, {1, 1}}, {{1, 2}, {2, 1}},
            {{3, 1, 2}, {3, 2, 1}}, {{1, 5, 1}, {5, 1, 1}}, {{2, 3, 1, 3, 3}, {2, 3, 3, 1, 3}}, {{0, -1, 4}, {0, 4, -1}},
            {asc, ascNext}, {desc, asc}};
        for (int n = 0; n < cases.length; n++) {
            int[] arr = cases[n][0].clone();
            new Solution().nextPermutation(arr);
            Check.eq(arr, cases[n][1], "case " + n);
        }
        Check.done();
    }
}
