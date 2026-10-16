class Main {
    public static void main(String[] args) {
        int[] big = new int[10000];
        for (int i = 0; i < big.length; i++) big[i] = i % 10; // 1000 climbs from 0 to 9
        Object[][] cases = {{new int[] {3, 1, 4, 2, 6}, 7}, {new int[] {2, 3, 5, 8}, 6}, {new int[] {9, 7, 4, 1}, 0}, {new int[] {5}, 0},
            {new int[] {4, 4, 4}, 0}, {new int[] {0, 10000}, 10000}, {new int[] {7, 1, 5, 3, 6, 4}, 7}, {new int[] {1, 5, 5, 2, 8}, 10},
            {big, 9000}};
        for (Object[] c : cases) {
            int[] prices = (int[]) c[0];
            Check.eq(new Solution().maxProfit(prices.clone()), c[1], "size " + prices.length);
        }
        Check.done();
    }
}
