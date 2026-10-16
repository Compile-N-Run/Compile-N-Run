import java.util.*;

class Main {
    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {new int[] {2, 5, 1, 4, 3, 5}, 5},
            new Object[] {new int[] {1, 3, 4, 2, 2}, 2},
            new Object[] {new int[] {3, 1, 3, 4, 2}, 3},
            new Object[] {new int[] {4, 4, 4, 4, 4, 4}, 4},
            new Object[] {new int[] {1, 1}, 1},
            new Object[] {new int[] {2, 2, 1}, 2},
            new Object[] {new int[] {2, 5, 9, 6, 9, 3, 8, 9, 7, 1}, 9},
            new Object[] {new int[] {9, 8, 7, 6, 5, 4, 3, 2, 1, 9}, 9}));
        int[] big = new int[100001];
        big[0] = 777;
        for (int i = 1; i <= 100000; i++) big[i] = 100001 - i;
        cases.add(new Object[] {big, 777});
        int[] ones = new int[50001];
        Arrays.fill(ones, 1);
        cases.add(new Object[] {ones, 1});
        for (int n = 0; n < cases.size(); n++) {
            int[] nums = (int[]) cases.get(n)[0];
            int[] original = nums.clone();
            Check.eq(new Solution().findDuplicate(nums), cases.get(n)[1], "case " + n);
            Check.eq(nums, original, "case " + n + " must not modify the input");
        }
        Check.done();
    }
}
