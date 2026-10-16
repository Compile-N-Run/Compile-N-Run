import java.util.*;

class Main {
    static List<List<Integer>> lists(int[][] rows) {
        List<List<Integer>> out = new ArrayList<>();
        for (int[] r : rows) { List<Integer> l = new ArrayList<>(); for (int v : r) l.add(v); out.add(l); }
        return out;
    }

    static void sortLists(List<List<Integer>> lists) {
        lists.sort((a, b) -> { for (int i = 0; i < a.size(); i++) if (!a.get(i).equals(b.get(i))) return Integer.compare(a.get(i), b.get(i)); return 0; });
    }

    public static void main(String[] args) {
        Object[][] exact = {{new int[] {4, 9}, new int[][] {{4, 9}, {9, 4}}},
            {new int[] {1, 2, 3}, new int[][] {{1, 2, 3}, {1, 3, 2}, {2, 1, 3}, {2, 3, 1}, {3, 1, 2}, {3, 2, 1}}},
            {new int[] {-5}, new int[][] {{-5}}}, {new int[] {0, -10}, new int[][] {{-10, 0}, {0, -10}}}};
        for (Object[] c : exact) {
            List<List<Integer>> got = new Solution().permute(((int[]) c[0]).clone());
            sortLists(got);
            Check.eq(got, lists((int[][]) c[1]), Arrays.toString((int[]) c[0]));
        }
        Object[][] big = {{new int[] {0, -1, 7, 2}, 24}, {new int[] {6, -2, 3, 10, -8, 1}, 720}};
        for (Object[] c : big) {
            int[] nums = (int[]) c[0];
            int count = (int) c[1];
            List<List<Integer>> got = new Solution().permute(nums.clone());
            List<Integer> want = new ArrayList<>(lists(new int[][] {nums}).get(0));
            Collections.sort(want);
            boolean all = true;
            for (List<Integer> p : got) { List<Integer> q = new ArrayList<>(p); Collections.sort(q); all &= q.equals(want); }
            Check.eq(got.size(), count, "count " + Arrays.toString(nums));
            Check.eq(new HashSet<>(got).size(), count, "distinct " + Arrays.toString(nums));
            Check.eq(all, true, "each is a permutation " + Arrays.toString(nums));
        }
        Check.done();
    }
}
