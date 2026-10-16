class Main {
    public static void main(String[] args) {
        int[] big = new int[100000];
        for (int i = 0; i < big.length; i++) big[i] = i / 10; // each value 0..9999 appears 10 times
        Object[][] cases = {{new int[] {1, 3, 3, 3, 6, 9}, 3, new int[] {1, 3}}, {new int[] {2, 4, 4, 8}, 5, new int[] {-1, -1}},
            {new int[] {7}, 7, new int[] {0, 0}}, {new int[] {}, 0, new int[] {-1, -1}}, {new int[] {5, 5, 5, 5}, 5, new int[] {0, 3}},
            {new int[] {1, 2, 3}, 0, new int[] {-1, -1}}, {new int[] {1, 2, 3}, 4, new int[] {-1, -1}},
            {new int[] {-3, -1, -1, 0}, -1, new int[] {1, 2}}, {new int[] {1, 2, 3, 3}, 3, new int[] {2, 3}},
            {big, 4321, new int[] {43210, 43219}}, {big, 10000, new int[] {-1, -1}}};
        for (Object[] c : cases) {
            Check.eq(new Solution().searchRange(((int[]) c[0]).clone(), (int) c[1]), c[2], "target " + c[1]);
        }
        Check.done();
    }
}
