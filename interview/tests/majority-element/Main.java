import java.util.*;

class Main {
    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(Arrays.asList(new Object[][] {{new int[] {2, 7, 2}, 2}, {new int[] {5}, 5},
            {new int[] {-1, -1, 4, 4, -1}, -1}, {new int[] {3, 3, 8, 8, 3, 8, 8}, 8},
            {new int[] {1000000000, -1000000000, 1000000000}, 1000000000}, {new int[] {0, 0, 0, 0}, 0},
            {new int[] {1, 2, 1, 3, 1, 4, 1}, 1}}));
        // Larger case: 25001 copies of -7 interleaved with 24999 distinct other values.
        int[] big = new int[50001];
        for (int i = 0; i < 25000; i++) { big[2 * i] = -7; big[2 * i + 1] = i; }
        big[49999] = -7;
        big[50000] = 99;
        cases.add(new Object[] {big, -7});
        for (Object[] c : cases) {
            int[] nums = (int[]) c[0];
            Check.eq(new Solution().majorityElement(nums.clone()), c[1], "size " + nums.length);
        }
        Check.done();
    }
}
