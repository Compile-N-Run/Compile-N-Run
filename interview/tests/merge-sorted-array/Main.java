import java.util.*;

class Main {
    public static void main(String[] args) {
        List<int[][]> cases = new ArrayList<>(Arrays.asList(new int[][] {{2, 5, 9}, {4, 10}}, new int[][] {{1, 1}, {1}},
            new int[][] {{}, {-3, 6}}, new int[][] {{7}, {}}, new int[][] {{4, 5, 6}, {1, 2, 3}},
            new int[][] {{1, 2, 3}, {4, 5, 6}}, new int[][] {{-5, 0, 0}, {-5, 0}}));
        int[] big1 = new int[1000], big2 = new int[1000];
        for (int i = 0; i < 1000; i++) { big1[i] = 2 * i; big2[i] = 2 * i - 1; }
        cases.add(new int[][] {big1, big2});
        for (int c = 0; c < cases.size(); c++) {
            int[] a = cases.get(c)[0], b = cases.get(c)[1];
            int[] nums1 = Arrays.copyOf(a, a.length + b.length);
            int[] expected = Arrays.copyOf(a, a.length + b.length);
            System.arraycopy(b, 0, expected, a.length, b.length);
            Arrays.sort(expected);
            new Solution().merge(nums1, a.length, b.clone(), b.length);
            Check.eq(nums1, expected, "case " + c);
        }
        Check.done();
    }
}
