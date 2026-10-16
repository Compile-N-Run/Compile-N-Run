import java.util.*;

class Main {
    public static void main(String[] args) {
        Object[][] cases = {{new int[] {3, 8, 11, 5}, 13, new int[] {1, 3}}, {new int[] {4, 6, 4}, 8, new int[] {0, 2}},
            {new int[] {-2, 7, 1}, -1, new int[] {0, 2}}, {new int[] {2, 7, 11, 15}, 9, new int[] {0, 1}},
            {new int[] {0, 4, 3, 0}, 0, new int[] {0, 3}}, {new int[] {1, 2}, 3, new int[] {0, 1}}};
        for (Object[] c : cases) {
            int[] got = new Solution().twoSum(((int[]) c[0]).clone(), (int) c[1]);
            Arrays.sort(got);
            Check.eq(got, c[2], Arrays.toString((int[]) c[0]));
        }
        Check.done();
    }
}
