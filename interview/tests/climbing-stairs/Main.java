class Main {
    public static void main(String[] args) {
        int[][] cases = {{1, 1}, {2, 2}, {3, 3}, {4, 5}, {6, 13}, {10, 89}, {20, 10946}, {45, 1836311903}};
        for (int[] c : cases) {
            Check.eq(new Solution().climbStairs(c[0]), c[1], "n=" + c[0]);
        }
        Check.done();
    }
}
