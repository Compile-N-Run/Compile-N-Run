import java.util.*;

class Main {
    public static void main(String[] args) {
        List<int[][]> cases = new ArrayList<>(Arrays.asList(
            new int[][] {{-4, -1, 0, 3, 10}, {0, 1, 9, 16, 100}},
            new int[][] {{-7, -3, 2, 3, 11}, {4, 9, 9, 49, 121}},
            new int[][] {{1, 2, 3}, {1, 4, 9}},
            new int[][] {{-3, -2, -1}, {1, 4, 9}},
            new int[][] {{0}, {0}},
            new int[][] {{-5}, {25}},
            new int[][] {{0, 0, 0}, {0, 0, 0}},
            new int[][] {{-2, -2, 2, 2}, {4, 4, 4, 4}},
            new int[][] {{-10000, 10000}, {100000000, 100000000}}));
        int[] big = new int[1000], bigWant = new int[1000];
        for (int i = 0; i < 1000; i++) {
            big[i] = i - 500;
            bigWant[i] = big[i] * big[i];
        }
        Arrays.sort(bigWant);
        cases.add(new int[][] {big, bigWant});
        for (int n = 0; n < cases.size(); n++) {
            int[] input = cases.get(n)[0];
            Check.eq(new Solution().sortedSquares(input.clone()), cases.get(n)[1], "case " + n + " first " + input[0]);
        }
        Check.done();
    }
}
