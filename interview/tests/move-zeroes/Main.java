import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] big = new int[10000];
        List<Integer> nonZero = new ArrayList<>();
        for (int i = 0; i < big.length; i++) {
            big[i] = i % 3 == 0 ? 0 : i;
            if (big[i] != 0) nonZero.add(big[i]);
        }
        int[] bigExpected = new int[big.length];
        for (int i = 0; i < nonZero.size(); i++) bigExpected[i] = nonZero.get(i);
        int[][][] cases = {{{4, 0, 5, 0, 0, 9}, {4, 5, 9, 0, 0, 0}}, {{0, 0, 7}, {7, 0, 0}}, {{-3, 2}, {-3, 2}}, {{0}, {0}},
            {{5}, {5}}, {{0, 0, 0}, {0, 0, 0}}, {{0, 1, 0, 3, 12}, {1, 3, 12, 0, 0}}, {{2, 0, 2, 0, -1}, {2, 2, -1, 0, 0}},
            {big, bigExpected}};
        for (int[][] c : cases) {
            int[] arr = c[0].clone();
            new Solution().moveZeroes(arr);
            Check.eq(arr, c[1], "size " + c[0].length);
        }
        Check.done();
    }
}
