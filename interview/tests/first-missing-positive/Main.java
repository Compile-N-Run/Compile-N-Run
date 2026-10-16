class Main {
    public static void main(String[] args) {
        int[] big = new int[100000];
        for (int i = 0; i < big.length; i++) big[i] = 100000 - i == 77777 ? -1 : 100000 - i; // 77777 removed
        Object[][] cases = {{new int[] {2, 5, 1, 9}, 3}, {new int[] {-4, 0, 6}, 1}, {new int[] {3, 1, 2, 2}, 4}, {new int[] {1}, 2},
            {new int[] {2}, 1}, {new int[] {1, 1}, 2}, {new int[] {0}, 1}, {new int[] {7, 8, 9, 11, 12}, 1},
            {new int[] {Integer.MIN_VALUE, Integer.MAX_VALUE, 1, 2}, 3}, {new int[] {4, 3, 2, 1}, 5}, {big, 77777}};
        for (Object[] c : cases) {
            int[] nums = (int[]) c[0];
            Check.eq(new Solution().firstMissingPositive(nums.clone()), c[1], "size " + nums.length);
        }
        Check.done();
    }
}
