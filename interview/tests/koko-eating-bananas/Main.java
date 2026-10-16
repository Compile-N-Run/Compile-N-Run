import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] same = new int[10000], seq = new int[10000];
        Arrays.fill(same, 1000000000);
        for (int i = 0; i < seq.length; i++) seq[i] = i + 1;
        Object[][] cases = {{new int[] {5, 9, 2}, 6, 3}, {new int[] {10, 10}, 2, 10}, {new int[] {7}, 7, 1},
            {new int[] {4, 1, 8}, 5, 4}, {new int[] {2, 2, 2}, 3, 2}, {new int[] {1, 1, 1, 1}, 10, 1},
            {new int[] {1000000000}, 2, 500000000}, {same, 1000000000, 10000}, {seq, 10000, 10000}};
        for (Object[] c : cases) {
            int got = new Solution().minEatingSpeed(((int[]) c[0]).clone(), (int) c[1]);
            Check.eq(got, c[2], "h " + c[1]);
        }
        Check.done();
    }
}
