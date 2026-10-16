class Main {
    public static void main(String[] args) {
        int n = 100000;
        int[] big = new int[n], bigExpected = new int[n];
        for (int i = 0; i < n; i++) {
            big[i] = i;
            bigExpected[i] = (i - 23456 + n) % n; // k = 123456 is 23456 after wrapping
        }
        Object[][] cases = {{new int[] {10, 20, 30, 40, 50}, 2, new int[] {40, 50, 10, 20, 30}}, {new int[] {1, 2, 3}, 4, new int[] {3, 1, 2}},
            {new int[] {-5, 8}, 0, new int[] {-5, 8}}, {new int[] {9}, 7, new int[] {9}}, {new int[] {1, 2, 3, 4}, 4, new int[] {1, 2, 3, 4}},
            {new int[] {1, 2, 3, 4, 5, 6, 7}, 3, new int[] {5, 6, 7, 1, 2, 3, 4}}, {new int[] {1, 2}, 1, new int[] {2, 1}},
            {new int[] {4, 4, 1, 4}, 3, new int[] {4, 1, 4, 4}}, {big, 123456, bigExpected}};
        for (Object[] c : cases) {
            int[] arr = ((int[]) c[0]).clone();
            new Solution().rotate(arr, (int) c[1]);
            Check.eq(arr, c[2], "size " + arr.length + " k=" + c[1]);
        }
        Check.done();
    }
}
