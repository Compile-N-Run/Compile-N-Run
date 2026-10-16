class Main {
    static int brute(int[] nums, int k) {
        int total = 0;
        for (int i = 0; i < nums.length; i++) {
            int s = 0;
            for (int j = i; j < nums.length; j++) { s += nums[j]; if (s == k) total++; }
        }
        return total;
    }

    public static void main(String[] args) {
        int[] big = new int[2000];
        long x = 3;
        for (int i = 0; i < 2000; i++) { x = x * 48271 % 2147483647L; big[i] = (int) (x % 21) - 10; }
        Object[][] cases = {{new int[] {1, 2, 3}, 3, 2}, {new int[] {1, 1, 1, 1}, 2, 3}, {new int[] {2, -2, 2, -2}, 0, 4},
            {new int[] {5}, 5, 1}, {new int[] {5}, 4, 0}, {new int[] {-1, -1, 1}, 0, 1}, {new int[] {0, 0, 0}, 0, 6},
            {new int[] {3, 4, 7, 2, -3, 1, 4, 2}, 7, 4}, {new int[] {1, -1, 0}, 0, 3}, {new int[] {-3, -2}, -5, 1},
            {new int[2000], 0, 2001000}, {big, 5, brute(big, 5)}};
        for (int i = 0; i < cases.length; i++) {
            Object[] c = cases[i];
            Check.eq(new Solution().subarraySum(((int[]) c[0]).clone(), (int) c[1]), c[2], "case " + i);
        }
        Check.done();
    }
}
