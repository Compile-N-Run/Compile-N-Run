import java.util.*;

class Main {
    static int[][] normalise(List<List<Integer>> quads) { // any order is valid: sort inside each quadruplet and sort the list
        int[][] out = new int[quads.size()][];
        for (int i = 0; i < out.length; i++) {
            out[i] = quads.get(i).stream().mapToInt(Integer::intValue).sorted().toArray();
        }
        Arrays.sort(out, Arrays::compare);
        return out;
    }

    public static void main(String[] args) {
        int[] mod10 = new int[200];
        for (int i = 0; i < 200; i++) mod10[i] = i % 10;
        List<int[]> mod10Want = new ArrayList<>();
        for (int a = 0; a < 10; a++) for (int b = a; b < 10; b++) for (int c = b; c < 10; c++) for (int d = c; d < 10; d++) {
            if (a + b + c + d == 18) mod10Want.add(new int[] {a, b, c, d});
        }
        Object[][] cases = {
            {new int[] {1, 0, -1, 0, -2, 2}, 0, new int[][] {{-2, -1, 1, 2}, {-2, 0, 0, 2}, {-1, 0, 0, 1}}},
            {new int[] {2, 2, 2, 2, 2}, 8, new int[][] {{2, 2, 2, 2}}},
            {new int[] {-3, -1, 0, 2, 4, 5}, 2, new int[][] {{-3, -1, 2, 4}}},
            {new int[] {1, 2, 3}, 6, new int[][] {}},
            {new int[] {}, 0, new int[][] {}},
            {new int[] {0, 0, 0, 0}, 0, new int[][] {{0, 0, 0, 0}}},
            {new int[] {0, 0, 0, 0}, 1, new int[][] {}},
            {new int[] {-5, -4, -3, -2, -1}, -10, new int[][] {{-4, -3, -2, -1}}},
            {new int[] {1, -2, -5, -4, -3, 3, 3, 5}, -11, new int[][] {{-5, -4, -3, 1}}},
            {new int[] {1000000000, 1000000000, 1000000000, 1000000000}, -294967296, new int[][] {}}, // a 32-bit sum wraps to the target
            {new int[] {-1000000000, -1000000000, 1000000000, 1000000000}, 0, new int[][] {{-1000000000, -1000000000, 1000000000, 1000000000}}},
            {mod10, 18, mod10Want.toArray(new int[0][])},
        };
        for (int n = 0; n < cases.length; n++) {
            int[] nums = ((int[]) cases[n][0]).clone();
            int target = (int) cases[n][1];
            Check.eq(normalise(new Solution().fourSum(nums, target)), cases[n][2], "case " + n + " (length " + nums.length + ") target " + target);
        }

        int[] distinct = new int[100]; // 100 distinct values: 26536 quadruplets sum to 0
        for (int v = -50; v < 50; v++) distinct[v + 50] = v;
        List<List<Integer>> got = new Solution().fourSum(distinct, 0);
        Check.eq(got.size(), 26536, "range(-50, 50) target 0: number of quadruplets");
        Set<String> seen = new HashSet<>();
        boolean valid = true;
        for (int[] q : normalise(got)) {
            valid = valid && seen.add(Arrays.toString(q)) && q[0] + q[1] + q[2] + q[3] == 0;
        }
        Check.eq(valid, true, "range(-50, 50) target 0: all distinct and each sums to 0");
        Check.done();
    }
}
