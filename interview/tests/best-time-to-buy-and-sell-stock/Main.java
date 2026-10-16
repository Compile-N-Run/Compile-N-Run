class Main {
    public static void main(String[] args) {
        // Large case: prices fall from 50000 to 1, then rise from 1 to 50000.
        int[] big = new int[100000];
        for (int i = 0; i < 50000; i++) {
            big[i] = 50000 - i;
            big[50000 + i] = i + 1;
        }
        Object[][] cases = {{new int[] {9, 2, 6, 1, 4}, 4}, {new int[] {2, 9, 1, 8}, 7}, {new int[] {8, 6, 5, 3}, 0},
            {new int[] {5}, 0}, {new int[] {3, 3, 3}, 0}, {new int[] {0, 10000}, 10000}, {new int[] {4, 1, 7, 0, 2}, 6}, {big, 49999}};
        for (int n = 0; n < cases.length; n++) {
            Check.eq(new Solution().maxProfit(((int[]) cases[n][0]).clone()), cases[n][1], "case " + n);
        }
        Check.done();
    }
}
