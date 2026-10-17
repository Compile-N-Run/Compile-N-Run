import java.util.*;

class Main {
    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {new int[] {4, 2, 1, 3}, new int[][] {{1, 2}, {2, 3}, {3, 4}}},
            new Object[] {new int[] {1, 3, 6, 10, 15}, new int[][] {{1, 3}}},
            new Object[] {new int[] {3, 8, -10, 23, 19, -4, -14, 27}, new int[][] {{-14, -10}, {19, 23}, {23, 27}}},
            new Object[] {new int[] {10, 1, 100, 7}, new int[][] {{7, 10}}},
            new Object[] {new int[] {1, 2}, new int[][] {{1, 2}}},
            new Object[] {new int[] {-5, 5}, new int[][] {{-5, 5}}},
            new Object[] {new int[] {1000000, -1000000}, new int[][] {{-1000000, 1000000}}},
            new Object[] {new int[] {-3, -1, -2}, new int[][] {{-3, -2}, {-2, -1}}},
            new Object[] {new int[] {40, 11, 26, 27, 10}, new int[][] {{10, 11}, {26, 27}}}));
        int[] evens = new int[1000], squares = new int[1000]; // evens: every neighbouring gap is 2; squares: only 0 and 1 are 1 apart
        int[][] evensWant = new int[999][];
        for (int i = 0; i < 1000; i++) {
            evens[999 - i] = 2 * i;
            squares[999 - i] = i * i;
        }
        for (int i = 0; i < 999; i++) evensWant[i] = new int[] {2 * i, 2 * i + 2};
        cases.add(new Object[] {evens, evensWant});
        cases.add(new Object[] {squares, new int[][] {{0, 1}}});
        for (int n = 0; n < cases.size(); n++) {
            int[] arr = ((int[]) cases.get(n)[0]).clone();
            List<List<Integer>> got = new Solution().minimumAbsDifference(arr);
            int[][] flat = new int[got.size()][];
            for (int i = 0; i < got.size(); i++) flat[i] = new int[] {got.get(i).get(0), got.get(i).get(1)};
            Check.eq(flat, cases.get(n)[1], "case " + n + " (length " + arr.length + ")");
        }
        Check.done();
    }
}
