class Main {
    public static void main(String[] args) {
        Object[][] cases = {{1331, true}, {12321, true}, {-44, false}, {50, false}, {0, true}, {7, true}, {10, false},
            {1000021, false}, {1000000001, true}, {2147447412, true}, {2147483647, false}, {Integer.MIN_VALUE, false}};
        for (Object[] c : cases) Check.eq(new Solution().isPalindrome((int) c[0]), c[1], String.valueOf(c[0]));
        Check.done();
    }
}
