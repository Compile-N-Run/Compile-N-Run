import java.util.*;

class Main {
    public static void main(String[] args) {
        List<int[][][]> cases = new ArrayList<>(Arrays.asList(
            new int[][][] {{{1, 2, 3}, {4, 0, 6}, {7, 8, 9}}, {{1, 0, 3}, {0, 0, 0}, {7, 0, 9}}},
            new int[][][] {{{0, 5}, {7, 8}}, {{0, 0}, {0, 8}}},
            new int[][][] {{{1, 1, 1}, {0, 1, 1}}, {{0, 1, 1}, {0, 0, 0}}},
            new int[][][] {{{3, 4}, {5, 6}}, {{3, 4}, {5, 6}}},
            new int[][][] {{{0, 1, 2, 0}, {3, 4, 5, 2}, {1, 3, 1, 5}}, {{0, 0, 0, 0}, {0, 4, 5, 0}, {0, 3, 1, 0}}},
            new int[][][] {{{1}}, {{1}}},
            new int[][][] {{{0}}, {{0}}},
            new int[][][] {{{1, 0, 3}}, {{0, 0, 0}}},
            new int[][][] {{{1}, {0}, {3}}, {{0}, {0}, {0}}},
            new int[][][] {{{1, 0}, {1, 1}, {1, 1}}, {{0, 0}, {1, 0}, {1, 0}}},
            new int[][][] {{{-1, 5}, {0, -7}}, {{0, 5}, {0, 0}}},
            new int[][][] {{{1, 2, 3}, {4, 5, 6}, {7, 8, 0}}, {{1, 2, 0}, {4, 5, 0}, {0, 0, 0}}}));
        // 200 x 200 with zeros on the diagonal at every 50th row: rows and columns 0, 50, 100, 150 are cleared.
        int[][] big = new int[200][200], bigWant = new int[200][200];
        for (int r = 0; r < 200; r++) {
            for (int c = 0; c < 200; c++) {
                big[r][c] = r == c && r % 50 == 0 ? 0 : 1;
                bigWant[r][c] = r % 50 == 0 || c % 50 == 0 ? 0 : 1;
            }
        }
        cases.add(new int[][][] {big, bigWant});
        for (int n = 0; n < cases.size(); n++) {
            int[][] work = new int[cases.get(n)[0].length][];
            for (int i = 0; i < work.length; i++) work[i] = cases.get(n)[0][i].clone();
            new Solution().setZeroes(work);
            Check.eq(work, cases.get(n)[1], "case " + n + ": " + Arrays.deepToString(work));
        }
        Check.done();
    }
}
