import java.util.*;

class Main {
    static List<List<Integer>> normalise(List<List<Integer>> lists) {
        List<List<Integer>> out = new ArrayList<>();
        for (List<Integer> s : lists) {
            List<Integer> copy = new ArrayList<>(s);
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
            List<Integer> s = new ArrayList<>();
            for (int v : row) s.add(v);
            out.add(s);
        }
        return out;
    }

    public static void main(String[] args) {
        int[][] three = {{}, {1}, {1, 2}, {1, 2, 3}, {1, 3}, {2}, {2, 3}, {3}};
        Object[][] exact = {
            {new int[] {1, 2, 3}, three},
            {new int[] {3, 1, 2}, three},
            {new int[] {}, new int[][] {{}}},
            {new int[] {0}, new int[][] {{}, {0}}},
            {new int[] {-1, 4}, new int[][] {{}, {-1}, {-1, 4}, {4}}},
            {new int[] {5, -2, 7, 0}, new int[][] {{}, {-2}, {-2, 0}, {-2, 0, 5}, {-2, 0, 5, 7}, {-2, 0, 7}, {-2, 5}, {-2, 5, 7}, {-2, 7},
                {0}, {0, 5}, {0, 5, 7}, {0, 7}, {5}, {5, 7}, {7}}},
        };
        for (Object[] c : exact) {
            int[] nums = ((int[]) c[0]).clone();
            Check.eq(normalise(new Solution().subsets(nums)), lists((int[][]) c[1]), Arrays.toString(nums));
        }
        // Larger inputs: 2^n distinct subsets, each made of distinct elements of nums.
        int[] ten = new int[10], twelve = new int[12];
        for (int i = 0; i < 10; i++) ten[i] = i + 1;
        for (int i = 0; i < 12; i++) twelve[i] = i - 6;
        for (int[] nums : new int[][] {ten, twelve}) {
            List<List<Integer>> got = new Solution().subsets(nums.clone());
            int want = 1 << nums.length;
            Check.eq(got.size(), want, "count for " + Arrays.toString(nums));
            Check.eq(new HashSet<>(normalise(got)).size(), want, "distinct for " + Arrays.toString(nums));
            Set<Integer> allowed = new HashSet<>();
            for (int v : nums) allowed.add(v);
            for (List<Integer> s : got) {
                boolean valid = new HashSet<>(s).size() == s.size() && allowed.containsAll(s);
                Check.eq(valid, true, Arrays.toString(nums) + ": invalid subset " + s);
            }
        }
        Check.done();
    }
}
