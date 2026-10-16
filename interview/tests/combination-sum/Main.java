import java.util.*;

class Main {
    static List<List<Integer>> normalise(List<List<Integer>> combos) {
        List<List<Integer>> out = new ArrayList<>();
        for (List<Integer> c : combos) {
            List<Integer> copy = new ArrayList<>(c);
            Collections.sort(copy);
            out.add(copy);
        }
        out.sort((a, b) -> {
            for (int i = 0; i < Math.min(a.size(), b.size()); i++) {
                if (!a.get(i).equals(b.get(i))) return Integer.compare(a.get(i), b.get(i));
            }
            return Integer.compare(a.size(), b.size());
        });
        return out;
    }

    static List<List<Integer>> lists(int[][] rows) {
        List<List<Integer>> out = new ArrayList<>();
        for (int[] row : rows) {
            List<Integer> list = new ArrayList<>();
            for (int x : row) list.add(x);
            out.add(list);
        }
        return out;
    }

    public static void main(String[] args) {
        Object[][] cases = {{new int[] {3, 4, 5}, 8, new int[][] {{3, 5}, {4, 4}}},
            {new int[] {6, 3, 9}, 9, new int[][] {{3, 3, 3}, {3, 6}, {9}}}, {new int[] {2}, 6, new int[][] {{2, 2, 2}}},
            {new int[] {5}, 3, new int[][] {}},
            {new int[] {2, 3, 5}, 12, new int[][] {{2, 2, 2, 2, 2, 2}, {2, 2, 2, 3, 3}, {2, 2, 3, 5}, {2, 5, 5}, {3, 3, 3, 3}}},
            {new int[] {7}, 7, new int[][] {{7}}}, {new int[] {40, 2}, 1, new int[][] {}}};
        for (Object[] c : cases) {
            List<List<Integer>> got = normalise(new Solution().combinationSum(((int[]) c[0]).clone(), (int) c[1]));
            Check.eq(got, lists((int[][]) c[2]), Arrays.toString((int[]) c[0]) + " " + c[1]);
        }
        // Larger case: 45 distinct combinations, each summing to 30 and using only the candidates.
        List<List<Integer>> big = normalise(new Solution().combinationSum(new int[] {7, 3, 2, 5}, 30));
        Check.eq(big.size(), 45, "count for [7, 3, 2, 5] 30");
        boolean valid = true;
        for (List<Integer> combo : big) {
            int sum = 0;
            for (int x : combo) { sum += x; if (x != 2 && x != 3 && x != 5 && x != 7) valid = false; }
            if (sum != 30) valid = false;
        }
        Check.eq(valid, true, "valid combinations");
        Check.eq(new HashSet<>(big).size(), 45, "no duplicates");
        Check.done();
    }
}
