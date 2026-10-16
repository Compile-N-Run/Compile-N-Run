import java.util.*;

class Main {
    static List<Integer> asList(int[] values) { List<Integer> out = new ArrayList<>(); for (int v : values) out.add(v); return out; }

    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(Arrays.asList(new Object[][] {
            {new int[] {10, 20, 30, 40, 50, 60, 70}, 3, new int[] {30, 20, 10, 60, 50, 40, 70}},
            {new int[] {1, 2, 3, 4}, 4, new int[] {4, 3, 2, 1}}, {new int[] {5, 6, 7, 8, 9}, 2, new int[] {6, 5, 8, 7, 9}},
            {new int[] {1, 2, 3}, 1, new int[] {1, 2, 3}}, {new int[] {42}, 1, new int[] {42}},
            {new int[] {1, 2, 3, 4, 5, 6}, 3, new int[] {3, 2, 1, 6, 5, 4}}, {new int[] {0, 0, 1, 1, 2}, 2, new int[] {0, 0, 1, 1, 2}}}));
        // Larger cases: 5000 nodes in groups of 7 (2 left over) and one group of 5000.
        int[] big = new int[5000], expected7 = new int[5000], reversed = new int[5000];
        for (int i = 0; i < 5000; i++) { big[i] = i; reversed[i] = 4999 - i; }
        for (int i = 0; i < 5000; i++) {
            int start = i / 7 * 7;
            expected7[i] = start + 7 <= 5000 ? start + 6 - (i - start) : i;
        }
        cases.add(new Object[] {big, 7, expected7});
        cases.add(new Object[] {big, 5000, reversed});
        for (Object[] c : cases) {
            int[] values = (int[]) c[0];
            int k = (int) c[1];
            Check.eq(Check.values(new Solution().reverseKGroup(Check.list(values), k)), asList((int[]) c[2]), "size " + values.length + " k=" + k);
        }
        Check.done();
    }
}
