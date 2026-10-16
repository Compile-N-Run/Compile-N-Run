import java.util.*;

class Main {
    public static void main(String[] args) {
        List<int[][][]> cases = new ArrayList<>(Arrays.asList(
            new int[][][] {{{6, 8}, {1, 4}, {3, 5}}, {{1, 5}, {6, 8}}},
            new int[][][] {{{2, 4}, {4, 7}}, {{2, 7}}},
            new int[][][] {{{1, 10}, {2, 3}, {4, 5}}, {{1, 10}}},
            new int[][][] {{{5, 5}}, {{5, 5}}},
            new int[][][] {{{1, 2}, {3, 4}}, {{1, 2}, {3, 4}}},
            new int[][][] {{{0, 0}, {0, 0}}, {{0, 0}}},
            new int[][][] {{{4, 9}, {1, 3}, {2, 4}}, {{1, 9}}}));
        int[][] disjoint = new int[1000][], disjointWant = new int[1000][], chain = new int[1000][];
        for (int i = 0; i < 1000; i++) {
            disjoint[999 - i] = new int[] {2 * i, 2 * i + 1};
            disjointWant[i] = new int[] {2 * i, 2 * i + 1};
            chain[999 - i] = new int[] {i, i + 1};
        }
        cases.add(new int[][][] {disjoint, disjointWant});
        cases.add(new int[][][] {chain, {{0, 1000}}});
        for (int n = 0; n < cases.size(); n++) {
            int[][] input = cases.get(n)[0], copy = new int[input.length][];
            for (int i = 0; i < input.length; i++) copy[i] = input[i].clone();
            int[][] got = new Solution().merge(copy);
            Arrays.sort(got, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
            Check.eq(got, cases.get(n)[1], "case " + n + ": " + Arrays.deepToString(got));
        }
        Check.done();
    }
}
