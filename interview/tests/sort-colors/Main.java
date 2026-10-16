import java.util.*;

class Main {
    public static void main(String[] args) {
        List<int[]> cases = new ArrayList<>(Arrays.asList(new int[] {2, 1, 0, 2, 0, 1}, new int[] {1, 2, 1}, new int[] {2, 2, 0},
            new int[] {1}, new int[] {2, 0}, new int[] {1, 0}, new int[] {0, 0, 0}, new int[] {2, 1, 0}));
        int[] big = new int[1000];
        for (int i = 0; i < 1000; i++) big[i] = (i * 7 + i / 3) % 3;
        cases.add(big);
        for (int n = 0; n < cases.size(); n++) {
            int[] got = cases.get(n).clone(), expected = cases.get(n).clone();
            Arrays.sort(expected);
            new Solution().sortColors(got);
            Check.eq(got, expected, "case " + n);
        }
        Check.done();
    }
}
