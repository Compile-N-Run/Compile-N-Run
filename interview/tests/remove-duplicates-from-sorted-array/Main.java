import java.util.*;

class Main {
    public static void main(String[] args) {
        List<Integer> bigList = new ArrayList<>();
        int[] bigExpected = new int[1000];
        for (int v = -500; v < 500; v++) { bigExpected[v + 500] = v; for (int c = 0; c <= ((v % 3) + 3) % 3; c++) bigList.add(v); }
        int[] big = bigList.stream().mapToInt(Integer::intValue).toArray();
        int[][][] cases = {{{2, 2, 5, 7, 7, 7}, {2, 5, 7}}, {{-4, -4, -4}, {-4}}, {{1, 3, 8}, {1, 3, 8}}, {{6}, {6}},
            {{0, 0, 1, 1, 1, 2, 2, 3, 3, 4}, {0, 1, 2, 3, 4}}, {{-100, 100}, {-100, 100}}, {big, bigExpected}};
        for (int[][] c : cases) {
            int[] arr = c[0].clone();
            int k = new Solution().removeDuplicates(arr);
            Check.eq(k, c[1].length, "k, size " + c[0].length);
            if (k == c[1].length) Check.eq(Arrays.copyOf(arr, k), c[1], "prefix, size " + c[0].length);
        }
        Check.done();
    }
}
