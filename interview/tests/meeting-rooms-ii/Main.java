import java.util.*;

class Main {
    public static void main(String[] args) {
        int[][] big = new int[10000][];
        for (int i = 0; i < big.length; i++) big[i] = new int[] {9999 - i, 9999 - i + 100}; // each moment is covered by 100 meetings
        Object[][] cases = {{new int[][] {{1, 5}, {2, 6}, {8, 9}}, 2}, {new int[][] {{0, 4}, {4, 7}}, 1},
            {new int[][] {{1, 10}, {2, 3}, {4, 5}, {6, 7}}, 2}, {new int[][] {{3, 8}, {3, 8}, {3, 8}}, 3},
            {new int[][] {{5, 6}}, 1}, {new int[][] {{6, 9}, {1, 3}, {2, 5}}, 2}, {new int[][] {{1, 2}, {3, 4}, {5, 6}}, 1},
            {new int[][] {{0, 1000000}, {1, 2}, {2, 3}, {1, 3}}, 3}, {big, 100}};
        for (Object[] c : cases) {
            int[][] intervals = (int[][]) c[0];
            Check.eq(new Solution().minMeetingRooms(intervals), c[1], "meetings " + intervals.length);
        }
        Check.done();
    }
}
