import java.util.*;

class Main {
    static List<List<Integer>> normalise(List<List<Integer>> ts) {
        List<List<Integer>> out = new ArrayList<>();
        for (List<Integer> t : ts) {
            List<Integer> c = new ArrayList<>(t);
            Collections.sort(c);
            out.add(c);
        }
        out.sort((x, y) -> {
            for (int k = 0; k < 3; k++) {
                int d = Integer.compare(x.get(k), y.get(k));
                if (d != 0) return d;
            }
            return 0;
        });
        return out;
    }

    static List<List<Integer>> of(int[]... ts) {
        List<List<Integer>> out = new ArrayList<>();
        for (int[] t : ts) out.add(Arrays.asList(t[0], t[1], t[2]));
        return out;
    }

    public static void main(String[] args) {
        // Larger case: values -6..6, each at least 15 times, so every value triple summing to 0 is present.
        int[] big = new int[200];
        for (int i = 0; i < 200; i++) big[i] = (i * 7) % 13 - 6;
        List<List<Integer>> bigExpected = new ArrayList<>();
        for (int a = -6; a <= 6; a++)
            for (int b = a; b <= 6; b++)
                if (b <= -a - b && -a - b <= 6) bigExpected.add(Arrays.asList(a, b, -a - b));
        Object[][] cases = {{new int[] {-4, 1, 3, 2, -1, -2}, of(new int[] {-4, 1, 3}, new int[] {-2, -1, 3})},
            {new int[] {-2, 1, 1, -2, 4, 0}, of(new int[] {-2, -2, 4}, new int[] {-2, 1, 1})},
            {new int[] {0, 0, 0, 0}, of(new int[] {0, 0, 0})}, {new int[] {2, 5, -1}, of()},
            {new int[] {-2, 0, 0, 2, 2}, of(new int[] {-2, 0, 2})},
            {new int[] {-1, 0, 1, 2, -1, -4}, of(new int[] {-1, -1, 2}, new int[] {-1, 0, 1})},
            {new int[] {1, 2, -2, -1}, of()}, {big, bigExpected}};
        for (Object[] c : cases) {
            @SuppressWarnings("unchecked")
            List<List<Integer>> expected = (List<List<Integer>>) c[1];
            List<List<Integer>> got = new Solution().threeSum(((int[]) c[0]).clone());
            Check.eq(normalise(got), normalise(expected), "size " + ((int[]) c[0]).length);
        }
        Check.done();
    }
}
