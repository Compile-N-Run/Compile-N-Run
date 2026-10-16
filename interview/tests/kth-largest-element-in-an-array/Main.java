import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] big = new int[100000];
        for (int i = 0; i < big.length; i++) big[i] = (int) ((i * 7919L) % 20001) - 10000;
        int[] asc = big.clone();
        Arrays.sort(asc);
        Object[][] cases = {{new int[] {7, 2, 9, 4}, 2, 7}, {new int[] {5, 5, 1}, 2, 5}, {new int[] {-1, -8, -3}, 3, -8},
            {new int[] {6}, 1, 6}, {new int[] {1, 2, 3, 4, 5}, 1, 5}, {new int[] {3, 3, 3, 3}, 3, 3},
            {new int[] {10, -10, 0}, 2, 0}, {big, 500, asc[asc.length - 500]}, {big, 100000, asc[0]}};
        for (Object[] c : cases) {
            int got = new Solution().findKthLargest(((int[]) c[0]).clone(), (int) c[1]);
            Check.eq(got, c[2], "k " + c[1]);
        }
        Check.done();
    }
}
