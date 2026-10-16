import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] big = new int[50000];
        for (int i = 0; i < big.length; i++) big[i] = i % 500 + 1;
        Object[][] cases = {
            {new int[] {3, 2, 2, 4, 1, 4}, 3, 6},
            {new int[] {7, 3, 5}, 1, 15},
            {new int[] {7, 3, 5}, 3, 7},
            {new int[] {5}, 1, 5},
            {new int[] {1, 1, 1, 1}, 2, 2},
            {new int[] {1, 1, 1, 1}, 4, 1},
            {new int[] {1, 1, 1, 1}, 3, 2},
            {new int[] {10, 1, 1, 1, 1, 10}, 2, 12},
            {new int[] {6, 2, 9, 3, 8, 1}, 4, 9},
            {new int[] {500, 500, 500}, 50, 500},
            {big, 100, 125250},
            {big, 1, 12525000},
            {big, 50000, 500},
        };
        for (int n = 0; n < cases.length; n++) {
            int[] weights = ((int[]) cases[n][0]).clone();
            Check.eq(new Solution().shipWithinDays(weights, (int) cases[n][1]), cases[n][2], "case " + n);
        }
        Check.done();
    }
}
