import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] evens = new int[100], odds = new int[100], all = new int[200];
        for (int i = 0; i < 100; i++) {
            evens[i] = -100 + 2 * i;
            odds[i] = -99 + 2 * i;
        }
        for (int i = 0; i < 200; i++) all[i] = -100 + i;
        int[][][] cases = {{{2, 5, 9}, {1, 6}, {1, 2, 5, 6, 9}}, {{3, 3, 4}, {3}, {3, 3, 3, 4}}, {{}, {7, 8}, {7, 8}},
            {{}, {}, {}}, {{1, 2, 3}, {}, {1, 2, 3}}, {{-5, 0}, {-10, -5, 20}, {-10, -5, -5, 0, 20}}, {{1}, {2}, {1, 2}},
            {{10, 11, 12}, {1, 2, 3}, {1, 2, 3, 10, 11, 12}}, {evens, odds, all}};
        for (int[][] c : cases) {
            List<Integer> got = Check.values(new Solution().mergeTwoLists(Check.list(c[0]), Check.list(c[1])));
            Check.eq(got, Check.values(Check.list(c[2])), Arrays.toString(c[0]) + " + " + Arrays.toString(c[1]));
        }
        Check.done();
    }
}
