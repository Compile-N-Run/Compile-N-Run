import java.util.*;

class Main {
    public static void main(String[] args) {
        int[][] big = new int[50][]; // 50 interleaved lists covering 0..4999
        for (int j = 0; j < 50; j++) {
            big[j] = new int[100];
            for (int i = 0; i < 100; i++) big[j][i] = j + 50 * i;
        }
        List<Integer> bigExpected = new ArrayList<>();
        for (int i = 0; i < 5000; i++) bigExpected.add(i);
        Object[][] cases = {{new int[][] {{1, 4, 9}, {2, 3}, {5, 6, 10}}, List.of(1, 2, 3, 4, 5, 6, 9, 10)},
            {new int[][] {{}, {-3, 0}}, List.of(-3, 0)}, {new int[][] {{7}, {7, 8}}, List.of(7, 7, 8)},
            {new int[][] {}, List.of()}, {new int[][] {{}}, List.of()}, {new int[][] {{5}}, List.of(5)},
            {new int[][] {{-2, -1}, {-3}, {0, 0}, {}, {-5, 10}}, List.of(-5, -3, -2, -1, 0, 0, 10)}, {big, bigExpected}};
        for (Object[] c : cases) {
            int[][] values = (int[][]) c[0];
            ListNode[] lists = new ListNode[values.length];
            for (int i = 0; i < values.length; i++) lists[i] = Check.list(values[i]);
            Check.eq(Check.values(new Solution().mergeKLists(lists)), c[1], "k " + values.length);
        }
        Check.done();
    }
}
