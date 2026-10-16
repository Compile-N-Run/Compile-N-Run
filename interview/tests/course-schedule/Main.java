class Main {
    public static void main(String[] args) {
        int[][] chain = new int[1999][], looped = new int[2000][];
        for (int i = 1; i < 2000; i++) chain[i - 1] = looped[i - 1] = new int[] {i, i - 1};
        looped[1999] = new int[] {0, 1999};
        Object[][] cases = {{3, new int[][] {{1, 0}, {2, 1}}, true}, {2, new int[][] {{0, 1}, {1, 0}}, false}, {4, new int[][] {}, true},
            {4, new int[][] {{1, 0}, {2, 1}, {3, 2}, {1, 3}}, false}, {1, new int[][] {}, true},
            {5, new int[][] {{1, 0}, {2, 0}, {3, 1}, {3, 2}, {4, 3}}, true}, {3, new int[][] {{0, 1}, {1, 2}, {2, 0}}, false},
            {2000, chain, true}, {2000, looped, false}};
        for (int i = 0; i < cases.length; i++) {
            Object[] c = cases[i];
            Check.eq(new Solution().canFinish((int) c[0], (int[][]) c[1]), c[2], "case " + i);
        }
        Check.done();
    }
}
