import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] big = new int[5000];
        for (int i = 0; i < 5000; i++) big[i] = i - 2500;
        int[][] cases = {{1, 2, 3, 4}, {8, 5}, {7}, {}, {3, 3, 1}, {-5, 0, 5, -5}, big};
        for (int[] values : cases) {
            List<Integer> expected = new ArrayList<>();
            for (int i = values.length - 1; i >= 0; i--) expected.add(values[i]);
            Check.eq(Check.values(new Solution().reverseList(Check.list(values))), expected, "size " + values.length);
        }
        Check.done();
    }
}
